import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDropDown]'
})
export class DropDown {

 private isOpen = false;

  constructor(private el:ElementRef, private renderr: Renderer2) { }

  @HostListener('click')
  toggleOpen() {
    this.isOpen = !this.isOpen;
    this.updateState();
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.updateState();
    }
  }

  private updateState() {
    if (this.isOpen) {
      this.renderr.addClass(this.el.nativeElement, 'open');
    } else {
      this.renderr.removeClass(this.el.nativeElement, 'open');
    }
  }

}
