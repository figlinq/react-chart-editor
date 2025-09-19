import Field from './Field';
import PropTypes from 'prop-types';
import {Component} from 'react';
import {connectToContainer} from 'lib';
import RadioBlocks from '../widgets/RadioBlocks';
import Numeric from './Numeric';
import DataSelector from './DataSelector';
import {MULTI_VALUED, ATTRS_WITH_DISABLED_VARIABLE_OPTION} from 'lib/constants';

class UnconnectedMarkerSize extends Component {
  constructor(props, context) {
    super(props, context);

    let type = null;
    let disableVariableOption = false;
    if (!props.container.marker || (props.container.marker && !props.container.marker.sizesrc)) {
      type = 'constant';
    } else if (
      props.container.marker &&
      Array.isArray(props.container.marker.size) &&
      props.fullContainer.marker &&
      Array.isArray(props.fullContainer.marker.size)
    ) {
      type = 'variable';
    }

    // Disable 'variable' option for certain attrs in box and violin traces due to lack of support in plotly.js
    if (
      props.container.type &&
      ATTRS_WITH_DISABLED_VARIABLE_OPTION[props.container.type] &&
      ATTRS_WITH_DISABLED_VARIABLE_OPTION[props.container.type].includes(props.attr)
    ) {
      disableVariableOption = true;
      type = 'constant';
    }

    this.state = {
      type,
      value: {
        constant: type === 'constant' ? props.fullValue : '6',
        variable: type === 'variable' ? props.fullValue : null,
      },
      disableVariableOption,
    };

    this.setType = this.setType.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  setType(type) {
    this.setState({type: type});
    this.props.updatePlot(this.state.value[type]);
    if (type === 'constant') {
      this.context.updateContainer({['marker.sizesrc']: null});
    } else {
      this.context.updateContainer({
        ['marker.size']: null,
        ['marker.sizesrc']: null,
      });
    }
  }

  setValue(inputValue) {
    const {type} = this.state;

    this.setState(
      type === 'constant' ? {value: {constant: inputValue}} : {value: {variable: inputValue}}
    );
    this.props.updatePlot(inputValue);
  }

  render() {
    const {attr, fullValue} = this.props;
    const {localize: _} = this.context;
    const {type, value, disableVariableOption} = this.state;
    const options = [
      {label: _('Constant'), value: 'constant'},
      {label: _('Variable'), value: 'variable'},
    ];
    const multiValued =
      this.props.multiValued || (Array.isArray(fullValue) && fullValue.includes(MULTI_VALUED));

    return (
      <Field {...this.props} multiValued={multiValued} attr={attr}>
        {!disableVariableOption ? (
          <RadioBlocks options={options} activeOption={type} onOptionChange={this.setType} />
        ) : null}
        {type === 'constant' ? (
          <Numeric
            suppressMultiValuedMessage
            attr="marker.size"
            updatePlot={this.setValue}
            fullValue={value.constant}
          />
        ) : multiValued ? null : (
          <DataSelector suppressMultiValuedMessage attr="marker.size" updatePlot={this.setValue} />
        )}
      </Field>
    );
  }
}

UnconnectedMarkerSize.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedMarkerSize.contextTypes = {
  localize: PropTypes.func,
  updateContainer: PropTypes.func,
};

UnconnectedMarkerSize.displayName = 'UnconnectedMarkerSize';

export default connectToContainer(UnconnectedMarkerSize);
