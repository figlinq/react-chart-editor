import PlotlyFold from './PlotlyFold';
import PlotlyPanel from './PlotlyPanel';
import PropTypes from 'prop-types';
import {connectRangeSelectorToAxis, getParsedTemplateString} from 'lib';
import {EDITOR_ACTIONS} from 'lib/constants';

const RangeSelectorFold = connectRangeSelectorToAxis(PlotlyFold);

const RangeSelectorAccordion = ({children}, {fullContainer, layout, localize: _}) => {
  if (
    !fullContainer?.rangeselector?.visible ||
    // next line checks for "all" case
    fullContainer._axisGroup === 0
  ) {
    return null;
  }

  const {
    rangeselector: {buttons = []},
  } = fullContainer;

  const content =
    buttons.length &&
    buttons.map((btn, i) => (
      <RangeSelectorFold
        key={i}
        rangeselectorIndex={i}
        name={getParsedTemplateString(btn.label, {meta: layout})}
        canDelete={true}
      >
        {children}
      </RangeSelectorFold>
    ));

  const addAction = {
    label: _('Button'),
    handler: ({fullContainer, updateContainer}) => {
      if (updateContainer) {
        const rangeselectorIndex = Array.isArray(fullContainer.rangeselector.buttons)
          ? fullContainer.rangeselector.buttons.length
          : 0;

        updateContainer(
          {
            [`rangeselector.buttons[${rangeselectorIndex}]`]: {},
          },
          EDITOR_ACTIONS.ADD_RANGESELECTOR
        );
      }
    },
  };

  return <PlotlyPanel addAction={addAction}>{content || null}</PlotlyPanel>;
};

RangeSelectorAccordion.contextTypes = {
  fullContainer: PropTypes.object,
  localize: PropTypes.func,
  layout: PropTypes.object,
};

RangeSelectorAccordion.propTypes = {
  children: PropTypes.node,
};

RangeSelectorAccordion.plotly_editor_traits = {
  no_visibility_forcing: true,
};

export default RangeSelectorAccordion;
