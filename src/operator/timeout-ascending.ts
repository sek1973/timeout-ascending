import { Observable, throwError, timeout } from 'rxjs';

export class CustomTimeoutError extends Error {
  constructor() {
    super('Timeout occurred');
    this.name = 'CustomTimeoutError';
  }
}

export function timeoutAscending(delayMs: number, retries: number = 1) {
  if (retries < 1) {
    throw new TypeError('Wrong value for retries provided (required >=1)');
  }

  return function <T>(source: Observable<T>): Observable<T> {
    return new Observable(subscriber => {
      let retried = 1;
      const config = (delayValue: number) => ({
        first: delayValue,
        with: () => throwError(() => new CustomTimeoutError())
      });
      const observer = {
        next(value: T) {
          subscriber.next(value);
        },
        error(error: any) {
          if (error instanceof CustomTimeoutError) {
            if (retried < retries) {
              console.warn(`Timed out. Retry ${retried}. with ${delayMs * Math.pow(2, retried)}ms`);
              subscription.unsubscribe();
              subscription = source
                .pipe(timeout(config(delayMs * Math.pow(2, retried))))
                .subscribe(observer);
              ++retried;
            } else {
              console.warn(`Timeout error after ${retries} retries.`);
              subscriber.error(error);
            }
          } else {
            subscriber.error(error);
          }
        },
        complete() {
          subscriber.complete();
        }
      }
      console.log(`First attempt with ${delayMs}ms`);
      let subscription = source
        .pipe(
          timeout(config(delayMs)))
        .subscribe(observer);

      return () => subscription.unsubscribe();
    });
  }
}