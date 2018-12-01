const myHello = require('../../lib/myBuses');
const uuid = require('uuid');

// stripped out to just the request
const missingIntentExampleEvent = {
    "version": "1.0",
    "session": {
        "new": true,
        "sessionId": "amzn1.echo-api.session." + uuid.v4(),
        "application": {
            "applicationId": "amzn1.ask.skill.2ba78764-0a67-481f-907a-3f7c08287aeb"
        },
        "user": {
            "userId": "amzn1.ask.account.AEGDLGI2QMONKDWOIBWRN7KLRXOYMNXOCN3MCECKPBE7SVWDSIEEVKVF7ZVHHPRBBMSETSBSB4BVV3RJVFEO4JT2TSJVTG7FJAGIS5RP2RTUFT5464HJRBTEI4C6BAMHLW6ZTNQ3QJHXBUKIE7ZX5YGOYBCEJCN57BDV7JAHWBH7ZR67C2TLUGQBW5TVVVVMHHUVYVAPADEAWWQ"
        }
    },
    "request": {
		"type": "IntentRequest",
		"requestId": "amzn1.echo-api.request.1485557e-4bbe-408b-96c9-cef3f780a519",
		"timestamp": "2018-11-29T09:28:31Z",
		"locale": "en-GB",
		"intent": {
			"name": "AMAZON.FallbackIntent",
			"confirmationStatus": "NONE"
		},
		"dialogState": "STARTED"
	}
};

const myBuses = async () => {
    try {
        console.log("About to call myBuses handler");

        const returnVal = await myHello.handler(
            missingIntentExampleEvent,
            { invokedFunctionArn : 'arn:aws:lambda:eu-west-1:accountid:function:wozitech-alexa-skills-dev-myBuses' },
            (err, data) => {
                if (err) console.error(err);
                console.log("LOCAL: My results: ", data);
            }
        );
        console.log("MyBuses.Handler returned: ", returnVal);
    } catch (err) {
        console.error("Caught local error: ", err);
    }
}

process.env.TFL_API_SECRET_ID = 'TFL_API_Portal';
process.env.LOG_LEVEL = 5;
process.env.SLACK_WEBHOOK = 'SLACK_MY_BUSES';
process.env.SLACK_LEVEL = 5;
myBuses();