# RXTP

A minimal, reactive-first message and event framework for TypeScript, powered by RxJS and a lightweight, delegation-based DI system.

## Core Concepts

- **MessageBus**: The central hub for publishing and subscribing to events.
- **Envelope**: A wrapper for every message that includes a scoped DI injector.
- **Injector**: A lightweight, hierarchy-aware dependency injection system (no decorators or `reflect-metadata` required).
- **Handlers**: Simple classes or functions that process messages within the RxJS pipeline.

## Installation

```bash
# This library is designed to be lightweight and included directly or via git
npm install github:rxtp/rxtp
```

## Example

```typescript
import { Injector, MessageBus, MessageHandler, useHandler, filterType } from "@rxtp/core";
import { of, tap, mergeMap, catchError, EMPTY } from "rxjs";

// 1. Define a Service
class AlertService {
  notify(msg: string) { console.log(`[Alert] ${msg}`); }
}

// 2. Define a Handler
class OrderHandler implements MessageHandler<OrderEvent> {
  constructor(private alert: AlertService) {}

  handle(event: OrderEvent) {
    if (event.amount < 0) throw new Error("Invalid amount");
    return of(event).pipe(tap(() => console.log("Order processed")));
  }
}

// 3. Setup DI
const injector = new Injector();
injector.register(AlertService, () => new AlertService());
injector.register(OrderHandler, (i) => new OrderHandler(i.get(AlertService)));

// 4. Initialize Bus
const bus = new MessageBus<OrderEvent>(injector);

// 5. Connect with Resilience
bus.stream$.pipe(
  filterType('ORDER_CREATED'),
  mergeMap(envelope => of(envelope).pipe(
    useHandler(OrderHandler),
    catchError(err => {
      envelope.injector.get(AlertService).notify(err.message);
      return EMPTY;
    })
  ))
).subscribe();

bus.publish({ type: 'ORDER_CREATED', amount: -10 });
```

## Advanced Usage

### Application-Level Deduplication

Since the framework is just RxJS, you can easily add complex patterns like in-flight deduplication:

```typescript
function dedupeBy<M, K, R>(
  keySelector: (message: M) => K,
  pipeline: (source$: Observable<Envelope<M>>) => Observable<R>,
): OperatorFunction<Envelope<M>, R> {
  const inFlight = new Set<K>();

  return mergeMap((envelope) => {
    const key = keySelector(envelope.message);
    if (inFlight.has(key)) return EMPTY;

    inFlight.add(key);
    return pipeline(of(envelope)).pipe(
      finalize(() => inFlight.delete(key))
    );
  });
}

// Usage in pipeline
bus.stream$.pipe(
  filterType('DATA_SYNC'),
  dedupeBy(msg => msg.resourceId, ev$ => ev$.pipe(
    useHandler(SyncHandler)
  ))
).subscribe();
```

## Why RXTP?

- **Zero Metadata**: No `reflect-metadata` or `experimentalDecorators` required. Works in any TypeScript environment.
- **Performance**: Child injectors use **delegation** rather than copying providers, making per-message scoping extremely fast and memory-efficient.
- **Stream Isolation**: By combining `mergeMap` with inner `catchError`, a single failing message won't kill your entire application bus.
- **Type Safety**: Built-in `filterType` operator provides full TypeScript narrowing for union-type events.
- **Explicit**: Dependency trees are defined via simple factory functions, making them easy to trace and test.
