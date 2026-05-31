import { Injector } from './injector';
import { handleError } from './error';
import { handleMessage } from './handler';
import { mergeMap, of, Subject } from 'rxjs';
import { Providers } from './types/injector';

export class Platform<M> {
  readonly message = new Subject<M>();

  readonly message$ = this.message.asObservable().pipe(
    mergeMap((message) => {
      // Create a message-scoped injector for each message
      const messageInjector = this._injector.createMessageInjector();
      return of(message).pipe(
        handleMessage<M>(messageInjector),
        handleError<M>(message, messageInjector),
      );
    }),
  );

  constructor(private readonly _injector: Injector) {}

  public static createPlatform<M>(providers: Providers) {
    const injector = Injector.createPlatformInjector(providers);
    const platform = new Platform<M>(injector);
    const subscription = platform.message$.subscribe();
    return { platform, subscription, injector };
  }
}
