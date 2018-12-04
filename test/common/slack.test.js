import * as MySecrets from '../../src/aws/secrets';
import { slackInfo, slackTrace, slackWarn, slackError, slackRequest } from '../../src/common/slack';
import * as MyLogger from '../../src/common/logger';
import axios from 'axios';


// add mocks
jest.mock('axios');
// axios.post.mockReturnValue({
//     status: 200
// });
axios.post.mockResolvedValue({
    status: 201
});

const getSlackWebHookSecretMock = jest.fn();
MySecrets.getSlackWebHookSecret = getSlackWebHookSecretMock;
getSlackWebHookSecretMock.mockImplementation(() => {
    return Promise.resolve({
        webhook: 'https://my.webhook.slack.com'
    });
});

const logErrorMock = jest.fn();
MyLogger.logError = jest.fn();

// global.console = {
//     error: jest.fn(),
//     warn: jest.fn(),
//     log: jest.fn()
// }

const slackToAll = async () => {
    await slackRequest("My request", { one: true }, { two: false});
    await slackError("My Error", "one", { two: false});
    await slackWarn("My Warning", "one");
    await slackInfo("My Info", "one", { two: false}, "three");
    await slackTrace("My Trace", "one", "two");
};

describe('Each level of slack logging', () => {
    beforeAll(() => {
        
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

/*     it ('should handle silently any error associated with getting the Slack webhook from Secrets Manager', () => {
        process.env.LOG_LEVEL=1;    // this is to force the writing of logError
        process.env.SLACK_LEVEL=1;
        console.log("TEST DEBUG: about to test exception in getSlackWebHookSecret")

        getSlackWebHookSecretMock.mockImplementationOnce(() => {
            console.log("TEST DEBUG - calling mocked Secrets error just once")
            return Promise.reject(new Error('oops just once'));
        });

        slackError("My Secrets Error Test");
        expect(axios.post).not.toHaveBeenCalled();
        expect(global.console.error).toHaveBeenCalledTimes(1);
        console.log("TEST DEBUG: MyLogger mock function: ", MyLogger.logError);
        expect(MyLogger.logError).toHaveBeenCalledTimes(1);
        expect(MyLogger.logError).toHaveBeenCalledWith("Failed to post to Slack:");
    });
*/
    it ('should handle silently any error associated with calling upon the Slack API', async () => {
        console.log("TEST DEBUG: about to test exception in axios.post")
        process.env.SLACK_LEVEL=1;
        process.env.SLACK_WEBHOOK='MY_SLACK_KEY';

        axios.post.mockRejectedValueOnce(new Error('oops just once'));

        await slackError("My Slack API error test");
        expect(axios.post).toHaveBeenCalledTimes(1);
        // expect(MyLogger.logError).toHaveBeenCalledTimes(1);
        // expect(MyLogger.logError).toHaveBeenCalledWith("Failed to post to Slack:");
    });

    // it ('should log nothing with logging is disabled - first, log level undefined', async () => {
    //     delete process.env.SLACK_LEVEL;
    //     await slackToAll();
    //     expect(axios.post).toHaveBeenCalledTimes(0);
    // });
    // it ('should log nothing with logging is disabled - first, log level defined as disabled', async () => {
    //     process.env.SLACK_LEVEL=0;
    //     await slackToAll();
    //     expect(axios.post).toHaveBeenCalledTimes(0);
    // });

    // it ('should log only errors', async () => {
    //     console.log("TEST DEBUG: about to test errors only")
    //     process.env.SLACK_LEVEL=1;
    //     await slackToAll();
    //     expect(axios.post).toHaveBeenCalledTimes(1);
    // });

    // it ('should log up to warnings only', async () => {
    //     console.log("TEST DEBUG: about to test warning only")
    //     process.env.SLACK_LEVEL=2;
    //     await slackToAll();
    //     expect(axios.post).toHaveBeenCalledTimes(2);
    // });

    it ('should log up to info only', async () => {
        console.log("TEST DEBUG: about to test info only")
        process.env.SLACK_LEVEL=3;
        slackToAll();
        expect(axios.post).toHaveBeenCalledTimes(4);
    });
    it ('should log up to debug', async () => {
        console.log("TEST DEBUG: about to test debug only")
        process.env.SLACK_LEVEL=4;
        await slackToAll();
        expect(axios.post).toHaveBeenCalledTimes(4);
    });
    it ('should log all', async () => {
        console.log("TEST DEBUG: about to test trace only")
        process.env.SLACK_LEVEL=5;
        await slackToAll();
        expect(axios.post).toHaveBeenCalledTimes(4);
    });
});