import plotlyCartesian from 'plotly.js/dist/plotly-cartesian';
import Lib from 'plotly.js/src/lib';
import GraphTransformsPanel from '../GraphTransformsPanel';
import {TestEditor, fixtures, mount} from 'lib/test-utils';
import DropdownWidget from '../../components/widgets/Dropdown';
import {TRANSFORMS_LIST} from 'lib/constants';
import realAttributes from './fixtures/summaryTransformAttributes.json';

// A stand-in for Figlinq's `summary` transform. Its attributes come from fixtures/summaryTransformAttributes.json, exported from the real module in Streambed
// (shelly/plotlyjs/static/plotlyjs/src/addons/summaryTransform.js) by `node scripts/exportSummaryAttributes.js <path to that file>`; re-run it and commit the
// fixture when the transform changes. The editor only needs the full transform container; the grouping itself is plotly.js work done in Streambed.
const {attributes} = realAttributes;
const summaryTransform = {
  moduleType: 'transform',
  name: realAttributes.name,
  attributes,
  supplyDefaults(transformIn) {
    const out = {};
    const coerce = (attr, dflt) => Lib.coerce(transformIn, out, attributes, attr, dflt);
    if (!coerce('enabled')) {
      return out;
    }
    Object.keys(attributes)
      .filter((attr) => !['enabled', 'editType', 'confidence'].includes(attr))
      .forEach((attr) => coerce(attr));
    if (out.statistic === 'ci') {
      coerce('confidence');
    }
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

  const mountPanel = (transform, onUpdate = jest.fn(), extra = {}) => {
    const fixture = fixtures.scatter({
      data: [{type: 'bar', transforms: [transform]}],
    });
    return mount(
      <TestEditor {...{...fixture, onUpdate, ...extra}}>
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
    expect(labels.some((label) => /^Confidence level/.test(label))).toBe(false);
  });

  it('shows the confidence level for the confidence interval', () => {
    const editor = mountPanel({type: 'summary', groupssrc: 'x1', statistic: 'ci'});
    expect(labelsOf(editor).some((label) => /^Confidence level/.test(label))).toBe(true);
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
      statistic: 'sem',
      shown: true,
    });
  });

  it('only uses attributes the real transform has (drift check against the exported fixture)', () => {
    const editor = mountPanel({type: 'summary', groupssrc: 'x1', statistic: 'ci'});
    const used = editor
      .find('Field')
      .map((field) => field.prop('attr'))
      .filter(Boolean);
    ['statistic', 'confidence', 'shown', 'grouporder', 'orientation', 'groups', 'target'].forEach(
      (attr) => {
        expect(used).toContain(attr);
        expect(Object.keys(attributes)).toContain(attr);
      }
    );
    // the confidence control accepts the transform's range (0, 1) up to the UI limits
    expect(attributes.confidence.min).toBe(0);
    expect(attributes.confidence.max).toBe(1);
    expect(attributes.statistic.values).toEqual(['sd', 'sem', 'ci']);
  });

  it('writes groups and groupssrc when a column is chosen in the By selector', () => {
    const beforeUpdateTraces = jest.fn();
    const editor = mountPanel({type: 'summary', statistic: 'sem'}, jest.fn(), {beforeUpdateTraces});
    beforeUpdateTraces.mockClear();
    editor.find('[attr="groups"]').last().find(DropdownWidget).prop('onChange')('x1');
    const {update} = beforeUpdateTraces.mock.calls[0][0];
    expect(update['transforms[0].groups']).toEqual([1, 2, 3]);
    expect(update['transforms[0].groupssrc']).toBe('x1');
  });

  it('edits the new controls through updateContainer', () => {
    const beforeUpdateTraces = jest.fn();
    const editor = mountPanel({type: 'summary', groupssrc: 'x1', statistic: 'sem'}, jest.fn(), {
      beforeUpdateTraces,
    });
    beforeUpdateTraces.mockClear();
    const dropdown = editor
      .find('Dropdown')
      .filterWhere((n) => n.prop('options') && n.prop('options').some((o) => o.value === 'ci'))
      .last();
    dropdown.prop('onChange')('ci');
    expect(beforeUpdateTraces.mock.calls[0][0].update).toEqual({'transforms[0].statistic': 'ci'});
  });
});
