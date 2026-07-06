import { ChangeDetectorRef, Component, OnInit, Renderer2, inject } from '@angular/core';
import { Db } from '../services/db';
import { AuthService } from '../../auth-service';
import { WeddingCardOrder } from '../models/orderModel/weddingCardOrder.model';
import { CommonModule } from '@angular/common';
import { filter, switchMap, tap } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule,FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})

export class Cart implements OnInit{

  items: any;
  authservice = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  uid!: string;
  orders: WeddingCardOrder[] |any = [];
  totalAmount = 0;
  ordersModified: WeddingCardOrder[] |any = [];
  private router = inject(Router);

  constructor (private dbservice: Db, private renderr: Renderer2) {
    this.authservice.user$
      .pipe(
          filter(user => !!user),
          tap(user => {this.uid = user.uid}),             // ensures uid exists
          switchMap( user => 
            this.dbservice.getCartItems(user!.uid)
          )
        )
        .subscribe(items => {
          this.orders = items;
          this.ordersModified = items;
          console.log(this.orders && this.orders.length)
          if (this.orders && this.orders.length > 0) {
          this.orders.forEach((order:any) => {
            if (order.priceAfterPromotion > 0) {
              this.totalAmount += order.priceAfterPromotion;
            } else {
              this.totalAmount += order.price
            }
          });
          this.ordersModified.forEach((order: any) => {
            order.editMode = false;
          })
          this.ordersModified.forEach((order: any) => {
            if (order.isGiftBoxIncluded) {
              order.giftBox.editMode = false;
            }
          }) 
        }
        console.log(this.ordersModified)
        this.cdr.detectChanges();
      });
  }

   async ngOnInit() {
     
      
  }
  
  deleteItem(docId: string) {
    this.dbservice.deleteCartItem(this.uid, docId);
  }
  
  toggleModification(index: number) {
    this.ordersModified[index].editMode = !this.ordersModified[index].editMode;
    this.cdr.detectChanges();
    if (this.ordersModified[index].editMode) {
      let id = `#quantity_${index}`
      const item = this.renderr.selectRootElement(id)!;
      if (item) {
        item.focus();
      }
    }
  }

  toggleGBModification(index: number) {
    this.ordersModified[index].giftBox.editMode = !this.ordersModified[index].giftBox.editMode;
    this.cdr.detectChanges();
    if (this.ordersModified[index].editMode) {
      let id = `#GBQuantity_${index}`
      const item = this.renderr.selectRootElement(id)!;
      if (item) {
        item.focus();
      }
    }
  }

  updateQuantity(form: NgForm, docId: string) {
    console.log(form.value.quantity)
    if (form.value.quantity == 0) {
      return;
    }
    const value = form.value.quantity;
    this.dbservice.updateCartQuantity(this.uid, docId, value)
  }

  proceed() {
    this.router.navigate(['/checkout'], { state: {orders: [...this.orders]}})
  }

  updateGiftBoxQuantity(form: NgForm, docId: string) {
    if (form.value.quantity == 0) {
      return;
    }
    const value = form.value.quantity;
    this.dbservice.updateCartGBQuantity(this.uid, docId, value)
  }


}
