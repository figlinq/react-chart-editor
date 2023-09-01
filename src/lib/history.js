import {diff} from 'deep-object-diff';
import isNumeric from 'fast-isnumeric';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {EDITOR_ACTIONS, INVERSE_ACTIONS, OPERATION_TYPE} from './constants';

const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;

// Get index from a string like 'annotations[0]'
const extractIndex = (arrayString) => parseInt(arrayString.match(/\[(\d+)\]/)[1], 10);

const isAxisDomainUpdate = (payload) =>
  payload?.update && Object.keys(payload.update)?.every((k) => k.includes('domain'));
const isHole = (payload) => payload?.update?.hole;

const sameListOfAttrs = (oldPayload, newPayload) => {
  const oldAttrs = Object.keys(oldPayload.update);
  const newAttrs = Object.keys(newPayload.update);
  return oldAttrs.length === newAttrs.length && oldAttrs.every((attr) => newAttrs.includes(attr));
};

const isRangeUpdate = (update) => update && Object.keys(update)?.every((k) => k.includes('range'));

const skipRelayout = (update) =>
  isRangeUpdate(update) ||
  Object.keys(update)?.includes('dragmode') ||
  Object.keys(update)?.includes('selections') ||
  Object.keys(update)?.includes('scene.camera') ||
  Object.keys(update)?.includes('autosize');

export default class History {
  // Sometimes we call constructor just to get access to the singleton instance, so arg is optional
  constructor(graphDiv = null, onAddToUndo = null, onAddToRedo = null) {
    if (!History.instance) {
      this.undoStack = [];
      this.redoStack = [];
      History.instance = this;
    }

    if (graphDiv) {
      // Stores the graphDiv layout after every action - needed for relayout undo
      // The last call will have the latest graphDiv before modifications.
      History.instance.oldGraphDivLayout = structuredClone(graphDiv.layout);
    }

    if (onAddToUndo) {
      History.instance.onAddToUndo = onAddToUndo;
    }
    if (onAddToRedo) {
      History.instance.onAddToRedo = onAddToRedo;
    }

    return History.instance;
  }

  reverseAction({type, payload, canBeOptimizedAway}, oldGraphDiv, graphDiv, operationType) {
    let action = {
      type: INVERSE_ACTIONS[type],
      payload: {},
      // canBeOptimizedAway: if true, this action can be optimized away if it returns to the same state as last undo
      // inherit it from the action being reversed
      canBeOptimizedAway,
    };
    const lastUndoAction = this.getLastUndo();

    // Optimization for sliders and other draggable UI. RectanglePositioner stuff (isAxisDomainUpdate) is handled separately
    if (
      operationType === OPERATION_TYPE.UNDO &&
      action.canBeOptimizedAway &&
      lastUndoAction?.canBeOptimizedAway &&
      !(isAxisDomainUpdate(payload) && type === EDITOR_ACTIONS.UPDATE_LAYOUT) &&
      sameListOfAttrs(payload, lastUndoAction?.payload)
    ) {
      console.log('skipping undo action');
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
        const traceIndex = !payload ? graphDiv.data.length - 1 : payload.traceIndexes[0];
        action.payload = {
          traceIndexes: [traceIndex || 0],
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
        // Are we undoing axis domain update on Pie chart? skip.
        // This is a workaround for too many undo actions being created for subplot draggable UI
        if (
          ((isAxisDomainUpdate(payload) && isAxisDomainUpdate(lastUndoAction?.payload)) ||
            (isHole(payload) && isHole(lastUndoAction?.payload))) &&
          payload.traceIndexes[0] === lastUndoAction?.payload.traceIndexes[0]
        ) {
          action = null;
        } else {
          const update = {};
          for (const attr in payload.update) {
            if (payload.update.hasOwnProperty(attr)) {
              update[attr] = nestedProperty(oldGraphDiv.data[payload.traceIndexes[0]], attr).get();
            }
          }
          // If all attrs in the action are same as in oldGraphDiv, skip
          if (isEmpty(diff(update, payload.update))) {
            console.log('Empty trace update - skip');
            action = null;
          } else {
            action.payload = {
              traceIndexes: payload.traceIndexes,
              update,
            };
          }
        }
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
        } else if (
          operationType === OPERATION_TYPE.UNDO &&
          action.canBeOptimizedAway &&
          lastUndoAction?.canBeOptimizedAway &&
          isAxisDomainUpdate(payload) &&
          isAxisDomainUpdate(lastUndoAction?.payload)
        ) {
          // Are we undoing axis domain update? skip.
          // This is a workaround for too many undo actions being created for subplot draggable UI
          action = null;
        } else {
          for (const attr in payload.update) {
            if (payload.update.hasOwnProperty(attr)) {
              update[attr] = nestedProperty(oldGraphDiv.layout, attr).get();
            }
          }
          // If all attrs in the action are same as in oldGraphDiv, skip
          if (isEmpty(diff(update, payload.update))) {
            console.log('Empty layout update - skip');
            action = null;
          } else {
            action.payload = {
              update,
            };
          }
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
    console.log(
      'reverse action created:',
      action,
      'previous action:',
      lastUndoAction,
      'diff:',
      diff(action, lastUndoAction)
    );

    return action;
  }

  addToUndo(action, oldGraphDiv, graphDiv) {
    const undoAction = this.reverseAction(action, oldGraphDiv, graphDiv, OPERATION_TYPE.UNDO);
    if (undoAction) {
      this.undoStack.push(undoAction);
      if (this.onAddToUndo) {
        this.onAddToUndo(undoAction);
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
      this.onAddToRedo(redoAction);
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
          this.onAddToUndo(undoAction);
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
