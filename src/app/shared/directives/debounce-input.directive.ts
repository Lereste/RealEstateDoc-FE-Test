import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';

@Directive({
  selector: '[debounceInput]',
})
export class DebounceInputDirective {
  @Output() debounceInput = new EventEmitter<string>();

  constructor(private el: ElementRef<HTMLInputElement>) {
    fromEvent<InputEvent>(this.el.nativeElement, 'input')
      .pipe(
        map((event) => (event.target as HTMLInputElement).value),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => this.debounceInput.emit(value));
  }
}
