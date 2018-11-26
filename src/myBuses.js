'use strict';

export const handler = async (event, context, callback) => {
  console.log("Inside myBuses.handler")
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
};
