// this is a prototype that simply imports JSON data
// being the personalised set of destinations and bus routes, with walking distances

// this approach is being used as a stop gap, until a general consumer service
//  allow a whole host of personalised data to be maintained is built as an
//  indepdentent service that can be consumed.

// wrapping as a prototype makes it easy to provide a mock override for use
//  with jest thereby protecting any committing of personal data.

export const getMyBusData = () => {
    return require('../../resources/myBusData.json');
};