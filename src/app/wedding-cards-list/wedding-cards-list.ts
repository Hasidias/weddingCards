import { Component, inject, Injectable, SimpleChanges, EventEmitter, runInInjectionContext, Injector, NgZone, ChangeDetectorRef } from '@angular/core';
import { WeddingCard } from '../shared/wedding-card/wedding-card';
import { Db } from '../coreComponents/services/db';
import { Card } from '../coreComponents/models/card.model';



@Component({
  selector: 'app-wedding-cards-list',
  imports: [WeddingCard],
  templateUrl: './wedding-cards-list.html',
  styleUrl: './wedding-cards-list.scss'
})

@Injectable({ providedIn: 'root' })
export class WeddingCardsList {
private cdr = inject(ChangeDetectorRef);
cards:Card[] | any = [];
cardUpdated: EventEmitter<Card[]> = new EventEmitter<Card[]>();
uid!:string | undefined;

constructor(private dbService: Db) { 
  // const collectionRef = collection(this.firestore, 'weddingCards');
  // var weddingCards$: Observable<Card[]> = collectionData(collectionRef, { idField: 'id' }) as Observable<Card[]>;
  // // weddingCards$.subscribe(async (res) => {
  // runInInjectionContext(this.injector, () => {
  //   return new Promise<void>((resolve) => {
  //     weddingCards$.subscribe(async (res) => {
  //       this.cards = res;
  //       this.cdr.detectChanges();
  //       resolve();
  //     })
  // })});
      this.dbService.getWeddingCards().subscribe(res => {
      this.cards = res;
      this.cdr.detectChanges();
    })
}

 ngOnInit() { 
}
}

