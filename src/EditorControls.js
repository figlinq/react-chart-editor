import DefaultEditor from './DefaultEditor';
import {addedDiff} from 'deep-object-diff';
import PropTypes from 'prop-types';
import {Component} from 'react';
import {
  bem,
  localizeString,
  plotlyTraceToCustomTrace,
  traceTypeToPlotlyInitFigure,
  hasValidCustomConfigVisibilityRules,
} from './lib';
import {
  shamefullyClearAxisTypes,
  shamefullyAdjustAxisRef,
  shamefullyAdjustGeo,
  shamefullyAddTableColumns,
  shamefullyCreateSplitStyleProps,
  shamefullyAdjustSplitStyleTargetContainers,
  shamefullyDeleteRelatedAnalysisTransforms,
  shamefullyAdjustSizeref,
  shamefullyAdjustAxisDirection,
  shamefullyAdjustMapbox,
} from './shame';
import {EDITOR_ACTIONS, OPERATION_TYPE} from './lib/constants';
import isNumeric from 'fast-isnumeric';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {categoryLayout, traceTypes} from 'lib/traceTypes';
import {ModalProvider} from 'components/containers';
import {DEFAULT_FONTS} from 'lib/constants';
import History from 'lib/history';

class EditorControls extends Component {
  constructor(props, context) {
    super(props, context);

    this.localize = (key) => localizeString(props.dictionaries || {}, props.locale, key);

    // we only need to compute this once.
    if (props.plotly) {
      this.plotSchema = props.plotly.PlotSchema.get();
    }

    this.history = new History(props.graphDiv, props.onAddToUndo, props.onAddToRedo);
  }

  getChildContext() {
    const gd = this.props.graphDiv || {};
    return {
      advancedTraceTypeSelector: this.props.advancedTraceTypeSelector,
      config: gd._context,
      srcConverters: this.props.srcConverters,
      data: gd.data,
      dataSourceComponents: this.props.dataSourceComponents,
      dataSourceOptions: this.props.dataSourceOptions,
      dataSources: this.props.dataSources,
      dictionaries: this.props.dictionaries || {},
      localize: this.localize,
      frames: gd._transitionData ? gd._transitionData._frames : [],
      fullData: gd._fullData,
      fullLayout: gd._fullLayout,
      graphDiv: gd,
      layout: gd.layout,
      locale: this.props.locale,
      onUpdate: this.handleUpdate.bind(this),
      plotSchema: this.plotSchema,
      plotly: this.props.plotly,
      traceTypesConfig: this.props.traceTypesConfig,
      showFieldTooltips: this.props.showFieldTooltips,
      glByDefault: this.props.glByDefault,
      mapBoxAccess: this.props.mapBoxAccess,
      fontOptions: this.props.fontOptions,
      chartHelp: this.props.chartHelp,
      customConfig: this.props.customConfig,
      hasValidCustomConfigVisibilityRules: hasValidCustomConfigVisibilityRules(
        this.props.customConfig
      ),
      showUndoRedo: this.props.showUndoRedo,
      undo: this.undo.bind(this),
      redo: this.redo.bind(this),
    };
  }

  undo() {
    console.log('undo');
    const action = this.history.undo();
    if (action) {
      this.handleUpdate(action, OPERATION_TYPE.UNDO);
    }
  }

  redo() {
    console.log('redo');
    const action = this.history.redo();
    if (action) {
      this.handleUpdate(action, OPERATION_TYPE.REDO);
    }
  }

