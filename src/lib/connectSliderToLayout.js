import {Component} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName} from '../lib';
import EditorContext from './EditorContext';

export default function connectSliderToLayout(WrappedComponent) {
  class SliderConnectedComponent extends Component {
    constructor(props, context) {
      super(props, context);
      this.updateSlider = this.updateSlider.bind(this);
      this.setLocals(props, context);
    }

    setLocals(props, context) {
      const {sliderIndex} = props;
      const {container, fullContainer} = context;

      const sliders = container.sliders || [];
      const fullSliders = fullContainer.sliders || [];
      this.container = sliders[sliderIndex];
      this.fullContainer = fullSliders[sliderIndex];
    }

    getChildContext() {
      this.setLocals(this.props, this.context);
      return {
        getValObject: (attr) =>
          !this.context.getValObject ? null : this.context.getValObject(`sliders[].${attr}`),
        updateContainer: this.updateSlider,
        container: this.container,
        fullContainer: this.fullContainer,
      };
    }

    updateSlider(update) {
      const newUpdate = {};
      const {sliderIndex} = this.props;
      for (const key in update) {
        const newkey = `sliders[${sliderIndex}].${key}`;
        newUpdate[newkey] = update[key];
      }
      this.context.updateContainer(newUpdate);
    }

    render() {
      this.setLocals(this.props, this.context);
      const contextValue = {
        ...this.context,
        ...this.getChildContext(),
      };

      return (
        <EditorContext.Provider value={contextValue}>
          <WrappedComponent {...this.props} />
        </EditorContext.Provider>
      );
    }
  }

  SliderConnectedComponent.displayName = `SliderConnected${getDisplayName(WrappedComponent)}`;

  SliderConnectedComponent.propTypes = {
    sliderIndex: PropTypes.number.isRequired,
  };

  SliderConnectedComponent.contextTypes = {
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    onUpdate: PropTypes.func,
    updateContainer: PropTypes.func,
    getValObject: PropTypes.func,
  };

  SliderConnectedComponent.childContextTypes = {
    updateContainer: PropTypes.func,
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    getValObject: PropTypes.func,
  };

  const {plotly_editor_traits} = WrappedComponent;
  SliderConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return SliderConnectedComponent;
}
