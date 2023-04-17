import { catchError, delay, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { CustomTimeoutError, timeoutAscending } from './timeout-ascending';

describe('RxJS timeoutAscending', () => {
    let testScheduler: TestScheduler
    beforeEach(() => {
        testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    });

    it('errors with CustomTimeoutError if the origin request times out', () => {
        const y = of(1).pipe(delay(1000), timeoutAscending(300, 2),
            catchError(err => throwError(() => {
                if (err instanceof CustomTimeoutError) {
                    throw 'error';
                } else {
                    throw err
                }
            })));
        const expectedMarbles = '900ms (#)';
        testScheduler.run(({ expectObservable }) => expectObservable(y).toBe(expectedMarbles, [0]));
    });

    it('errors regardless the number of retries provided when the delay of origin request is longer than provided delay', () => {
        const y = of(1).pipe(delay(200), timeoutAscending(100, 1),
            catchError(err => throwError(() => {
                if (err instanceof CustomTimeoutError) {
                    throw 'error';
                } else {
                    throw err
                }
            })));
        const expectedMarbles = '100ms (#)';
        testScheduler.run(({ expectObservable }) =>
            expectObservable(y).toBe(
                expectedMarbles,
                [0]
            )
        );
    });

    it('returns simple value if there is no delay', () => {
        const y = of(1).pipe(timeoutAscending(300, 1));
        const expectedMarbles = '(a|)';
        const expectedValues = { a: 1 };
        testScheduler.run(({ expectObservable }) =>
            expectObservable(y).toBe(
                expectedMarbles,
                expectedValues
            )
        );
    });

    it('returns simple value after a few attempts where total delay time comprises of timeout delays and response delay', () => {
        // expected value = 300 + 600 + 1200 + 1500 = 3600ms (the last timeout delay 2400ms is longer than request delay time)
        const y = of(1).pipe(delay(1500), timeoutAscending(300, 4));
        const expectedMarbles = '3600ms (a|)';
        const expectedValues = { a: 1 };
        testScheduler.run(({ expectObservable }) =>
            expectObservable(y).toBe(
                expectedMarbles,
                expectedValues
            )
        );
    });
});
