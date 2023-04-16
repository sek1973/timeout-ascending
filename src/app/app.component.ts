import { Component } from '@angular/core';
import { Observable, delay, of, throwError, timeout } from 'rxjs';

class CustomTimeoutError extends Error {
  constructor() {
    super('Timeout occured');
    this.name = 'CustomTimeoutError';
  }
}

function timeoutAscending(delay: number, retries: number = 1) {
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    const obs1 = of(1).pipe(delay(1000), timeoutAscending(300, 2));
    const obs2 = of(2).pipe(delay(1500), timeoutAscending(300, 4));

    obs1.subscribe((val) => console.log(val));
    setTimeout(() => obs2.subscribe((val) => console.log(val)), 5000);
  }

}
