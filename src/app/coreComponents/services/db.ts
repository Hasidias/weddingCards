import { Inject, inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, getDoc, setDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})

export class Db {
 firestore =  inject(Firestore);
 collectionRef = collection(this.firestore, 'weddingCards');
 
 
 constructor(private injector: Injector) { 

 }
  
  getWeddingCards() {
  return collectionData(this.collectionRef, { idField: 'docId' }) ;
  }

  async placeOrder(orderData:any){
   ( async () => {
      const ordersRef = collection(this.firestore, 'orders');
      return await addDoc(ordersRef, orderData);
    })();
  }

  async addToCart(orderData:any, uid: string){
     runInInjectionContext(this.injector, () => {
        (async () => {
          const ordersRef = doc(this.firestore, 'carts', uid);
          const subCollectionRef = collection(this.firestore, 'carts', uid, 'items')
          const snap = await getDoc(ordersRef);
          if (!snap.exists()) {
            await setDoc(ordersRef, {...orderData});
          } else {
            await addDoc(subCollectionRef, {...orderData});
          }
        })(); 
     })
        
  }

  async submitCustomizedOrder(orderData:any, uid: string){
    runInInjectionContext(this.injector, () => {
      ( async() => {
        const ordersRef = doc(this.firestore, 'customOrders', uid);
        const subCollectionRef = collection(this.firestore, 'customOrders', uid, 'items')
        const snap = await getDoc(ordersRef);
        if (!snap.exists()) {
          await setDoc(ordersRef, {...orderData});
        } else {
          await addDoc(subCollectionRef, {...orderData});
        }
      })();     
    })
      
  }

   getCartItems (uid: string){
    console.log(uid)
    return runInInjectionContext(this.injector,  () => {
      const subCollectionRef = collection(this.firestore, 'carts', uid, 'items')
      var weddingCards$ = collectionData(subCollectionRef, { idField: 'docId' });
      return weddingCards$
    });
    
  }

   deleteCartItem(uid:string, docId:string,) {
    console.log(uid,docId)
    return runInInjectionContext(this.injector,  async () => {
      const docRef = doc(this.firestore, `carts/${uid}/items/${docId}`)
      await deleteDoc(docRef).then(() => {
        console.log('delete Success')
      }).catch(error => {
        console.log(error)
      })
    });
  }

  updateCartQuantity(uid:string, docId: string, quantity:number) {
    return runInInjectionContext(this.injector,  async () => {
      const docRef = doc(this.firestore, `carts/${uid}/items/${docId}`)
      await updateDoc(docRef, {
        quantity
      }).then(() => {
        console.log('update Success')
      }).catch(error => {
        console.log(error)
      })
    });
  }

  updateCartGBQuantity(uid:string, docId: string, quantity:number) {
    return runInInjectionContext(this.injector,  async () => {
      const docRef = doc(this.firestore, `carts/${uid}/items/${docId}`)
      await updateDoc(docRef, {
        "giftBox.quantity": quantity
      }).then(() => {
        console.log('update Success')
      }).catch(error => {
        console.log(error)
      })
    });
  }
}
