import dateFormat from 'dateformat';
/*
 * An example response below. A card can provide additional info to the Alexa
   app (phone) or website, or if the device has a display, graphical content.
 {
    "version": "1.0",
    "sessionAttributes": {
        "key": "value"
    },
    "response": {
        "outputSpeech": {
            "type": "PlainText",
            "text": "Plain text string to speak",
            "ssml": "<speak>SSML text string to speak</speak>",
            "playBehavior": "REPLACE_ENQUEUED"      
        },
        "card": {
            "type": "Standard",
            "title": "Title of the card",
            "content": "Content of a simple card",
            "text": "Text content for a standard card",
            "image": {
                "smallImageUrl": "https://url-to-small-card-image...",
                "largeImageUrl": "https://url-to-large-card-image..."
            }
        },
        "reprompt": {
            "outputSpeech": {
                "type": "PlainText",
                "text": "Plain text string to speak",
                "ssml": "<speak>SSML text string to speak</speak>",
                "playBehavior": "REPLACE_ENQUEUED"             
            }
        },
        "directives": [
            {
                "type": "InterfaceName.Directive"
                (...properties depend on the directive type)
            }
        ],
        "shouldEndSession": true
    }
  }
 */

const formatBusNumberSpeech = (busNumber) => {
    if (typeof busNumber === 'string') {
        busNumber = parseInt(busNumber, 10);
    }

    if (busNumber > 100) {
        // bus number must be spelt out
        let modifiedNumber = '';
        busNumber.toString().split('').forEach((thisChar, index) => {
            if (index == 0) {
                modifiedNumber += thisChar;
            } else {
                modifiedNumber += ` ${thisChar}`;
            }
        });
        return modifiedNumber;
    } else {
        return `Number ${busNumber}`;
    }
}

const formatSessionResponse = (session) => {
    if (typeof session !== 'undefined') {
        return {
            sessionId: session.sessionId,
            application: session.application,
            user: session.user
        }
    } else {
        return null;
    }
};

// this returns an AlexaSkill response, when unable to get bus information
export const returnUnableToGetBusInfoResponse = () => {
    const responses = [
        `Sorry, I am not able to get bus information at present`,
        `I am not able to get bus information at present`,
        `Sorry, bus info is not available`,
        `Bus info is not available`,
        `Sorry, there is no bus information at present`,
        `Bus information is unavailable`,
    ];

    return {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: responses[Math.floor((Math.random()*responses.length))],
          playBehavior: "REPLACE_ENQUEUED"      
        },
        shouldEndSession: true
      },
      sessionAttributes: {}
    };
};


// this returns an AlexaSkill response, if the destination is unknown (is given by skill
//  but not resolve by our TFL API); prompting Alexa to ask for destination clarification
// we expect to prompt Alexa to ask again for the Destination, or for the user to
//  invoke the default stop intent
export const returnUnknownDestinationResponse = (skillDestination, session) => {
    const responses = [
        `Sorry, I don't know how to get to ${skillDestination}`,
        `${skillDestination} is not known to me`,
        `I don't know how to get to ${skillDestination}`,
        `${skillDestination} is unknown to me`,
        `I don't know ${skillDestination}`,
    ];

    return {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: responses[Math.floor((Math.random()*responses.length))],
          playBehavior: "REPLACE_ENQUEUED"      
        },
        shouldEndSession: false
      },
      sessionAttributes: formatSessionResponse(session)
    };
};

// this returns an AlexaSkill response, if the destination is not given with the intent
// we expect to prompt Alexa to ask again for the Destination, or for the user to
//  invoke the default stop intent
export const returnNoDestinationResponse = (session) => {
    const responses = [
        'Sorry, I am unable to determine your destination',
        'I am unable to determine your destination',
        'Sorry, I can\'t determine your destination',
        'I can\'t determine your destination',
        'Sorry, you have not said your destination',
        'You have not said your destination',
        'Sorry, I don\'t have your destination',
        'I don\'t have your destination',
        'Missing destination, please tell me where you want to go'
    ];

    return {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: responses[Math.floor((Math.random()*responses.length))],
          playBehavior: "REPLACE_ENQUEUED"      
        },
        shouldEndSession: false
      },
      sessionAttributes: formatSessionResponse(session)
    };
};

