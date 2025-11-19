import { Component, inject, Inject, Injectable, SimpleChanges, EventEmitter, runInInjectionContext, Injector, NgZone, ChangeDetectorRef } from '@angular/core';
import { WeddingCard } from '../shared/wedding-card/wedding-card';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Db } from '../coreComponents/services/db';
import { Card } from '../coreComponents/models/card.model';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';



@Component({
  selector: 'app-wedding-cards-list',
  imports: [WeddingCard],
  templateUrl: './wedding-cards-list.html',
  styleUrl: './wedding-cards-list.scss'
})

@Injectable({ providedIn: 'root' })
export class WeddingCardsList {
private firestore = inject(Firestore);
private cdr = inject(ChangeDetectorRef);
cards:Card[] = [];
cardUpdated: EventEmitter<Card[]> = new EventEmitter<Card[]>();

constructor(private injector: Injector) { 
  const collectionRef = collection(this.firestore, 'weddingCards');
  var weddingCards$: Observable<Card[]> = collectionData(collectionRef, { idField: 'id' }) as Observable<Card[]>;
  // weddingCards$.subscribe(async (res) => {
  runInInjectionContext(this.injector, () => {
    return new Promise<void>((resolve) => {
      weddingCards$.subscribe(async (res) => {
        this.cards = res;
        this.cdr.detectChanges();
        resolve();
      })
  })});
}

 ngOnInit() {
  // this.db.getWeddingCards().then(data => {
  //   data.subscribe(res => {
  //       this.cards = res;
  //       console.log(this.cards);
  //   });
  // });
  
  //   this.cards = res;
  //   console.log(this.cards);
  // });

  
}
}