  handleUpdate({type, payload, canBeOptimizedAway = false}, opType = OPERATION_TYPE.UPDATE) {
    const {
      graphDiv,
      beforeUpdateTraces,
      mapBoxAccess,
      afterUpdateTraces,
      onUpdate,
      beforeUpdateLayout,
      afterUpdateLayout,
      beforeAddTrace,
      afterAddTrace,
      beforeDeleteTrace,
      afterDeleteTrace,
      makeDefaultTrace,
      glByDefault,
      beforeDeleteAnnotation,
      afterDeleteAnnotation,
      beforeDeleteShape,
      afterDeleteShape,
      beforeDeleteImage,
      afterDeleteImage,
    } = this.props;

    console.log(
      'handleUpdate',
      {type, payload, canBeOptimizedAway},
      'graphDiv.data',
      graphDiv.data,
      'graphDiv.layout',
      graphDiv.layout
    );

    const oldGraphDiv = structuredClone({layout: graphDiv.layout, data: graphDiv.data});
    let layoutDiff;

    let {data: updatedData, layout: updatedLayout} = graphDiv;

    switch (type) {
      case EDITOR_ACTIONS.ADD_TRANSFORM:
      case EDITOR_ACTIONS.UPDATE_TRACES:
        if (beforeUpdateTraces) {
          beforeUpdateTraces(payload);
        }

        shamefullyAdjustSizeref(graphDiv, payload);
        shamefullyAdjustAxisDirection(graphDiv, payload);
        shamefullyClearAxisTypes(graphDiv, payload);
        shamefullyAdjustAxisRef(graphDiv, payload);
        shamefullyAddTableColumns(graphDiv, payload);
        shamefullyAdjustSplitStyleTargetContainers(graphDiv, payload);
        if (!mapBoxAccess) {
          shamefullyAdjustMapbox(graphDiv, payload);
        }

        payload.traceIndexes.forEach((traceIndex) => {
          for (const attr in payload.update) {
            const splitTraceGroup = payload.splitTraceGroup
              ? payload.splitTraceGroup.toString()
              : null;

            const value = payload.update[attr];
            const props = splitTraceGroup
              ? shamefullyCreateSplitStyleProps(graphDiv, attr, traceIndex, splitTraceGroup)
              : [nestedProperty(graphDiv.data[traceIndex], attr)];

            props.forEach((p) => {
              // Not sure why we check for void 0, so will allow setting to undefined only for undo/redo cases to play safe
              if (value !== void 0 || opType !== OPERATION_TYPE.UPDATE) {
                p.set(value);
              }
            });
          }
        });

        if (afterUpdateTraces) {
          afterUpdateTraces(payload);
        }
        updatedData = graphDiv.data.slice();
        break;

      case EDITOR_ACTIONS.ADD_ANNOTATION:
      case EDITOR_ACTIONS.ADD_SHAPE:
      case EDITOR_ACTIONS.ADD_IMAGE:
      case EDITOR_ACTIONS.ADD_RANGESELECTOR:
      case EDITOR_ACTIONS.UPDATE_LAYOUT:
        shamefullyAdjustGeo(graphDiv, payload);

        if (beforeUpdateLayout) {
          beforeUpdateLayout(payload);
        }
        for (const attr in payload.update) {
          const prop = nestedProperty(graphDiv.layout, attr);
          const value = payload.update[attr];
          // Not sure why we check for void 0, so will allow setting to undefined only for undo/redo cases to play safe
          if (value !== void 0 || opType !== OPERATION_TYPE.UPDATE) {
            prop.set(value);
          }
        }
        if (afterUpdateLayout) {
          afterUpdateLayout(payload);
        }
        updatedLayout = {...graphDiv.layout};
        break;

      case EDITOR_ACTIONS.ADD_TRACE:
        if (beforeAddTrace) {
          beforeAddTrace(payload);
        }

        // can't use default prop because plotly.js mutates it:
        // https://github.com/plotly/react-chart-editor/issues/509
        if (graphDiv.data.length === 0) {
          graphDiv.data.push(
            makeDefaultTrace
              ? makeDefaultTrace()
              : {
                  type: `scatter${glByDefault ? 'gl' : ''}`,
                  mode: 'markers',
                }
          );
        } else {
          const prevTrace = graphDiv.data[graphDiv.data.length - 1];
          const prevTraceType = plotlyTraceToCustomTrace(prevTrace);
          graphDiv.data.push(
            traceTypeToPlotlyInitFigure(prevTraceType, prevTrace?.type?.endsWith('gl') ? 'gl' : '')
          );
        }

        if (afterAddTrace) {
          afterAddTrace(payload);
        }
        updatedData = graphDiv.data.slice();
        break;

      case EDITOR_ACTIONS.RESTORE_TRACE:
        if (beforeAddTrace) {
          beforeAddTrace(payload);
        }

        payload.traceIndexes.forEach((traceIndex, i) => {
          graphDiv.data.splice(traceIndex, 0, payload.traces[i]);
        });

        for (const attr in payload.update) {
          const prop = nestedProperty(graphDiv.layout, attr);
          const value = payload.update[attr];
          if (value !== void 0) {
            prop.set(value);
          }
        }

        if (afterAddTrace) {
          afterAddTrace(payload);
        }
        updatedData = graphDiv.data.slice();
        break;

      case EDITOR_ACTIONS.DELETE_TRACE:
        if (payload.traceIndexes && payload.traceIndexes.length) {
          if (beforeDeleteTrace) {
            beforeDeleteTrace(payload);
          }

          shamefullyAdjustAxisRef(graphDiv, payload.traceIndexes[0]);
          shamefullyDeleteRelatedAnalysisTransforms(graphDiv, payload);

          layoutDiff = addedDiff(graphDiv.layout, oldGraphDiv.layout);

          graphDiv.data.splice(payload.traceIndexes[0], 1);
          if (afterDeleteTrace) {
            afterDeleteTrace(payload);
          }
          updatedData = graphDiv.data.slice();
        }
        break;

      case EDITOR_ACTIONS.DELETE_ANNOTATION:
        if (isNumeric(payload.annotationIndex)) {
          if (beforeDeleteAnnotation) {
            beforeDeleteAnnotation(payload);
          }
          graphDiv.layout.annotations.splice(payload.annotationIndex, 1);
          if (afterDeleteAnnotation) {
            afterDeleteAnnotation(payload);
          }
          updatedLayout = {...graphDiv.layout};
        }
        break;

      case EDITOR_ACTIONS.DELETE_SHAPE:
        if (isNumeric(payload.shapeIndex)) {
          if (beforeDeleteShape) {
            beforeDeleteShape(payload);
          }
          graphDiv.layout.shapes.splice(payload.shapeIndex, 1);
          if (afterDeleteShape) {
            afterDeleteShape(payload);
          }
          updatedLayout = {...graphDiv.layout};
        }
        break;

      case EDITOR_ACTIONS.DELETE_IMAGE:
        if (isNumeric(payload.imageIndex)) {
          if (beforeDeleteImage) {
            beforeDeleteImage(payload);
          }
          graphDiv.layout.images.splice(payload.imageIndex, 1);
          if (afterDeleteImage) {
            afterDeleteImage(payload);
          }
          updatedLayout = {...graphDiv.layout};
        }
        break;

      case EDITOR_ACTIONS.DELETE_RANGESELECTOR:
        if (isNumeric(payload.rangeselectorIndex)) {
          graphDiv.layout[payload.axisId].rangeselector.buttons.splice(
            payload.rangeselectorIndex,
            1
          );
          updatedLayout = {...graphDiv.layout};
        }
        break;

      case EDITOR_ACTIONS.DELETE_MAPBOXLAYER:
        if (isNumeric(payload.mapboxLayerIndex)) {
          graphDiv.layout[payload.mapboxId].layers.splice(payload.mapboxLayerIndex, 1);
          updatedLayout = {...graphDiv.layout};
        }
        break;

      case EDITOR_ACTIONS.DELETE_TRANSFORM:
        if (isNumeric(payload.transformIndex) && payload.traceIndex < graphDiv.data.length) {
          if (graphDiv.data[payload.traceIndex].transforms.length === 1) {
            delete graphDiv.data[payload.traceIndex].transforms;
          } else {
            graphDiv.data[payload.traceIndex].transforms.splice(payload.transformIndex, 1);
          }
          updatedData = graphDiv.data.slice();
        }
        break;

      case EDITOR_ACTIONS.MOVE_TO:
        // checking if fromIndex and toIndex is a number because
        // gives errors if index is 0 (falsy value)
        if (payload.path && !isNaN(payload.fromIndex) && !isNaN(payload.toIndex)) {
          function move(container) {
            const movedEl = container[payload.fromIndex];
            const replacedEl = container[payload.toIndex];
            container[payload.toIndex] = movedEl;
            container[payload.fromIndex] = replacedEl;
          }

          if (payload.path === 'data') {
            move(graphDiv.data);
          }

          if (payload.path === 'layout.images') {
            move(graphDiv.layout.images);
          }

          if (payload.path === 'layout.shapes') {
            move(graphDiv.layout.shapes);
          }

          if (payload.path === 'layout.annotations') {
            move(graphDiv.layout.annotations);
          }

          if (payload.path === 'layout.mapbox.layers') {
            move(graphDiv.layout[payload.mapboxId].layers);
          }

          updatedData = payload.path.startsWith('data') ? graphDiv.data.slice() : graphDiv.data;
          updatedLayout = payload.path.startsWith('layout')
            ? {...graphDiv.layout}
            : graphDiv.layout;
        }
        break;

      default:
        throw new Error(this.localize('must specify an action type to handleEditorUpdate'));
    }

    if (onUpdate) {
      onUpdate(updatedData, updatedLayout, graphDiv._transitionData._frames);
    }

    console.log('layoutDiff', layoutDiff);

    this.history.add(
      {
        type,
        payload: layoutDiff ? {...payload, update: layoutDiff} : payload,
        canBeOptimizedAway,
      },
      oldGraphDiv,
      graphDiv,
      opType
    );
  }

