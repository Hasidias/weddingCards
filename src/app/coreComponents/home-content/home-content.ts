import { Component } from '@angular/core';
import { WeddingCardsList } from '../../wedding-cards-list/wedding-cards-list';

@Component({
  selector: 'app-home-content',
  imports: [WeddingCardsList],
  templateUrl: './home-content.html',
  styleUrl: './home-content.scss'
})
export class HomeContent {

}
