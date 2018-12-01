import { handler } from '../../src/api/myBuses';
import AWS  from 'aws-sdk';
import * as TFL from '../../src/model/tfl.api';
import * as MySecrets from '../../src/aws/secrets';
import uuid from 'uuid';
import * as Slack from '../../src/common/slack';


const nextBusToMock = jest.fn();
const getTflApiSecretMock = jest.fn();
const getSlackWebHookSecretMock = jest.fn();

// the Alexa responses are randomised to offer a more personal touch, but this makes
//  unit testing somewhat difficult.
// Overriding the global Math.random function to always return the same result,
//  and hence predictable AlexaSkill responses.
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.999;   // always returns the last
global.Math = mockMath;

const tflApiEnv = 'TFL_API_Portal';

const nowTime = new Date();
const nextTime = new Date();
const lastTime = new Date();
nowTime.setMinutes(nowTime.getMinutes() + 2);
nextTime.setMinutes(nextTime.getMinutes() + 5);
lastTime.setMinutes(lastTime.getMinutes() + 10);

TFL.nextBusTo = nextBusToMock;
nextBusToMock.mockReturnValue({
    status: 200,
    route: 417,
    endpoint: 'https://mocked/endpoint',
    arrivals: [
        nowTime.toISOString(),
        nextTime.toISOString(),
        lastTime.toISOString(),
    ]
});

MySecrets.getTflApiSecret = getTflApiSecretMock;
MySecrets.getSlackWebHookSecret = getSlackWebHookSecretMock;
getSlackWebHookSecretMock.mockReturnValue({
    webhook : 'https://webhook'
});

Slack.slackError = jest.fn();
Slack.slackInfo = jest.fn();
Slack.slackRequest = jest.fn();
Slack.slackTrace = jest.fn();
Slack.slackWarn = jest.fn();

const alexaSkillDefaultSession = {
    "new": true,
    "sessionId": "amzn1.echo-api.session." + uuid.v4(),
    "application": {
        "applicationId": "amzn1.ask.skill.2ba78764-0a67-481f-907a-3f7c08287aeb"
    },
    "user": {
        "userId": "amzn1.ask.account.AEGDLGI2QMONKDWOIBWRN7KLRXOYMNXOCN3MCECKPBE7SVWDSIEEVKVF7ZVHHPRBBMSETSBSB4BVV3RJVFEO4JT2TSJVTG7FJAGIS5RP2RTUFT5464HJRBTEI4C6BAMHLW6ZTNQ3QJHXBUKIE7ZX5YGOYBCEJCN57BDV7JAHWBH7ZR67C2TLUGQBW5TVVVVMHHUVYVAPADEAWWQ"
    }
};

const whenIsAlexaExampleEvent = {
    "version": "1.0",
    "session" : alexaSkillDefaultSession,
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
    "session" : alexaSkillDefaultSession,
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

const openskillAlexaExampleEvent = {
    "version": "1.0",
    "session" : alexaSkillDefaultSession,
    "request": {
		"type": "SessionEndedRequest",
		"requestId": "amzn1.echo-api.request.ffa4ce1b-63ec-4921-8ed2-0d8d7e274ec0",
		"timestamp": "2018-11-29T15:08:55Z",
		"locale": "en-GB",
		"reason": "USER_INITIATED"
	}
};

const unexpectedIntentExampleEvent = {
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

const goodIntentButnNoDestinationExampleEvent = {
    "version": "1.0",
    "session" : alexaSkillDefaultSession,
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
					"confirmationStatus": "NONE"
				}
			}
        },
        "dialogState": "STARTED"
    }
};

