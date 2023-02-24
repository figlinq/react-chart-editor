import PropTypes from 'prop-types';
import {useState} from 'react';
import {Dropdown, TextEditor} from '../index';
import Field from './Field';
import {connectToContainer} from 'lib';

const UpdateMenuButtons = (props, context) => {
  const _ = context.localize;
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);

  return (
    <Field>
      <Dropdown
        attr="buttons"
        label={_('Button')}
        options={props.fullValue.map((button, index) => ({
          label: _('Button') + ` ${index + 1}`,
          value: index,
        }))}
        updatePlot={(index) => setCurrentButtonIndex(index)}
        clearable={false}
        fullValue={currentButtonIndex}
      />
      <TextEditor attr={`buttons[${currentButtonIndex}].label`} richTextOnly />
    </Field>
  );
};

UpdateMenuButtons.propTypes = {
  attr: PropTypes.string,
  fullValue: PropTypes.array,
  updatePlot: PropTypes.func,
};

UpdateMenuButtons.contextTypes = {
  localize: PropTypes.func,
};

export default connectToContainer(UpdateMenuButtons);
