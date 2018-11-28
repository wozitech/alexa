'use strict';

import { getTflApiSecret } from '../aws/secrets';
import { nextBusTo } from '../model/tfl.api';
import { returnUnkwownDestinationResponse, returnScheduledBusesResponse } from '../model/alexaResponse';

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
          typeof event.request.intent.slots.Destination !== 'undefined') {
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

  const parsedRequest = parseRequest(event);

  try {
      if ('undefined' === typeof process.env.TFL_API_SECRET_ID) {
        throw new Error('Missing env variable for TFL_API_SECRET_ID');
      }

      var tflApiDetails = await getTflApiSecret(lambdaRegion,
                                                process.env.TFL_API_SECRET_ID);

      const nextBuses = parsedRequest && parsedRequest.destination ?
        await nextBusTo(parsedRequest.destination, tflApiDetails) : {};

      const response = {
        statusCode: 200,
        request: parsedRequest ? parsedRequest.message : null,
        rawRequest: parsedRequest,
      };

      if ((parsedRequest && parsedRequest.destination === null) ||
          nextBuses.endpoint === null) {
        // the destination is unknown
        response.code = 501;
        response.err = 'Destination unknown';

        //console.log("WA DEBUG logging in Lambda:CloudWatch: response: ", response);
        //return response;
      }

      if (nextBuses.arrivals) {
        response.arrivals = nextBuses.arrivals;

        const actualResponse = returnScheduledBusesResponse(parsedRequest.destination,
                                                            parsedRequest.intent,
                                                            nextBuses.arrivals);
        //console.log("WA DEBUG logging in Lambda:CloudWatch: response: ", actualResponse);

        callback(null, actualResponse);
      }

      //console.log("WA DEBUG logging in Lambda:CloudWatch: response: ", response);
      //return response;

  } catch (err) {
      callback(new Error(err));
  }
};
