import { Message } from './message';
import { Injector } from './injector.js';
import { mergeMap, of, OperatorFunction, switchMap } from 'rxjs';

export abstract class Finalizer {
  abstract finalize: OperatorFunction<Message, Message>;
}

export function finalizeMessage(
  injector: Injector
): OperatorFunction<Message, Message> {
  return (message$) =>
    message$.pipe(
      switchMap((message) =>
        injector
          .resolve(Finalizer)
          .pipe(mergeMap((finalizer) => finalizer.finalize(of(message))))
      )
    );
}
