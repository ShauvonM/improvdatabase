import {
    Component,
    OnInit,
    Renderer2,
    Inject
} from '@angular/core';
import 'rxjs/Subject';
import 'rxjs/add/operator/filter';
import { PathLocationStrategy } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, RoutesRecognized, NavigationStart, NavigationEnd } from '@angular/router';

import { CONFIG_TOKEN } from '../constants';

import { AppHttp } from '../data/app-http';

import { User } from "../model/user";
import { Config } from '../model/config';

import { AppService } from '../service/app.service';
import { UserService } from '../service/user.service';

import { DialogAnim, ToggleAnim, ShrinkAnim } from '../util/anim.util';

import { CurtainInterface } from '../view/curtain.view';

@Component({
    moduleId: module.id,
    selector: 'improvdatabase',
    templateUrl: '../template/app.component.html',
    animations: [
        DialogAnim.dialog,
        ToggleAnim.fade,
        ToggleAnim.bubble,
        ShrinkAnim.vertical
    ]
})
export class AppComponent implements OnInit {

    config: Config;

    scrollpos: number = 0;
    showToolbarScrollPosition: number = 20;
    toolbarVisible: boolean;

    private scrollSource = new Subject<number>();
    onScroll$ = this.scrollSource.asObservable()

    inApp: boolean;
    backgroundRequested: boolean;
    backgroundVisible: boolean;

    // loader = document.getElementById("siteLoader");
    loaderVisible: boolean = true;

    showMenu: boolean = false;
    showFullscreen: boolean = false;

    private _teamCount: number;
    private _teamId: string;

    // Login stuff
    redirectUrl: string;
    user: User;
    showLogin: boolean;
    userSubscription: Subscription;

    // the dialog / menu backdrop
    showBackdrop: boolean;

    // generic dialogs
    // TODO: make this an interface!
    showDialog: boolean = false;
    dialogTitle: string = "";
    dialogMessage: string = "";
    dialogCancel: string = "";
    dialogConfirm: string = "";
    dialogOnConfirm: Function;
    dialogHideCancel: boolean = true;
    dialogPrompt: string;
    dialogInput: string;

    toastMessage: string;
    private toastMessageQueue: string[] = [];

    curtainData: CurtainInterface = {};

    constructor(
        @Inject(CONFIG_TOKEN) config: Config,

        private _renderer: Renderer2,
        private router: Router,
        private _route: ActivatedRoute,
        private _service: AppService,
        private userService: UserService,
        private pathLocationStrategy: PathLocationStrategy,
        private http: AppHttp
    ) {
        this.config = config;
     }

