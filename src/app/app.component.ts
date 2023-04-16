import { Component } from '@angular/core';
import { delay, of } from 'rxjs';
import { timeoutAscending } from 'src/operator/timeout-ascending';

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
