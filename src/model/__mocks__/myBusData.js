// this is a Jest mock prototype that simply imports test JSON data
// being the personalised set of destinations and bus routes, with walking distances
export const getMyBusData = () => {
    return require('./myBusTestData.json');
};