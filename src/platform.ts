import { Injector } from "./injector.js";
import { ErrorHandler, handleError } from "./error.js";
import { handleMessage, Handler } from "./handler.js";
import { mergeMap, of, Subject } from "rxjs";
import { Providers, Type } from "./types/injector";

export class Platform<M> {
  readonly message = new Subject<M>();

  readonly message$ = this.message.asObservable().pipe(
    mergeMap((message) =>
      of(message).pipe(
        handleMessage<M>(this._injector),
        handleError<M>(message, this._injector),
      ),
    ),
  );

  constructor(private readonly _injector: Injector) { }

  public static createPlatform<M>(providers: Providers) {
    const injector = Injector.createPlatformInjector(providers);
    const platform = new Platform(injector);
    const subscription = platform.message$.subscribe();
    return { platform, subscription, injector };
  }
}
