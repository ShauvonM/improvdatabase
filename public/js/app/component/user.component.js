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
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var app_component_1 = require("../../component/app.component");
var user_service_1 = require("../../service/user.service");
var util_1 = require("../../util/util");
var time_util_1 = require("../../util/time.util");
var anim_util_1 = require("../../util/anim.util");
var MAX_ATTEMPTS = 5;
var UserComponent = (function () {
    function UserComponent(userService, router, location, _app, fb) {
        this.userService = userService;
        this.router = router;
        this.location = location;
        this._app = _app;
        this.fb = fb;
        this.title = "Account";
        this.tabs = [
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
        this.selectedTab = 'user';
        this._tools = [
            {
                icon: "fa-sign-out",
                name: "logout",
                text: "Log Out",
                active: false
            }
        ];
    }
    UserComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.errorCount = 0;
        this.weGood = true;
        this.user = this._app.user;
        this.userService.fetchPurchases().then(function (p) {
            _this.purchases = p;
        });
        this.userService.fetchSubscription().then(function (u) {
            _this.subscription = u.subscription;
        });
    };
    UserComponent.prototype.ngOnDestroy = function () {
    };
    UserComponent.prototype.selectTab = function (tab) {
        this.selectedTab = tab.id;
        this.changePledgeShown = false;
    };
    UserComponent.prototype.logout = function () {
        this._app.logout();
    };
    UserComponent.prototype.submitEditUser = function (user) {
        var _this = this;
        if (user && user._id) {
            this.userService.updateUser(user)
                .then(function () {
                _this.isPosting = false;
                _this._app.toast("Your information has been saved!");
            })
                .catch(function () {
                _this.isPosting = false;
            });
        }
    };
    UserComponent.prototype.onToolClicked = function (tool) {
        this._app.showLoader();
        switch (tool.name) {
            case "logout":
                this._app.logout();
                break;
        }
    };
    UserComponent.prototype.getDate = function (date) {
        return time_util_1.TimeUtil.simpleDate(date);
    };
    UserComponent.prototype.getTime = function (date) {
        return time_util_1.TimeUtil.simpleTime(date);
    };
    UserComponent.prototype.cancelSubscription = function () {
        this._app.toast("This button doesn't work yet.");
    };
    UserComponent.prototype.showChangePledge = function () {
        var _this = this;
        this.pledge = this.subscription.pledge.toFixed(2);
        this.changePledgeShown = true;
        this.creditCard = util_1.Util.setupStripe(this._app.config.stripe, function (e) {
            _this.cardComplete = e.complete;
            if (e.error) {
                _this.cardError = e.error.message;
            }
            else {
                _this.cardError = '';
            }
        });
        setTimeout(function () {
            _this.creditCard.mount('#card-element');
        });
    };
    UserComponent.prototype.pledgeFormValid = function () {
        return parseFloat(this.pledge) != this.subscription.pledge &&
            (parseFloat(this.pledge) == 0 || this.cardComplete);
    };
    UserComponent.prototype.savePledge = function () {
        var _this = this;
        if (parseFloat(this.pledge) != this.subscription.pledge) {
            this.isPosting = true;
            if (this.pledge && this.cardComplete) {
                util_1.Util.getStripeToken(this._app.config.stripe, this.creditCard).then(function (result) {
                    if (result.error) {
                        _this.cardError = result.error.message;
                    }
                    else {
                        _this._savePledge(result.token);
                    }
                });
            }
            else {
                this._savePledge();
            }
        }
        else {
            this.changePledgeShown = false;
        }
    };
    UserComponent.prototype._savePledge = function (token) {
        var _this = this;
        this.userService.updatePledge(this.pledge, token).then(function (sub) {
            _this.subscription = sub;
            _this.changePledgeShown = false;
            _this.isPosting = false;
        });
    };
    UserComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "user",
            templateUrl: "../template/user.component.html",
            animations: [
                anim_util_1.ShrinkAnim.height
            ]
        }),
        __metadata("design:paramtypes", [user_service_1.UserService,
            router_1.Router,
            common_1.Location,
            app_component_1.AppComponent,
            forms_1.FormBuilder])
    ], UserComponent);
    return UserComponent;
}());
exports.UserComponent = UserComponent;

//# sourceMappingURL=user.component.js.map
