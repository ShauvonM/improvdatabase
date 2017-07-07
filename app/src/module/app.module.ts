import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PathLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppHttp } from '../data/app-http';

// main components
import { AppComponent } from '../component/app.component';
import { WelcomeComponent } from '../component/ms.welcome.component';

import { AppRoutingModule } from './app-routing.module';

// the shared module is where all of the views and services live
import { SharedModule } from './shared.module';

import { ImprovDatabaseModule } from '../app/module/improvdatabase.module';

import { LoginScreenComponent } from '../component/login-screen.component';
import { SignupComponent } from '../component/signup.component';
import { ChangePasswordComponent } from '../component/change-password.component'
import { InviteComponent } from '../component/invite.component';

import { MarketingToolbarView } from '../view/marketing-toolbar.view';

// import { FormInputDirective } from '../view/form-input.directive';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        SharedModule,
        AppRoutingModule,
        ImprovDatabaseModule
     ],
    declarations: [
        LoginScreenComponent,
        AppComponent,
        WelcomeComponent,
        SignupComponent,
        ChangePasswordComponent,
        InviteComponent,
        MarketingToolbarView
    ],
    bootstrap: [ AppComponent ],
    providers: [
        PathLocationStrategy,
        AppHttp
    ]
})

export class AppModule { }
