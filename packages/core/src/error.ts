import { Message } from './message.js';
import { Injector } from './injector.js';
import { catchError, of, OperatorFunction, switchMap } from 'rxjs';

export abstract class ErrorHandler {
  abstract handleError: OperatorFunction<[Message, Error], Message>;
}

export function handleError$(
  message: Message,
  injector: Injector
): OperatorFunction<Message, Message> {
  return (message$) =>
    message$.pipe(
      catchError((error) =>
        injector
          .resolve$(ErrorHandler)
          .pipe(
            switchMap((errorHandler) =>
              errorHandler.handleError(of([message, error]))
            )
          )
      )
    );
}
