import { Subject, Observable, map } from 'rxjs';
import { Injector } from './injector';
import { Envelope } from './envelope';

export class MessageBus<M> {
  private readonly _messages$ = new Subject<M>();

  constructor(private readonly injector: Injector) {}

  publish(message: M): void {
    this._messages$.next(message);
  }

  get stream$(): Observable<Envelope<M>> {
    return this._messages$.asObservable().pipe(
      map((message) => ({
        message,
        injector: this.injector.child(),
      })),
    );
  }
}
