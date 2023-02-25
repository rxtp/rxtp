import { OperatorFunction } from 'rxjs';
import { Message } from './message.js';

export abstract class Finalizer {
  abstract finalize: OperatorFunction<Message, Message>;
}
