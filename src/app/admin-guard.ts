import { inject } from '@angular/core';
import { Auth, authState, user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {

  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(Firestore);
  const platformId = inject(PLATFORM_ID);

    // ✅ Allow prerender / SSR
    if (isPlatformServer(platformId)) {
      return true;
    }


  return authState(auth).pipe(
  take(1),
  switchMap(user => {
    console.log(user)
    if (!user) {
      return of(
        router.createUrlTree(
          ['/signin'],
          { queryParams: { returnUrl: state.url } }
        )
      );
    }

    const ref = doc(firestore, `authorizations/${user.uid}`);

    return docData(ref).pipe(
      take(1),
      map((userData: any) => {
        console.log(userData);

        if (userData?.role === 'admin') {
          return true;
        }

        return router.createUrlTree(
          ['/home'],
          { queryParams: { returnUrl: state.url } }
        );
      })
    );
  })
);

};