export const returnSkillOpenedResponse = (session) => {
    const responses = [
        'Hello, where are you going?',
        'Where are you going?',
        'Hello, where are you wanting to go?',
        'Where are you wanting to go?',
        'OK, where do you need to be?',
        'Where do you need to be?',
    ];

    return {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: responses[Math.floor((Math.random()*responses.length))],
          playBehavior: "REPLACE_ENQUEUED"      
        },
        shouldEndSession: false
      },
      sessionAttributes: formatSessionResponse(session)
    };
}


// this returns an AlexaSkills response, choosing between the more specific of whenIs (time) or howLong (duration) speach
// TODO: multiple language support
export const returnScheduledBusesResponse = (destination, intent, route, arrivals, walkingTime) => {
    const skillResponse = {
      version: "1.0",
      response: {
        outputSpeech: {
            type: "PlainText",
            text: "Plain text string to speak",
            ssml: "<speak>SSML text string to speak</speak>",
            playBehavior: "REPLACE_ENQUEUED"      
        },
        shouldEndSession: true
      },
      sessionAttributes: {},
    };

    let fullSpeach = '';
    const HOW_LONG_INTENT = 'howLong';
    const WHEN_IS_INTENT = 'whenIs';

    const spokenBusRoute = formatBusNumberSpeech(route);

    const preambleSpeach = `The next arrivals for the, ${spokenBusRoute} bus, going to ${destination}, are`;

    switch (intent) {
        case WHEN_IS_INTENT:
            skillResponse.response.outputSpeech.text = formatWhenIsResponse(preambleSpeach, arrivals, walkingTime);
            break;
        case HOW_LONG_INTENT:
            skillResponse.response.outputSpeech.text = formatHowToResponse(preambleSpeach, arrivals, walkingTime);
            break;
        default:
            skillResponse.response.outputSpeech.text = 'Sorry, I don\'t understand what you are asking me.';
    }

    return skillResponse;
};

// this specifically formats the AlexaSkills text as required of 'whenIs' intent;
//  namely, returns speach based on time of schedule
const formatWhenIsResponse = (preamble, arrivals, walkingTime) => {
    let speachResponse = preamble + ' ';
    const currentTimestamp = (new Date()).getTime();

    let actualArrrivalIndex = 0;
    let totalArrivals = arrivals.length-1;
    arrivals.forEach( (thisArrival, index) => {
        const thisArrivalDate = new Date(thisArrival);

        const minimumTimeDiff = walkingTime*1000; // 60 second * 1000 milliseconds
        if ((thisArrivalDate.getTime() - currentTimestamp) > minimumTimeDiff) {
            if (actualArrrivalIndex==0) {
                speachResponse += 'first ';
            } else if (actualArrrivalIndex < totalArrivals) {
                speachResponse += ', then ';
            } else {
                speachResponse += ' and finally ';
            }
    
            //const thisArrivalDate = 
            const thisArrivalTime = dateFormat(new Date(thisArrival), 'h:MM');
            speachResponse += thisArrivalTime;
            actualArrrivalIndex++;
    
        }
    });

    return speachResponse;
};

// this specifically formats the AlexaSkills text as required of 'howLong' intent;
//  namely, returns speach based on duration from now
const formatHowToResponse = (preamble, arrivals, walkingTime) => {
    let speachResponse = preamble + ' in ';
    const currentTimestamp = (new Date()).getTime();

    let actualArrrivalIndex = 0;
    let totalArrivals = arrivals.length-1;
    arrivals.forEach( (thisArrival, index) => {
        const thisArrivalDate = new Date(thisArrival);
        const timeDiffInSeconds = Math.floor((thisArrivalDate.getTime() - currentTimestamp) / 1000);

        if (timeDiffInSeconds > walkingTime) {
            if (actualArrrivalIndex==0) {
                speachResponse += '';
            } else if (actualArrrivalIndex < totalArrivals) {
                speachResponse += ', then ';
            } else {
                speachResponse += ' and finally ';
            }

            speachResponse += `${Math.floor(timeDiffInSeconds / 60)} minutes`;
            actualArrrivalIndex++;
        }
    });

    return speachResponse;
};
