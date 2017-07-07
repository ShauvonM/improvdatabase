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

    @ViewChild('page') pageElement: ElementRef;

    @ViewChild('improviserCard', {read: BracketCardDirective}) improviserCard: BracketCardDirective;
    @ViewChild('yourselfCard', {read: BracketCardDirective}) yourselfCard: BracketCardDirective;
    @ViewChild('yourTeamCard', {read: BracketCardDirective}) yourTeamCard: BracketCardDirective;
    @ViewChildren('packageCard', {read: BracketCardDirective}) packageCards: QueryList<BracketCardDirective>;

    userType: string = 'improviser';
    teamOption: string;

    email: string;
    password: string;
    teamName: string;
    userName: string;

    isLoadingPackages: boolean = false;

    isPosting: boolean = false;

    stripe: any;
    creditCard: any;

    emailError: string;
    cardError: string;
    teamError: string;

    cardComplete: boolean = false;

    termsDialogVisible: boolean;
    termsAccepted: boolean;

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

        // this.isLoadingPackages = true;
        // this._service.getPackages().then(p => {
        //     this.isLoadingPackages = false;
        //     this.packages = p;
        // });

        this.stripe = Stripe(this._app.config.stripe);
        let elements = this.stripe.elements();
        this.creditCard = elements.create('card', {
            // value: {postalCode: this.user.zip},
            style: {
                base: {
                    color: '#32325d',
                    lineHeight: '24px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',

                    '::placeholder': {
                        color: 'rgba(96,96,96,0.5)'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        this.creditCard.addEventListener('change', (e: any) => {
            
            this.cardComplete = e.complete;

            if (e.error) {
                this.cardError = e.error.message;
            } else {
                this.cardError = '';
            }
        });

        this._app.hideLoader();

    }

    emailTimer: any;
    emailInput(): void {
        clearTimeout(this.emailTimer);

        this.emailError = '';
        this.emailTimer = setTimeout(() => {
            this.validateEmail();
        }, 500);
    }

    validateEmail(): void {
        let user = new User();

        if (this.email.indexOf('@') > -1 && this.email.indexOf('.') > -1) {
            user.email = this.email;
            this._service.validateUser(user).then(message => {
                this.emailError = message;
            });
        } else if (this.email.length > 0) {
            this.emailError = 'This does not seem to be a valid email address.';
        } else {
            this.emailError = '';
        }
    }

    teamTimer: any;
    teamInput(): void {
        clearTimeout(this.teamTimer);

        this.teamError = '';
        this.teamTimer = setTimeout(() => {
            this.validateTeam();
        }, 500);
    }

    validateTeam(): void {
        let team = new Team();
        team.name = this.teamName;

        this._service.validateTeam(team).then(message => {
            this.teamError = message;
        });
    }

    setPageHeight(): void {
        let page = this.pageElement.nativeElement,
            height = page.offsetHeight,
            currentMinHeight = page.style.minHeight ? parseInt(page.style.minHeight.replace('px', '')) : 0;

        if (height > currentMinHeight) {
            page.style.minHeight = page.offsetHeight + 'px';
        }
    }

    selectCard(option: string, value: string, cardToOpen: BracketCardDirective, cardToClose: BracketCardDirective): void {
        if (this[option] == value || cardToOpen.isOpen) {
            return;
        }

        this.setPageHeight();

        // this[option] = '';

        if (option == 'userType') {
            this.teamOption = '';
        }
        if (option == 'teamOption') {
            this.userName = '';
            this.teamName = '';
            this.setupPackages(value == 'team');
        }

        cardToOpen.open();
        cardToClose.close();

        setTimeout(() => {
            this[option] = value;
        }, 600);
    }

    reset(): void {
        this._app.scrollTo(0);

        setTimeout(() => {
            this.userType = '';
            this.teamOption = '';

            this.email = '';
            this.password = '';
            this.userName = '';
            this.teamName = '';
            this.selectedPackage = null;

            this.improviserCard.reset(500)
        }, 400);
    }

    selectImproviser(): void {
        this.selectCard('userType', 'improviser', 
            this.improviserCard, this.facilitatorCard);
    }

    selectYourself(): void {
        this.selectCard('teamOption', 'individual', 
            this.yourselfCard, this.yourTeamCard);
    }

    selectYourTeam(): void {
        this.selectCard('teamOption', 'team',
            this.yourTeamCard, this.yourselfCard);
    }

    setupPackages(team: boolean): void {
        this.selectedPackage = null;
        
        this.options = [];
    }

    isFormValid(): boolean {
        if (!this.email) {
            return false;
        }
        if (!this.password) {
            return false;
        }
        if (!this.teamOption || !this.userType) {
            return false;
        }
        if (this.teamOption == 'team' && !this.teamName) {
            return false;
        }
        if (this.teamOption == 'individual' && !this.userName) {
            return false;
        }
        if (this.cardError || !this.cardComplete || this.teamError) {
            return false;
        }
        if (!this.termsAccepted) {
            return false;
        }
        return true;
    }

    submitPayment(): void {
        if (!this.isFormValid()) {
            return;
        }

        let user = new User();
        if (this.userName && this.userName.length) {
            let nameArray = this.userName.split(' ');
            if (nameArray[0]) {
                user.firstName = nameArray[0];
            }
            if (nameArray[1]) {
                user.lastName = nameArray[1];
            }
        }
        user.email = this.email;
        user.password = this.password;

        this._app.showLoader();
        this.isPosting = true;

        this.stripe.createToken(this.creditCard).then((result: any) => {
            if (result.error) {
                this.cardError = result.error.message;
            } else {
                
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

}
