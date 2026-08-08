import { Observable } from 'rxjs';

export interface MessageHandler<M, R> {
  handle(message: M): Observable<R>;
}
