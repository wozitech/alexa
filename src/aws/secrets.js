import AWS  from 'aws-sdk';

export const getTflApiSecret = async (lambdaRegion, secretKey) => {
    var secrets = new AWS.SecretsManager({
        region: lambdaRegion
    });

    var tflApiSecret = await secrets.getSecretValue({SecretId: secretKey}).promise();
    if (typeof tflApiSecret.SecretString !== 'undefined') {
      var tflApiDetails = JSON.parse(tflApiSecret.SecretString);

      if (typeof tflApiDetails == 'undefined' ||
          typeof tflApiDetails.tfl_api_app_id == 'undefined' ||
          typeof tflApiDetails.tfl_api_app_key == 'undefined') {
        throw new Error('Unexpected TFL API credentials');
      }

      return tflApiDetails;
    } else {

      throw new Error('Unknown TFL API');
    }

}