import AWS  from 'aws-sdk';
import { logError } from '../common/logger';

let secrets = null;

export const initialiseSecrets = (lambdaRegion) => {
  console.log("WA DEBUG: Initialising secrets with: ", lambdaRegion)
  secrets = new AWS.SecretsManager({
    region: lambdaRegion
  });
};

export const resetSecrets = () => {
  secrets = null;
};

export const getTflApiSecret = async () => {
  if ('undefined' === typeof process.env.TFL_API_SECRET_ID) {
    const errMsg = 'Missing env variable for TFL_API_SECRET_ID';
    logError(errMsg)
    throw new Error(errMsg);
  }

  if (secrets === null) {
    const errMsg = 'Not initialised secrets';
    logError(errMsg)
    throw new Error(errMsg);
  }

  const tflApiSecret =
    await secrets.getSecretValue({SecretId: process.env.TFL_API_SECRET_ID}).promise();

  if (typeof tflApiSecret.SecretString !== 'undefined') {
    var tflApiDetails = JSON.parse(tflApiSecret.SecretString);

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

export const getSlackWebHookSecret = async () => {
  if ('undefined' === typeof process.env.SLACK_WEBHOOK) {
    const errMsg = 'Missing env variable for SLACK_WEBHOOK';
    logError(errMsg)
    throw new Error(errMsg);
  }
  
  if (secrets === null) {
    const errMsg = 'Not initialised secrets';
    logError(errMsg)
    throw new Error(errMsg);
  }

  console.log("WA DEBUG: getting secret: ", process.env.SLACK_WEBHOOK);
  const webhookSecret =
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