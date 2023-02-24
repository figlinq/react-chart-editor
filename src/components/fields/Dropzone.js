import Drop from '../widgets/Dropzone';
import Field from './Field';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';

export const UnconnectedDropzone = (props) => (
  <Field {...props}>
    <Drop value={props.fullValue} onUpdate={props.updatePlot} fileType={props.fileType} />
  </Field>
);

UnconnectedDropzone.propTypes = {
  value: PropTypes.any,
  onUpdate: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedDropzone.displayName = 'UnconnectedDropzone';

function modifyPlotProps(props, context, plotProps) {
  if (context.container.type === 'choroplethmapbox' || context.container.type === 'choropleth') {
    plotProps.isVisible = true;
  }
}

export default connectToContainer(UnconnectedDropzone, {modifyPlotProps});
