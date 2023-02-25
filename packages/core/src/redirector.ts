import { Path } from './types/router.js';
import { Message } from './message';
import { Injector } from './injector.js';
import { mergeMap, of, OperatorFunction, switchMap } from 'rxjs';

export abstract class Redirector {
  abstract redirect: OperatorFunction<[Message, Path], Message>;
}

export function redirectMessage(
  path: Path,
  injector: Injector
): OperatorFunction<Message, Message> {
  return (message$) =>
    message$.pipe(
      switchMap((message) =>
        injector
          .resolve(Redirector)
          .pipe(
            mergeMap((redirector) => redirector.redirect(of([message, path])))
          )
      )
    );
}
