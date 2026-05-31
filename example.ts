import 'reflect-metadata';

import { Injectable, Handler, ErrorHandler, MessageAndError, Platform } from './src';
import { OperatorFunction, tap, map, filter, delay, of, Observable, mergeMap, range } from 'rxjs';

const inFlight = new Set();

function dedupeInFlight<T, K, R>(
  keySelector: (value: T) => K,
  project: (value: T) => Observable<R>,
): OperatorFunction<T, R> {
  return (source) =>
    source.pipe(
      mergeMap((value) => {
        const key = keySelector(value);
        if (inFlight.has(key)) {
          return of();
        }
        inFlight.add(key);
        return project(value).pipe(tap({ complete: () => inFlight.delete(key) }));
      }),
    );
}

function get<K extends keyof Record<string, unknown>, V>(
  key: K,
): OperatorFunction<Record<K, V>, V> {
  return map((record) => record[key]);
}

@Injectable()
class InMemoryDatabase<T> {
  private data = new Map<string, T>();
  public set(key: string, value: T) {
    return this.data.set(key, value);
  }
  public get(key: string) {
    return this.data.get(key);
  }
}

interface User {
  id: number;
  name: string;
}

@Injectable()
class UserService {
  constructor(private db: InMemoryDatabase<User>) {
    // Pre-populate the database with some users
    this.db.set('1', { id: 1, name: 'Alice' });
    this.db.set('2', { id: 2, name: 'Bob' });
    this.db.set('3', { id: 3, name: 'Charlie' });
    this.db.set('4', { id: 4, name: 'Diana' });
  }

  getUser: OperatorFunction<User['id'], User | undefined> = (id$) =>
    id$.pipe(
      delay(Math.random() * 10000),
      map((id) => this.db.get(id.toString())),
    );
}

type Message = User['id'];

@Injectable()
class UserMessageHandler extends Handler<Message> {
  constructor(private userService: UserService) {
    super();
  }

  handle: OperatorFunction<Message, Message> = (id$) =>
    id$.pipe(
      dedupeInFlight(
        (id) => id.toString(), // Use user ID as the key for deduplication
        (id) => of(id).pipe(this.userService.getUser, filter(Boolean), tap(console.log), get('id')),
      ),
    );
}

@Injectable()
class UserErrorHandler extends ErrorHandler<Message> {
  handleError: OperatorFunction<MessageAndError<Message>, Message> = (errorInfo$) =>
    errorInfo$.pipe(
      tap(({ message, error }) => console.error(`Error processing message ${message}:`, error)),
      get('message'),
    );
}

const { platform } = Platform.createPlatform<User['id']>([
  InMemoryDatabase,
  UserService,
  UserMessageHandler,
  UserErrorHandler,
]);

platform.message$.subscribe();

range(1, 4)
  .pipe(mergeMap((id) => of(id, id, id)))
  .subscribe((id) => platform.message.next(id));