  render() {
    return (
      <div
        className={
          bem('editor_controls') +
          ' plotly-editor--theme-provider' +
          `${this.props.className ? ` ${this.props.className}` : ''}`
        }
      >
        <ModalProvider>
          {this.props.graphDiv?._fullLayout &&
            (this.props.children ? this.props.children : <DefaultEditor />)}
        </ModalProvider>
      </div>
    );
  }
}

EditorControls.propTypes = {
  advancedTraceTypeSelector: PropTypes.bool,
  afterAddTrace: PropTypes.func,
  afterDeleteAnnotation: PropTypes.func,
  afterDeleteShape: PropTypes.func,
  afterDeleteImage: PropTypes.func,
  afterDeleteTrace: PropTypes.func,
  afterUpdateLayout: PropTypes.func,
  afterUpdateTraces: PropTypes.func,
  beforeAddTrace: PropTypes.func,
  beforeDeleteAnnotation: PropTypes.func,
  beforeDeleteShape: PropTypes.func,
  beforeDeleteImage: PropTypes.func,
  beforeDeleteTrace: PropTypes.func,
  beforeUpdateLayout: PropTypes.func,
  beforeUpdateTraces: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  srcConverters: PropTypes.shape({
    toSrc: PropTypes.func.isRequired,
    fromSrc: PropTypes.func.isRequired,
  }),
  dataSourceComponents: PropTypes.object,
  dataSourceOptions: PropTypes.array,
  dataSources: PropTypes.object,
  dictionaries: PropTypes.object,
  graphDiv: PropTypes.object,
  locale: PropTypes.string,
  onUpdate: PropTypes.func,
  plotly: PropTypes.object,
  showFieldTooltips: PropTypes.bool,
  traceTypesConfig: PropTypes.object,
  makeDefaultTrace: PropTypes.func,
  glByDefault: PropTypes.bool,
  mapBoxAccess: PropTypes.bool,
  fontOptions: PropTypes.array,
  chartHelp: PropTypes.object,
  customConfig: PropTypes.object,
  showUndoRedo: PropTypes.bool,
  onAddToUndo: PropTypes.func,
  onAddToRedo: PropTypes.func,
};

