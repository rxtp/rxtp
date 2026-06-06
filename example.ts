import { Injector, MessageBus, MessageHandler, useHandler, filterType, Envelope } from './src';
import {
  of,
  delay,
  tap,
  catchError,
  EMPTY,
  timer,
  map,
  mergeMap,
  throwError,
  Observable,
  OperatorFunction,
  finalize,
} from 'rxjs';

/**
 * Deduplicates in-flight messages based on a key.
 * This is an application-level operator.
 */
function dedupeBy<M, K, R>(
  keySelector: (message: M) => K,
  pipeline: (source$: Observable<Envelope<M>>) => Observable<R>,
): OperatorFunction<Envelope<M>, R> {
  const inFlight = new Set<K>();

  return mergeMap((envelope) => {
    const key = keySelector(envelope.message);
    if (inFlight.has(key)) {
      return EMPTY;
    }

    inFlight.add(key);
    return pipeline(of(envelope)).pipe(finalize(() => inFlight.delete(key)));
  });
}

/**
 * 1. Define Shared Services
 */
class Logger {
  log(msg: string, context = 'App') {
    console.log(`[${context}] ${msg}`);
  }
}

class AlertService {
  constructor(private logger: Logger) {}
  notifyAdmin(error: Error, context: string) {
    this.logger.log(`ALERT: ${error.message}`, `AdminAlert:${context}`);
  }
}

class AnalyticsService {
  constructor(private logger: Logger) {}
  track(event: string, data: unknown) {
    this.logger.log(`Analytics: ${event} ${JSON.stringify(data)}`, 'Analytics');
  }
}

/**
 * 2. Define Domain Events & Results
 */
interface OrderCreated {
  type: 'ORDER_CREATED';
  orderId: string;
  amount: number;
}

interface PaymentProcessed {
  type: 'PAYMENT_PROCESSED';
  orderId: string;
  status: 'SUCCESS' | 'FAILED';
  amount?: number;
}

interface DataSyncRequested {
  type: 'DATA_SYNC';
  resourceId: string;
}

type AppEvent = OrderCreated | PaymentProcessed | DataSyncRequested;

type ProcessResult =
  | { status: 'COMPLETED'; id: string }
  | { status: 'REJECTED'; id: string; reason: string };

class OrdersRepository {
  private orders = new Map<string, { id: string; amount: number }>();

  save$(order: { id: string; amount: number }) {
    this.orders.set(order.id, order);
    return of(order).pipe(delay(300));
  }

  findById$(id: string) {
    // Randomly throw a REAL system error (simulating network/DB crash)
    if (Math.random() > 0.7) {
      return throwError(() => new Error('CRITICAL: Database connection timed out'));
    }

    const order = this.orders.get(id);
    return of(order).pipe(delay(200));
  }
}

class SyncHandler implements MessageHandler<DataSyncRequested, ProcessResult> {
  constructor(private logger: Logger) {}

  handle(event: DataSyncRequested) {
    this.logger.log(`Starting sync for: ${event.resourceId}`, 'SyncHandler');
    // Simulate long running sync task
    return timer(1500).pipe(map(() => ({ status: 'COMPLETED', id: event.resourceId }) as const));
  }
}

/**
 * 3. Define Handlers
 */

// Handles Order Creation
class OrderHandler implements MessageHandler<OrderCreated, ProcessResult> {
  constructor(
    private logger: Logger,
    private analytics: AnalyticsService,
    private ordersRepo: OrdersRepository,
  ) {}

  handle(event: OrderCreated) {
    this.logger.log(`Processing Order: ${event.orderId} ($${event.amount})`, 'OrderHandler');

    if (event.amount < 0) {
      return of({ status: 'REJECTED', id: event.orderId, reason: 'Negative amount' } as const);
    }

    return timer(500).pipe(
      mergeMap(() => this.ordersRepo.save$({ id: event.orderId, amount: event.amount })),
      tap(() => this.analytics.track('order_processed', { id: event.orderId })),
      map(() => ({ status: 'COMPLETED', id: event.orderId }) as const),
    );
  }
}

// Handles Payment Status
class PaymentHandler implements MessageHandler<PaymentProcessed, ProcessResult> {
  constructor(
    private logger: Logger,
    private ordersRepo: OrdersRepository,
  ) {}

  handle(event: PaymentProcessed) {
    this.logger.log(`Payment status for ${event.orderId}: ${event.status}`, 'PaymentHandler');

    return this.ordersRepo.findById$(event.orderId).pipe(
      map((order) => {
        if (!order) {
          return { status: 'REJECTED', id: event.orderId, reason: 'Order not found' } as const;
        }

        if (event.status === 'FAILED') {
          return { status: 'REJECTED', id: event.orderId, reason: 'Payment declined' } as const;
        }

        if (order.amount !== event.amount) {
          return { status: 'REJECTED', id: event.orderId, reason: 'Amount mismatch' } as const;
        }

        return { status: 'COMPLETED', id: event.orderId } as const;
      }),
    );
  }
}

