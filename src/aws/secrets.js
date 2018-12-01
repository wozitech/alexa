import AWS  from 'aws-sdk';
import { logError } from '../common/logger';

export const getTflApiSecret = async (lambdaRegion) => {
  if ('undefined' === typeof process.env.TFL_API_SECRET_ID) {
    const errMsg = 'Missing env variable for TFL_API_SECRET_ID';
    logError(errMsg)
    throw new Error(errMsg);
  }

  var secrets = new AWS.SecretsManager({
      region: lambdaRegion
  });
  
  var tflApiSecret =
    await secrets.getSecretValue({SecretId: process.env.TFL_API_SECRET_ID}).promise();

  if (typeof tflApiSecret.SecretString !== 'undefined') {
    var tflApiDetails = JSON.parse(tflApiSecret.SecretString);

    console.log("WA DEBIG, API details: ", tflApiDetails)

    if (typeof tflApiDetails == 'undefined' ||
        typeof tflApiDetails.tfl_api_app_id == 'undefined' ||
        typeof tflApiDetails.tfl_api_app_key == 'undefined') {

      throw new Error('Unexpected TFL API credentials');
    }

    return tflApiDetails;
  } else {

    throw new Error('Unknown TFL API secret');
  }

}

export const getSlackWebHookSecret = async (lambdaRegion) => {
  if ('undefined' === typeof process.env.SLACK_WEBHOOK) {
    const errMsg = 'Missing env variable for SLACK_WEBHOOK';
    logError(errMsg)
    throw new Error(errMsg);
  }
  
  var secrets = new AWS.SecretsManager({
      region: lambdaRegion
  });
  
  var webhookSecret =
    await secrets.getSecretValue({SecretId: process.env.SLACK_WEBHOOK}).promise();

  if (typeof webhookSecret.SecretString !== 'undefined') {
    var webhookDetails = JSON.parse(webhookSecret.SecretString);

    if (typeof webhookDetails == 'undefined' ||
        typeof webhookDetails.webhook == 'undefined') {

      throw new Error('Unexpected Slack webhook');
    }

    return webhookDetails;
  } else {

    throw new Error('Unknown Slack webhook secret');
  }

}