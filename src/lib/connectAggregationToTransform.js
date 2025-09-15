import {Component} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName} from '../lib';

export default function connectAggregationToTransform(WrappedComponent) {
  class AggregationConnectedComponent extends Component {
    constructor(props, context) {
      super(props, context);

      this.updateAggregation = this.updateAggregation.bind(this);
      this.setLocals(props, context);
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
      this.setLocals(nextProps, nextContext);
    }

    setLocals(props, context) {
      const {aggregationIndex} = props;
      const {container, fullContainer} = context;

      // Keep references to the parent transform containers
      this.parentContainer = container;
      this.parentFullContainer = fullContainer;

      this.container = (container?.aggregations || [])[aggregationIndex];
      this.fullContainer = (fullContainer?.aggregations || [])[aggregationIndex];
    }

    updateAggregation(update) {
      // Build a full aggregations array update so other entries are preserved
      const {aggregationIndex} = this.props;
      const sourceAggs = Array.isArray(this.parentContainer?.aggregations)
        ? this.parentContainer.aggregations
        : Array.isArray(this.parentFullContainer?.aggregations)
        ? this.parentFullContainer.aggregations
        : [];

      const newAggs = sourceAggs.map((a) => (a ? {...a} : a));
      const current = newAggs[aggregationIndex] ? {...newAggs[aggregationIndex]} : {};

      Object.keys(update).forEach((k) => {
        current[k] = update[k];
      });

      // If target wasn't provided and doesn't exist yet, fall back to existing agg target
      if (typeof update.target === 'undefined' && !current.target && this.fullContainer?.target) {
        current.target = this.fullContainer.target;
      }

      current.enabled = true;
      newAggs[aggregationIndex] = current;

      // Send whole aggregations array; parent context will prefix with transforms[index].
      this.context.updateContainer({aggregations: newAggs});
    }

    getChildContext() {
      const {getValObject} = this.context;
      return {
        getValObject: getValObject ? (attr) => getValObject(`aggregations[].${attr}`) : null,
        updateContainer: this.updateAggregation,
        container: this.container,
        fullContainer: this.fullContainer,
      };
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  AggregationConnectedComponent.displayName = `AggregationConnected${getDisplayName(
    WrappedComponent
  )}`;

  AggregationConnectedComponent.propTypes = {
    aggregationIndex: PropTypes.number.isRequired,
  };

  AggregationConnectedComponent.contextTypes = {
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    data: PropTypes.array,
    onUpdate: PropTypes.func,
    updateContainer: PropTypes.func,
    getValObject: PropTypes.func,
  };

  AggregationConnectedComponent.childContextTypes = {
    updateContainer: PropTypes.func,
    deleteContainer: PropTypes.func,
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    getValObject: PropTypes.func,
  };

  const {plotly_editor_traits} = WrappedComponent;
  AggregationConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return AggregationConnectedComponent;
}
