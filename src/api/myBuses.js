'use strict';

import { getTflApiSecret } from '../aws/secrets';

export const handler = async (event, context, callback) => {
  var arnList = (context.invokedFunctionArn).split(":");
  var lambdaRegion = arnList[3];
  

  
  try {
      if ('undefined' === typeof process.env.TFL_API_SECRET_ID) {
        throw new Error('Missing env variable for TFL_API_SECRET_ID');
      }

      var tflApiDetails = await getTflApiSecret(lambdaRegion,
                                                process.env.TFL_API_SECRET_ID);
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Go Serverless v1.0! Your function executed successfully!',
          input: event,
          api: tflApiDetails
        }),
      };

      return response;
  } catch (err) {
      callback(new Error(err));
  }
};
