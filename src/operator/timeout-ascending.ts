import { Observable, throwError, timeout } from 'rxjs';

export class CustomTimeoutError extends Error {
  constructor() {
    super('Timeout occured');
    this.name = 'CustomTimeoutError';
  }
}

export function timeoutAscending(delay: number, retries: number = 1) {
  if (retries <= 0) {
    throw new TypeError('Wrong value for retries provided');
  }

  return function <T>(source: Observable<T>): Observable<T> {
    return new Observable(subscriber => {
      let retried = 0;
      const config = (delayValue: number) => ({
        first: delayValue,
        with: () => throwError(() => new CustomTimeoutError())
      });
      const observer = {
        next(value: T) { subscriber.next(value); },
        error(error: any) {
          if (error instanceof CustomTimeoutError) {
            if (retried < retries) {
              subscription.unsubscribe();
              subscription = source
                .pipe(timeout(config(delay * Math.pow(2, retried++))))
                .subscribe(observer);
              console.log(`retry ${retried}. with ${delay * Math.pow(2, retried - 1)}ms`);
            } else {
              console.log(`Timeout error after ${retries} retries.`);
              subscriber.error(error);
            }
          } else {
            console.log('other error!');
            subscriber.error(error);
          }
        },
        complete() { subscriber.complete(); }
      }
      let subscription = source
        .pipe(timeout(config(delay)))
        .subscribe(observer);

      return () => subscription.unsubscribe();
    });
  }
}