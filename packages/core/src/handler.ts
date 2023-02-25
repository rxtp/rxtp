import { Token } from './types/injector.js';
import { Message } from './message';
import { Injector } from './injector.js';
import { mergeMap, of, OperatorFunction, switchMap } from 'rxjs';

export abstract class Handler {
  abstract handle: OperatorFunction<Message, Message>;
}

export function handleMessage(
  handler: Token<Handler>,
  injector: Injector
): OperatorFunction<Message, Message> {
  return (message$) =>
    message$.pipe(
      switchMap((message) =>
        injector
          .resolve(handler)
          .pipe(mergeMap((handler) => handler.handle(of(message))))
      )
    );
}
