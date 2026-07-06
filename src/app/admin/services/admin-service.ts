import { Inject, inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private firestore = inject(Firestore);
  
  constructor(private injector: Injector) {}

  async saveProduct(productData: any) {
    const productsCollection = collection(this.firestore, 'weddingCards')
    return await addDoc(productsCollection, productData)
  }

  getOrders() {
    return runInInjectionContext(this.injector, () => {
      const collectionRef = collection(this.firestore, 'orders');
      return collectionData(collectionRef, { idField: 'docId' });
    })
  }
}
