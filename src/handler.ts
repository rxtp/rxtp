import { Observable } from 'rxjs';

export interface MessageHandler<M, R = unknown> {
  handle(message: M): Observable<R>;
}
