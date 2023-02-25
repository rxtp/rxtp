import { Message } from './message.js';
import { OperatorFunction } from 'rxjs';

export abstract class Handler {
  abstract handle: OperatorFunction<Message, Message>;
}
