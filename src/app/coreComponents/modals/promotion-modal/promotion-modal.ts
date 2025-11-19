import { Component, Output, EventEmitter, Input } from '@angular/core';
import { WeddingCard } from '../../../shared/wedding-card/wedding-card';
import { CardPromotion } from '../../models/card.promotion.model';


@Component({
  selector: 'app-promotion-modal',
  imports: [],
  templateUrl: './promotion-modal.html',
  styleUrl: './promotion-modal.scss'
})
export class PromotionModal {
@Output() closeModal= new EventEmitter<void>();
@Input() promotions: CardPromotion[] = [] ;
close() {
  this.closeModal.emit();
}
}
