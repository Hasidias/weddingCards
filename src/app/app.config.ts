import { ApplicationConfig, EnvironmentInjector, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDi0gp5U-oEeW9S7MjkxIHP4b364rMtm5s",
  authDomain: "wedding-card-d137e.firebaseapp.com",
  projectId: "wedding-card-d137e",
  storageBucket: "wedding-card-d137e.firebasestorage.app",
  messagingSenderId: "645549653783",
  appId: "1:645549653783:web:47f622ab644ac821454152"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: 'FIREBASE_APP',
      useFactory: () => {
        if (typeof window !== 'undefined') {
          return initializeApp({
            apiKey: "AIzaSyDi0gp5U-oEeW9S7MjkxIHP4b364rMtm5s",
            authDomain: "wedding-card-d137e.firebaseapp.com",
            projectId: "wedding-card-d137e",
            storageBucket: "wedding-card-d137e.firebasestorage.app",
            messagingSenderId: "645549653783",
            appId: "1:645549653783:web:47f622ab644ac821454152",
          });
        } else {
          console.warn('Skipping Firebase initialization on the server.');
          return null;
        }
      },
    },
    provideBrowserGlobalErrorListeners(),
    // providefirebaseApp(() => app),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay())
  ]
};
function providefirebaseApp(arg0: () => FirebaseApp): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error('Function not implemented.');
}

function provideAuth(arg0: () => any): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error('Function not implemented.');
}

function provideFirestore(arg0: () => any): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error('Function not implemented.');
}

