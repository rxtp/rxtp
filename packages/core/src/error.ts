import { Message } from './message.js';
import { OperatorFunction } from 'rxjs';

export abstract class ErrorHandler {
  abstract handleError: OperatorFunction<[Message, Error], Message>;
}
