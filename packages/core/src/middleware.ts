import { Message } from './message.js';
import { OperatorFunction } from 'rxjs';

export abstract class Middleware {
  abstract preHandle: OperatorFunction<Message, Message>;
  abstract postHandle: OperatorFunction<Message, Message>;
}
