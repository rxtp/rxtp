import { Injector } from './injector.js';
import { catchError, of, OperatorFunction, switchMap } from 'rxjs';

export interface MessageAndError<M> {
  message: M;
  error: Error;
}

export abstract class ErrorHandler<M> {
  abstract handleError: OperatorFunction<MessageAndError<M>, M>;
}

export function handleError<M>(message: M, injector: Injector): OperatorFunction<M, M> {
  return (message$) =>
    message$.pipe(
      catchError((error) =>
        injector
          .resolve(ErrorHandler<M>)
          .pipe(switchMap((errorHandler) => errorHandler.handleError(of({ message, error })))),
      ),
    );
}
