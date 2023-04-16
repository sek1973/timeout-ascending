
import { catchError, delay, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { CustomTimeoutError, timeoutAscending } from './timeout-ascending';

describe('RxJS', () => {
    let testScheduler: TestScheduler
    beforeEach(() => {
        testScheduler = new TestScheduler((actual, expected) => {
            return expect(actual).toEqual(expected);
        });
    });

    it('returns simple value', () => {
        const y = of(1).pipe(delay(1000), timeoutAscending(300, 2),
            catchError(err => throwError(() => {
                if (err instanceof CustomTimeoutError) {
                    throw 'error';
                } else { throw err }
            })));
        const expectedMarbles = '900ms (#)';
        testScheduler.run(({ expectObservable }) => {
            expectObservable(y).toBe(
                expectedMarbles,
                [0]
            );
        });
    });

    it('returns simple value', () => {
        const y = of(2).pipe(delay(1500), timeoutAscending(300, 4));
        const expectedMarbles = '3600ms (a|)';
        const expectedValues = { a: 2 };
        testScheduler.run(({ expectObservable }) => {
            expectObservable(y).toBe(
                expectedMarbles,
                expectedValues
            );
        });
    });
});