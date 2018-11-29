const myHello = require('../../lib/myBuses');

// stripped out to just the request
const missingIntentExampleEvent = {
    "version": "1.0",
    "session": {
        "new": true,
        "sessionId": "amzn1.echo-api.session.2f8f91d4-fed4-445f-bd2a-923c27db6072",
        "application": {
            "applicationId": "amzn1.ask.skill.2ba78764-0a67-481f-907a-3f7c08287aeb"
        },
        "user": {
            "userId": "amzn1.ask.account.AEGDLGI2QMONKDWOIBWRN7KLRXOYMNXOCN3MCECKPBE7SVWDSIEEVKVF7ZVHHPRBBMSETSBSB4BVV3RJVFEO4JT2TSJVTG7FJAGIS5RP2RTUFT5464HJRBTEI4C6BAMHLW6ZTNQ3QJHXBUKIE7ZX5YGOYBCEJCN57BDV7JAHWBH7ZR67C2TLUGQBW5TVVVVMHHUVYVAPADEAWWQ"
        }
    },
};

const myBuses = async () => {
    try {
        console.log("About to call myBuses handler");

        const returnVal = await myHello.handler(
            missingIntentExampleEvent,
            { invokedFunctionArn : 'arn:aws:lambda:eu-west-2:accountid:function:wozitech-alexa-skills-dev-myBuses' },
            (err, data) => {
                if (err) console.error(err);
                console.log("LOCAL: My results: ", data);
            }
        );
        console.log("MyBuses.Handler returned: ", returnVal);
    } catch (err) {
        console.error("Caught local error: ", err);
    }
}

process.env.TFL_API_SECRET_ID = 'TFL_API_Portal';
myBuses();