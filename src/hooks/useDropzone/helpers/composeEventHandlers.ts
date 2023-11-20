/**
 * This is intended to be used to compose event handlers
 * They are executed in order until one of them calls `event.isPropagationStopped()`.
 * Note that the check is done on the first invoke too,
 * meaning that if propagation was stopped before invoking the fns,
 * no handlers will be executed.
 *
 * @param {Function} handlers the event hanlder functions
 * @return {Function} the event handler to add to an element
 */

export function isPropagationStoppedWrapper<T>(...handlers: (((event: T) => void) | undefined)[]) {
  return (event: T & React.SyntheticEvent) =>
    handlers.some((handler) => {
      if (!event.isPropagationStopped() && handler) {
        handler(event);
      }
      return event.isPropagationStopped();
    });
}
