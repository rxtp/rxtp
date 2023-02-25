import { handleMessage$, Message } from './message.js';
import { Injector, InjectionToken } from './injector.js';
import { PlatformID } from './types/platform.js';
import { ErrorHandler } from './error.js';
import { Finalizer } from './finalizer.js';
import { Router } from './router.js';
import { catchError, mergeMap, of, Subject, switchMap } from 'rxjs';

export const PLATFORM_ID = new InjectionToken<PlatformID>('PLATFORM_ID');

export class Platform {
  readonly message = new Subject<Message>();

  readonly message$ = this.message.asObservable().pipe(
    mergeMap((message) => {
      return of(message).pipe(
        this._router.route$(),
        handleMessage$(),
        // finalize message
        switchMap((message) =>
          this._injector
            .resolve$(Finalizer)
            .pipe(switchMap((finalizer) => finalizer.finalize(of(message))))
        ),

        // capture errors
        catchError((error: Error) =>
          this._injector
            .resolve$(ErrorHandler)
            .pipe(
              switchMap((errorHandler) =>
                errorHandler.handleError(of([message, error]))
              )
            )
        )
      );
    })
  );

  constructor(
    private readonly _router: Router,
    private readonly _injector: Injector
  ) {}
}
