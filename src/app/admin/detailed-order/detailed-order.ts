import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';


@Component({
  selector: 'app-detailed-order',
  imports: [CommonModule],
  templateUrl: './detailed-order.html',
  styleUrl: './detailed-order.scss',
})
export class DetailedOrder {
  
  ORDER_STATUS_COLORS: any = {
  verifying:'#FACC15',
  verified: '#06B6D4',
  dispatching:'#3B82F6',
  shipped:'#8B5CF6',
  delivered: '#22C55E',
  cancelled: '#EF4444'

}
  @Input('order') order: any;
  copiedValue:string = '';
  private cdr = inject(ChangeDetectorRef)
  ngOnInit() {
    console.log(this.order)
  }

  getShippingLines(ship: any): string[] {
  return [
    ship.line_1,
    ship.line_2,
    ship.city,
    ship.district,
    ship.phoneNumbers1,
    ship.phoneNumbers2
  ].filter(Boolean);
}


  async copy(text: string): Promise<boolean> {
    // Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        this.copiedValue = text;
        this.cdr.detectChanges();
        return true;
      } catch {
        return this.fallbackCopy(text);
      }
    }

    // Fallback for older browsers
    return this.fallbackCopy(text);
  }

  private fallbackCopy(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Prevent scrolling to bottom on iOS
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

}
