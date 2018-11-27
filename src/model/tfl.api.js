// this encapsulates the invocation of TFL API.

// TFL API is a simple HTTP [GET]. Using Axios here to execute a
//  precomposed request:
// https://api.tfl.gov.uk/StopPoint/<stop point id>/Arrivals?app_key=<app key>&app_id=<app id>

import axios from 'axios';

const TFL_API_ENDPOINT = 'https://api.tfl.gov.uk';
const TFL_API_STOP_POINT_ENDPOINT = `${TFL_API_ENDPOINT}/StopPoint`;
const TO_CRYSTAL_PALACE_STOP_POINT = {
    stopPointId: '490013686E',
    route: '417'
};
const TO_CLAPHAM_STOP_POINT = {
    stopPointId: '490010452W2',
    route: '417'
};

export const nextBusTo = async (destination, tflApiDetails) => {
    var apiEndpoint = TFL_API_STOP_POINT_ENDPOINT;

    switch (destination) {
        case 'Clapham':
            apiEndpoint += `/${TO_CLAPHAM_STOP_POINT.stopPointId}/Arrivals`;
            break;

        case 'Crystal Palace':
            apiEndpoint += `/${TO_CRYSTAL_PALACE_STOP_POINT.stopPointId}/Arrivals`;
            break;

        default:
            apiEndpoint = null;
    }

    var nextBusResponse = {
        endpoint: apiEndpoint
    };

    if (apiEndpoint) {
        try {
            const apiResponse = await axios.get(apiEndpoint, {
                params: {
                    app_key: tflApiDetails.tfl_api_app_key,
                    app_id: tflApiDetails.tfl_api_app_id
                }
            });
            console.log("DEBUG tfl.api::nextBusTo: RESP: ", apiResponse.status);

            const nextArrivals = [];
            apiResponse.data.forEach(thisEntity => {
                //console.log("DEBUG: this entity: ", thisEntity);

                // must be a bus
                if (typeof thisEntity.expectedArrival !== 'undefined' &&
                    typeof thisEntity.lineName  !== 'undefined' &&
                    typeof thisEntity.modeName  !== 'undefined' &&
                    thisEntity.lineName === TO_CRYSTAL_PALACE_STOP_POINT.route &&
                    thisEntity.modeName === 'bus') {
                        
                    nextArrivals.push(thisEntity.expectedArrival)
                }
            });

            // ensure the set of next arrivials (in ISO date format) are in chronological sequence
            nextArrivals.sort();
            nextBusResponse.arrivals = nextArrivals;

        } catch (err) {
            console.error("DEBUG tfl.api::nextBusTo: ERR: ", err.response.statusCode, err.response.statusText);

            nextBusResponse.err = err;
        }
    }

    return nextBusResponse;
};