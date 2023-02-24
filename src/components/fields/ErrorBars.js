import PropTypes from 'prop-types';
import {DataSelector, Radio, Numeric, MultiColorPicker} from '../index';
import RadioBlocks from '../widgets/RadioBlocks';
import Field from './Field';
import {connectToContainer} from 'lib';

const ErrorBars = (props, {localize: _}) => {
  const updatePlot = (value) => {
    if (value === 'symmetric') {
      props.updatePlot({...props.fullValue, visible: true, symmetric: true});
    }

    if (value === 'asymmetric') {
      props.updatePlot({...props.fullValue, visible: true, symmetric: false});
    }

    if (value === 'hidden') {
      props.updatePlot({...props.fullValue, visible: false});
    }
  };

  const getMode = () => {
    let mode;

    if (!props.fullValue.visible) {
      mode = 'hidden';
    }

    if (
      props.fullValue.visible &&
      (props.fullValue.symmetric || typeof props.fullValue.symmetric === 'undefined')
    ) {
      // when props.fullValue.type === 'sqrt',
      // then props.fullValue.symmetric is undefined, but 'sqrt' is only
      // applicable when we want symmetric error bars
      // https://github.com/plotly/plotly.js/issues/2359
      mode = 'symmetric';
    }

    if (props.fullValue.visible && props.fullValue.symmetric === false) {
      // it has to be explicitly set to false, because we don't want it to catch
      // cases when it's undefined
      mode = 'asymmetric';
    }

    return mode;
  };

  const renderModeSelector = () => (
    <Field>
      <RadioBlocks
        alignment="center"
        onOptionChange={updatePlot}
        activeOption={getMode()}
        options={[
          {
            label: _('None'),
            value: 'hidden',
          },
          {
            label: _('Symmetric'),
            value: 'symmetric',
          },
          {
            label: _('Asymmetric'),
            value: 'asymmetric',
          },
        ]}
      />
    </Field>
  );
  const renderErrorBarControls = () => {
    const mode = getMode();
    const showCustomDataControl = props.fullValue.type === 'data';
    const styleAttrs = (
      <>
        <Radio
          label={_('Copy Y Style')}
          attr={`${props.attr}.copy_ystyle`}
          options={[
            {
              label: _('Yes'),
              value: true,
            },
            {
              label: _('No'),
              value: false,
            },
          ]}
        />
        <Radio
          label={_('Copy Z Style')}
          attr={`${props.attr}.copy_zstyle`}
          options={[
            {
              label: _('Yes'),
              value: true,
            },
            {
              label: _('No'),
              value: false,
            },
          ]}
        />
        <MultiColorPicker label={_('Color')} attr={`${props.attr}.color`} />
        <Numeric label={_('Thickness')} attr={`${props.attr}.thickness`} />
        <Numeric label={_('Crossbar Width')} attr={`${props.attr}.width`} />
      </>
    );

    if (mode === 'symmetric') {
      return (
        <>
          <Radio
            label={_('Error Type')}
            attr={`${props.attr}.type`}
            options={[
              {
                label: _('%'),
                value: 'percent',
              },
              {
                label: _('Constant'),
                value: 'constant',
              },
              {
                label: _('√'),
                value: 'sqrt',
              },
              {
                label: _('Data'),
                value: 'data',
              },
            ]}
          />
          <Numeric label={_('Value')} attr={`${props.attr}.value`} />
          {showCustomDataControl ? (
            <DataSelector label={_('Custom Data')} attr={`${props.attr}.array`} />
          ) : null}
          {styleAttrs}
        </>
      );
    }

    if (mode === 'asymmetric') {
      return (
        <>
          <Radio
            label={_('Error Type')}
            attr={`${props.attr}.type`}
            options={[
              {
                label: _('%'),
                value: 'percent',
              },
              {
                label: _('Constant'),
                value: 'constant',
              },
              {
                label: _('Data'),
                value: 'data',
              },
            ]}
          />
          <Numeric label={_('Value')} attr={`${props.attr}.value`} />
          <Numeric label={_('Value (-)')} attr={`${props.attr}.valueminus`} />
          {showCustomDataControl ? (
            <>
              <DataSelector label={_('Error (+)')} attr={`${props.attr}.array`} />
              <DataSelector label={_('Error (-)')} attr={`${props.attr}.arrayminus`} />
            </>
          ) : null}
          {styleAttrs}
        </>
      );
    }

    return null;
  };

  return (
    <>
      {renderModeSelector()}
      {renderErrorBarControls()}
    </>
  );
};

ErrorBars.propTypes = {
  attr: PropTypes.string,
  fullValue: PropTypes.object,
  updatePlot: PropTypes.func,
};

ErrorBars.contextTypes = {
  localize: PropTypes.func,
};

export default connectToContainer(ErrorBars);
