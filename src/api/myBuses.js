'use strict';

import { getTflApiSecret } from '../aws/secrets';
import { nextBusTo } from '../model/tfl.api';
import { returnUnknownDestinationResponse,
         returnSkillOpenedResponse,
         returnNoDestinationResponse,
         returnUnableToGetBusInfoResponse,
         returnScheduledBusesResponse } from '../model/alexaResponse';

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

  if (typeof event.request !== 'undefined' &&
      typeof event.request.intent !== 'undefined' &&
      typeof event.request.intent.name !== 'undefined') {

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

  // 'parsedRequest' returns null if not intent
  const parsedRequest = parseRequest(event);
  if (parsedRequest) {
    // no destination given in intent
    if (parsedRequest && parsedRequest.destination === null) {
      const actualResponse = returnNoDestinationResponse(event.session);
      //console.log("WA DEBUG logging in Lambda:CloudWatch: response: ", actualResponse);
      callback(null, actualResponse);
    }
    
    let nextBuses = null;
    try {
      if ('undefined' === typeof process.env.TFL_API_SECRET_ID) {
        throw new Error('Missing env variable for TFL_API_SECRET_ID');
      }

      var tflApiDetails = await getTflApiSecret(lambdaRegion,
                                                process.env.TFL_API_SECRET_ID);

      nextBuses = parsedRequest && parsedRequest.destination ?
        await nextBusTo(parsedRequest.destination, tflApiDetails) : {};
      console.log("WA DEBUG logging in Lambda:CloudWatch: nextBuses: ", nextBuses);

    } catch (err) {
      // unable to get bus information
      console.error(`Parsed Request: ${parsedRequest}, errored: `, err);

      callback(null, returnUnableToGetBusInfoResponse());
    }

    // destination given in intent, but is unknown to our TFL API
    if (parsedRequest.destination && nextBuses.endpoint === 'null') {
      const actualResponse = returnUnknownDestinationResponse(parsedRequest.destination, event.session);
      //console.log("WA DEBUG logging in Lambda:CloudWatch: response: ", actualResponse);
      callback(null, actualResponse);
    }

    console.log("WA DDEBUG: got here: ", parsedRequest)
    // intent and destination both given, the destination is known by our TFL API,
    //  but the actual TFL API returned an error
    if (! [200,201].includes(nextBuses.status)) {
      const actualResponse = returnUnableToGetBusInfoResponse();
      //console.log("WA DEBUG logging in Lambda:CloudWatch: response: ", actualResponse);
      callback(null, actualResponse);
    }

    // get this far with success and a set of next arrivals
    if (nextBuses.arrivals) {
      const actualResponse = returnScheduledBusesResponse(parsedRequest.destination,
                                                          parsedRequest.intent,
                                                          nextBuses.arrivals);
      //console.log("WA DEBUG logging in Lambda:CloudWatch: response: ", actualResponse);

      callback(null, actualResponse);
    }

    // gets here without a callback - that is bad
    return false;

  } else {
    // no intent given, user has simply opened the skill
    callback(null, returnSkillOpenedResponse(event.session));
  }

  return true;
};
