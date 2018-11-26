import { handler } from '../src/myBuses';

describe('The myBuses handler', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Calling the handler', () => {
        const theEvent = {
            httpMethod: 'GET',
            pathParameters : {
                move: true
            }
        };
        const mockCallback = jest.fn();

        it('should call the handler', async () => {
            const returnVal = await handler(theEvent, {});
            const theBody = JSON.parse(returnVal.body);
            expect(JSON.parse(returnVal.body).message).toEqual('Go Serverless v1.0! Your function executed successfully!')
        });
            
    });
});