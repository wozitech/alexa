import AWS  from 'aws-sdk';
import { getTflApiSecret } from '../../src/aws/secrets';

const secretValueMock = jest.fn();

AWS.SecretsManager = jest.fn( () => ({
    getSecretValue : secretValueMock
}));

secretValueMock.mockReturnValue({
    promise: () => ({
        SecretString: "{\"tfl_api_app_id\" : 123, \"tfl_api_app_key\" : 456}"
    })
});

describe('The myBuses handler', async () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('should return exception when failing to get secret', async () => {
        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                empty: true
            })
        });

        try {
            const tglApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tglApiEnv;
            await getTflApiSecret('eu-west-1', 'MY_TFL_SECREET_KEY');
        } catch (err) {
            expect(secretValueMock).toHaveBeenCalledWith({"SecretId": "MY_TFL_SECREET_KEY"});
            expect(secretValueMock).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('Unknown TFL API'));
        }
    });

    it ('should return exception when the fetched secret is not as expected', async () => {
        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                SecretString: "{\"ttfl_api_app_id\" : 123, \"ttfl_api_app_key\" : 456}"
            })
        });

        try {
            const tglApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tglApiEnv;
            await getTflApiSecret('eu-west-1', 'MY_TFL_SECREET_KEY');
        } catch (err) {
            expect(secretValueMock).toHaveBeenCalledWith({"SecretId": "MY_TFL_SECREET_KEY"});
            expect(secretValueMock).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('Unexpected TFL API credentials'));
        }
    });

    it ('should return the fetched secret', async () => {
        AWS.SecretsManager.getSecretValue = secretValueMock;

        const tglApiEnv = 'TFL_API_Portal';
        process.env.TFL_API_SECRET_ID = tglApiEnv;
        const mySecret = await getTflApiSecret('eu-west-1', 'MY_TFL_SECREET_KEY');
        expect(mySecret).toEqual({ tfl_api_app_id: 123, tfl_api_app_key: 456 });
        expect(secretValueMock).toHaveBeenCalledTimes(1);
        expect(secretValueMock).toHaveBeenCalledWith({"SecretId": "MY_TFL_SECREET_KEY"});
    });
});