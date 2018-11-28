const myHello = require('../../lib/myBuses');

const WHEN_IS_MODE=1;
const HOW_LONG_MODE=2;

// stripped out to just the request
const whenIsAlexaExampleEvent = {
    "version": "1.0",
    "request": {
        "type": "IntentRequest",
        "requestId": "amzn1.echo-api.request.833e1635-eda6-4fb5-ae8b-f06e0453c135",
        "timestamp": "2018-11-27T14:48:29Z",
        "locale": "en-GB",
        "intent": {
            "name": "whenIs",
            "confirmationStatus": "NONE",
            "slots": {
                "Destination": {
                    "name": "Destination",
                    "value": "Clapham",
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
                                            "name": "Clapham",
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

// stripped out to just the request
const howLongAlexaExampleEvent = {
    "version": "1.0",
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

const myBuses = async (requestMode) => {
    try {
        console.log("About to call myBuses handler");
        var handlerEvent=null;
        switch (requestMode) {
            case WHEN_IS_MODE:
                handlerEvent = whenIsAlexaExampleEvent;
                break;

            case HOW_LONG_MODE:
                handlerEvent = howLongAlexaExampleEvent;
                break;
        }

        const returnVal = await myHello.handler(
            handlerEvent,
            { invokedFunctionArn : 'arn:aws:lambda:eu-west-2:accountid:function:wozitech-alexa-skills-dev-myBuses' },
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

myBuses(HOW_LONG_MODE);
myBuses(WHEN_IS_MODE);