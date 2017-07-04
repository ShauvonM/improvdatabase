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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var user_service_1 = require("../service/user.service");
var anim_util_1 = require("../util/anim.util");
var MAX_ATTEMPTS = 5;
var LoginView = (function () {
    function LoginView(userService) {
        this.userService = userService;
        this.done = new core_1.EventEmitter();
        // weGood: boolean;
        this.state = 'default';
    }
    LoginView.prototype.ngOnInit = function () {
        this.errorCount = 0;
    };
    LoginView.prototype.submitLogin = function () {
        var _this = this;
        this.state = 'default';
        this.loginError = "";
        this.isPosting = true;
        this.userService.login(this.email, this.password)
            .then(function (user) {
            _this.email = "";
            _this.password = "";
            //this.router.navigate(['/games']);
            _this.done.emit(user);
            _this.isPosting = false;
        })
            .catch(function (reason) {
            console.log(reason.json());
            _this.state = 'shake';
            if (reason.status == 401) {
                _this.isPosting = false;
                _this.errorCount++;
                if (_this.errorCount === 1) {
                    _this.loginError = "That is not the correct username or password.";
                }
                else if (_this.errorCount === 2) {
                    _this.loginError = "That is still not the correct username or password.";
                }
                else if (_this.errorCount === 3) {
                    _this.loginError = "Yo, dawg, try using your actual password.";
                }
                else if (_this.errorCount === 4) {
                    _this.loginError = "<a href=\"/images/password-incorrect.png\" target=\"_blank\">Die wanna wanga!</a>";
                }
                else if (_this.errorCount == MAX_ATTEMPTS) {
                    _this.loginError = "I'll let you take one more crack at it.";
                }
                else {
                    _this.loginError = "That's it, I'm out of here.";
                    _this.state = 'runaway';
                    setTimeout(function () {
                        _this.show = false;
                    }, 100);
                    setTimeout(function () {
                        _this.done.emit(null);
                    }, 7100);
                }
            }
            else {
                _this.loginError = 'Some sort of server error happened. If this keeps happening, please email contact@improvpl.us';
            }
        });
    };
    LoginView.prototype.cancel = function () {
        this.showRecoverPassword = false;
        this.recoverPasswordDone = false;
        this.done.emit(null);
        return false;
    };
    LoginView.prototype.recoverPassword = function () {
        var _this = this;
        this.show = false;
        setTimeout(function () {
            _this.showRecoverPassword = true;
            _this.show = true;
        }, 200);
    };
    LoginView.prototype.cancelRecoverPassword = function () {
        var _this = this;
        this.show = false;
        setTimeout(function () {
            _this.showRecoverPassword = false;
            _this.show = true;
        }, 200);
    };
    LoginView.prototype.submitRecoverPassword = function () {
        var _this = this;
        this.isPosting = true;
        this.recoverPasswordError = '';
        this.userService.recoverPassword(this.email)
            .catch(function (e) {
            console.log(e);
            _this.recoverPasswordError = 'We had a problem looking up that address.';
        })
            .then(function (success) {
            _this.isPosting = false;
            if (success) {
                _this.show = false;
                setTimeout(function () {
                    _this.showRecoverPassword = false;
                    _this.recoverPasswordDone = true;
                    _this.show = true;
                }, 200);
            }
            else {
                _this.recoverPasswordError = 'We had a problem looking up that address.';
            }
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], LoginView.prototype, "show", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], LoginView.prototype, "done", void 0);
    LoginView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "login",
            templateUrl: "../template/view/login.view.html",
            animations: [
                anim_util_1.DialogAnim.dialog,
                anim_util_1.DialogAnim.starburst,
                anim_util_1.ToggleAnim.fade,
                anim_util_1.ToggleAnim.fadeAbsolute
            ],
            styles: ["\n        .password-recover-link {\n            \n        }\n    "]
        }),
        __metadata("design:paramtypes", [user_service_1.UserService])
    ], LoginView);
    return LoginView;
}());
exports.LoginView = LoginView;

//# sourceMappingURL=login.view.js.map
