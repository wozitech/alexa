import { nextBusTo } from '../../src/model/tfl.api';
import axios from 'axios';
import { executionAsyncId } from 'async_hooks';
jest.mock('axios');


// the expected good return value; includes set of entities not in time sequence,
//  but also some unexpected entities
axios.get.mockReturnValue({
    status: 200,
    data: [{
            modeName: 'bus',
            lineName: '417',
            expectedArrival: '2018-11-27T11:13:33Z',
        },{
            modeName: 'train',
            lineName: '417',
            expectedArrival: '2018-11-27T09:44:02Z',
        },{
        },{
            modeName: 'bus',
            lineName: '219',
            expectedArrival: '2018-11-27T09:41:17Z',
        },{
        },{
            modeName: 'bus',
            lineName: '417',
            expectedArrival: '2018-11-27T09:44:02Z',
        },{
            modeName: 'bus',
            lineName: '417',
            expectedArrival: '2018-11-27T11:19:05Z',
        },{
            modeName: 'bus',
            lineName: '417',
            expectedArrival: '2018-11-27T11:23:43Z',
        }
    ]
});

const mockTflApiDetails = {
    tfl_api_app_key: 123,
    tfl_api_app_id: 345
};

// test conditions on nextBusTo:
//  1. unknown destination
//  2. axios.get exception
//  3. axios.get response that is empty; expect on endpoint response value
//  4. axios.get response that is non-empty but no data for given line
//  5. axios.get response that is non-empty and includes line data in unexpected time order. Expect on arrivals in good time order

describe('The TFL API Model', () => {
    describe('Calling myNextBus', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return with success but empty results on unknown destination', async () => {
            const expectedResults = await nextBusTo('Edinburgh', mockTflApiDetails);
            expect(expectedResults.endpoint).toEqual('null');
        });

        it('should handle silently non-success response from TFL API', async () => {
            axios.get.mockReturnValueOnce ({
                status: 400
            });
            const expectedResults = await nextBusTo('Crystal Palace', mockTflApiDetails);
            expect(expectedResults.endpoint).toEqual('https://api.tfl.gov.uk/StopPoint/490013686E/Arrivals');
            expect(expectedResults.status).toEqual(400);
        });

        it('should handle silently success response from TFL API, but empty set of data', async () => {
            axios.get.mockReturnValueOnce({
                status: 200
            });
            const expectedResults = await nextBusTo('Clapham', mockTflApiDetails);
            expect(expectedResults.status).toEqual(200);
            expect(expectedResults.endpoint).toEqual('https://api.tfl.gov.uk/StopPoint/490010452W2/Arrivals');
        });

        it('should return success response from TFL API, sorting and limiting data', async () => {
            const expectedResults = await nextBusTo('Clapham', mockTflApiDetails);
            expect(expectedResults.status).toEqual(200);
            expect(expectedResults.endpoint).toEqual('https://api.tfl.gov.uk/StopPoint/490010452W2/Arrivals');
            expect(expectedResults.arrivals.length).toEqual(3);
            expect(expectedResults.arrivals[0]).toEqual('2018-11-27T09:44:02Z');
        });

        it('should handle silently axios exception', async () => {
            axios.get.mockImplementation(() => {
                throw {
                    response: {
                        statusCode: 401,
                        statusText: 'axios error'
                    }
                };
            });
            const expectedResults = await nextBusTo('Crystal Palace', mockTflApiDetails);
            expect(expectedResults.endpoint).toEqual('https://api.tfl.gov.uk/StopPoint/490013686E/Arrivals');
            expect(expectedResults.status).toEqual(401);
            expect(expectedResults.err).toEqual('axios error');
        });

    });
});