/**
 * 4. Advanced DI Setup
 * Demonstrating cross-dependency and complex registration.
 */
const rootInjector = new Injector();

// Register singletons
rootInjector.register(Logger, () => new Logger());
rootInjector.register(AlertService, (i) => new AlertService(i.get(Logger)));
rootInjector.register(AnalyticsService, (i) => new AnalyticsService(i.get(Logger)));
rootInjector.register(OrdersRepository, () => new OrdersRepository());

// Register handlers
rootInjector.register(
  OrderHandler,
  (i) => new OrderHandler(i.get(Logger), i.get(AnalyticsService), i.get(OrdersRepository)),
);
rootInjector.register(
  PaymentHandler,
  (i) => new PaymentHandler(i.get(Logger), i.get(OrdersRepository)),
);
rootInjector.register(SyncHandler, (i) => new SyncHandler(i.get(Logger)));

/**
 * 5. Initialize the Message Bus
 */
const bus = new MessageBus<AppEvent>(rootInjector);

/**
 * 6. Complex Pipeline
 * Filter by event type and route to specific handlers.
 */
console.log('--- System Online ---\n');

// Order Processing Pipeline
bus.stream$
  .pipe(
    filterType('ORDER_CREATED'),
    mergeMap((envelope) =>
      of(envelope).pipe(
        useHandler(OrderHandler),
        tap((result) => {
          if (result.status === 'REJECTED') {
            envelope.injector
              .get(Logger)
              .log(`Order ${result.id} rejected: ${result.reason}`, 'Pipeline');
          }
        }),
        catchError((err) => {
          envelope.injector.get(AlertService).notifyAdmin(err, 'Orders');
          return EMPTY;
        }),
      ),
    ),
  )
  .subscribe();

// Payment Processing Pipeline with Error Handling
bus.stream$
  .pipe(
    filterType('PAYMENT_PROCESSED'),
    mergeMap((envelope) =>
      of(envelope).pipe(
        useHandler(PaymentHandler),
        tap((result) => {
          if (result.status === 'REJECTED') {
            envelope.injector
              .get(Logger)
              .log(`Payment ${result.id} rejected: ${result.reason}`, 'Pipeline');
          }
        }),
        catchError((err) => {
          envelope.injector.get(AlertService).notifyAdmin(err, 'Payments');
          return EMPTY;
        }),
      ),
    ),
  )
  .subscribe();

// Data Sync Pipeline with Deduplication
bus.stream$
  .pipe(
    filterType('DATA_SYNC'),
    // Only allow one sync per resourceId at a time
    dedupeBy(
      (msg) => msg.resourceId,
      (ev$) => ev$.pipe(useHandler(SyncHandler)),
    ),
  )
  .subscribe((res) => console.log(`[Pipeline] Sync ${res.id} finished`));

/**
 * 7. Simulate Real-world Events
 */
bus.publish({ type: 'ORDER_CREATED', orderId: 'ORD-123', amount: 99.99 });

// Wait for order to be "created" in DB before paying
setTimeout(() => {
  bus.publish({ type: 'PAYMENT_PROCESSED', orderId: 'ORD-123', status: 'SUCCESS', amount: 99.99 });
}, 1000);

// Simulate failures
setTimeout(() => {
  console.log('\n--- Simulating Failures ---');
  // 1. Failed Order (Negative Amount)
  bus.publish({ type: 'ORDER_CREATED', orderId: 'ORD-ERR', amount: -50 });
  // 2. Failed Payment (Unknown Order ID)
  bus.publish({
    type: 'PAYMENT_PROCESSED',
    orderId: 'ORD-UNKNOWN',
    status: 'SUCCESS',
    amount: 49.99,
  });
  // 3. Failed Payment (Declined)
  bus.publish({ type: 'ORDER_CREATED', orderId: 'ORD-999', amount: 49.99 });
  setTimeout(() => {
    bus.publish({ type: 'PAYMENT_PROCESSED', orderId: 'ORD-999', status: 'FAILED', amount: 49.99 });
  }, 1000);

  // 4. Deduplication Example
  console.log('\n--- Testing Deduplication ---');
  bus.publish({ type: 'DATA_SYNC', resourceId: 'USER_TABLE' });
  bus.publish({ type: 'DATA_SYNC', resourceId: 'USER_TABLE' }); // Ignored
  bus.publish({ type: 'DATA_SYNC', resourceId: 'USER_TABLE' }); // Ignored
}, 2500);
