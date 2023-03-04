import {useState} from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import {SketchPicker} from '@hello-pangea/color-picker';
import {COLOR_PICKER_SWATCH} from 'lib/constants';

// Utility functions for converting ColorPicker color objects or raw strings into TinyColor objects.
const extractRGB = (c) => c.rgb || c;
const getColorSource = (c) => (c.source === 'hex' ? c.hex : extractRGB(c));
const toTinyColor = (c) => tinycolor(getColorSource(c));

const ColorPicker = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  const onSelectedColorChange = (newColor) => {
    // We use our own toTinyColor because this value is a ColorPicker
    // color value which is an object that needs unpacking. We also handle
    // the case where a color string is passed in (just in case).
    const color = toTinyColor(newColor);

    // relayout call only wants a RGB String
    props.onColorChange(color.toRgbString());
  };

  const toggleVisible = () => {
    setIsVisible(!isVisible);
  };

  // We use tinycolor here instead of our own toTinyColor as
  // tinycolor handles `null` values and other weirdness we may
  // expect from user data.
  const selectedColor = tinycolor(props.selectedColor);
  const colorText = selectedColor.toHexString();
  const rgbString = selectedColor.toRgbString();

  // We need inline style here to assign the background color dynamically.
  const swatchStyle = {backgroundColor: rgbString};

  return (
    <>
      <div className="colorpicker__container">
        <div className="colorpicker">
          <div
            className="colorpicker__swatch +cursor-clickable"
            style={swatchStyle}
            onClick={toggleVisible}
          />
        </div>

        <div className="colorpicker__selected-color +hover-grey" onClick={toggleVisible}>
          {colorText}
        </div>
      </div>

      {isVisible && (
        <SketchPicker
          color={rgbString}
          onChangeComplete={onSelectedColorChange}
          presetColors={COLOR_PICKER_SWATCH}
          width={190}
        />
      )}
    </>
  );
};

ColorPicker.propTypes = {
  onColorChange: PropTypes.func.isRequired,
  selectedColor: PropTypes.string,
};

export default ColorPicker;
