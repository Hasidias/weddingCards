import { ChangeDetectorRef, Component, ElementRef, inject, Injector, NgZone, PLATFORM_ID, Renderer2, runInInjectionContext, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordValidator } from '../../password-validator';
import { Auth, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendPasswordResetEmail, confirmPasswordReset, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, addDoc, collection, getDoc, setDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


interface Alert {
  message: string;
  type: 'error' | 'success';
  duration: number;
}

const provider = new GoogleAuthProvider();

@Component({
  selector: 'app-login',
  imports: [FormsModule, PasswordValidator],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {
hidePassword: boolean = true;
registerInfo:any = {};
loginInfo:any = {};
resetEmail:string = '';
newPassword:string = '';
Mode:string = 'login';
private auth = inject(Auth);
private route = inject(ActivatedRoute);
private firestore = inject(Firestore);
sentEmail:boolean = false;
private cdr = inject(ChangeDetectorRef);
timeoutId: any;
error: string = '';
oobCode = '';
private alertSubject = new Subject<Alert>();
alert$ = this.alertSubject.asObservable();
@ViewChild('dynamicContainer', { static: true }) dynamicContainer!: ElementRef;
router = inject(Router);
private platformId = inject(PLATFORM_ID);

constructor (private injector: Injector, private ngZone: NgZone, private renderer: Renderer2) {
  if (isPlatformBrowser(this.platformId)) {
      this.setAuthPersistence();
    }
  let oobCode = this.route.snapshot.queryParamMap.get('oobCode')!;
  console.log(this.oobCode)
  if (oobCode) {
    this.changeMode('reset');
    this.oobCode = oobCode;
  }
  this.alert$.subscribe(alert => {
    this.ngZone.run(() => {
      this.error = alert.message;
      console.log(alert)
      this.cdr.detectChanges();
    })
  });
}

async setAuthPersistence() {
    await setPersistence(this.auth, browserLocalPersistence);
    // alternatives:
    // browserSessionPersistence
    // inMemoryPersistence
  }


toggleShow() {
  this.hidePassword = !this.hidePassword;
}

async register(){
  runInInjectionContext(this.injector, async () => {
    await createUserWithEmailAndPassword(
      this.auth,
      this.registerInfo.email,
      this.registerInfo.password,
    ).then(res => {
      updateProfile(res.user, {
        displayName: `${this.registerInfo.first_name} ${this.registerInfo.last_name}`
      });
      this.startTimer('Registration successful!', 'success');
       setDoc(doc(this.firestore,`users/${res.user.uid}`), {
        ...this.registerInfo,
        uid: res.user.uid,
        photo: res.user.photoURL || null,
        status: 'active',
        role: 'user',
        createdAt: new Date().getTime(),
        emailVerified: false,
      });
    }).catch(err => {
        let errorMessage = this.mapAuthError(err.code);
        this.startTimer(errorMessage, 'error');
    });
  });
}

login() {
  runInInjectionContext(this.injector, async () => {
    signInWithEmailAndPassword(
      this.auth,
      this.loginInfo.email,
      this.loginInfo.password
    ).then(res => {
      this.startTimer('Login successful!', 'success');
    }).catch(err => {
      let errorMessage = this.mapAuthError(err.code);
      this.startTimer(errorMessage, 'error');
    });
  });
}

changeMode(mode: string) {
  this.Mode = mode;
}

async sendEmail() {
  const actionCodeSettings = {
      url: 'https://wedding-card-d137e.web.app/signin', // ⬅️ Your custom page
      handleCodeInApp: true
    };
    runInInjectionContext(this.injector, async () => {
      
      await sendPasswordResetEmail(
        this.auth,
        this.resetEmail,
        actionCodeSettings
      ).then(() => {
        this.sentEmail = true;
        this.cdr.detectChanges();
      }).catch(err => {
        let errorMessage = this.mapAuthError(err.code);
        this.startTimer(errorMessage, 'error');
    });
    });
}

resetPassword(){
  runInInjectionContext(this.injector, async () => {
    confirmPasswordReset(
      this.auth,
      this.oobCode,
      this.newPassword
    ).then(() => {

    }).catch(err => {
      let errorMessage = this.mapAuthError(err.code);
      this.startTimer(errorMessage, 'error');
    });
  });
}

mapAuthError(code: string): string {
  let errorMessage = 'Error occurred.';
  switch (code) {
    case "auth/invalid-email":
      errorMessage = "The email address is not valid.";
      break;
    case "auth/user-disabled":
      errorMessage = "This user account has been disabled.";
      break;
    case "auth/user-not-found":
      errorMessage = "No user found with this email.";
      break;
    case "auth/invalid-credential":
      errorMessage = "Incorrect email or password.";
      break;
    case "auth/email-already-in-use":
      errorMessage = "This email is already registered.";
      break;
    case "auth/weak-password":
      errorMessage = "Password is too weak.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many attempts. Try again later.";
      break;
    default:
      errorMessage = "Something went wrong. Please try again.";
  }
  return errorMessage;
}

startTimer(message: string, customClass: string) {
  // Clear any existing timeout
  if (this.timeoutId) {
    clearTimeout(this.timeoutId);
  }
  this.renderer.removeClass(this.dynamicContainer.nativeElement, 'success');
  this.renderer.removeClass(this.dynamicContainer.nativeElement, 'error');
  const html = `<div class="${customClass}"><p>${message}</p></div>`;
  this.dynamicContainer.nativeElement.innerHTML = html;
  this.renderer.addClass(this.dynamicContainer.nativeElement, `${customClass}`);
  this.timeoutId = setTimeout(() => {
    this.error = '';
    this.dynamicContainer.nativeElement.innerHTML = '';
    this.renderer.removeClass(this.dynamicContainer.nativeElement, `${customClass}`);
    // your logic here
  }, 5000);
}

async thirdpartyLogin(providerName: string) {
  console.log('third party login', providerName);
  if(providerName === 'google'){
    console.log('google sign in');
    runInInjectionContext(this.injector, async () => {
       signInWithPopup(this.auth, provider).then(async (result) => {
        this.router.navigate(['/admin']);
        this.startTimer('Login successful!', 'success');
        let userAvailable = doc(this.firestore, `users/${result.user.uid}`);
        const snap = await getDoc(userAvailable);
        console.log(snap.exists())
        if (snap.exists() == false) {
          setDoc(doc(this.firestore,`users/${result.user.uid}`), {
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            photo: result.user.photoURL || null,
            status: 'active',
            role: 'user',
            createdAt: new Date().getTime(),
            emailVerified: true,
          });
        }
      }).catch((error) => {
        let errorMessage = this.mapAuthError(error.code);
        this.startTimer(errorMessage, 'error');
      });
    });
  }
}

singout() {
  this.auth.signOut();
}
}
