const myHello = require('../../lib/myBuses');

// stripped out to just the request
const howLongAlexaExampleEvent = {
    "version": "1.0",
    "session": {
        "new": true,
        "sessionId": "amzn1.echo-api.session.2f8f91d4-fed4-445f-bd2a-923c27db6072",
        "application": {
            "applicationId": "amzn1.ask.skill.2ba78764-0a67-481f-907a-3f7c08287aeb"
        },
        "user": {
            "userId": "amzn1.ask.account.AEGDLGI2QMONKDWOIBWRN7KLRXOYMNXOCN3MCECKPBE7SVWDSIEEVKVF7ZVHHPRBBMSETSBSB4BVV3RJVFEO4JT2TSJVTG7FJAGIS5RP2RTUFT5464HJRBTEI4C6BAMHLW6ZTNQ3QJHXBUKIE7ZX5YGOYBCEJCN57BDV7JAHWBH7ZR67C2TLUGQBW5TVVVVMHHUVYVAPADEAWWQ"
        }
    },
    "request": {
        "type": "IntentRequest",
        "requestId": "amzn1.echo-api.request.3d2fe165-8a8f-425d-b286-5dc4a0fa5e4d",
        "timestamp": "2018-11-27T15:38:54Z",
        "locale": "en-GB",
        "intent": {
            "name": "howLong",
            "confirmationStatus": "NONE",
            "slots": {
                "Destination": {
                    "name": "Destination",
                    "value": "Crystal Palace",
                    "resolutions": {
                        "resolutionsPerAuthority": [
                            {
                                "authority": "amzn1.er-authority.echo-sdk.amzn1.ask.skill.2ba78764-0a67-481f-907a-3f7c08287aeb.LIST_OF_DESTINATIONS",
                                "status": {
                                    "code": "ER_SUCCESS_MATCH"
                                },
                                "values": [
                                    {
                                        "value": {
                                            "name": "Crystal Palace",
                                            "id": "5a0251c093f8679f79d2fc9d474dd768"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    "confirmationStatus": "NONE",
                    "source": "USER"
                }
            }
        },
        "dialogState": "STARTED"
    }
};

const myBuses = async () => {
    try {
        console.log("About to call myBuses handler");
        const returnVal = await myHello.handler(
            howLongAlexaExampleEvent,
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
process.env.LOG_LEVEL = 3;
process.env.SLACK_LEVEL = 5;
myBuses();