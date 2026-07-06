import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { AdminService } from '../services/admin-service';
import { CommonModule } from '@angular/common';
import { DetailedOrder } from '../detailed-order/detailed-order';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, DetailedOrder],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})


export class Orders {
  private adminService = inject(AdminService);
  orders: any[] = [];
  private cdr = inject(ChangeDetectorRef);
  detailedView:boolean = false;
  selectedOrder: any;
  constructor(private zone: NgZone) {}
  
  ngOnInit() {
    this.adminService.getOrders().subscribe((orders) => {
      console.log('Orders:', orders);
      this.zone.run(() => {
        this.orders = [...orders];
      })
      
      this.cdr.detectChanges();
    });
  }

  selectOrder (order: any) {
    this.detailedView = true;
    this.selectedOrder = order;
  }
}
