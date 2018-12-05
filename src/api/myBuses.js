'use strict';

import assert from 'assert';
import { getTflApiSecret } from '../aws/secrets';
import { nextBusTo } from '../model/tfl.api';
import { returnUnknownDestinationResponse,
         returnSkillOpenedResponse,
         returnNoDestinationResponse,
         returnUnableToGetBusInfoResponse,
         returnScheduledBusesResponse } from '../model/alexaResponse';
import { logInfo, logError, logWarn, logTrace } from '../common/logger';
import { slackInfo, slackRequest, slackTrace, slackWarn, slackError } from '../common/slack';
import { initialiseSecrets } from '../aws/secrets';

// processes the Lambda Event from Alexa Skill, validating the request
//  and extracting the intent & destination.
// Returns null if the request is not as expected, otherwise:
//  {
//    destination - can be null (missing) if not destination found
//    intent
//    message
//  }
const parseRequest = (event) => {
  const requestResponse = {
    message: 'WOZiTech Becks'
  };

  const expectedIntents = [
    "whenIs",
    "howLong"
  ];

  if (typeof event.request !== 'undefined' &&
      typeof event.request.intent !== 'undefined' &&
      typeof event.request.intent.name !== 'undefined' &&
      expectedIntents.includes(event.request.intent.name)) {

      requestResponse.intent = event.request.intent.name;
      requestResponse.message = `${requestResponse.message} with intent (${requestResponse.intent})`;

      if (typeof event.request.intent.slots !== 'undefined' &&
          typeof event.request.intent.slots.Destination !== 'undefined' &&
          typeof event.request.intent.slots.Destination.value === 'string') {
        requestResponse.destination = event.request.intent.slots.Destination.value;
        requestResponse.message = `${requestResponse.message} to ${requestResponse.destination}`;
      } else {
        requestResponse.destination = null;
      }
  }

  if (typeof requestResponse.intent === 'undefined') {
    return null;
  } else {
    return requestResponse;
  }
};

export const handler = async (event, context, callback) => {
  var arnList = (context.invokedFunctionArn).split(":");
  var lambdaRegion = arnList[3];

  const slackTitle = typeof event.session.sessionId === 'undefined' ? 'Not AlexaSkill data' :
  event.session.sessionId.split('.')[3];

  initialiseSecrets(lambdaRegion);

  slackTrace(slackTitle, event);

  // 'parsedRequest' returns null if not intent
  const parsedRequest = parseRequest(event);

  if (parsedRequest) {
    slackRequest(slackTitle, parsedRequest.intent, parsedRequest.destination);

    // no destination given in intent
    if (parsedRequest && parsedRequest.destination === null) {
      const actualResponse = returnNoDestinationResponse(event.session);
      slackWarn(slackTitle, 'Known intent but destination unknown', actualResponse);
      return callback(null, actualResponse);
    }
    
    let nextBuses = null;
    try {
      var tflApiDetails = await getTflApiSecret();

      nextBuses = await nextBusTo(parsedRequest.destination, tflApiDetails);
      slackTrace(slackTitle, "Next Buses: ", nextBuses);

    } catch (err) {
      // unable to get bus information
      logError(`Parsed Request: ${parsedRequest}, errored: `, err);
      slackError(slackTitle, 'Unable to fetch bus info', err);
      return callback(null, returnUnableToGetBusInfoResponse());
    }

    // destination given in intent, but is unknown to our TFL API
    if (parsedRequest.destination && nextBuses.endpoint === 'null') {
      const actualResponse = returnUnknownDestinationResponse(parsedRequest.destination, event.session);
      logError('Destination given in intent, but is unknown to our TFL API: ', parsedRequest);
      slackError(slackTitle, 'Intent/Destination is good, but destination is unknown to our TFL API client.', parsedRequest);
      return callback(null, actualResponse);
    }

    // intent and destination both given, the destination is known by our TFL API,
    //  but the actual TFL API returned an error
    if (! [200,201].includes(nextBuses.status)) {
      const actualResponse = returnUnableToGetBusInfoResponse();
      logError('Error returning from TFL API: ', nextBuses);
      slackError(slackError, 'Error returning from TFL API: ', nextBuses);
      return callback(null, actualResponse);
    }

    // get this far with success and a set of next arrivals
    if (nextBuses.arrivals) {
      const actualResponse = returnScheduledBusesResponse(parsedRequest.destination,
                                                          parsedRequest.intent,
                                                          nextBuses.route,
                                                          nextBuses.arrivals,
                                                          nextBuses.walkingTime);
      logInfo("Successful intent and destination: ", actualResponse);
      slackInfo(slackTitle, "Successful intent and destination", actualResponse);

      return callback(null, actualResponse);
    }

    // gets here without a callback - that is bad
    assert.fail();

  } else {
    // no intent given, user has simply opened the skill
    logWarn('Unknown intent, open skill');
    slackWarn('Unknown intent, open skill');
    return callback(null, returnSkillOpenedResponse(event.session));
  }
};
