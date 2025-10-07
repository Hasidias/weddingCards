import { Component, Inject } from '@angular/core';
import { WeddingCard } from '../shared/wedding-card/wedding-card';
import { Cards } from '../coreComponents/models/cards.model';

@Component({
  selector: 'app-wedding-cards-list',
  imports: [],
  templateUrl: './wedding-cards-list.html',
  styleUrl: './wedding-cards-list.scss'
})
export class WeddingCardsList {
private dbService = Inject('Db');
cards = this.dbService.getWeddingCards().subscribe((cards :Cards) => {
  console.log(cards);
  cards.list.forEach(card => {
    console.log(card.name);
  })  
});
}
