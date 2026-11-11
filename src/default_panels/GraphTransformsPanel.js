import PropTypes from 'prop-types';
import {
  Radio,
  TransformAccordion,
  TraceAccordion,
  DataSelector,
  Dropdown,
  Numeric,
  PlotlySection,
  FilterOperation,
  FilterValue,
} from '../components';
import {connectAggregationToTransform} from '../lib';
import {TRANSFORMABLE_TRACES} from 'lib/constants';

const AggregationSection = connectAggregationToTransform(PlotlySection);

export const Aggregations = (props, context) => {
  const {
    fullContainer: {aggregations = []},
    localize: _,
  } = context;

  if (aggregations.length === 0) {
    return null;
  }

  return (
    <PlotlySection name={_('Aggregations')} attr="aggregations">
      {aggregations
        .filter((aggr) => !(aggr?.target && aggr.target.match(/transforms\[\d*\]\./gi)))
        .map(({target}, i) => (
          <AggregationSection show key={i} aggregationIndex={i}>
            <Dropdown
              attr="func"
              label={target}
              options={[
                {
                  label: _('Count'),
                  value: 'count',
                },
                {
                  label: _('Sum'),
                  value: 'sum',
                },
                {
                  label: _('Average'),
                  value: 'avg',
                },
                {
                  label: _('Median'),
                  value: 'median',
                },
                {
                  label: _('Mode'),
                  value: 'mode',
                },
                {
                  label: _('RMS'),
                  value: 'rms',
                },
                {
                  label: _('Standard Deviation'),
                  value: 'stddev',
                },
                {
                  label: _('Min'),
                  value: 'min',
                },
                {
                  label: _('Max'),
                  value: 'max',
                },
                {
                  label: _('First'),
                  value: 'first',
                },
                {
                  label: _('Last'),
                  value: 'last',
                },
                {
                  label: _('Change'),
                  value: 'change',
                },
                {
                  label: _('Range'),
                  value: 'range',
                },
              ]}
              clearable={false}
            />
          </AggregationSection>
        ))}
    </PlotlySection>
  );
};

Aggregations.plotly_editor_traits = {no_visibility_forcing: true};
Aggregations.contextTypes = {
  fullContainer: PropTypes.object,
  container: PropTypes.object,
  localize: PropTypes.func,
};

const GraphTransformsPanel = (props, {localize: _}) => (
  <TraceAccordion traceFilterCondition={(t) => TRANSFORMABLE_TRACES.includes(t.type)}>
    <TransformAccordion>
      <Radio
        attr="enabled"
        options={[
          {label: _('Enabled'), value: true},
          {label: _('Disabled'), value: false},
        ]}
      />

      <DataSelector label={_('By')} attr="groups" />

      <DataSelector label={_('Target')} attr="target" />
      <FilterOperation label={_('Operator')} attr="operation" />
      <FilterValue label={_('Value')} attr="value" />

      <Radio
        attr="order"
        options={[
          {label: _('Ascending'), value: 'ascending'},
          {label: _('Descending'), value: 'descending'},
        ]}
      />

      <Aggregations />

      <Dropdown
        label={_('Error bars')}
        attr="statistic"
        options={[
          {label: _('SD (standard deviation)'), value: 'sd'},
          {label: _('SEM (standard error of the mean)'), value: 'sem'},
          {label: _('Confidence interval of the mean'), value: 'ci'},
        ]}
        clearable={false}
      />
      <Numeric label={_('Confidence level')} attr="confidence" min={0.5} max={0.9999} step={0.01} />
      <Radio
        label={_('Show n')}
        attr="shown"
        options={[
          {label: _('Yes'), value: true},
          {label: _('No'), value: false},
        ]}
      />
      <Radio
        label={_('Group order')}
        attr="grouporder"
        options={[
          {label: _('First seen'), value: 'first'},
          {label: _('Sorted'), value: 'sorted'},
        ]}
      />
      <Radio
        label={_('Orientation')}
        attr="orientation"
        options={[
          {label: _('Vertical'), value: 'v'},
          {label: _('Horizontal'), value: 'h'},
        ]}
      />
    </TransformAccordion>
  </TraceAccordion>
);

GraphTransformsPanel.contextTypes = {
  localize: PropTypes.func,
};

export default GraphTransformsPanel;
