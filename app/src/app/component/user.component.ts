import { 
    Component,
    OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { AppComponent } from '../../component/app.component';

import { Tool } from '../view/toolbar.view';

import { TabData } from '../../model/tab-data';

import { UserService } from "../../service/user.service";
import { StripeService } from '../../service/stripe.service';

import { User } from "../../model/user";
import { Subscription } from '../../model/subscription';
import { Purchase } from '../../model/purchase';
import { Team } from '../../model/team';

import { Option, Address } from '../view/editable-metadata.view';

import { Util } from '../../util/util';
import { TimeUtil } from '../../util/time.util';
import { TextUtil } from '../../util/text.util';

import { ShrinkAnim } from '../../util/anim.util';

const MAX_ATTEMPTS = 5;

@Component({
    moduleId: module.id,
    selector: "user",
    templateUrl: "../template/user.component.html",
    animations: [
        ShrinkAnim.height
    ]
})
export class UserComponent implements OnInit {

    title: string = "Account";

    tabs = [
        {
            name: 'Details',
            id: 'user',
            icon: 'user'
        },
        {
            name: 'Behind the Scenes',
            id: 'subscription',
            icon: 'id-card-o'
        }
    ];
    selectedTab: string = 'subscription';

    email: string;
    password: string;
    passwordConfirm: string;
    passwordMatchError: boolean;

    loginError: string;

    errorCount: number;

    runaway: boolean;
    weGood: boolean;

    user: User;

    userName: string;
    descriptionHtml: string;

    isPosting: boolean;

    subscription: Subscription;
    purchases: Purchase[];

    changePledgeShown: boolean;
    pledge: string;

    creditCard: any;
    cardComplete: boolean;
    cardError: string;

    birthdayDay: number;
    birthdayMonth: number;
    birthdayYear: number;

    constructor(
        private userService: UserService,
        private router: Router,
        private location: Location,
        public _app: AppComponent,
        private fb: FormBuilder,
        private stripeService: StripeService
    ) { }

    _tools: Tool[] = [
        {
            icon: "fa-sign-out",
            name: "logout",
            text: "Log Out",
            active: false
        }
    ]

    ngOnInit(): void {
        this.errorCount = 0;
        this.weGood = true;

        this.user = this._app.user;

        this.userName = this.user.firstName + ' ' + this.user.lastName;

        this.renderDescription();

        if (this.user.birthday) {
            let birthday = new Date(this.user.birthday);
            if (isNaN(birthday.getDate())) {
                birthday = new Date(parseInt(this.user.birthday));
            }
            this.birthdayDay = birthday.getDate();
            this.birthdayMonth = birthday.getMonth();
            this.birthdayYear = birthday.getFullYear();
        }

        this.userService.fetchPurchases().then(p => {
            this.purchases = p;
        });

        this.userService.fetchSubscription().then(u => {
            this.subscription = u.subscription;
            
            this.subscription.pledge = this.subscription.pledge || 0;
        });
    }

    // TODO: this
    canEdit(): boolean {
        return true;
    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
        this.changePledgeShown = false;
    }

    logout(): void {
        this._app.logout();
    }

    renderDescription(): void {
        this.descriptionHtml = TextUtil.renderDescription(this.user.description);
    }

    newDescriptionText: string;
    editDescriptionShown: boolean;
    showEditDescription(): void {
        if (this.canEdit()) {
            this.newDescriptionText = this.user.description;
            this.editDescriptionShown = true;
        }
    }

    cancelDescription(): void {
        this.editDescriptionShown = false;
    }

    saveDescription(): void {
        this.user.description = this.newDescriptionText;
        this._saveUser();
        this.cancelDescription();
        this.renderDescription();
    }

    private _saveUser(): void {
        if (this.user && this.user._id) {
            this.userService.updateUser(this.user)
                .then(() => {
                    this.isPosting = false;
                    this.password = '';
                    this.passwordConfirm = '';
                    this._app.toast("Your information has been saved!");
                }, () => {
                    this.isPosting = false;
                });
        }
    }
    
    saveEditName(name: string): void {
        this.user.firstName = name.split(' ')[0];
        this.user.lastName = name.replace(this.user.firstName + ' ', '');
        this._saveUser();
    }

    saveEditPhone(phone: string): void {
        this.user.phone = phone;
        this._saveUser();
    }

    saveEditEmail(email: string): void {
        this.user.email = email;
        this._saveUser();
    }

    saveEditUrl(url: string): void {
        this.user.url = url;
        this._saveUser();
    }

    saveEditAddress(address: Address): void {
        this.user.address = address.address;
        this.user.city = address.city;
        this.user.state = address.state;
        this.user.zip = address.zip;
        this.user.country = address.country;

        this._saveUser();
    }

    onToolClicked(tool: Tool): void {
        this._app.showLoader();
        
        switch (tool.name) {
            case "logout":
                this._app.logout();
                break;
        }
    }

    getDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    getTime(date: string): string {
        return TimeUtil.simpleTime(date);
    }

    cancelSubscription(): void {
        this._app.toast("This button doesn't work yet.");
    }

    showChangePledge(): void {
        this.pledge = this.subscription.pledge.toFixed(2);
        this.changePledgeShown = true;

        this.creditCard = this.stripeService.setupStripe(e => {
            this.cardComplete = e.complete;

            if (e.error) {
                this.cardError = e.error.message;
            } else {
                this.cardError = '';
            }
        });

        setTimeout(() => {
            this.creditCard.mount('#card-element');
        });
    }

    pledgeFormValid(): boolean {
        return parseFloat(this.pledge) != this.subscription.pledge &&
                (parseFloat(this.pledge) == 0 || this.cardComplete);
    }

    savePledge(): void {

        if (parseFloat(this.pledge) != this.subscription.pledge) {

            this.isPosting = true;

            if (this.pledge && this.cardComplete) {
                this.stripeService.getStripeToken(this.creditCard).then(result => {
                    if (result.error) {
                        this.cardError = result.error.message;
                    } else {
                        this._savePledge(result.token);
                    }
                });
            } else {
                this._savePledge();
            }

        } else {
            this.changePledgeShown = false;
        }

    }

    private _savePledge(token?: any): void {
        this.userService.updatePledge(this.pledge, token).then(sub => {
            this.subscription = sub;
            this.changePledgeShown = false;
            this.isPosting = false;
        });
    }

    saveBirthday(d: Date): void {
        this.user.birthday = d.getTime().toString();
        this._saveUser();
    }

    saveExperience(l: string): void {
        let level: number;
        level = parseInt(l);
        this.user.improvExp = level;
        console.log(level, l, this.user);
        this._saveUser();
    }

    savePassword(): void {
        this.passwordMatchError = false;
        if (this.password && this.password === this.passwordConfirm) {
            this.user.password = this.password;
            this._saveUser();
        } else {
            this.passwordMatchError = true;
        }
    }
}
