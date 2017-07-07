import { 
    Component,
    OnInit,
    OnDestroy,
    Input,
    ViewChild,
    ViewChildren,
    QueryList
} from '@angular/core';

import 'rxjs/Subscription';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

import { AppComponent } from '../../component/app.component';

import { UserService } from '../../service/user.service';

import { PreferenceUtil } from '../../util/preference.util';

import { BracketCardDirective } from '../../directive/bracket-card.directive';

import { ShrinkAnim } from '../../util/anim.util';

import { Invite } from '../../model/invite';

class DashboardMessage {
    key: string;
    title?: string;
    body?: string;
    button?: string;
    action?: Function;
    trigger?: Function;
    notDismissable?: boolean;
}

@Component({
    moduleId: module.id,
    selector: 'dashboard-message-list',
    templateUrl: '../template/view/dashboard-message-list.view.html',
    animations: [ ShrinkAnim.height ]
})
export class DashboardMessageListView implements OnInit, OnDestroy {

    @ViewChild('dashboardMessage', {read: BracketCardDirective}) messageElement: BracketCardDirective;

    private PREFERENCE_KEY_PREFIX = 'hide_dash_message_';

    userSubscription: Subscription;

    messages: DashboardMessage[] = [
        {
            key: 'invite',
            trigger: () => {
                 let invites = this.userService.getInvites();
                 if (invites.length) {
                     this.invite = invites[0];
                 }
                 return invites.length;
            }
        },
        {
            key: 'no-subscription',
            title: 'No Subscription',
            body: `
                <p>Your subscription is expired or otherwise invalid. The app will be off-limits until you renew your subscription.</p>
            `,
            button: 'Purchase Subscription',
            notDismissable: true,
            action: () => {
                this._app.toast('This feature is coming soon. Please hang on.');
            },
            trigger: () => {
                return this.userService.isExpired();
            }
        },
        {
            key: 'welcome'
        },
        {
            key: 'birthday-' + (new Date()).getFullYear(),
            title: '<div class="columns"><i class="fa fa-birthday-cake"></i> <span>Happy Birthday!</span> <i class="fa fa-birthday-cake"></i></div>',
            body: `
                <p>It's your Special Day (or at least the day you told us was your Special Day). We here at the Improv Database hope it's a great one!</p>
            `,
            trigger: () => {
                let birthday = this.userService.getLoggedInUser().birthday;
                if (birthday) {
                    let date = new Date(birthday),
                        today = new Date();
                    if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth()) {
                        return true;
                    }
                }
            }
        },
        {
            key: 'username',
            trigger: () => {
                return !this.userService.getLoggedInUser().firstName || !this.userService.getLoggedInUser().lastName
            }
        },
        {
            key: 'birthday-enter',
            trigger: () => {
                return !this.userService.getLoggedInUser().birthday;
            }
        }
    ];
    visibleMessage: DashboardMessage = new DashboardMessage();

    isPosting: boolean;

    firstName: string;
    lastName: string;

    invite: Invite;

    constructor(
        private userService: UserService,
        private router: Router,
        private _app: AppComponent
    ) { }

    ngOnInit(): void {

        // if the user is refreshing, wait until it finishes to show any messages
        if (!this.userService.isLoggingIn) {
            this.showNextMessage();
        }

        // when the user updates, re-scan to see if the message to show has changed
        this.userSubscription = this.userService.loginState$.subscribe(user => {
            if (user) {
                this.showNextMessage();
            }
        });
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
    }

    showNextMessage(): void {
        let delay = this.visibleMessage ? 300 : 1;

        this.visibleMessage = null;

        // show the first message that has not been hidden by the user
        setTimeout(() => {
            this.messages.some(message => {
                let key = message.key;
                let visible = this.userService.getPreference(this.PREFERENCE_KEY_PREFIX + key) != 'true';

                if (visible && message.trigger) {
                    visible = visible && message.trigger();
                }
                if (visible) {
                    this.visibleMessage = message;
                    return true;
                }
            });
        }, delay);
    }

    dismissVisibleMessage(): void {
        if (!this.visibleMessage.notDismissable) {
            this.userService.setPreference(this.PREFERENCE_KEY_PREFIX + this.visibleMessage.key, 'true')
                .then(() => {
                    setTimeout(() => {
                        this.showNextMessage();
                    }, 300);
                })

            this.messageElement.close();
        }
    }

    saveUserName(): void {
        let user = this.userService.getLoggedInUser();
        user.firstName = this.firstName;
        user.lastName = this.lastName;
        
        this.isPosting = true;
        this.userService.updateUser(user)
            .then(user => {
                this.isPosting = false;
                setTimeout(() => {
                    this.showNextMessage();
                }, 100);
            });

    }

    inviteAccepted: boolean;
    inviteRejected: boolean;

    acceptInvite(): void {
        this.isPosting = true;
        this.userService.acceptInvite(this.invite._id).then(() => {
            this.isPosting = false;
            this.inviteAccepted = true;
        });
    }

    rejectInvite(): void {
        this.isPosting = true;
        this.userService.cancelInvite(this.invite).then(() => {
            this.isPosting = false;
            this.inviteRejected = true;
        })
    }

    dismissInvite(): void {
        this.messageElement.close();

        setTimeout(() => {
            this.inviteAccepted = false;
            this.inviteRejected = false;
            
            this.showNextMessage();
        }, 300);
    }

    birthdayMonth: number;
    birthdayDay: number;
    birthdayYear: number;

    saveBirthday(): void {
        if (this.birthdayYear < 100) {
            this.birthdayYear = this.birthdayYear + 1900; // Y2K compliant!
        }

        let birthday = new Date();
        birthday.setDate(this.birthdayDay);
        birthday.setMonth(this.birthdayMonth);
        birthday.setFullYear(this.birthdayYear);

        this.isPosting = true;

        let user = this.userService.getLoggedInUser();
        user.birthday = birthday.getTime() + '';
        this.userService.updateUser(user).then(user => {
            this.isPosting = false;
            setTimeout(() => {
                this.showNextMessage();
            }, 100);
        })
    }
}
