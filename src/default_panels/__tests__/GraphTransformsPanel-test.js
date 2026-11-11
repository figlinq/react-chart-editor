import plotlyCartesian from 'plotly.js/dist/plotly-cartesian';
import Lib from 'plotly.js/src/lib';
import GraphTransformsPanel from '../GraphTransformsPanel';
import {TestEditor, fixtures, mount} from 'lib/test-utils';
import {TRANSFORMS_LIST} from 'lib/constants';

// A stand-in for Figlinq's `summary` transform (streambed: shelly/plotlyjs/static/plotlyjs/src/addons/summaryTransform.js) with the same attributes and
// supplyDefaults. The editor only needs the full transform container; the grouping itself is plotly.js work done in Streambed.
const attributes = {
  enabled: {valType: 'boolean', dflt: true, editType: 'calc'},
  groups: {valType: 'data_array', dflt: [], editType: 'calc'},
  target: {valType: 'data_array', dflt: [], editType: 'calc'},
  statistic: {valType: 'enumerated', values: ['sd', 'sem', 'ci'], dflt: 'sd', editType: 'calc'},
  confidence: {valType: 'number', min: 0, max: 1, dflt: 0.95, editType: 'calc'},
  orientation: {valType: 'enumerated', values: ['v', 'h'], dflt: 'v', editType: 'calc'},
  shown: {valType: 'boolean', dflt: true, editType: 'calc'},
  grouporder: {valType: 'enumerated', values: ['first', 'sorted'], dflt: 'first', editType: 'calc'},
  groupssrc: {valType: 'string', editType: 'none'},
  targetsrc: {valType: 'string', editType: 'none'},
  editType: 'calc',
};
const summaryTransform = {
  moduleType: 'transform',
  name: 'summary',
  attributes,
  supplyDefaults(transformIn) {
    const out = {};
    const coerce = (attr, dflt) => Lib.coerce(transformIn, out, attributes, attr, dflt);
    if (!coerce('enabled')) {
      return out;
    }
    coerce('groups');
    coerce('target');
    if (coerce('statistic') === 'ci') {
      coerce('confidence');
    }
    coerce('orientation');
    coerce('shown');
    coerce('grouporder');
    coerce('groupssrc');
    coerce('targetsrc');
    return out;
  },
  calcTransform() {},
};

const labelsOf = (editor) =>
  editor
    .find('Field')
    .map((field) => field.prop('label'))
    .filter(Boolean);

describe('<GraphTransformsPanel> with a summary transform', () => {
  beforeAll(() => {
    plotlyCartesian.register(summaryTransform);
  });

  const mountPanel = (transform, onUpdate = jest.fn()) => {
    const fixture = fixtures.scatter({
      data: [{type: 'bar', transforms: [transform]}],
    });
    return mount(
      <TestEditor {...{...fixture, onUpdate}}>
        <GraphTransformsPanel />
      </TestEditor>
    );
  };

  it('is in the list of transforms the data selectors know', () => {
    expect(TRANSFORMS_LIST).toContain('summary');
  });

  it('shows a Summarize fold with the statistic, show n, group order and orientation controls', () => {
    const editor = mountPanel({type: 'summary', groupssrc: 'x1', statistic: 'sem'});
    const names = editor.find('PlotlyFold').map((fold) => fold.prop('name'));
    expect(names.some((name) => /^Summarize/.test(name))).toBe(true);
    const labels = labelsOf(editor);
    ['Error bars', 'Show n', 'Group order', 'Orientation', 'By', 'Target'].forEach((label) =>
      expect(labels).toContain(label)
    );
    // the confidence level only belongs to the interval
    expect(labels).not.toContain('Confidence level');
  });

  it('shows the confidence level for the confidence interval', () => {
    const editor = mountPanel({type: 'summary', groupssrc: 'x1', statistic: 'ci'});
    expect(labelsOf(editor)).toContain('Confidence level');
  });

  it('does not show filter or sort controls in the summary fold', () => {
    const labels = labelsOf(mountPanel({type: 'summary', groupssrc: 'x1'}));
    expect(labels).not.toContain('Operator');
    expect(labels).not.toContain('Value');
  });

  it('offers Summarize in the add menu and adds it with sensible defaults', () => {
    const fixture = fixtures.scatter({data: [{type: 'bar'}]});
    const onUpdate = jest.fn();
    const editor = mount(
      <TestEditor {...{...fixture, onUpdate}}>
        <GraphTransformsPanel />
      </TestEditor>
    );
    const addAction = editor
      .find('PlotlyPanel')
      .filterWhere((panel) => panel.prop('addAction'))
      .first()
      .prop('addAction');
    const summarize = addAction.handler.find(({label}) => label === 'Summarize');
    expect(summarize).toBeTruthy();
    const updateContainer = jest.fn();
    summarize.handler({fullContainer: {transforms: []}, updateContainer});
    expect(updateContainer.mock.calls[0][0]['transforms[0]']).toEqual({
      type: 'summary',
      groupssrc: null,
      groups: null,
      target: [],
      targetsrc: null,
      statistic: 'sem',
      shown: true,
    });
  });
});
