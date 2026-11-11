import {getFullTrace} from '..';

describe('getFullTrace', () => {
  const input = {index: 0, name: 'input'};
  const props = {traceIndexes: [0]};

  it('reads _fullInput of a transformed trace', () => {
    const fullData = [
      {index: 0, name: 'transformed', transforms: [{type: 'filter'}], _fullInput: input},
    ];
    expect(getFullTrace(props, {fullData, data: [{}]})).toBe(input);
  });

  it('reads the trace itself for the moving-average and fit transforms (the fit transform is named "fit")', () => {
    ['moving-average', 'fit'].forEach((type) => {
      const trace = {index: 0, transforms: [{type}], _fullInput: input};
      expect(getFullTrace(props, {fullData: [trace], data: [{}]})).toBe(trace);
    });
  });
});
