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
var user_service_1 = require("../service/user.service");
var anim_util_1 = require("../util/anim.util");
var ChangePasswordComponent = (function () {
    function ChangePasswordComponent(_app, router, route, userService) {
        this._app = _app;
        this.router = router;
        this.route = route;
        this.userService = userService;
        this.isDialog = true;
    }
    ChangePasswordComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.forEach(function (params) {
            _this.token = params['token'];
        });
        this._app.backdrop(true);
        this.checking = true;
        this.userService.checkPasswordRecoveryToken(this.token).then(function (r) {
            _this.checking = false;
            if (r) {
                setTimeout(function () {
                    _this.valid = true;
                }, 200);
            }
        });
    };
    ChangePasswordComponent.prototype.submitPassword = function () {
        var _this = this;
        if (this.password !== this.confirmPassword) {
            this.error = 'Your passwords do not match.';
        }
        else {
            this.isPosting = true;
            this.userService.changePassword(this.token, this.password)
                .then(function (user) {
                if (user) {
                    _this.userService.login(user.email, _this.password);
                }
            });
        }
    };
    __decorate([
        core_1.HostBinding('class.dialog-container'),
        core_1.HostBinding('class.show'),
        __metadata("design:type", Boolean)
    ], ChangePasswordComponent.prototype, "isDialog", void 0);
    ChangePasswordComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "change-password",
            templateUrl: '../template/change-password.component.html',
            animations: [
                anim_util_1.DialogAnim.dialog
            ]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            router_1.ActivatedRoute,
            user_service_1.UserService])
    ], ChangePasswordComponent);
    return ChangePasswordComponent;
}());
exports.ChangePasswordComponent = ChangePasswordComponent;

//# sourceMappingURL=change-password.component.js.map
