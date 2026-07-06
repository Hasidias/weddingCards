import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // ✅ Always allow SSR / prerender
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // ✅ Browser-only Firebase auth check
  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }

      // ✅ Return UrlTree instead of router.navigate
      return router.createUrlTree(['/signin'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};
