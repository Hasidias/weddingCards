import { Routes } from '@angular/router';
import { Home } from './coreComponents/home/home';
import { IndividualWeddingCard } from './coreComponents/individual-wedding-card/individual-wedding-card';

export const routes: Routes = [
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
        loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
    }
];
