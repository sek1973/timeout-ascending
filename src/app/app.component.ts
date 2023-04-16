import { Component } from '@angular/core';
import { Observable, delay, of, throwError, timeout } from 'rxjs';

class CustomTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'CustomTimeoutError';
  }
}

function timeoutAscending(delay: number) {
  return function <T>(source: Observable<T>): Observable<T> {
    return new Observable(subscriber => {
      const config = (delayValue: number) => ({
        first: delayValue,
        with: () => throwError(() => new CustomTimeoutError())
      });
      const observer = {
        next(value: T) { subscriber.next(value); },
        error(error: any) {
          if (error instanceof CustomTimeoutError) {
            console.log('Timeout error!!!');
          } else {
            subscriber.error(error);
          }
        },
        complete() { subscriber.complete(); }
      }
      const subscription = source
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
    const obs1 = of(1).pipe(delay(500), timeoutAscending(1000));
    const obs2 = of(2).pipe(delay(1500), timeoutAscending(1000));

    obs1.subscribe((val) => console.log(val));
    obs2.subscribe((val) => console.log(val));
  }

}
