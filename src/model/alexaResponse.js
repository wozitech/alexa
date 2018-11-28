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

// this returns an AlexaSkill response, if the destination is unknown; prompting Alexa to ask for destination clarification
export const returnUnkwownDestinationResponse = () => {

}

// this returns an AlexaSkills response, choosing between the more specific of whenIs (time) or howLong (duration) speach
// TODO: multiple language support
export const returnScheduledBusesResponse = (destination, intent, arrivals) => {
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
    const preambleSpeach = `The next bus arrivals for ${destination} `;

    switch (intent) {
        case WHEN_IS_INTENT:
            skillResponse.response.outputSpeech.text = formatWhenIsResponse(preambleSpeach, arrivals);
            break;
        case HOW_LONG_INTENT:
            skillResponse.response.outputSpeech.text = formatHowToResponse(preambleSpeach, arrivals);
            break;
        default:
            skillResponse.response.outputSpeech.text = 'Sorry, I don\'t understand what you are asking me.';
    }

    return skillResponse;
};

// this specifically formats the AlexaSkills text as required of 'whenIs' intent;
//  namely, returns speach based on time of schedule
const formatWhenIsResponse = (preamble, arrivals) => {
    let speachResponse = preamble + 'are, ';

    arrivals.forEach( (thisArrival, index) => {
        if (index==0) {
            speachResponse += 'first ';
        } else if (index < (arrivals.length-1)) {
            speachResponse += 'then ';
        } else {
            speachResponse += 'and finally ';
        }

        //const thisArrivalDate = 
        const thisArrivalTime = dateFormat(new Date(thisArrival), 'h:MM');
        speachResponse += thisArrivalTime;

        if (index < (arrivals.length-1)) {
            speachResponse += ', ';
        } else {
            speachResponse += '.';
        }
    });

    return speachResponse;
}

// this specifically formats the AlexaSkills text as required of 'howLong' intent;
//  namely, returns speach based on duration from now
const formatHowToResponse = (preamble, arrivals) => {
    let speachResponse = preamble + 'in ';
    const currentTimestamp = (new Date()).getTime();

    arrivals.forEach( (thisArrival, index) => {
        const thisArrivalDate = new Date(thisArrival);
        const timeInMinutes = Math.floor((thisArrivalDate.getTime() - currentTimestamp) / 1000 / 60);
        
        if (timeInMinutes > 1) {
            if (index==0) {
                speachResponse += '';
            } else if (index < (arrivals.length-1)) {
                speachResponse += ', then ';
            } else {
                speachResponse += ' and finally ';
            }
    
    
            speachResponse += `${timeInMinutes} minutes`;
        }
    });

    return speachResponse;
}
