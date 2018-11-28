import { handler } from '../../src/api/myBuses';
import AWS  from 'aws-sdk';
import * as TFL from '../../src/model/tfl.api';

const getSecretValueMock = jest.fn();
const nextBusToMock = jest.fn();

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


AWS.SecretsManager = jest.fn( () => ({
    getSecretValue : getSecretValueMock
}));

TFL.nextBusTo = nextBusToMock;
nextBusToMock.mockReturnValue({
    endpoint: 'https://mocked/endpoint',
    arrivals: [
        '2018-11-27T11:13:33Z',
        '2018-11-27T09:44:02Z',
        '2018-11-27T11:19:05Z',
    ]
});

describe('The myBuses handler', () => {
    describe('Calling the handler', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        const theEvent = {

        };
        const theContext = {
            invokedFunctionArn : 'arn:aws:lambda:eu-west-2:accountid:function:wozitech-alexa-skills-dev-myBuses'
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

            const returnVal = await handler(theEvent, theContext, mockCallback);
            //const theBody = JSON.parse(returnVal.body);

            expect(getSecretValueMock).toHaveBeenCalledWith({SecretId: tflApiEnv});
            expect(returnVal.statusCode).toEqual(200);
            expect(returnVal.arrivals).not.toBeDefined();
            expect(returnVal.request).toBeNull();
            expect(returnVal.rawRequest).toBeNull();
        });

        it('should call the handler with success for whenIs intent', async () => {
            const tflApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            getSecretValueMock.mockReturnValue({
                promise: () => ({
                    SecretString: "{\"tfl_api_app_id\" : 123, \"tfl_api_app_key\" : 456}"
                })
            });

            const returnVal = await handler(whenIsAlexaExampleEvent, theContext, mockCallback);
            //const theBody = JSON.parse(returnVal.body);

            expect(returnVal.statusCode).toEqual(200);
            expect(getSecretValueMock).toHaveBeenCalledWith({SecretId: tflApiEnv});
            expect(returnVal.request).toMatch('WOZiTech Becks with intent (whenIs) to Clapham');
            expect(returnVal.arrivals.length).toEqual(3);
            expect(returnVal.arrivals[1]).toEqual('2018-11-27T09:44:02Z');
            expect(returnVal).toMatchSnapshot();
        });

        it('should call the handler with success for howLong intent', async () => {
            const tflApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tflApiEnv;

            getSecretValueMock.mockReturnValue({
                promise: () => ({
                    SecretString: "{\"tfl_api_app_id\" : 123, \"tfl_api_app_key\" : 456}"
                })
            });

            const returnVal = await handler(howLongAlexaExampleEvent, theContext, mockCallback);
            //const theBody = JSON.parse(returnVal.body);

            expect(returnVal.statusCode).toEqual(200);
            expect(getSecretValueMock).toHaveBeenCalledWith({SecretId: tflApiEnv});
            expect(returnVal.request).toMatch('WOZiTech Becks with intent (howLong) to Crystal Palace');
            expect(returnVal.arrivals.length).toEqual(3);
            expect(returnVal.arrivals[1]).toEqual('2018-11-27T09:44:02Z');
            expect(returnVal).toMatchSnapshot();
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

            const returnVal = await handler(howLongAlexaExampleEvent, theContext, mockCallback);
            //const theBody = JSON.parse(returnVal.body);

            expect(returnVal.statusCode).toEqual(200);
            expect(getSecretValueMock).toHaveBeenCalledWith({SecretId: tflApiEnv});
            expect(returnVal.request).toMatch('WOZiTech Becks with intent (howLong)');
            expect(returnVal.arrivals).not.toBeDefined();
            expect(returnVal.rawRequest.destination).toBeNull();
            expect(returnVal.rawRequest.intent).toEqual('howLong');
        });
        
    });

    describe('Calling the next bus model', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        // Need to mock "nextBusTo"
        // test conditions:
        //  1. unknown destination - returns success, but the response.err is set
        //  2. exception (simulates an Axios.get error - could be gateway et al)

    });
});