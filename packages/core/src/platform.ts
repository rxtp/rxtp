import { handleMessage$, Message } from './message.js';
import { Injector, InjectionToken } from './injector.js';
import { PlatformID } from './types/platform.js';
import { handleError$ } from './error.js';
import { finalize$ } from './finalizer.js';
import { Router } from './router.js';
import { mergeMap, of, Subject } from 'rxjs';

export const PLATFORM_ID = new InjectionToken<PlatformID>('PLATFORM_ID');

export class Platform {
  readonly message = new Subject<Message>();

  readonly message$ = this.message.asObservable().pipe(
    mergeMap((message) => {
      return of(message).pipe(
        this._router.route$(),
        handleMessage$(),
        finalize$(this._injector),
        handleError$(message, this._injector)
      );
    })
  );

  constructor(
    private readonly _router: Router,
    private readonly _injector: Injector
  ) {}
}