EditorControls.defaultProps = {
  showFieldTooltips: false,
  locale: 'en',
  traceTypesConfig: {
    categories: (_) => categoryLayout(_),
    traces: (_) => traceTypes(_),
    complex: true,
  },
  fontOptions: DEFAULT_FONTS,
};

EditorControls.childContextTypes = {
  advancedTraceTypeSelector: PropTypes.bool,
  config: PropTypes.object,
  srcConverters: PropTypes.shape({
    toSrc: PropTypes.func.isRequired,
    fromSrc: PropTypes.func.isRequired,
  }),
  data: PropTypes.array,
  dataSourceComponents: PropTypes.object,
  dataSourceOptions: PropTypes.array,
  dataSources: PropTypes.object,
  dictionaries: PropTypes.object,
  frames: PropTypes.array,
  fullData: PropTypes.array,
  fullLayout: PropTypes.object,
  graphDiv: PropTypes.any,
  layout: PropTypes.object,
  locale: PropTypes.string,
  localize: PropTypes.func,
  onUpdate: PropTypes.func,
  plotly: PropTypes.object,
  plotSchema: PropTypes.object,
  traceTypesConfig: PropTypes.object,
  showFieldTooltips: PropTypes.bool,
  glByDefault: PropTypes.bool,
  mapBoxAccess: PropTypes.bool,
  fontOptions: PropTypes.array,
  chartHelp: PropTypes.object,
  customConfig: PropTypes.object,
  hasValidCustomConfigVisibilityRules: PropTypes.bool,
  showUndoRedo: PropTypes.bool,
  undo: PropTypes.func,
  redo: PropTypes.func,
};

export default EditorControls;