    ngOnInit() {
        this.hideLoader();

        this.router.events.filter(event => event instanceof NavigationStart).subscribe(event => {
            this.backgroundVisible = true;
            this.backgroundRequested = false;
            this.closeOverlays();

            if ((<NavigationStart> event).url.indexOf('/app') > -1) {
                this.inApp = true;
            } else {
                this.inApp = false;
            }
        });

        this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
            if (!this.backgroundRequested) {
                this.backgroundVisible = false;
            }
            this.setCurtain({});
        });

        this.setUser(this.userService.getLoggedInUser());

        this.userSubscription = this.userService.loginState$.subscribe(user => {
            if (!this.user) {
                // we just logged in
                let path:string[] = [];

                if (this._service.getRedirect()) {
                    path.push('app');
                    this._service.getRedirect().forEach(segment => {
                        path.push(segment.path);
                    });
                } else {
                    path.push('app/dashboard');
                }
                setTimeout(() => {
                    this.router.navigate(path, { replaceUrl: true });
                    window.scrollTo(0, 0);
                }, 0);
            }
            if (!user) {
                // we just logged out
                setTimeout(() => {
                    this.router.navigate(['/']);
                    window.scrollTo(0,0);
                    this.hideLoader();
                });
            }

            this.setUser(user);
        });

        if (this.userService.getLoggedInUser()) {
            // TODO: where is the best place for this?
            this.userService.refreshToken().catch(() => {
                this.toast('There was a problem refreshing your login.');
            });
        }

        setTimeout(() => {
            let siteLoader = document.getElementById("siteLoader");
            siteLoader.style.opacity = "0";
            setTimeout(() => {
                siteLoader.remove();
            }, 500);
        }, 100);
    }

    ngOnDestroy() {
        this.userSubscription.unsubscribe();
    }
    
    onScroll(): void {
        this.scrollpos = document.scrollingElement.scrollTop; //$event.target.scrollingElement.scrollTop;
        
        this.toolbarVisible = this.scrollpos > this.showToolbarScrollPosition;

        this.scrollSource.next(this.scrollpos);
    }

    showLoader(): void {
        this.loaderVisible = true;
        this.showBackdrop = true;
    }

    hideLoader(): void {
        this.loaderVisible = false;
        this.showBackdrop = false;
    }

    showBackground(show?: boolean): void {
        if (show == undefined) {
            show = true;
        }
        this.backgroundRequested = true;
        setTimeout(() => {
            this.backgroundVisible = show;
        }, 50);
    }

    setUser(user: User): void {
        this.user = user;
        if (this.user) {
            this._teamCount = this.user.adminOfTeams.length + this.user.memberOfTeams.length;
            if (this._teamCount == 1) {
                this._teamId = <string> this.user.adminOfTeams[0] || <string> this.user.memberOfTeams[0];
            }
        } else {
            this._teamCount = 0;
            this._teamId = '';
        }
    }

    toggleNav(): void {
        if (this.userService.getLoggedInUser()) {
            this.showMenu = !this.showMenu;
            this.showBackdrop = this.showMenu;
        } else {
            this.router.navigate(['/welcome']);
        }
    }

    closeOverlays(): void {
        this.showDialog = false;
        this.showMenu = false;
        this.showLogin = false;
        this.showBackdrop = false;
    }

    backdrop(show: boolean): void {
        this.showBackdrop = show;
    }

    fullscreen(): void {
        // are we full-screen?
        if (document.fullscreenElement ||
            document.webkitFullscreenElement) {
            
            // exit full-screen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }

            this.showFullscreen = false;
        } else {
            var i = document.body;
            // go full-screen
            if (i.requestFullscreen) {
                i.requestFullscreen();
            } else if (i.webkitRequestFullscreen) {
                i.webkitRequestFullscreen();
            }

            this.showFullscreen = true;
        }
    }

    dialog(title: string, body: string, button?: string, onConfirm?: Function, hideCancel?: boolean, prompt?: string): void {
        this.dialogTitle = title;
        this.dialogMessage = body;
        this.dialogConfirm = button;
        this.dialogOnConfirm = onConfirm;
        this.dialogPrompt = prompt || '';

        this.dialogInput = '';

        this.dialogCancel = button ? button.toLocaleLowerCase() == 'yes' ? 'No' : 'Cancel' : 'Okay then';

        this.dialogHideCancel = hideCancel;

        this.showDialog = true;
        this.showBackdrop = true;
    }

    onDialogDismiss(): void {
        this.closeOverlays();
    }

    onDialogConfirm(): void {
        if (this.dialogPrompt && !this.dialogInput) {
            return;
        }
        if (this.dialogOnConfirm) {
            if (this.dialogOnConfirm(this.dialogInput) !== false) {
                this.closeOverlays();
            }
        } else {
            this.closeOverlays();
        }
    }

    private _toastTimer: NodeJS.Timer;
    toast(message: string): void {
        this.toastMessageQueue.push(message);
        if (!this.toastMessage) {
            this.hideToast();
        }
    }

    hideToast(): void {
        clearTimeout(this._toastTimer);
        if (this.toastMessageQueue.length) {
            this.toastMessage = this.toastMessageQueue.shift();
            this._toastTimer = setTimeout(() => {
                this.hideToast();
            }, 5000);
        } else {
            this.toastMessage = '';
        }
    }

    login(): void {
        if (this.userService.getLoggedInUser()) {
            this.router.navigate(['/app']);
        } else {
            this.closeOverlays();
            this.showLogin = true;
            this.showBackdrop = true;
        }
    }

    handleLogin(user: User): void {
        this.closeOverlays();

        if (!user) {
            this.router.navigate(['/welcome']);
        } else if (this.inApp || this.router.url == '/login') {
            this.router.navigate(['/app']);
        }
    }

    logout(): void {
        this.showLoader();
        this.userService.logout();
    }

    setPath(path: string): void {
        let pathWithoutApp = path.replace('/app', ''),
            pathRoot = pathWithoutApp.split('/')[1];

        if (this.pathLocationStrategy.path().indexOf('/' + pathRoot + '/') > -1) {
            this.pathLocationStrategy.replaceState({}, '', path, '');
        } else {
            this.pathLocationStrategy.pushState({}, '', path, '');
        }
    }

    scrollTo(to: number, duration?: number) {
        let maxScroll = document.body.scrollHeight - window.innerHeight;
        if (maxScroll < to) {
            duration = duration * (maxScroll / to);
            to = maxScroll;
        }
        
        let from = window.scrollY,
            difference = to - from,
            perTick = duration > 0 ? difference / duration * 10 : difference;

        duration = duration || Math.abs(difference);

        let easeInOutQuad = function (time: number, start: number, end: number, duration: number) {
            let reverse = false,
                s, e, val;
            if (start > end) {
                reverse = true;
                s = end;
                e = start;
            } else {
                s = start;
                e = end;
            }

            time /= duration/2;
            if (time < 1) val = e/2*time*time + s;
            time--;
            val = -e/2 * (time*(time-2) - 1) + s;

            if (reverse) {
                return end - val;
            } else {
                return val;
            }
        }

        let startTime = 0;

        let scrollFunc = function(time: number) {

            if (startTime === 0) {
                startTime = time;
            }
            if (window.scrollY === to || (time - startTime) >= duration) {
                return;
            }

            window.scroll(0, easeInOutQuad((time - startTime), from, to, duration));
            requestAnimationFrame(scrollFunc);
        };

        requestAnimationFrame(scrollFunc);
    }

    setCurtain(data: CurtainInterface): void {
        this.curtainData = data;
    }
    
}
