import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { WeddingCard } from '../../shared/wedding-card/wedding-card';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})

export class Db {
 firestore =  inject(Firestore);
 collectionRef = collection(this.firestore, 'weddingCards');
 
  
 async getWeddingCards() {
  var weddingCards$: Observable<Card[]> = collectionData(this.collectionRef, { idField: 'id' }) as Observable<Card[]>;
    return weddingCards$
  }
}
