import { 
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { AppComponent } from '../../component/app.component';

import { Tool } from '../view/toolbar.view';

import { TabData } from '../../model/tab-data';

import { UserService } from "../../service/user.service";

import { User } from "../../model/user";
import { Subscription } from '../../model/subscription';
import { Purchase } from '../../model/purchase';
import { Team } from '../../model/team';

import { Util } from '../../util/util';
import { TimeUtil } from '../../util/time.util';

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
export class UserComponent implements OnInit, OnDestroy {

    title: string = "Account";

    tabs = [
        {
            name: 'Details',
            id: 'user',
            icon: 'user'
        },
        {
            name: 'Your Account',
            id: 'subscription',
            icon: 'id-card-o'
        }
    ];
    selectedTab: string = 'user';

    email: string;
    password: string;
    passwordConfirm: string;
    passwordMatchError: boolean;

    loginError: string;

    errorCount: number;

    runaway: boolean;
    weGood: boolean;

    user: User;

    isPosting: boolean;

    subscription: Subscription;
    purchases: Purchase[];

    changePledgeShown: boolean;
    pledge: string;

    creditCard: any;
    cardComplete: boolean;
    cardError: string;

    constructor(
        private userService: UserService,
        private router: Router,
        private location: Location,
        public _app: AppComponent,
        private fb: FormBuilder
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

        this.userService.fetchPurchases().then(p => {
            this.purchases = p;
        });

        this.userService.fetchSubscription().then(u => {
            this.subscription = u.subscription;
        });
    }

    ngOnDestroy(): void {

    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
        this.changePledgeShown = false;
    }

    logout(): void {
        this._app.logout();
    }

    submitEditUser(user: User): void {
        if (user && user._id) {
            this.userService.updateUser(user)
                .then(() => {
                    this.isPosting = false;
                    this._app.toast("Your information has been saved!");
                })
                .catch(() => {
                    this.isPosting = false;
                });
        }
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

        this.creditCard = Util.setupStripe(this._app.config.stripe, e => {
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
                Util.getStripeToken(this._app.config.stripe, this.creditCard).then(result => {
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
}
