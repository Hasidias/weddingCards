import { inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth = inject(Auth);
  user$ = user(this.auth);
}
