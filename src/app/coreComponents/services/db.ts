import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WeddingCard } from '../../shared/wedding-card/wedding-card';

@Injectable({
  providedIn: 'root'
})
export class Db {
  private firestore = Inject('Firestore');
  items$: Observable<WeddingCard[]> = new Observable<WeddingCard[]>();

  getWeddingCards(): Observable<WeddingCard[]> {
    return this.firestore.collection('weddingCards').valueChanges();
  }

}
