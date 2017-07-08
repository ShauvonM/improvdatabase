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
var router_1 = require("@angular/router");
var app_component_1 = require("./app.component");
var app_service_1 = require("../service/app.service");
var user_service_1 = require("../service/user.service");
var user_1 = require("../model/user");
var anim_util_1 = require("../util/anim.util");
var util_1 = require("../util/util");
var SignupComponent = (function () {
    function SignupComponent(_app, _service, router, userService) {
        this._app = _app;
        this._service = _service;
        this.router = router;
        this.userService = userService;
        this.isPosting = false;
        this.cardComplete = false;
    }
    SignupComponent.prototype.ngOnInit = function () {
        if (this.userService.isLoggedIn()) {
            this.router.navigate(['/app/dashboard'], { replaceUrl: true });
        }
        this.setup();
    };
    SignupComponent.prototype.setup = function () {
        var _this = this;
        this._app.showBackground(true);
        this.creditCard = util_1.Util.setupStripe(this._app.config.stripe, function (e) {
            _this.cardComplete = e.complete;
            if (e.error) {
                _this.cardError = e.error.message;
            }
            else {
                _this.cardError = '';
            }
        });
        this.creditCard.mount('#card-element');
        this._app.hideLoader();
    };
    SignupComponent.prototype.emailInput = function () {
        var _this = this;
        clearTimeout(this.emailTimer);
        this.emailError = '';
        this.emailValidating = true;
        this.emailTimer = setTimeout(function () {
            _this.validateEmail();
        }, 1000);
    };
    SignupComponent.prototype.validateEmail = function () {
        var _this = this;
        var user = new user_1.User();
        if (this.email.indexOf('@') > -1 && this.email.indexOf('.') > -1) {
            user.email = this.email;
            this._service.validateUser(user).then(function (message) {
                _this.emailError = message;
                _this.emailValidating = false;
            });
        }
        else if (this.email.length > 0) {
            this.emailError = 'This does not seem to be a valid email address.';
            this.emailValidating = false;
        }
        else {
            this.emailError = '';
            this.emailValidating = false;
        }
    };
    SignupComponent.prototype.isFormValid = function () {
        return !this.emailValidating && !!this.email && !!!this.emailError && !!this.password && !!!this.cardError && (!!!this.pledge || this.cardComplete); // !!!!!
    };
    SignupComponent.prototype.submitPayment = function () {
        var _this = this;
        if (!this.isFormValid()) {
            return;
        }
        this._app.showLoader();
        this.isPosting = true;
        if (this.pledge && this.cardComplete) {
            util_1.Util.getStripeToken(this._app.config.stripe, this.creditCard).then(function (result) {
                if (result.error) {
                    _this.cardError = result.error.message;
                }
                else {
                    _this._signup(result.token);
                }
            });
        }
        else {
            this._signup();
        }
    };
    SignupComponent.prototype._signup = function (token) {
        var _this = this;
        this._service.signup(this.email, this.password, this.userName, this.pledge, token)
            .catch(function (response) {
            _this._app.hideLoader();
            _this.isPosting = false;
            var msg = response.json();
            if (msg.error && msg.error == 'email already exists') {
                _this.emailError = "That email address is already registered.";
            }
            else if (msg.error) {
                _this._app.dialog('An error has occurred.', 'We are so sorry. Something happened, and we can\'t be sure what. Please try again, and if this keeps happening, reach out to us by emailing contact@improvpl.us. Have a nice day, dude.', 'Okay bye', null, true);
            }
        })
            .then(function (user) {
            _this._app.hideLoader();
            if (user && user.email) {
                return _this.userService.login(_this.email, _this.password);
            }
            else {
                // uh oh?
                _this._app.toast("Something bad happened. I'm not sure what to tell you.");
            }
        });
    };
    SignupComponent.prototype.showTerms = function () {
        this._app.backdrop(true);
        this.termsDialogVisible = true;
    };
    SignupComponent.prototype.hideTerms = function () {
        this._app.backdrop(false);
        this.termsDialogVisible = false;
    };
    SignupComponent.prototype.showPledgeInfo = function () {
        this._app.backdrop(true);
        this.pledgeInfoDialogVisible = true;
    };
    SignupComponent.prototype.hidePledgeInfo = function () {
        this._app.backdrop(false);
        this.pledgeInfoDialogVisible = false;
    };
    SignupComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "signup",
            templateUrl: '../template/signup.component.html',
            animations: [
                anim_util_1.ToggleAnim.fadeAbsolute,
                anim_util_1.ToggleAnim.bubble,
                anim_util_1.ToggleAnim.bubbleSlow,
                anim_util_1.DialogAnim.dialog
            ]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            app_service_1.AppService,
            router_1.Router,
            user_service_1.UserService])
    ], SignupComponent);
    return SignupComponent;
}());
exports.SignupComponent = SignupComponent;

//# sourceMappingURL=signup.component.js.map
