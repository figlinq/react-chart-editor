import {useState} from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import {CustomPicker as customPicker, CompactPicker} from 'react-color';
import Fields from 'react-color/lib/components/sketch/SketchFields';
import {Hue, Saturation} from 'react-color/lib/components/common';

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
      <CompactPicker
        {...props}
        colors={[
          '#b71c1c',
          '#d32f2f',
          '#f44336',
          '#e57373',
          '#ffcdd2',
          '#33691e',
          '#689f38',
          '#8bc34a',
          '#aed581',
          '#dcedc8',
          '#880e4f',
          '#c2185b',
          '#e91e63',
          '#f06292',
          '#f8bbd0',
          '#827717',
          '#afb42b',
          '#cddc39',
          '#dce775',
          '#f0f4c3',
          '#4a148c',
          '#7b1fa2',
          '#9c27b0',
          '#ba68c8',
          '#e1bee7',
          '#f57f17',
          '#fbc02d',
          '#ffeb3b',
          '#fff176',
          '#fff9c4',
          '#311b92',
          '#512da8',
          '#673ab7',
          '#9575cd',
          '#d1c4e9',
          '#ff6f00',
          '#ffa000',
          '#ffc107',
          '#ffd54f',
          '#ffecb3',
          '#1a237e',
          '#303f9f',
          '#3f51b5',
          '#7986cb',
          '#c5cae9',
          '#e65100',
          '#f57c00',
          '#ff9800',
          '#ffb74d',
          '#ffe0b2',
          '#0d47a1',
          '#1976d2',
          '#2196f3',
          '#64b5f6',
          '#bbdefb',
          '#bf360c',
          '#e64a19',
          '#ff5722',
          '#ff8a65',
          '#ffccbc',
          '#01579b',
          '#0288d1',
          '#03a9f4',
          '#4fc3f7',
          '#b3e5fc',
          '#3e2723',
          '#5d4037',
          '#795548',
          '#a1887f',
          '#d7ccc8',
          '#006064',
          '#0097a7',
          '#00bcd4',
          '#4dd0e1',
          '#b2ebf2',
          '#263238',
          '#455a64',
          '#607d8b',
          '#90a4ae',
          '#cfd8dc',
          '#004d40',
          '#00796b',
          '#009688',
          '#4db6ac',
          '#b2dfdb',
          '#000000',
          '#1a1a1a',
          '#333333',
          '#4d4d4d',
          '#666666',
          '#194D33',
          '#388e3c',
          '#4caf50',
          '#81c784',
          '#c8e6c9',
          '#7f7f7f',
          '#999999',
          '#b2b2b2',
          '#cccccc',
          '#ffffff',
        ]}
      />
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
