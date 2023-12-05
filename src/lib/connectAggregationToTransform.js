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

      this.container = (container?.aggregations || [])[aggregationIndex];
      this.fullContainer = (fullContainer?.aggregations || [])[aggregationIndex];
    }

    updateAggregation(update) {
      const newUpdate = {};
      const path = `aggregations[${this.props.aggregationIndex}]`;
      for (const key in update) {
        newUpdate[`${path}.${key}`] = update[key];
      }
      newUpdate[`${path}.target`] = this.fullContainer.target;
      newUpdate[`${path}.enabled`] = true;
      this.context.updateContainer(newUpdate);
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
