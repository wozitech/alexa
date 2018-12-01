// Slack is a great tool for comms. But not just between people. Applications can interact with Slack too.
// Slack application integration allows not just for messaging, but well formatted messaging
import axios from 'axios';
import { logError } from './logger';
import { getSlackWebHookSecret } from '../aws/secrets';

// log to console, if given level is less than equal to environment log level
const SLACK_TRACE=5;
const SLACK_DEBUG=4;
const SLACK_INFO=3;
const SLACK_WARN=2;
const SLACK_ERROR=1;
const SLACK_DISABLED=0;

// posts the given "Slack formatted" message to the known inbound we
const postToSlack = async (slackMsg) => {
    try {
        const slackWebhook = await getSlackWebHookSecret();

        console.log("About to post to slack: ", slackWebhook);
        const apiResponse = await axios.post(
            slackWebhook.webhook,
            slackMsg,       // the data
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

        console.log("Response from slack: ", apiResponse);

    } catch (err) {
        // silently discard errors
        logError("Failed to post to Slack: ", err);
    }

}

// check current Slack log level and only then, post to slack
const logToSlack = (level, slackMsg) => {
    // default to logging errors only; 0 disables logging
    const ENV_LOG_LEVEL = process.env.SLACK_LEVEL || SLACK_DISABLED;

    if (level <= ENV_LOG_LEVEL) {
        postToSlack(slackMsg);

        // TODO: HOW TO FORMAT THE MESSAGE TO SHOW LEVEL OF LOGGING IN SLACK
        // switch (level) {
        //     case SLACK_ERROR:
        //         console.log("DEBUG: ", args);
        //         break;
        //     case SLACK_WARN:
        //         console.log("WARNING: ", args);
        //         break;
        //     case SLACK_INFO:
        //         console.log("INFO: ", args);
        //         break;
        //     case SLACK_DEBUG:
        //         console.log("DEBUG: ", args);
        //         break;
        //     case SLACK_TRACE:
        //         console.log("TRACE: ", args);
        //         break;
        // }        
    }
};

// takes a 
export const slackInfo = (strMsg) => {
    logToSlack(SLACK_INFO, {text: `INFO: ${strMsg}`});
}

export const slackError = (strMsg) => {
    logToSlack(SLACK_ERROR, {text: `ERROR: ${strMsg}`});
}