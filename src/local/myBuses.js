const myHello = require('../../lib/myBuses');

const myBuses = async () => {
    try {
        console.log("About to call myBuses handler");

        const returnVal = await myHello.handler(
            {
                param1: "myBus"
            },
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