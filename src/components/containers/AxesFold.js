import AxesSelector from '../fields/AxesSelector';
import PlotlyFold from './PlotlyFold';
import PropTypes from 'prop-types';
import {connectAxesToLayout} from 'lib';

const AxesFold = (props) =>
  Boolean(props.options.length && props.children) && (
    <PlotlyFold {...props}>
      {props.options.length === 1 ? null : <AxesSelector axesOptions={props.options} />}
      {props.children}
    </PlotlyFold>
  );

AxesFold.propTypes = {
  children: PropTypes.any,
  options: PropTypes.array,
};

AxesFold.plotly_editor_traits = {foldable: true};

export default connectAxesToLayout(AxesFold);
