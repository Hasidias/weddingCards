import { ApplicationConfig, EnvironmentInjector, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {  initializeApp } from "@angular/fire/app";
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth, indexedDBLocalPersistence, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore'; 
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environment/environment.dev';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() =>  {
      const auth = getAuth();
      return auth;
    }
    ),
    provideStorage(() => getStorage()),
  ]
};



