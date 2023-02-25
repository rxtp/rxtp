import { OperatorFunction } from 'rxjs';
import { Message } from './message.js';

export abstract class Redirector {
  abstract redirect: OperatorFunction<Message, Message>;
}
