import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { FoldArea } from '../fold-area/fold-area';
import { HomeContent } from '../home-content/home-content';

@Component({
  selector: 'app-home',
  imports: [Navbar, FoldArea, HomeContent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
