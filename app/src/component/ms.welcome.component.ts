import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Headers, Http } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/toPromise';

// import { MarketingSiteComponent } from './ms.component';
import { AppComponent } from './app.component';

import { DialogAnim, ToggleAnim } from '../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "for-improvisers",
    templateUrl: "../template/improvisers.component.html",
    animations: [
        DialogAnim.dialog,
        ToggleAnim.fade
    ]
})
export class WelcomeComponent implements OnInit {

    contactDialogVisible: boolean;

    contact = {
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        team: "",
        objective: ""
    }

    contactError: string;

    sending: boolean;
    sent: boolean;
    
    toolbarheight = 48;
    pageStart = window.innerHeight - (this.toolbarheight + 24);

    constructor(
        public _app: AppComponent,
        private router: Router,
        private http: Http
    ) { }

    ngOnInit(): void {
        this.setupSize();
    }

    setupSize(): void {
    }

    login(): void {
        this._app.login();
    }

    showContactDialog(): void {
        this.contactDialogVisible = true;
        this._app.backdrop(true);
    }
    hideContactDialog(): void {
        this.contactDialogVisible = false;
        this.sent = false;
        this.sending = false;
        this._app.backdrop(false);
    }

    submitContact(): void {
        if (!this.contact.firstName || !this.contact.lastName || !this.contact.email) {
            this.contactError = "Please enter your name and email."
        } else {
            this.contactError = "";
            
            this.sending = true;
            this._app.showLoader();
            this.http.post('/hireUs', this.contact)
                .toPromise()
                .then(response => {
                    this._app.hideLoader();
                    this._app.backdrop(true);
                    
                    this.sending = false;
                    this.sent = true;
                });
        }
    }

}
