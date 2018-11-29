// this encapsulates the invocation of TFL API.

// TFL API is a simple HTTP [GET]. Using Axios here to execute a
//  precomposed request:
// https://api.tfl.gov.uk/StopPoint/<stop point id>/Arrivals?app_key=<app key>&app_id=<app id>

import axios from 'axios';

const MAX_NUM_RESULTS = 3;
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
    var filterLineBy = null;    // must be a string for filter comparison to work

    switch (destination.toLowerCase()) {
        case 'clapham':
            apiEndpoint += `/${TO_CLAPHAM_STOP_POINT.stopPointId}/Arrivals`;
            filterLineBy = 417;
            break;

        case 'crystal palace':
            apiEndpoint += `/${TO_CRYSTAL_PALACE_STOP_POINT.stopPointId}/Arrivals`;
            filterLineBy = '417';
            break;

        // this destination forces an error in TFL API
        case 'mythical land':
            apiEndpoint += `/10039549696093/AAAAArrivals`;
            filterLineBy = '000';
            break;
        
        default:
            apiEndpoint = null;
    }

    if (typeof filterLineBy === 'number') {
        filterLineBy = filterLineBy.toString();
    }

    var nextBusResponse = {
        endpoint: apiEndpoint === null ? 'null' : apiEndpoint
    };

    if (apiEndpoint) {
        try {
            const apiResponse = await axios.get(apiEndpoint, {
                params: {
                    app_key: tflApiDetails.tfl_api_app_key,
                    app_id: tflApiDetails.tfl_api_app_id
                }
            });
            nextBusResponse.status = apiResponse.status;
            nextBusResponse.route = filterLineBy;
            //console.log("DEBUG tfl.api::nextBusTo: RESP: ", apiResponse);

            const nextArrivals = [];

            if ([200,201].includes(apiResponse.status) &&
                typeof apiResponse.data !== 'undefined') {
                apiResponse.data.forEach(thisEntity => {
                    //console.log("DEBUG: this entity: ", thisEntity);
    
                    // must be a bus
                    if (typeof thisEntity.expectedArrival !== 'undefined' &&
                        typeof thisEntity.lineName  !== 'undefined' &&
                        typeof thisEntity.modeName  !== 'undefined' &&
                        thisEntity.lineName === filterLineBy &&
                        thisEntity.modeName === 'bus') {
    
                        nextArrivals.push(thisEntity.expectedArrival)
                    }
                });
    
                // ensure the set of next arrivials (in ISO date format) are in chronological sequence
                nextArrivals.sort();

                // and now ensure there are no more than just three results
                nextArrivals.splice(3, nextArrivals.length-MAX_NUM_RESULTS);
                nextBusResponse.arrivals = nextArrivals;
            }

        } catch (err) {
            //console.error("DEBUG: err: ", err);
            nextBusResponse.status = err.response.statusCode;
            nextBusResponse.err = err.response.statusText;
        }
    }

    return nextBusResponse;
};