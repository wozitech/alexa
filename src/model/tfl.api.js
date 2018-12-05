// this encapsulates the invocation of TFL API.

// TFL API is a simple HTTP [GET]. Using Axios here to execute a
//  precomposed request:
// https://api.tfl.gov.uk/StopPoint/<stop point id>/Arrivals?app_key=<app key>&app_id=<app id>

import axios from 'axios';
import { getMyBusData } from './myBusData';
import { logDebug, logTrace } from '../common/logger';

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
    let apiEndpoint = TFL_API_STOP_POINT_ENDPOINT;
    let filterLineBy = null;    // must be a string for filter comparison to work

    const myBusData = getMyBusData();
    //console.log("WA DEBUG: my imported bus data: ", myBusData);
    const foundDestination = myBusData.find((thisDestination) => {
        return thisDestination.destination.toLowerCase() === destination.toLowerCase();
    });

    if (foundDestination) {
        try {
            const apiUrl = `${TFL_API_STOP_POINT_ENDPOINT}/${foundDestination.stopPoint}/Arrivals`;
            logTrace("tfl.api::nextBusTo - About to call upon TFL API with url", apiUrl);
            const apiResponse = await axios.get(apiUrl, {
                params: {
                    app_key: tflApiDetails.tfl_api_app_key,
                    app_id: tflApiDetails.tfl_api_app_id
                }
            });
            logTrace("tfl.api::nextBusTo API Response", apiResponse);

            const nextArrivals = [];
            if ([200,201].includes(apiResponse.status) &&
                typeof apiResponse.data !== 'undefined') {
                apiResponse.data.forEach(thisEntity => {
                    // must be a bus
                    if (typeof thisEntity.expectedArrival !== 'undefined' &&
                        typeof thisEntity.lineName  !== 'undefined' &&
                        typeof thisEntity.modeName  !== 'undefined' &&
                        thisEntity.lineName === foundDestination.line.toString() &&
                        thisEntity.modeName === 'bus') {
    
                        nextArrivals.push(thisEntity.expectedArrival)
                    }
                });
    
                // ensure the set of next arrivials (in ISO date format) are in chronological sequence
                nextArrivals.sort();

                // and now ensure there are no more than just three results
                nextArrivals.splice(3, nextArrivals.length-MAX_NUM_RESULTS);
            }

            const response = {
                status: apiResponse.status,
                route: foundDestination.line.toString(),
                walkingTime: foundDestination.walkTime,
                arrivals: nextArrivals
            };
            logDebug("tfl.api::nextBusTo to return", response);

            return response;

        } catch (err) {
            //console.error("DEBUG: err: ", err);
            nextBusResponse.status = err.response.statusCode;
            nextBusResponse.err = err.response.statusText;
        }
    } else {
        return {
            endpoint: 'null',
            status: 500
        }
    }

    return nextBusResponse;
};