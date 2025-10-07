import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})

export class Navbar {
linkQuery:string = 'home';

constructor(private route: ActivatedRoute) { 
  this.route.queryParams.subscribe(params => {
    if (params['navQuery'])
      this.linkQuery = params['navQuery'];
      console.log(this.linkQuery);
  })
}

updateQuery(value: string) {
  this.linkQuery = value; 
  console.log(this.linkQuery);
}

}