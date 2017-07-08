import { 
    Component,
    OnInit,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef
} from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AppService } from '../service/app.service';
import { UserService } from '../service/user.service';

import { User } from '../model/user';
import { Team } from '../model/team';

import { ToggleAnim, DialogAnim } from '../util/anim.util';

import { BracketCardDirective } from '../directive/bracket-card.directive';

import { Util } from '../util/util';

declare var Stripe: any;

@Component({
    moduleId: module.id,
    selector: "signup",
    templateUrl: '../template/signup.component.html',
    animations: [
        ToggleAnim.fadeAbsolute,
        ToggleAnim.bubble,
        ToggleAnim.bubbleSlow,
        DialogAnim.dialog
    ]
})
export class SignupComponent implements OnInit {
    [key:string]: any;

    email: string;
    password: string;
    userName: string;

    pledge: string;

    isPosting: boolean = false;

    creditCard: any;

    emailValidating: boolean;
    emailError: string;
    cardError: string;

    cardComplete: boolean = false;

    termsDialogVisible: boolean;
    termsAccepted: boolean;
    
    pledgeInfoDialogVisible: boolean;

    constructor(
        public _app: AppComponent,
        private _service: AppService,
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit(): void {

        if (this.userService.isLoggedIn()) {
            this.router.navigate(['/app/dashboard'], {replaceUrl: true});
        }

        this.setup();

    }

    setup(): void {

        this._app.showBackground(true);

        this.creditCard = Util.setupStripe(this._app.config.stripe, e => {
            this.cardComplete = e.complete;

            if (e.error) {
                this.cardError = e.error.message;
            } else {
                this.cardError = '';
            }
        });

        this.creditCard.mount('#card-element');

        this._app.hideLoader();

    }

    emailTimer: any;
    emailInput(): void {
        clearTimeout(this.emailTimer);

        this.emailError = '';
        this.emailValidating = true;
        this.emailTimer = setTimeout(() => {
            this.validateEmail();
        }, 1000);
    }

    validateEmail(): void {
        let user = new User();

        if (this.email.indexOf('@') > -1 && this.email.indexOf('.') > -1) {
            user.email = this.email;
            this._service.validateUser(user).then(message => {
                this.emailError = message;
                this.emailValidating = false;
            });
        } else if (this.email.length > 0) {
            this.emailError = 'This does not seem to be a valid email address.';
            this.emailValidating = false;
        } else {
            this.emailError = '';
            this.emailValidating = false;
        }
    }

    isFormValid(): boolean {
        return !this.emailValidating && !!this.email && !!!this.emailError && !!this.password && !!!this.cardError && (!!!this.pledge || this.cardComplete); // !!!!!
    }

    submitPayment(): void {
        if (!this.isFormValid()) {
            return;
        }

        this._app.showLoader();
        this.isPosting = true;

        if (this.pledge && this.cardComplete) {
            Util.getStripeToken(this._app.config.stripe, this.creditCard).then((result: any) => {
                if (result.error) {
                    this.cardError = result.error.message;
                } else {
                    this._signup(result.token);
                }
            });
        } else {
            this._signup();
        }
    }

    private _signup(token?: any): void {
        this._service.signup(this.email, this.password, this.userName, this.pledge, token)
            .catch(response => {
                this._app.hideLoader();
                this.isPosting = false;
                let msg = response.json();
                if (msg.error && msg.error == 'email already exists') {
                    this.emailError = "That email address is already registered.";
                } else if (msg.error) {
                    this._app.dialog('An error has occurred.', 'We are so sorry. Something happened, and we can\'t be sure what. Please try again, and if this keeps happening, reach out to us by emailing contact@improvpl.us. Have a nice day, dude.', 'Okay bye', null, true);
                }
            })
            .then(user => {
                this._app.hideLoader();
                if (user && user.email) {
                    return this.userService.login(this.email, this.password);
                } else {
                    // uh oh?
                    this._app.toast("Something bad happened. I'm not sure what to tell you.");
                }
            });
    }

    showTerms(): void {
        this._app.backdrop(true);
        this.termsDialogVisible = true;
    }

    hideTerms(): void {
        this._app.backdrop(false);
        this.termsDialogVisible = false;
    }

    showPledgeInfo(): void {
        this._app.backdrop(true);
        this.pledgeInfoDialogVisible = true;
    }

    hidePledgeInfo(): void {
        this._app.backdrop(false);
        this.pledgeInfoDialogVisible = false;
    }

}
