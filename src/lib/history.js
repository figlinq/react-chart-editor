import isNumeric from 'fast-isnumeric';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {EDITOR_ACTIONS, INVERSE_ACTIONS, OPERATION_TYPE} from './constants';

const arraysEqual = (a, b) =>
  a.length !== b.length ? false : a.every((value, index) => value === b[index]);

// Get index from a string like 'annotations[0]'
const extractIndex = (arrayString) => parseInt(arrayString.match(/\[(\d+)\]/)[1], 10);

const sameAction = (oldPayload, newPayload) => {
  const sameTrace =
    (!oldPayload.traceIndexes && !newPayload.traceIndex) ||
    arraysEqual(oldPayload.traceIndexes, newPayload.traceIndexes);
  const sameAttrs = arraysEqual(Object.keys(oldPayload.update), Object.keys(newPayload.update));

  return sameTrace && sameAttrs;
};

const isRangeUpdate = (update) => update && Object.keys(update)?.every((k) => k.includes('range'));

const skipRelayout = (update) =>
  isRangeUpdate(update) ||
  Object.keys(update)?.includes('dragmode') ||
  Object.keys(update)?.includes('selections') ||
  Object.keys(update)?.includes('scene.camera') ||
  Object.keys(update)?.includes('autosize');

export default class History {
  constructor(graphDiv = null, onAddToUndo = null, onAddToRedo = null) {
    this.undoStack = [];
    this.redoStack = [];
    this.oldGraphDivLayout = graphDiv?.layout ? structuredClone(graphDiv.layout) : {};
    this.onAddToUndo = onAddToUndo;
    this.onAddToRedo = onAddToRedo;
  }

  setCallbacks(onAddToUndo = null, onAddToRedo = null) {
    this.onAddToUndo = onAddToUndo;
    this.onAddToRedo = onAddToRedo;
  }

  setGraphDiv(graphDiv = null) {
    this.oldGraphDivLayout = graphDiv?.layout ? structuredClone(graphDiv.layout) : {};
  }

  getState() {
    return {
      undoStack: structuredClone(this.undoStack),
      redoStack: structuredClone(this.redoStack),
      oldGraphDivLayout: structuredClone(this.oldGraphDivLayout || {}),
    };
  }

  setState({undoStack = [], redoStack = [], oldGraphDivLayout = {}} = {}) {
    this.undoStack = structuredClone(undoStack);
    this.redoStack = structuredClone(redoStack);
    this.oldGraphDivLayout = structuredClone(oldGraphDivLayout);
  }

  reset() {
    this.undoStack = [];
    this.redoStack = [];
    this.oldGraphDivLayout = {};
  }

  reverseAction({type, payload, canBeOptimizedAway}, oldGraphDiv, graphDiv, operationType) {
    const action = {
      type: INVERSE_ACTIONS[type],
      payload: {},
      // canBeOptimizedAway: if true, this action can be optimized away if it returns to the same state as last undo
      // inherit it from the action being reversed
      canBeOptimizedAway,
    };
    const lastUndoAction = this.getLastUndo();

    // Optimization for sliders and other draggable UI.
    // TODO: need to fork react-resizable-rotatable-draggable to make this work well. Extend it with onEnd events.
    if (
      operationType === OPERATION_TYPE.UNDO &&
      lastUndoAction?.canBeOptimizedAway &&
      sameAction(payload, lastUndoAction?.payload)
    ) {
      if (!action.canBeOptimizedAway) {
        lastUndoAction.canBeOptimizedAway = false;
      }
      return null;
    }

    switch (action.type) {
      case EDITOR_ACTIONS.ADD_TRACE: {
        // eslint-disable-next-line no-undefined
        action.payload = undefined;
        break;
      }
      case EDITOR_ACTIONS.RESTORE_TRACE: {
        action.payload = {
          update: payload.update,
          traceIndexes: payload.traceIndexes,
          traces: oldGraphDiv.data.filter((_, i) => payload.traceIndexes.includes(i)),
        };
        break;
      }
      case EDITOR_ACTIONS.DELETE_TRACE: {
        action.payload = {
          traceIndexes: [(payload ? payload.traceIndexes[0] : graphDiv.data.length - 1) || 0],
        };
        break;
      }
      case EDITOR_ACTIONS.DELETE_TRANSFORM: {
        action.payload = {
          traceIndex: payload.traceIndexes[0],
          transformIndex: extractIndex(Object.keys(payload.update)[0]),
        };
        break;
      }
      case EDITOR_ACTIONS.ADD_TRANSFORM: {
        action.payload = {
          traceIndexes: [payload.traceIndex],
          update: {
            [`transforms[${payload.transformIndex}]`]:
              oldGraphDiv.data[payload.traceIndex].transforms[payload.transformIndex],
          },
        };
        break;
      }
      case EDITOR_ACTIONS.UPDATE_TRACES: {
        const update = {};
        Object.keys(payload.update).forEach((attr) => {
          update[attr] = nestedProperty(oldGraphDiv.data[payload.traceIndexes[0]], attr).get();
        });
        action.payload = {
          traceIndexes: payload.traceIndexes,
          update,
        };
        break;
      }
      case EDITOR_ACTIONS.UPDATE_LAYOUT: {
        const update = {};
        // Are we undoing DELETE_RANGESELECTOR?
        if (isNumeric(payload.rangeselectorIndex)) {
          const attr = `${payload.axisId}.rangeselector.buttons[${payload.rangeselectorIndex}]`;
          update[attr] = nestedProperty(oldGraphDiv.layout, attr).get();
          action.payload = {
            update,
          };
        } else {
          Object.keys(payload.update).forEach((attr) => {
            update[attr] = nestedProperty(oldGraphDiv.layout, attr).get();
          });
          action.payload = {
            update,
          };
        }
        break;
      }
      case EDITOR_ACTIONS.ADD_ANNOTATION: {
        action.payload = {
          update: {[`annotations[${payload.annotationIndex}]`]: oldGraphDiv.layout.annotations[0]},
        };
        break;
      }
      case EDITOR_ACTIONS.DELETE_ANNOTATION: {
        action.payload = {
          annotationIndex: extractIndex(Object.keys(payload.update)[0]),
        };
        break;
      }
      case EDITOR_ACTIONS.ADD_SHAPE: {
        action.payload = {
          update: {[`shapes[${payload.shapeIndex}]`]: oldGraphDiv.layout.shapes[0]},
        };
        break;
      }
      case EDITOR_ACTIONS.DELETE_SHAPE: {
        action.payload = {
          shapeIndex: extractIndex(Object.keys(payload.update)[0]),
        };
        break;
      }
      case EDITOR_ACTIONS.ADD_IMAGE: {
        action.payload = {
          update: {[`images[${payload.imageIndex}]`]: oldGraphDiv.layout.images[0]},
        };
        break;
      }
      case EDITOR_ACTIONS.DELETE_IMAGE: {
        action.payload = {
          imageIndex: extractIndex(Object.keys(payload.update)[0]),
        };
        break;
      }
      case EDITOR_ACTIONS.MOVE_TO: {
        action.payload = {
          fromIndex: payload.toIndex,
          toIndex: payload.fromIndex,
        };
        break;
      }
      default: {
        // eslint-disable-next-line no-undefined
        action.payload = undefined;
        break;
      }
    }

    return action;
  }

