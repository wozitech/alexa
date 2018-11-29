const myHello = require('../../lib/myBuses');

// stripped out to just the request
const whenIsAlexaExampleEvent = {
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

const myBuses = async () => {
    try {
        console.log("About to call myBuses handler");

        const returnVal = await myHello.handler(
            whenIsAlexaExampleEvent,
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
myBuses();