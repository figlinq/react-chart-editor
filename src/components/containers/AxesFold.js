import AxesSelector from '../fields/AxesSelector';
import PlotlyFold from './PlotlyFold';
import PropTypes from 'prop-types';
import {connectAxesToLayout} from 'lib';

const AxesFold = (props) => {
  const {children, options} = props;
  return options.length && children ? (
    <PlotlyFold {...props}>
      {options.length === 1 ? null : <AxesSelector axesOptions={options} />}
      {children}
    </PlotlyFold>
  ) : null;
};

AxesFold.propTypes = {
  children: PropTypes.any,
  options: PropTypes.array,
};

AxesFold.plotly_editor_traits = {foldable: true};

export default connectAxesToLayout(AxesFold);
