import { Message } from './message.js';
import { Injector } from './injector.js';
import { of, OperatorFunction, switchMap } from 'rxjs';

export abstract class Finalizer {
  abstract finalize: OperatorFunction<Message, Message>;
}

export function finalize(
  injector: Injector
): OperatorFunction<Message, Message> {
  return (message$) =>
    message$.pipe(
      switchMap((message) =>
        injector
          .resolve$(Finalizer)
          .pipe(switchMap((finalizer) => finalizer.finalize(of(message))))
      )
    );
}
