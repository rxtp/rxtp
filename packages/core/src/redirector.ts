import { Path } from './types/router.js';
import { Message } from './message.js';
import { Injector } from './injector.js';
import { of, OperatorFunction, switchMap } from 'rxjs';

export abstract class Redirector {
  abstract redirect: OperatorFunction<[Message, Path], Message>;
}

export function redirect(
  path: Path,
  injector: Injector
): OperatorFunction<Message, Message> {
  return (message$) =>
    message$.pipe(
      switchMap((message) =>
        injector
          .resolve$(Redirector)
          .pipe(
            switchMap((redirector) => redirector.redirect(of([message, path])))
          )
      )
    );
}
