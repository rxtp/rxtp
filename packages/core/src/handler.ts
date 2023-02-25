import { Token } from './types/injector.js';
import { Message } from './message.js';
import { Injector } from './injector.js';
import { of, OperatorFunction, switchMap } from 'rxjs';

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
          .resolve$(handler)
          .pipe(switchMap((handler) => handler.handle(of(message))))
      )
    );
}
