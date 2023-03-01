import {useState} from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import {CustomPicker as customPicker, CompactPicker} from 'react-color';
import Fields from 'react-color/lib/components/sketch/SketchFields';
import {Hue, Saturation} from 'react-color/lib/components/common';
import {COLOR_PICKER_SWATCH} from 'lib/constants';

// Utility functions for converting ColorPicker color objects or raw strings into TinyColor objects.
const extractRGB = (c) => c.rgb || c;
const getColorSource = (c) => (c.source === 'hex' ? c.hex : extractRGB(c));
const toTinyColor = (c) => tinycolor(getColorSource(c));

const Custom = (props) => (
  <div className="colorpicker__outer">
    <div className="colorpicker__controls +flex">
      <div className="colorpicker__sliders">
        <div className="colorpicker__slider">
          <Hue {...props} />
        </div>
      </div>
    </div>
    <div className="colorpicker__saturation">
      <Saturation {...props} />
    </div>
    <div className="colorpicker__custom-input">
      <Fields {...props} onChange={props.onChangeComplete} />
    </div>
    <div className="colorpicker__swatches">
      <CompactPicker {...props} colors={COLOR_PICKER_SWATCH} />
    </div>
  </div>
);

Custom.propTypes = {
  rgb: PropTypes.object,
  onChangeComplete: PropTypes.func,
};

const CustomColorPicker = customPicker(Custom);

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

  // Convert rgba to rgb if necessary
  const rgbString =
    selectedColor._a !== 0
      ? selectedColor.toRgbString()
      : `rgb(${selectedColor._r},${selectedColor._g},${selectedColor._b})`;

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
        <CustomColorPicker color={rgbString} onChangeComplete={onSelectedColorChange} />
      )}
    </>
  );
};

ColorPicker.propTypes = {
  onColorChange: PropTypes.func.isRequired,
  selectedColor: PropTypes.string,
};

export default ColorPicker;
