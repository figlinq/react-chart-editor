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

const isRangeUpdate = (update) => update && Object.keys(update)?.every((k) => k.includes('range'));

const skipRelayout = (update) =>
  isRangeUpdate(update) ||
  Object.keys(update)?.includes('dragmode') ||
  Object.keys(update)?.includes('selections') ||
  Object.keys(update)?.includes('scene.camera') ||
  Object.keys(update)?.includes('autosize');

export default class ActionBuffer {
  constructor({graphDiv}) {
    if (ActionBuffer.instance) {
      return ActionBuffer.instance;
    }
    ActionBuffer.instance = this;

    this.undoStack = [];
    this.redoStack = [];

    // Store the graphDiv layout after every action - needed for relayout undo
    this.oldGraphDivLayout = structuredClone(graphDiv.layout);

    return this;
  }

  reverseAction({type, payload}, oldGraphDiv, graphDiv, operationType, optimizeSliders = true) {
    let action = {type: INVERSE_ACTIONS[type], payload: {}};

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
          ((isAxisDomainUpdate(payload) && isAxisDomainUpdate(this.getLastUndo()?.payload)) ||
            (isHole(payload) && isHole(this.getLastUndo()?.payload))) &&
          payload.traceIndexes[0] === this.getLastUndo()?.payload.traceIndexes[0]
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
        } else if (isAxisDomainUpdate(payload) && isAxisDomainUpdate(this.getLastUndo()?.payload)) {
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
      this.getLastUndo(),
      diff(action, this.getLastUndo())
    );

    // Optimization for sliders and other draggable UI - if action returns to same state as last undo, skip
    if (
      optimizeSliders &&
      operationType === OPERATION_TYPE.UNDO &&
      action &&
      this.getLastUndo() &&
      isEmpty(diff(action, this.getLastUndo()))
    ) {
      console.log('skipping undo action');
      action = null;
    }
    return action;
  }

  addToUndo(action, oldGraphDiv, graphDiv) {
    const undoAction = this.reverseAction(action, oldGraphDiv, graphDiv, OPERATION_TYPE.UNDO);
    if (undoAction) {
      this.undoStack.push(undoAction);
    }
  }

  addToRedo(action, oldGraphDiv, graphDiv) {
    this.redoStack.push(this.reverseAction(action, oldGraphDiv, graphDiv, OPERATION_TYPE.REDO));
  }

  // Add to undo or redo based on current operation type
  add(action, oldGraphDiv, graphDiv, currentOperationType) {
    if (currentOperationType === OPERATION_TYPE.UPDATE) {
      this.clearRedo();
    }
    this.oldGraphDivLayout = structuredClone(graphDiv.layout);
    this[currentOperationType === OPERATION_TYPE.UNDO ? 'addToRedo' : 'addToUndo'](
      action,
      oldGraphDiv,
      graphDiv
    );
  }

  // Special case for relayout
  addToUndoRelayout(update, graphDiv) {
    // Range selection and a few other operations don't make it into layout, so no need to undo
    if (!skipRelayout(update)) {
      const undoAction = this.reverseAction(
        {type: EDITOR_ACTIONS.UPDATE_LAYOUT, payload: {update}},
        {layout: this.oldGraphDivLayout},
        graphDiv,
        OPERATION_TYPE.UNDO,
        false // don't optimize away things like multiple consecutive title updates);
      );
      if (undoAction) {
        this.undoStack.push(undoAction);
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
    return this.undoAvailable() ? this.undoStack.pop() : null;
  }

  getLastUndo() {
    return this.undoAvailable() ? this.undoStack[this.undoStack.length - 1] : null;
  }

  redo() {
    return this.redoAvailable() ? this.redoStack.pop() : null;
  }
}
