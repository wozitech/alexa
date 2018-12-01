// Slack is a great tool for comms. But not just between people. Applications can interact with Slack too.
// Slack application integration allows not just for messaging, but well formatted messaging
import util from 'util';
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

        const apiResponse = await axios.post(
            slackWebhook.webhook,
            slackMsg,       // the data
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

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

// info is green
export const slackInfo = (title, strMsg) => {
    logToSlack(SLACK_INFO, {
        text: `INFO`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                color: '#00FF00',
                title,
                text: strMsg
            }
        ]
    });
}

export const slackError = (title, strMsg) => {
    logToSlack(SLACK_ERROR, {
        text: `ERROR`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                color: '#00FF00',
                title,
                text: strMsg
            }
        ]
    });
}

export const slackTrace = (title, event) => {
    logToSlack(SLACK_TRACE, {
        text: `TRACE`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                color: '#444444',
                title,
                text: '```' + util.inspect(event, { depth: null, compact: true, breakLength: 100 }) + '```'
            }
        ]
    });
}

export const slackRequest = (title, intent, destination) => {
    logToSlack(SLACK_INFO, {
        text: `Request`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                title,
                fields: [
                    {
                        title: 'Intent',
                        value: intent,
                        short: true
                    },
                    {
                        title: 'Destination',
                        value: destination,
                        short: true
                    }                    
                ]
            }
        ]
    });
}