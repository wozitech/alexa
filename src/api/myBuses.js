'use strict';

import { getTflApiSecret } from '../aws/secrets';
import { nextBusTo } from '../model/tfl.api';

export const handler = async (event, context, callback) => {
  var arnList = (context.invokedFunctionArn).split(":");
  var lambdaRegion = arnList[3];
  
  try {
      if ('undefined' === typeof process.env.TFL_API_SECRET_ID) {
        throw new Error('Missing env variable for TFL_API_SECRET_ID');
      }

      var tflApiDetails = await getTflApiSecret(lambdaRegion,
                                                process.env.TFL_API_SECRET_ID);

      if (typeof event.destination === 'undefined') event.destination = 'Clapham';

      const nextBuses = await nextBusTo(event.destination, tflApiDetails);

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: `WOZiTech nextBusto ${event.destination}`,
          event
        }),
      };

      if (nextBuses.endpoint === null) {
        // the destination is unknown
        response.code = 501;
        response.err = 'Destination unknown';
      }
      if (nextBuses.arrivals) {
        response.arrivals = nextBuses.arrivals;
      }

      return response;
  } catch (err) {
      callback(new Error(err));
  }
};
