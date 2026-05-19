import { Injector } from "./injector.js";
import { mergeMap, Observable, of, OperatorFunction, switchMap } from "rxjs";

export abstract class Handler<M> {
  abstract handle: OperatorFunction<M, M>;
}

export function handleMessage<M>(
  injector: Injector,
): OperatorFunction<M, M> {
  return (message$) =>
    message$.pipe(
      switchMap((message) =>
        injector
          .resolve(Handler<M>)
          .pipe(mergeMap((handler) => handler.handle(of(message)))),
      ),
    );
}
