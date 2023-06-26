import isNumeric from 'fast-isnumeric';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {EDITOR_ACTIONS, INVERSE_ACTIONS} from './constants';

// Get index from a string like 'annotations[0]'
const extractIndex = (arrayString) => parseInt(arrayString.match(/\[(\d+)\]/)[1], 10);

export default class ActionBuffer {
  constructor() {
    if (ActionBuffer.instance) {
      return ActionBuffer.instance;
    }
    ActionBuffer.instance = this;
    this.undoStack = [];
    this.redoStack = [];
    return this;
  }

  reverseAction({type, payload}, oldGraphDiv, graphDiv) {
    const action = {type: INVERSE_ACTIONS[type], payload: {}};

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
        const update = {};
        for (const attr in payload.update) {
          if (payload.update.hasOwnProperty(attr)) {
            update[attr] = nestedProperty(oldGraphDiv.data[payload.traceIndexes[0]], attr).get();
          }
        }
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
        } else {
          for (const attr in payload.update) {
            if (payload.update.hasOwnProperty(attr)) {
              update[attr] = nestedProperty(oldGraphDiv.layout, attr).get();
            }
          }
        }
        action.payload = {
          update,
        };
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
    console.log('reverse action created:', action);
    return action;
  }

  addToUndo(action, oldGraphDiv, graphDiv) {
    this.undoStack.push(this.reverseAction(action, oldGraphDiv, graphDiv));
  }

  addToRedo(action, oldGraphDiv, graphDiv) {
    this.redoStack.push(this.reverseAction(action, oldGraphDiv, graphDiv));
  }

  // Add to undo or redo based on current operation type
  add(action, oldGraphDiv, graphDiv, currentOperationType) {
    if (currentOperationType === OPERATION_TYPE.UPDATE) {
      this.clearRedo();
    }
    this[currentOperationType === OPERATION_TYPE.UNDO ? 'addToRedo' : 'addToUndo'](
      action,
      oldGraphDiv,
      graphDiv
    );
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

  redo() {
    return this.redoAvailable() ? this.redoStack.pop() : null;
  }
}
