// test conditions on nextBusTo:
//  1. unknown destination
//  2. axios.get exception
//  3. axios.get response that is empty; expect on endpoint response value
//  4. axios.get response that is non-empty but no data for given line
//  5. axios.get response that is non-empty and includes line data in unexpected time order. Expect on arrivals in good time order