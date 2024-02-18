import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { fromEvent } from "./helpers/fromEvent";
import { isEventWithFiles } from "./helpers/isEventWithFiles";
import type { FileError, FileRejection, UseDropzoneProps } from "./types";
import { parseAcceptAsList } from "./helpers/parseAcceptAsList";
import { noOperation } from "./helpers/noOperation";
import { dropzoneStateWithActionReducer } from "./helpers/dropzoneStateWithActionReducer";
import { initialDropzoneState } from "./constants";
import { preventEvent } from "./helpers/preventEvent";
import { isEveryFileAccepted } from "./helpers/isEveryFileAccepted";
import { toTooManyFilesError } from "./helpers/toError";
import { isFileAccepted } from "./helpers/isFileAccepted";
import { isFileSizeAccepted } from "./helpers/isFileSizeAccepted";
import { isPropagationStoppedWrapper } from "./helpers/composeEventHandlers";

/**
 * For more info on this hook, checkout https://github.com/react-dropzone/react-dropzone/blob/master/src/index.js#L760
 */
export function useDropzone({
  accept,
  minSize,
  maxSize,
  maxFiles,
  autoFocus = false,
  disabled = false,
  preventDropOnDocument = true,
  noDragEventsBubbling = false,
  multiple = true,
  noClick = false,
  noKeyboard = false,
  noDrag = false,
  validator,
  onError: unstableOnError,
  onDragEnter: unstableOnDragEnter,
  onDragOver: unstableOnDragOver,
  onDragLeave: unstableOnDragLeave,
  onDrop: unstableOnDrop,
  onDropRejected,
  onDropAccepted,
}: UseDropzoneProps) {
  const acceptAttr = useMemo(() => parseAcceptAsList(accept), [accept]);

  const rootRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer(dropzoneStateWithActionReducer, initialDropzoneState);
  const { isFocused } = state;

  const dragTargetsRef = useRef<EventTarget[]>([]);

  const onDocumentDrop = (event: Event) => {
    if (rootRef.current?.contains(event.target as Node)) {
      // If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
      return;
    }
    event.preventDefault();
    dragTargetsRef.current = [];
  };

  const stopPropagation = (event: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    if (noDragEventsBubbling) {
      event.stopPropagation();
    }
  };

  useEffect(() => {
    if (preventDropOnDocument) {
      document.addEventListener("dragover", preventEvent, false);
      document.addEventListener("drop", onDocumentDrop, false);
    }

    return () => {
      if (preventDropOnDocument) {
        document.removeEventListener("dragover", preventEvent);
        document.removeEventListener("drop", onDocumentDrop);
      }
    };
  }, [rootRef, preventDropOnDocument]);

  // Auto focus the root when autoFocus is true
  useEffect(() => {
    if (!disabled && autoFocus && rootRef.current) {
      rootRef.current.focus();
    }
    return noOperation;
  }, [rootRef, autoFocus, disabled]);

  const onError = useCallback(
    (error?: unknown) => {
      if (unstableOnError) {
        unstableOnError(error);
      } else {
        // Let the user know something's gone wrong if they haven't provided the onError cb.
        console.error(error);
      }
    },
    [unstableOnError],
  );

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      // Persist here because we need the event later after getFilesFromEvent() is done
      event.persist();
      stopPropagation(event);

      dragTargetsRef.current = [...dragTargetsRef.current, event.target];

      if (isEventWithFiles(event)) {
        Promise.resolve(fromEvent(event))
          .then((files) => {
            if (event.isPropagationStopped() && !noDragEventsBubbling) return;

            const fileCount = files.length;
            const everyFileWasAccepted = isEveryFileAccepted({
              files: files as File[],
              accept: acceptAttr,
              minSize,
              maxSize,
              multiple,
              maxFiles,
              validator,
            });

            const isDragAccept = fileCount > 0 && everyFileWasAccepted;
            const isDragReject = fileCount > 0 && !everyFileWasAccepted;

            dispatch({ type: "setDraggedFiles", isDragAccept, isDragReject, isDragActive: true });

            if (unstableOnDragEnter) {
              unstableOnDragEnter(event);
            }
          })
          .catch((e: unknown) => onError(e));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      unstableOnDragEnter,
      onError,
      noDragEventsBubbling,
      acceptAttr,
      minSize,
      maxSize,
      multiple,
      maxFiles,
      validator,
    ],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.persist();
      stopPropagation(event);

      const hasFiles = isEventWithFiles(event);
      if (hasFiles && event.dataTransfer) {
        try {
          event.dataTransfer.dropEffect = "copy";
        } catch (error) {
          console.warn("what is this ?", error);
        }
      }

      if (hasFiles && unstableOnDragOver) {
        unstableOnDragOver(event);
      }

      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unstableOnDragOver, noDragEventsBubbling],
  );

  const onDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.persist();
      stopPropagation(event);

      // Only deactivate once the dropzone and all children have been left
      const targets = dragTargetsRef.current.filter(
        (target) => rootRef.current?.contains(target as Node),
      );
      // Make sure to remove a target present multiple times only once
      // (Firefox may fire dragenter/dragleave multiple times on the same element)
      const targetIdx = targets.indexOf(event.target);
      if (targetIdx !== -1) {
        targets.splice(targetIdx, 1);
      }
      dragTargetsRef.current = targets;
      if (targets.length > 0) {
        return;
      }

      dispatch({
        type: "setDraggedFiles",
        isDragActive: false,
        isDragAccept: false,
        isDragReject: false,
      });

      if (isEventWithFiles(event) && unstableOnDragLeave) {
        unstableOnDragLeave(event);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rootRef, unstableOnDragLeave, noDragEventsBubbling],
  );

  const setFiles = useCallback(
    (files: File[], event: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
      const acceptedFiles: File[] = [];
      const fileRejections: FileRejection[] = [];

      files.forEach((file) => {
        const [accepted, acceptError] = isFileAccepted(file, acceptAttr);
        const [sizeMatch, sizeError] = isFileSizeAccepted(file, minSize, maxSize);
        const customErrors = validator ? validator(file) : null;

        if (accepted && sizeMatch && !customErrors) {
          acceptedFiles.push(file);
        } else {
          let errors = [acceptError, sizeError];

          if (customErrors) {
            errors = errors.concat(customErrors);
          }

          fileRejections.push({ file, errors: errors.filter((e) => e) as FileError[] });
        }
      });

      if (
        (!multiple && acceptedFiles.length > 1) ||
        (multiple && maxFiles && maxFiles >= 1 && acceptedFiles.length > maxFiles)
      ) {
        // Reject everything and empty accepted files
        acceptedFiles.forEach((file) => {
          fileRejections.push({ file, errors: [toTooManyFilesError()] });
        });
        acceptedFiles.splice(0);
      }

      dispatch({
        type: "setFiles",
        acceptedFiles,
        rejectedFiles: fileRejections,
      });

      if (unstableOnDrop) {
        unstableOnDrop(acceptedFiles, fileRejections, event);
      }

      if (fileRejections.length > 0 && onDropRejected) {
        onDropRejected(fileRejections, event);
      }

      if (acceptedFiles.length > 0 && onDropAccepted) {
        onDropAccepted(acceptedFiles, event);
      }
    },
    [
      dispatch,
      multiple,
      acceptAttr,
      minSize,
      maxSize,
      maxFiles,
      unstableOnDrop,
      onDropAccepted,
      onDropRejected,
      validator,
    ],
  );

  const onDrop = useCallback(
    (event: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      // Persist here because we need the event later after getFilesFromEvent() is done
      event.persist();
      stopPropagation(event);

      dragTargetsRef.current = [];

      if (isEventWithFiles(event)) {
        Promise.resolve(fromEvent(event))
          .then((files) => {
            if (event.isPropagationStopped() && !noDragEventsBubbling) {
              return;
            }
            setFiles(files as File[], event);
          })
          .catch((e) => onError(e));
      }
      dispatch({ type: "reset" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setFiles, onError, noDragEventsBubbling],
  );

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      dispatch({ type: "openDialog" });
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }, []);

  // Cb to open the file dialog when SPACE/ENTER occurs on the dropzone
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Ignore keyboard events bubbling up the DOM tree
      if (!rootRef.current?.isEqualNode(event.target as Node)) {
        return;
      }

      if (
        event.key === " " ||
        event.key === "Enter" ||
        event.keyCode === 32 ||
        event.keyCode === 13
      ) {
        event.preventDefault();
        openFileDialog();
      }
    },
    [rootRef, openFileDialog],
  );

  // Update focus state for the dropzone
  const onFocus = useCallback(() => {
    dispatch({ type: "focus" });
  }, []);
  const onBlur = useCallback(() => {
    dispatch({ type: "blur" });
  }, []);

  // Cb to open the file dialog when click occurs on the dropzone
  const onClick = useCallback(() => {
    if (noClick) {
      return;
    }

    // In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
    // to ensure React can handle state changes
    // See: https://github.com/react-dropzone/react-dropzone/issues/450
    const userAgent = window.navigator.userAgent;
    const isIe = userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1;
    const isEdge = userAgent.indexOf("Edge/") !== -1;
    if (isIe || isEdge) {
      setTimeout(openFileDialog, 0);
    } else {
      openFileDialog();
    }
  }, [noClick, openFileDialog]);

  const isDragDisabled = disabled || noDrag;
  const isKeyboardAccessible = !disabled && !noKeyboard;

  const getRootProps = useMemo(
    () =>
      ({
        role,
        onKeyDown: _onKeyDown,
        onFocus: _onFocus,
        onBlur: _onBlur,
        onClick: _onClick,
        onDragEnter: _onDragEnter,
        onDragOver: _onDragOver,
        onDragLeave: _onDragLeave,
        onDrop: _onDrop,
        ...rest
      }: React.ComponentPropsWithoutRef<"div"> = {}) =>
        ({
          ref: rootRef,
          role: typeof role === "string" && role !== "" ? role : "presentation",
          onKeyDown: noKeyboard ? null : isPropagationStoppedWrapper(_onKeyDown, onKeyDown),
          onFocus: noKeyboard ? null : isPropagationStoppedWrapper(_onFocus, onFocus),
          onBlur: noKeyboard ? null : isPropagationStoppedWrapper(_onBlur, onBlur),
          onClick: disabled ? null : isPropagationStoppedWrapper(_onClick, onClick),
          onDragEnter: isDragDisabled
            ? null
            : isPropagationStoppedWrapper(_onDragEnter, onDragEnter),
          onDragOver: isDragDisabled ? null : isPropagationStoppedWrapper(_onDragOver, onDragOver),
          onDragLeave: isDragDisabled
            ? null
            : isPropagationStoppedWrapper(_onDragLeave, onDragLeave),
          onDrop: isDragDisabled ? null : isPropagationStoppedWrapper(_onDrop, onDrop),
          ...(isKeyboardAccessible ? { tabIndex: 0 } : {}),
          ...rest,
        }) as React.ComponentProps<"div">,
    [
      rootRef,
      onKeyDown,
      onFocus,
      onBlur,
      onClick,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
      noKeyboard,
      disabled,
      isDragDisabled,
      isKeyboardAccessible,
    ],
  );

  const onInputClick = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
  }, []);

  const getInputProps = useMemo(
    () =>
      ({ onChange, onClick, ...rest }: React.ComponentPropsWithoutRef<"input"> = {}) =>
        ({
          ref: inputRef,
          accept: acceptAttr,
          multiple,
          type: "file",
          style: { display: "none" },
          onChange: disabled ? null : isPropagationStoppedWrapper(onChange, onDrop),
          onClick: disabled ? null : isPropagationStoppedWrapper(onClick, onInputClick),
          tabIndex: -1,
          ...rest,
        }) as React.ComponentProps<"input">,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputRef, accept, multiple, onDrop, disabled],
  );

  return {
    ...state,
    isFocused: isFocused && !disabled,
    getRootProps,
    getInputProps,
    rootRef,
    inputRef,
    open: disabled ? null : openFileDialog,
  };
}