const goodIntentWithGivenButUnknownDestinationExampleEvent = {
    "version": "1.0",
    "session" : alexaSkillDefaultSession,
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
                    "value": "Dodge City",
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
                                            "name": "Dodge City",
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

describe('The myBuses handler', () => {
    process.env.SLACK_WEBHOOK = 'SLACK_MY_BUSES';
    process.env.LOG_LEVEL = 5;
    process.env.SLACK_LEVEL = 5;

    describe('Calling the handler', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        const theEvent = {
            "session": alexaSkillDefaultSession
        };
        const theContext = {
            invokedFunctionArn : 'arn:aws:lambda:eu-west-1:accountid:function:wozitech-alexa-skills-dev-myBuses'
        };
        const mockCallback = jest.fn();

        it('should return exception when env var TFL_API_SECRET_ID is undefined ', async () => {
            try {
                await handler(theEvent, theContext, mockCallback);
            } catch (err) {
                expect(err).toEqual(new Error('Missing env variable for TFL_API_SECRET_ID'));
            }
        });

        // it ('should silently handle error when the event has no intent', async () => {
        //     process.env.TFL_API_SECRET_ID = tflApiEnv;
        //     getTflApiSecretMock.mockImplementationOnce(() => {
        //         throw new Error('Why does this not work?');
        //     });
        //     getTflApiSecretMock.mockRejectedValueOnce(new Error('Why does this not work?'));

        //     const returnVal = await handler(theEvent, theContext, (err, data) => {
        //         // trapping of intent comes before any TFL API lookup
        //         expect(getTflApiSecretMock).not.toHaveBeenCalled();

        //         // expecting a proper format AlexaSkills response
        //         expect(data.version).toEqual('1.0');

        //         // speech is returned
        //         expect(data.response.outputSpeech).toBeDefined();
        //         expect(data.response.outputSpeech.type).toEqual('PlainText');
        //         expect(data.response.outputSpeech.text).toEqual('Where do you need to be?');

        //         // with no intent, we assume the skill is opening, so a conversation will incur
        //         expect(data.response.shouldEndSession).toEqual(false);
        //         expect(data.sessionAttributes).toEqual({
        //             sessionId: alexaSkillDefaultSession.sessionId,
        //             application: alexaSkillDefaultSession.application,
        //             user: alexaSkillDefaultSession.user
        //         });
        //     });
        // });

        it('should call the handler with success but handle a missing destination', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            // poor man's deep copy
            const noDestinationEvent = JSON.parse(JSON.stringify(howLongAlexaExampleEvent));
            delete noDestinationEvent.request.intent.slots;

            const returnVal = await handler(noDestinationEvent, theContext, (err, data) => {                // trapping of intent comes before any TFL API lookup
                expect(getTflApiSecretMock).not.toHaveBeenCalled();

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Missing destination, please tell me where you want to go');

                // we need to prompt for the destination, so this is not over
                expect(data.response.shouldEndSession).toEqual(false);
                expect(data.sessionAttributes).toEqual({
                    sessionId: alexaSkillDefaultSession.sessionId,
                    application: alexaSkillDefaultSession.application,
                    user: alexaSkillDefaultSession.user
                });
            });
        });

        /* it ('should silently handle when an exception is thrown in secrets', async () => {
            delete process.env.TFL_API_SECRET_ID;

console.log("TEST DEBUG: want to throw exception in getTflApiSecret")
            const returnVal = await handler(whenIsAlexaExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).toHaveBeenCalledWith('eu-west-1');

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Bus information is unavailable');

                // we satisfy the intent in full, end of dialog
                expect(data.response.shouldEndSession).toEqual(true);
                expect(data.sessionAttributes).toEqual({});
            });
        });
 
        it ('should silently handle when an exception is thrown in API', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

console.log("TEST DEBUG: want to throw exception in nextBusTo")
            const returnVal = await handler(whenIsAlexaExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).toHaveBeenCalledWith('eu-west-1');

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Bus information is unavailable');

                // we satisfy the intent in full, end of dialog
                expect(data.response.shouldEndSession).toEqual(true);
                expect(data.sessionAttributes).toEqual({});
            });
        });
  */

        it('should call the handler with success for whenIs intent', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            const returnVal = await handler(whenIsAlexaExampleEvent, theContext, (err, data) => {
                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toMatch(/^The next arrivals for the/);

                // we satisfy the intent in full, end of dialog
                expect(data.response.shouldEndSession).toEqual(true);
                expect(data.sessionAttributes).toEqual({});
            });
        });

        it('should call the handler with success for howLong intent', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            const returnVal = await handler(howLongAlexaExampleEvent, theContext, (err, data) => {
                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toMatch(/^The next arrivals for the/);

                // we satisfy the intent in full, end of dialog
                expect(data.response.shouldEndSession).toEqual(true);
                expect(data.sessionAttributes).toEqual({});
            });
        });

        it('should call the handler with success when simply opening the skill', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            const returnVal = await handler(openskillAlexaExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).not.toHaveBeenCalled();

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Where do you need to be?');

                // we need to prompt for the destination, so this is not over
                expect(data.response.shouldEndSession).toEqual(false);
                expect(data.sessionAttributes).toEqual({
                    sessionId: alexaSkillDefaultSession.sessionId,
                    application: alexaSkillDefaultSession.application,
                    user: alexaSkillDefaultSession.user
                });
            });
        });
        it('should call the handler safetly with an unexpected intent - equivalent to open skill', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            const returnVal = await handler(unexpectedIntentExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).not.toHaveBeenCalled();

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Where do you need to be?');

                // we need to prompt for the destination, so this is not over
                expect(data.response.shouldEndSession).toEqual(false);
                expect(data.sessionAttributes).toEqual({
                    sessionId: unexpectedIntentExampleEvent.session.sessionId,
                    application: unexpectedIntentExampleEvent.session.application,
                    user: unexpectedIntentExampleEvent.session.user
                });
            });
        });

        it('should call the handler prompting for more info, if giving a good intent but missing destination', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            const returnVal = await handler(goodIntentButnNoDestinationExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).not.toHaveBeenCalled();

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Missing destination, please tell me where you want to go');

                // we need to prompt for the destination, so this is not over
                expect(data.response.shouldEndSession).toEqual(false);
                expect(data.sessionAttributes).toEqual({
                    sessionId: alexaSkillDefaultSession.sessionId,
                    application: alexaSkillDefaultSession.application,
                    user: alexaSkillDefaultSession.user
                });
            });
        });

        it('should call the handler prompting for more info, if giving a good intent with destination but the destination unknown to our API', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            nextBusToMock.mockReturnValueOnce({
                endpoint: 'null',
                status: 200             // this is required to prevent trapping on TFL unavailable
            });

            const returnVal = await handler(goodIntentWithGivenButUnknownDestinationExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).toHaveBeenCalled();

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('I don\'t know Dodge City');

                // we need to prompt for the destination, so this is not over
                expect(data.response.shouldEndSession).toEqual(false);
                expect(data.sessionAttributes).toEqual({
                    sessionId: alexaSkillDefaultSession.sessionId,
                    application: alexaSkillDefaultSession.application,
                    user: alexaSkillDefaultSession.user
                });
            });
        });

        it('should call the handler safely, even on error in calling out to TFL API', async () => {
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            nextBusToMock.mockReturnValueOnce({
                endpoint: 'https://mocked/endpoint',
                status: 403,
                err: 'Force failure'
            });

            const returnVal = await handler(whenIsAlexaExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).toHaveBeenCalled();

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Bus information is unavailable');

                // we need to prompt for the destination, so this is not over
                expect(data.response.shouldEndSession).toEqual(true);
                expect(data.sessionAttributes).toEqual({});
            });
        });

    });

});