import AWS  from 'aws-sdk';
import { getTflApiSecret, getSlackWebHookSecret } from '../../src/aws/secrets';
import { initialiseSecrets, resetSecrets} from '../../src/aws/secrets';

const secretValueMock = jest.fn();

AWS.SecretsManager = jest.fn( () => ({
    getSecretValue : secretValueMock
}));

const tglApiEnv = 'MY_TFL_SECRET_KEY';
const slackApiEnv = 'MY_SLACK_SECRET_KEY';

describe('The TFL API secret', async () => {
    beforeAll(() => {
        resetSecrets();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return exception when env var TFL_API_SECRET_ID is undefined ', async () => {
        try {
            await getTflApiSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(err).toEqual(new Error('Missing env variable for TFL_API_SECRET_ID'));
        }
    });

    it('should return exception when not initialised ', async () => {
        try {
            process.env.TFL_API_SECRET_ID = tglApiEnv;
            await getTflApiSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(err).toEqual(new Error('Not initialised secrets'));
        }
    });

    it ('should return exception when failing to get secret', async () => {
        initialiseSecrets('eu-west-1');

        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                empty: true
            })
        });

        try {
            process.env.TFL_API_SECRET_ID = tglApiEnv;
            await getTflApiSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(secretValueMock).toHaveBeenCalledWith({"SecretId": tglApiEnv});
            expect(secretValueMock).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('Unknown TFL API secret'));
        }
    });

    it ('should return exception when the fetched secret is not as expected', async () => {
        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                SecretString: "{\"ttfl_api_app_id\" : 123, \"ttfl_api_app_key\" : 456}"
            })
        });

        try {
            process.env.TFL_API_SECRET_ID = tglApiEnv;
            await getTflApiSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(secretValueMock).toHaveBeenCalledWith({"SecretId": tglApiEnv});
            expect(secretValueMock).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('Unexpected TFL API credentials'));
        }
    });

    it ('should return the fetched secret', async () => {
        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                SecretString: "{\"tfl_api_app_id\" : 123, \"tfl_api_app_key\" : 456}"
            })
        });

        process.env.TFL_API_SECRET_ID = tglApiEnv;
        const mySecret = await getTflApiSecret();
        expect(mySecret).toEqual({ tfl_api_app_id: 123, tfl_api_app_key: 456 });
        expect(secretValueMock).toHaveBeenCalledTimes(1);
        expect(secretValueMock).toHaveBeenCalledWith({"SecretId": tglApiEnv});
    });
});

describe('The Slack WebHook secret', async () => {
    beforeAll(() => {
        resetSecrets();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    secretValueMock.mockReturnValue({
        promise: () => ({
            SecretString: "{\"webhook\" : \"https://hooks.slack.com/services\"}"
        })
    });

    it('should return exception when env var SLACK_WEBHOOK is undefined ', async () => {
        try {
            await getSlackWebHookSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(err).toEqual(new Error('Missing env variable for SLACK_WEBHOOK'));
        }
    });

    it('should return exception when not initialised ', async () => {
        try {
            process.env.SLACK_WEBHOOK = slackApiEnv;
            await getSlackWebHookSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(err).toEqual(new Error('Not initialised secrets'));
        }
    });

    it ('should return exception when failing to get secret', async () => {
        initialiseSecrets('eu-west-1');

        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                empty: true
            })
        });

        try {
            process.env.SLACK_WEBHOOK = slackApiEnv;
            await getSlackWebHookSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(secretValueMock).toHaveBeenCalledWith({"SecretId": slackApiEnv});
            expect(secretValueMock).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('Unknown Slack webhook secret'));
        }
    });

    it ('should return exception when the fetched secret is not as expected', async () => {
        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                SecretString: "{\"wwebhook\" : \"https://hooks.slack.com/services\"}"
            })
        });

        try {
            process.env.SLACK_WEBHOOK = slackApiEnv;
            await getSlackWebHookSecret();
            expect(false).toEqual(true);    // force failure if gets here
        } catch (err) {
            expect(secretValueMock).toHaveBeenCalledWith({"SecretId": slackApiEnv});
            expect(secretValueMock).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('Unexpected Slack webhook'));
        }
    });

    it ('should return the fetched secret', async () => {
        secretValueMock.mockReturnValueOnce({
            promise: () => ({
                SecretString: "{\"webhook\" : \"https://hooks.slack.com/services\"}"
            })
        });

        process.env.SLACK_WEBHOOK = slackApiEnv;
        const mySecret = await getSlackWebHookSecret();
        expect(mySecret).toEqual({ webhook: 'https://hooks.slack.com/services' });
        expect(secretValueMock).toHaveBeenCalledTimes(1);
        expect(secretValueMock).toHaveBeenCalledWith({"SecretId": slackApiEnv});
    });
});