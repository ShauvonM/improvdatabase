"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("rxjs/Subject");
require("rxjs/add/operator/filter");
var common_1 = require("@angular/common");
var Subject_1 = require("rxjs/Subject");
var router_1 = require("@angular/router");
var constants_1 = require("../constants");
var app_http_1 = require("../data/app-http");
var config_1 = require("../model/config");
var app_service_1 = require("../service/app.service");
var user_service_1 = require("../service/user.service");
var anim_util_1 = require("../util/anim.util");
var AppComponent = (function () {
    function AppComponent(config, _renderer, router, _route, _service, userService, pathLocationStrategy, http) {
        this._renderer = _renderer;
        this.router = router;
        this._route = _route;
        this._service = _service;
        this.userService = userService;
        this.pathLocationStrategy = pathLocationStrategy;
        this.http = http;
        this.scrollpos = 0;
        this.showToolbarScrollPosition = 20;
        this.scrollSource = new Subject_1.Subject();
        this.onScroll$ = this.scrollSource.asObservable();
        // loader = document.getElementById("siteLoader");
        this.loaderVisible = true;
        this.showMenu = false;
        this.showFullscreen = false;
        // generic dialogs
        this.showDialog = false;
        this.dialogTitle = "";
        this.dialogMessage = "";
        this.dialogCancel = "";
        this.dialogConfirm = "";
        this.dialogHideCancel = true;
        this.toastMessageQueue = [];
        this.config = config;
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.hideLoader();
        this.router.events.filter(function (event) { return event instanceof router_1.NavigationStart; }).subscribe(function (event) {
            _this.backgroundVisible = true;
            _this.backgroundRequested = false;
            _this.closeOverlays();
            if (event.url.indexOf('/app') > -1) {
                _this.inApp = true;
            }
            else {
                _this.inApp = false;
            }
        });
        this.router.events.filter(function (event) { return event instanceof router_1.NavigationEnd; }).subscribe(function (event) {
            if (!_this.backgroundRequested) {
                _this.backgroundVisible = false;
            }
            _this.setCurtainText('');
        });
        this.setUser(this.userService.getLoggedInUser());
        this.userSubscription = this.userService.loginState$.subscribe(function (user) {
            if (!_this.user) {
                // we just logged in
                var path_1 = [];
                if (_this._service.getRedirect()) {
                    path_1.push('app');
                    _this._service.getRedirect().forEach(function (segment) {
                        path_1.push(segment.path);
                    });
                }
                else {
                    path_1.push('app/dashboard');
                }
                setTimeout(function () {
                    _this.router.navigate(path_1, { replaceUrl: true });
                    window.scrollTo(0, 0);
                }, 0);
            }
            if (!user) {
                // we just logged out
                setTimeout(function () {
                    _this.router.navigate(['/']);
                    window.scrollTo(0, 0);
                    _this.hideLoader();
                });
            }
            _this.setUser(user);
        });
        if (this.userService.getLoggedInUser()) {
            // TODO: where is the best place for this?
            this.userService.refreshToken().catch(function () {
                _this.toast('There was a problem refreshing your login.');
            });
        }
        setTimeout(function () {
            var siteLoader = document.getElementById("siteLoader");
            siteLoader.style.opacity = "0";
            setTimeout(function () {
                siteLoader.remove();
            }, 500);
        }, 100);
    };
    AppComponent.prototype.ngOnDestroy = function () {
        this.userSubscription.unsubscribe();
    };
    AppComponent.prototype.onScroll = function () {
        this.scrollpos = document.scrollingElement.scrollTop; //$event.target.scrollingElement.scrollTop;
        this.toolbarVisible = this.scrollpos > this.showToolbarScrollPosition;
        this.scrollSource.next(this.scrollpos);
    };
    AppComponent.prototype.showLoader = function () {
        this.loaderVisible = true;
        this.showBackdrop = true;
    };
    AppComponent.prototype.hideLoader = function () {
        this.loaderVisible = false;
        this.showBackdrop = false;
    };
    AppComponent.prototype.showBackground = function (show) {
        var _this = this;
        if (show == undefined) {
            show = true;
        }
        this.backgroundRequested = true;
        setTimeout(function () {
            _this.backgroundVisible = show;
        }, 50);
    };
    AppComponent.prototype.setUser = function (user) {
        this.user = user;
        if (this.user) {
            this._teamCount = this.user.adminOfTeams.length + this.user.memberOfTeams.length;
            if (this._teamCount == 1) {
                this._teamId = this.user.adminOfTeams[0] || this.user.memberOfTeams[0];
            }
        }
        else {
            this._teamCount = 0;
            this._teamId = '';
        }
    };
    AppComponent.prototype.toggleNav = function () {
        if (this.userService.getLoggedInUser()) {
            this.showMenu = !this.showMenu;
            this.showBackdrop = this.showMenu;
        }
        else {
            this.router.navigate(['/welcome']);
        }
    };
    AppComponent.prototype.closeOverlays = function () {
        this.showDialog = false;
        this.showMenu = false;
        this.showLogin = false;
        this.showBackdrop = false;
    };
    AppComponent.prototype.backdrop = function (show) {
        this.showBackdrop = show;
    };
    AppComponent.prototype.fullscreen = function () {
        // are we full-screen?
        if (document.fullscreenElement ||
            document.webkitFullscreenElement) {
            // exit full-screen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            this.showFullscreen = false;
        }
        else {
            var i = document.body;
            // go full-screen
            if (i.requestFullscreen) {
                i.requestFullscreen();
            }
            else if (i.webkitRequestFullscreen) {
                i.webkitRequestFullscreen();
            }
            this.showFullscreen = true;
        }
    };
    AppComponent.prototype.dialog = function (title, body, button, onConfirm, hideCancel, prompt) {
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
    };
    AppComponent.prototype.onDialogDismiss = function () {
        this.closeOverlays();
    };
    AppComponent.prototype.onDialogConfirm = function () {
        if (this.dialogPrompt && !this.dialogInput) {
            return;
        }
        if (this.dialogOnConfirm) {
            if (this.dialogOnConfirm(this.dialogInput) !== false) {
                this.closeOverlays();
            }
        }
        else {
            this.closeOverlays();
        }
    };
    AppComponent.prototype.toast = function (message) {
        this.toastMessageQueue.push(message);
        if (!this.toastMessage) {
            this.hideToast();
        }
    };
    AppComponent.prototype.hideToast = function () {
        var _this = this;
        clearTimeout(this._toastTimer);
        if (this.toastMessageQueue.length) {
            this.toastMessage = this.toastMessageQueue.shift();
            this._toastTimer = setTimeout(function () {
                _this.hideToast();
            }, 5000);
        }
        else {
            this.toastMessage = '';
        }
    };
    AppComponent.prototype.login = function () {
        if (this.userService.getLoggedInUser()) {
            this.router.navigate(['/app']);
        }
        else {
            this.closeOverlays();
            this.showLogin = true;
            this.showBackdrop = true;
        }
    };
    AppComponent.prototype.handleLogin = function (user) {
        this.closeOverlays();
        if (!user) {
            this.router.navigate(['/welcome']);
        }
        else if (this.inApp || this.router.url == '/login') {
            this.router.navigate(['/app']);
        }
    };
    AppComponent.prototype.logout = function () {
        this.showLoader();
        this.userService.logout();
    };
    AppComponent.prototype.setPath = function (path) {
        var pathWithoutApp = path.replace('/app', ''), pathRoot = pathWithoutApp.split('/')[1];
        if (this.pathLocationStrategy.path().indexOf('/' + pathRoot + '/') > -1) {
            this.pathLocationStrategy.replaceState({}, '', path, '');
        }
        else {
            this.pathLocationStrategy.pushState({}, '', path, '');
        }
    };
    AppComponent.prototype.setCurtainText = function (text) {
        this.curtainText = text;
    };
    AppComponent.prototype.scrollTo = function (to, duration) {
        var maxScroll = document.body.scrollHeight - window.innerHeight;
        if (maxScroll < to) {
            duration = duration * (maxScroll / to);
            to = maxScroll;
        }
        var from = window.scrollY, difference = to - from, perTick = duration > 0 ? difference / duration * 10 : difference;
        duration = duration || Math.abs(difference);
        var easeInOutQuad = function (time, start, end, duration) {
            var reverse = false, s, e, val;
            if (start > end) {
                reverse = true;
                s = end;
                e = start;
            }
            else {
                s = start;
                e = end;
            }
            time /= duration / 2;
            if (time < 1)
                val = e / 2 * time * time + s;
            time--;
            val = -e / 2 * (time * (time - 2) - 1) + s;
            if (reverse) {
                return end - val;
            }
            else {
                return val;
            }
        };
        var startTime = 0;
        var scrollFunc = function (time) {
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
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'improvdatabase',
            templateUrl: '../template/app.component.html',
            animations: [
                anim_util_1.DialogAnim.dialog,
                anim_util_1.ToggleAnim.fade,
                anim_util_1.ToggleAnim.bubble,
                anim_util_1.ShrinkAnim.vertical
            ]
        }),
        __param(0, core_1.Inject(constants_1.CONFIG_TOKEN)),
        __metadata("design:paramtypes", [config_1.Config,
            core_1.Renderer2,
            router_1.Router,
            router_1.ActivatedRoute,
            app_service_1.AppService,
            user_service_1.UserService,
            common_1.PathLocationStrategy,
            app_http_1.AppHttp])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;

//# sourceMappingURL=app.component.js.map
