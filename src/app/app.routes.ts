import { Routes } from '@angular/router';
import { Home } from './coreComponents/home/home';
import { IndividualWeddingCard } from './coreComponents/individual-wedding-card/individual-wedding-card';
import { adminGuard } from './admin-guard';
import { Checkout } from './coreComponents/checkout/checkout';
import { Cart } from './coreComponents/cart/cart';

export const routes: Routes = [
    {
        path: 'cart',
        // canActivate: [authGuard],
        component: Cart,
    },
    {
        path: 'checkout',
        component: Checkout
     },
    // {
    //     path: 'weddingCard/:id',
    //     component: IndividualWeddingCard,
    //     renderMode: 'ssr'
    // },
    {
        path: 'weddingCard',
        component: IndividualWeddingCard
    },
    {
        path: '',
        component: Home
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
        data: { prerender: false }
    },
    {
        path: 'signin',
        loadChildren: () => import('./authentication/authentication-module').then(m => m.AuthenticationModule),
        data: { prerender: false }
    },
    {
        path: '**',
        redirectTo: ''
    }
];
