import { filter, mergeMap, OperatorFunction } from 'rxjs';
import { Envelope } from './envelope';
import { Token } from './injector';
import { MessageHandler } from './handler';

export function filterType<M extends { type: string }, T extends M['type']>(
  type: T,
): OperatorFunction<Envelope<M>, Envelope<Extract<M, { type: T }>>> {
  return filter((envelope): envelope is Envelope<Extract<M, { type: T }>> => {
    return envelope.message.type === type;
  });
}

export function useHandler<M, R>(
  token: Token<MessageHandler<M, R>>,
): OperatorFunction<Envelope<M>, R> {
  return mergeMap((envelope) => {
    const handler = envelope.injector.get(token);
    return handler.handle(envelope.message);
  });
}
