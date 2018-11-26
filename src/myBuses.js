'use strict';

import AWS  from 'aws-sdk';

export const handler = async (event, context, callback) => {
  var arnList = (context.invokedFunctionArn).split(":");
  var lambdaRegion = arnList[3];
console.log("DEBUG: Inside myBuses.handler")  
  
  var secrets = new AWS.SecretsManager({
      region: lambdaRegion
  });
  
  try {
      if ('undefined' === typeof process.env.TFL_API_SECRET_ID) {
        throw new Error('Missing env variable for TFL_API_SECRET_ID');
      }

console.log("DEBUG: Attempting to fetch secret")  
      var tflApiSecret = await secrets.getSecretValue({SecretId: process.env.TFL_API_SECRET_ID}).promise();

console.log("DEBUG: tflApiSecret is: ", tflApiSecret);

      if (typeof tflApiSecret.SecretString !== 'undefined') {
        var tflApiDetails = JSON.parse(tflApiSecret.SecretString);

        if (typeof tflApiDetails == 'undefined' ||
            typeof tflApiDetails.tfl_api_app_id == 'undefined' ||
            typeof tflApiDetails.tfl_api_app_key == 'undefined') {
          throw new Error('Unexpected TFL API credentials');
        }

        console.log("DEBUG: tflApiDetails are: ", tflApiDetails);
  
        const response = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
            api: tflApiDetails
          }),
        };
        return response;

      } else {
        throw new Error('Unknown TFL API');
      }

  } catch (err) {
      callback(new Error(err));
  }
};
