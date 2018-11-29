import { handler } from '../../src/api/myBuses';
import AWS  from 'aws-sdk';
import * as TFL from '../../src/model/tfl.api';
import * as MySecrets from '../../src/aws/secrets';

const getSecretValueMock = jest.fn();
const nextBusToMock = jest.fn();
const getTflApiSecretMock = jest.fn();

// the Alexa responses are randomised to offer a more personal touch, but this makes
//  unit testing somewhat difficult.
// Overriding the global Math.random function to always return the same result,
//  and hence predictable AlexaSkill responses.
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.999;   // always returns the last
global.Math = mockMath;

AWS.SecretsManager = jest.fn( () => ({
    getSecretValue : getSecretValueMock
}));



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
getTflApiSecretMock.mockReturnValue({
    tfl_api_app_id : 123,
    tfl_api_app_key : 456
});

const alexaSkillDefaultSession = {
    "new": true,
    "sessionId": "amzn1.echo-api.session.2f8f91d4-fed4-445f-bd2a-923c27db6072",
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

describe('The myBuses handler', () => {
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

        it ('should return exception when the fetched secret is not as expected', async () => {
            getSecretValueMock.mockReturnValueOnce({
                promise: () => ({
                    empty: true
                })
            });
            try {
                const tglApiEnv = 'TFL_API_Portal';
                process.env.TFL_API_SECRET_ID = tglApiEnv;
                await handler(theEvent, theContext, mockCallback);
            } catch (err) {
                expect(err).toEqual(new Error('Unknown TFL API'));
            }
        });

        it ('should return exception when the fetched secret is not as expected', async () => {
            getSecretValueMock.mockReturnValueOnce({
                promise: () => ({
                    SecretString: "{\"empty\" : true}"
                })
            });
            try {
                const tglApiEnv = 'TFL_API_Portal';
                process.env.TFL_API_SECRET_ID = tglApiEnv;
                await handler(theEvent, theContext, mockCallback);
            } catch (err) {
                expect(err).toEqual(new Error('Unexpected TFL API credentials'));
            }
        });

        it ('should silently handle error when the event has no intent', async () => {
            const tflApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            getSecretValueMock.mockReturnValue({
                promise: () => ({
                    SecretString: "{\"tfl_api_app_id\" : 123, \"tfl_api_app_key\" : 456}"
                })
            });

            const returnVal = await handler(theEvent, theContext, (err, data) => {
                // trapping of intent comes before any TFL API lookup
                expect(getTflApiSecretMock).not.toHaveBeenCalled();

                // expecting a proper format AlexaSkills response
                expect(data.version).toEqual('1.0');

                // speech is returned
                expect(data.response.outputSpeech).toBeDefined();
                expect(data.response.outputSpeech.type).toEqual('PlainText');
                expect(data.response.outputSpeech.text).toEqual('Where do you need to be?');

                // with no intent, we assume the skill is opening, so a conversation will incur
                expect(data.response.shouldEndSession).toEqual(false);
                expect(data.sessionAttributes).toEqual({
                    sessionId: alexaSkillDefaultSession.sessionId,
                    application: alexaSkillDefaultSession.application,
                    user: alexaSkillDefaultSession.user
                });
            });
        });

        it('should call the handler with success for whenIs intent', async () => {
            const tflApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            const returnVal = await handler(whenIsAlexaExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).toHaveBeenCalledWith('eu-west-1',tflApiEnv);

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
            const tflApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            const returnVal = await handler(howLongAlexaExampleEvent, theContext, (err, data) => {
                expect(getTflApiSecretMock).toHaveBeenCalledWith('eu-west-1',tflApiEnv);

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

        it('should call the handler with success but handle a missing destination', async () => {
            const tflApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            getSecretValueMock.mockReturnValue({
                promise: () => ({
                    SecretString: "{\"tfl_api_app_id\" : 123, \"tfl_api_app_key\" : 456}"
                })
            });

            const noDestinationEvent = howLongAlexaExampleEvent;
            delete noDestinationEvent.request.intent.slots;

            const returnVal = await handler(noDestinationEvent, theContext, (err, data) => {
                // trapping of intent comes before any TFL API lookup
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
        
    });

});