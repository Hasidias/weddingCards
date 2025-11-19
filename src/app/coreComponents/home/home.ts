import { Component, inject } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { FoldArea } from '../fold-area/fold-area';
import { HomeContent } from '../home-content/home-content';
import { ActivatedRoute, Router } from '@angular/router';
import { About } from "../about/about";
import { Contact } from "../contact/contact";

@Component({
  selector: 'app-home',
  imports: [Navbar, FoldArea, HomeContent, About, Contact],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class Home {
  navQuery: string  = ''
  private router = inject(ActivatedRoute);

  ngOnInit() {
    this.router.queryParams.subscribe(params => {
    params['navQuery'] ? this.navQuery = params['navQuery'] : this.navQuery = '';
  })
} 
}
