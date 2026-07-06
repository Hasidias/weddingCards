import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NewItem } from '../new-item/new-item';
import { Overview } from '../overview/overview';
import { Orders } from '../orders/orders';
import { CustomOrders } from '../custom-orders/custom-orders';
import { CurrentList } from '../current-list/current-list';
import { Users } from '../users/users';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, NewItem, Overview, Orders, CustomOrders, CurrentList, Users],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})


export class AdminDashboard {

  activeTab:string |null= '';
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.activatedRoute.queryParamMap.subscribe(q => {
      if (q) {
        console.log(q.get('tab'))
        this.activeTab = q.get('tab');
      }
    })
  }
}
