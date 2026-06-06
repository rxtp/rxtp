import { Injector } from './injector';

export interface Envelope<M> {
  readonly message: M;
  readonly injector: Injector;
}
