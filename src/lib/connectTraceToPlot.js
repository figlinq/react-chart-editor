import {Component} from 'react';
import PropTypes from 'prop-types';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {
  getDisplayName,
  plotlyTraceToCustomTrace,
  renderTraceIcon,
  getFullTrace,
  getParsedTemplateString,
} from '../lib';
import {deepCopyPublic, setMultiValuedContainer} from './multiValues';
import {EDITOR_ACTIONS} from 'lib/constants';

export default function connectTraceToPlot(WrappedComponent) {
  class TraceConnectedComponent extends Component {
    constructor(props, context) {
      super(props, context);

      this.deleteTrace = this.deleteTrace.bind(this);
      this.updateTrace = this.updateTrace.bind(this);
      this.moveTrace = this.moveTrace.bind(this);
      this.setLocals(props, context);
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
      this.setLocals(nextProps, nextContext);
    }

    setLocals(props, context) {
      const {traceIndexes} = props;
      const {data, fullData, plotly} = context;

      const trace = data[traceIndexes[0]];
      const fullTrace = getFullTrace(props, context);

      this.childContext = {
        getValObject: (attr) =>
          !plotly
            ? null
            : plotly.PlotSchema.getTraceValObject(fullTrace, nestedProperty({}, attr).parts),
        updateContainer: this.updateTrace,
        deleteContainer: this.deleteTrace,
        moveContainer: this.moveTrace,
        container: trace,
        fullContainer: fullTrace,
        traceIndexes: this.props.traceIndexes,
      };

      if (traceIndexes.length > 1) {
        const multiValuedFullContainer = deepCopyPublic(fullTrace);
        fullData.forEach((t) =>
          Object.keys(t).forEach((key) =>
            setMultiValuedContainer(multiValuedFullContainer, deepCopyPublic(t), key, {
              searchArrays: true,
            })
          )
        );
        const multiValuedContainer = deepCopyPublic(trace);
        data.forEach((t) =>
          Object.keys(t).forEach((key) =>
            setMultiValuedContainer(multiValuedContainer, deepCopyPublic(t), key, {
              searchArrays: true,
            })
          )
        );
        this.childContext.fullContainer = multiValuedFullContainer;
        this.childContext.defaultContainer = fullTrace;
        this.childContext.container = multiValuedContainer;
      }

      if (trace && fullTrace) {
        this.icon = renderTraceIcon(plotlyTraceToCustomTrace(trace));
        this.name = getParsedTemplateString(fullTrace.name, {meta: fullTrace.meta});
      }
    }

    getChildContext() {
      return this.childContext;
    }

    updateTrace(update, canBeOptimizedAway, type = EDITOR_ACTIONS.UPDATE_TRACES) {
      const {traceIndexes, fullDataArrayPosition} = this.props;
      const {fullData, onUpdate} = this.context;

      if (onUpdate) {
        const splitTraceGroup = fullDataArrayPosition
          ? fullDataArrayPosition.map((p) => fullData[p]._group)
          : null;

        const containsAnSrc = Object.keys(update).filter((a) => a.endsWith('src')).length > 0;

        if (Array.isArray(update)) {
          update.forEach((u, i) => {
            onUpdate({
              type,
              payload: {
                update: u,
                traceIndexes: [traceIndexes[i]],
                splitTraceGroup: splitTraceGroup ? splitTraceGroup[i] : null,
              },
              canBeOptimizedAway,
            });
          });
        } else if (splitTraceGroup && !containsAnSrc) {
          traceIndexes.forEach((t, i) => {
            onUpdate({
              type,
              payload: {
                update,
                traceIndexes: [traceIndexes[i]],
                splitTraceGroup: splitTraceGroup ? splitTraceGroup[i] : null,
              },
              canBeOptimizedAway,
            });
          });
        } else {
          onUpdate({
            type,
            payload: {
              update,
              traceIndexes,
            },
            canBeOptimizedAway,
          });
        }
      }
    }

    deleteTrace() {
      const {traceIndexes} = this.props;
      const {onUpdate} = this.context;

      if (onUpdate) {
        onUpdate({
          type: EDITOR_ACTIONS.DELETE_TRACE,
          payload: {traceIndexes},
        });
      }
    }

    moveTrace(direction) {
      const traceIndex = this.props.traceIndexes[0];
      const desiredIndex = direction === 'up' ? traceIndex - 1 : traceIndex + 1;
      this.context.onUpdate({
        type: EDITOR_ACTIONS.MOVE_TO,
        payload: {
          fromIndex: traceIndex,
          toIndex: desiredIndex,
          path: 'data',
        },
      });
    }

    render() {
      return <WrappedComponent name={this.name} icon={this.icon} {...this.props} />;
    }
  }

  TraceConnectedComponent.displayName = `TraceConnected${getDisplayName(WrappedComponent)}`;

  TraceConnectedComponent.propTypes = {
    traceIndexes: PropTypes.arrayOf(PropTypes.number).isRequired,
    fullDataArrayPosition: PropTypes.arrayOf(PropTypes.number),
  };

  TraceConnectedComponent.contextTypes = {
    fullData: PropTypes.array,
    data: PropTypes.array,
    plotly: PropTypes.object,
    onUpdate: PropTypes.func,
    layout: PropTypes.object,
  };

  TraceConnectedComponent.childContextTypes = {
    getValObject: PropTypes.func,
    updateContainer: PropTypes.func,
    deleteContainer: PropTypes.func,
    defaultContainer: PropTypes.object,
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    traceIndexes: PropTypes.array,
    moveContainer: PropTypes.func,
  };

  const {plotly_editor_traits} = WrappedComponent;
  TraceConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return TraceConnectedComponent;
}
