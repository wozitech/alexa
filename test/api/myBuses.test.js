import { handler } from '../../src/api/myBuses';
import AWS  from 'aws-sdk';

const getSecretValueMock = jest.fn();

AWS.SecretsManager = jest.fn( () => ({
    getSecretValue : getSecretValueMock
}));

describe('The myBuses handler', () => {
    describe('Calling the handler', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        const theEvent = {
            httpMethod: 'GET',
            pathParameters : {
                move: true
            }
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

        it('should call the handler', async () => {
            const tglApiEnv = 'TFL_API_Portal';
            process.env.TFL_API_SECRET_ID = tglApiEnv;

            getSecretValueMock.mockReturnValue({
                promise: () => ({
                    SecretString: "{\"tfl_api_app_id\" : 123, \"tfl_api_app_key\" : 456}"
                })
            });

            const returnVal = await handler(theEvent, theContext, mockCallback);
            const theBody = JSON.parse(returnVal.body);

            expect(getSecretValueMock).toHaveBeenCalledWith({SecretId: tglApiEnv});
            expect(theBody.message).toEqual('WOZiTech nextBusto completed.')
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