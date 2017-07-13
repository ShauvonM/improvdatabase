import { 
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { Router, Routes, RouterModule } from '@angular/router';

import { UserService } from "../service/user.service";

import { User } from "../model/user";

import { DialogAnim, ToggleAnim } from '../util/anim.util';

const MAX_ATTEMPTS = 5;

@Component({
    moduleId: module.id,
    selector: "login",
    templateUrl: "../template/view/login.view.html",
    animations: [
        DialogAnim.dialog,
        DialogAnim.starburst,
        ToggleAnim.fade,
        ToggleAnim.fadeAbsolute
    ],
    styles: [`
        .password-recover-link {
            
        }
    `]
})
export class LoginView implements OnInit {

    email: string;
    password: string;

    loginError: string;

    errorCount: number;

    runaway: boolean;

    @Input() show: boolean;

    @Output() done: EventEmitter<User> = new EventEmitter();

    showRecoverPassword: boolean;
    recoverPasswordError: string;
    recoverPasswordDone: boolean;

    isPosting: boolean;

    // weGood: boolean;

    state: string = 'default';

    constructor(
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.errorCount = 0;
    }

    submitLogin(): void {
        this.state = 'default';

        this.loginError = "";
        this.isPosting = true;
        this.userService.login(this.email, this.password)
            .then((user) => {
                this.email = "";
                this.password = "";

                //this.router.navigate(['/games']);
                this.done.emit(user);
                this.isPosting = false;
            }, (reason) => {

                this.state = 'shake';

                if (reason.status == 401) {
                    this.isPosting = false;
                    this.errorCount++;

                    if (this.errorCount === 1) {
                        this.loginError = "That is not the correct username or password.";
                    } else if (this.errorCount === 2) {
                        this.loginError = "That is still not the correct username or password.";
                    } else if (this.errorCount === 3) {
                        this.loginError = "Yo, dawg, try using your actual password.";
                    } else if (this.errorCount === 4) {
                        this.loginError = `<a href="/images/password-incorrect.png" target="_blank">Die wanna wanga!</a>`;
                    } else if (this.errorCount == MAX_ATTEMPTS) {
                        this.loginError = "I'll let you take one more crack at it.";
                    } else {
                        this.loginError = "That's it, I'm out of here.";

                        this.state = 'runaway';

                        setTimeout(() => {
                            this.show = false;
                        }, 100);

                        setTimeout(() => {
                            this.done.emit(null);
                        }, 7100);
                    }

                } else {
                    this.loginError = 'Some sort of server error happened. If this keeps happening, please email contact@improvpl.us';
                }
            });
    }

    cancel(): boolean {
        this.showRecoverPassword = false;
        this.recoverPasswordDone = false;
        
        this.done.emit(null);
        return false;
    }

    recoverPassword(): void {
        this.show = false;
        setTimeout(() => {
            this.showRecoverPassword = true;
            this.show = true;
        }, 200)
    }

    cancelRecoverPassword(): void {
        this.show = false;
        setTimeout(() => {
            this.showRecoverPassword = false;
            this.show = true;
        }, 200)
    }

    submitRecoverPassword(): void {
        this.isPosting = true;
        this.recoverPasswordError = '';
        this.userService.recoverPassword(this.email)
            .then((success) => {
                this.isPosting = false;

                if (success) {
                    this.show = false;
                    setTimeout(() => {
                        this.showRecoverPassword = false;
                        this.recoverPasswordDone = true;
                        this.show = true;
                    }, 200)
                }
            }, e => {
                this.recoverPasswordError = 'There doesn\'t seem to be an account registered with that address.';
            });
    }

}