  addToUndo(action, oldGraphDiv, graphDiv) {
    const undoAction = this.reverseAction(action, oldGraphDiv, graphDiv, OPERATION_TYPE.UNDO);
    if (undoAction) {
      this.undoStack.push(undoAction);
      if (this.onAddToUndo) {
        this.onAddToUndo(undoAction, this.getState());
      }
    }
  }

  addToRedo(action, oldGraphDiv, graphDiv) {
    const redoAction = this.reverseAction(
      {...action, canBeOptimizedAway: false},
      oldGraphDiv,
      graphDiv,
      OPERATION_TYPE.REDO
    );
    this.redoStack.push(redoAction);
    if (this.onAddToRedo) {
      this.onAddToRedo(redoAction, this.getState());
    }
  }

  // Add to undo or redo based on current operation type
  add(action, oldGraphDiv, graphDiv, currentOperationType, optimizeUndoAction = true) {
    if (currentOperationType === OPERATION_TYPE.UPDATE) {
      this.clearRedo();
    }
    this.oldGraphDivLayout = structuredClone(graphDiv.layout);
    this[currentOperationType === OPERATION_TYPE.UNDO ? 'addToRedo' : 'addToUndo'](
      {...action, optimizeUndoAction},
      oldGraphDiv,
      graphDiv
    );
  }

  // Special case for relayout
  // graphDiv we need here is the "new" graphDiv after the action
  addToUndoRelayout(update, graphDiv) {
    // Range selection and a few other operations don't make it into layout, so no need to undo
    if (!skipRelayout(update)) {
      const undoAction = this.reverseAction(
        // don't optimize away things like multiple consecutive title updates)
        {type: EDITOR_ACTIONS.UPDATE_LAYOUT, payload: {update}, canBeOptimizedAway: false},
        {layout: this.oldGraphDivLayout},
        graphDiv,
        OPERATION_TYPE.UNDO
      );
      if (undoAction) {
        this.undoStack.push(undoAction);
        if (this.onAddToUndo) {
          this.onAddToUndo(undoAction, this.getState());
        }
      }
    }
    this.oldGraphDivLayout = structuredClone(graphDiv?.layout || {});
  }

  undoAvailable() {
    return this.undoStack.length > 0;
  }

  redoAvailable() {
    return this.redoStack.length > 0;
  }

  clearRedo() {
    this.redoStack = [];
  }

  undo() {
    // we don't want actions to be optimized away once the user undoes/redoes them
    return this.undoAvailable() ? {...this.undoStack.pop(), canBeOptimizedAway: false} : null;
  }

  getLastUndo() {
    return this.undoAvailable() ? this.undoStack[this.undoStack.length - 1] : null;
  }

  redo() {
    return this.redoAvailable() ? {...this.redoStack.pop(), canBeOptimizedAway: false} : null;
  }
}
