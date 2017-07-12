import { NgModule }         from "@angular/core";
import { RouterModule, Routes, PreloadAllModules }     from "@angular/router";

// import { AuthGuard } from '../service/auth-guard.service';
import { AppLoadGuard } from '../service/app-load-guard.service';

import { WelcomeComponent } from '../component/ms.welcome.component';

import { LoginScreenComponent } from '../component/login-screen.component';
import { SignupComponent } from '../component/signup.component';
import { ChangePasswordComponent } from '../component/change-password.component';
import { InviteComponent } from '../component/invite.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full'
    },
    {
        path: 'welcome',
        component: WelcomeComponent
    },
    {
        path: 'login',
        component: LoginScreenComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'invite/:id',
        component: SignupComponent
    },
    {
        path: 'resetMyPassword/:token',
        component: ChangePasswordComponent
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, 
            { preloadingStrategy: PreloadAllModules }
        ) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {};
