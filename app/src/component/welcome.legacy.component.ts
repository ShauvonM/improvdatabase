import { 
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    ViewChildren,
    QueryList
} from '@angular/core';
import { Router } from '@angular/router';
import { Headers, Http } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/toPromise';

import { AppService } from '../service/app.service';

// import { MarketingSiteComponent } from './ms.component';
import { AppComponent } from './app.component';

import { Package } from '../model/package';
import { PackageConfig } from '../model/config';

import { DialogAnim, ToggleAnim } from '../util/anim.util';

import { BracketCardDirective } from '../directive/bracket-card.directive';

@Component({
    moduleId: module.id,
    selector: "welcome",
    templateUrl: "../template/ms.welcome.component.html",
    animations: [
        DialogAnim.dialog,
        ToggleAnim.fade
    ]
})
export class WelcomeComponent implements OnInit {

    @ViewChildren('packageCard', {read: BracketCardDirective}) packageCards: QueryList<BracketCardDirective>;

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

    packages: Package[] = [];
    private config: PackageConfig;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private http: Http,
        private _service: AppService
    ) { }

    ngOnInit(): void {
        this.setupSize();

        this._service.getPackageConfig().then(config => this.config = config)
        this._service.getPackages('facilitator', false).then(pkgs => {
            this.packages = pkgs;
        });
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

    selectedCard: HTMLElement;
    selectPackage($event: any, pkg: Package, cardClicked: HTMLElement): void {
        if (this.selectedCard && this.selectedCard != cardClicked) {
            this.selectPackage(null, null, this.selectedCard);
            setTimeout(() => {
                this.selectPackage($event, pkg, cardClicked);
            }, 500);
            return;
        }

        if (cardClicked.classList.contains('card-open')) {
            this.packageCards.forEach(card => {
                card.reset();
            });
            this.selectedCard = null;
        } else {
            this.selectedCard = cardClicked;
            this.packageCards.forEach(card => {
                if (card.card != cardClicked) {
                    card.close();
                } else {
                    card.open();
                }
            });
        }
    }

}
