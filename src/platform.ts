import { Injector } from './injector.js';
import { handleError } from './error.js';
import { handleMessage } from './handler.js';
import { mergeMap, of, Subject } from 'rxjs';
import { Providers } from './types/injector';

export class Platform<M> {
  readonly message = new Subject<M>();

  readonly message$ = this.message
    .asObservable()
    .pipe(
      mergeMap((message) =>
        of(message).pipe(handleMessage<M>(this._injector), handleError<M>(message, this._injector)),
      ),
    );

  constructor(private readonly _injector: Injector) {}

  public static createPlatform<M>(providers: Providers) {
    const injector = Injector.createPlatformInjector(providers);
    const platform = new Platform<M>(injector);
    const subscription = platform.message$.subscribe();
    return { platform, subscription, injector };
  }
}
