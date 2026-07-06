import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-wedding-card',
  imports: [RouterLink],
  templateUrl: './wedding-card.html',
  styleUrl: './wedding-card.scss'
})
export class WeddingCard {
@Input() cardData: any = {};

ngOnInit() {
}

}
