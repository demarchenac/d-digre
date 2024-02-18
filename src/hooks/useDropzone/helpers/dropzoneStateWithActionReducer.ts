import type { DropzoneAction, DropzoneState } from "../types";
import { initialDropzoneState } from "../constants";

/**
 * @param {DropzoneState} state
 * @param {{type: string} & DropzoneState} action
 * @returns {DropzoneState}
 */
export function dropzoneStateWithActionReducer(
  state: DropzoneState,
  action: DropzoneAction,
): DropzoneState {
  switch (action.type) {
    case "focus":
      return {
        ...state,
        isFocused: true,
      };
    case "blur":
      return {
        ...state,
        isFocused: false,
      };
    case "openDialog":
      return {
        ...initialDropzoneState,
        isFileDialogActive: true,
      };
    case "closeDialog":
      return {
        ...state,
        isFileDialogActive: false,
      };
    case "setDraggedFiles":
      return {
        ...state,
        isDragActive: Boolean(action.isDragActive),
        isDragAccept: Boolean(action.isDragAccept),
        isDragReject: Boolean(action.isDragReject),
      };
    case "setFiles":
      return {
        ...state,
        acceptedFiles: action.acceptedFiles ?? [],
        rejectedFiles: action.rejectedFiles ?? [],
      };
    case "reset":
      return {
        ...initialDropzoneState,
      };
    default:
      return state;
  }
}
