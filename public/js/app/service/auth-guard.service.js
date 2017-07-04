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
var app_service_1 = require("../../service/app.service");
var user_service_1 = require("../../service/user.service");
var AuthGuard = (function () {
    function AuthGuard(router, _service, userService) {
        this.router = router;
        this._service = _service;
        this.userService = userService;
    }
    AuthGuard.prototype.canActivateChild = function (route, state) {
        //console.log(this.userService.getLoggedInUser());
        var _this = this;
        if (this.userService.isLoggingIn) {
            return this.userService.loginPromise.then(function (user) {
                return Promise.resolve(_this.canActivateChild(route, state));
            });
        }
        if (this.userService.getLoggedInUser()) {
            var data = route.data;
            //console.log(data, this.userService.can(data.action));
            if (data.admin && this.userService.isSuperAdmin()) {
                return true;
            }
            else if (!data.action || this.userService.can(data.action)) {
                return true;
            }
            else {
                this.router.navigate(['/app/unauthorized'], { replaceUrl: true });
            }
        }
        else {
            this._service.setRedirect(route.url);
            this.router.navigate(['/login'], { replaceUrl: true });
        }
        return false;
    };
    AuthGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router,
            app_service_1.AppService,
            user_service_1.UserService])
    ], AuthGuard);
    return AuthGuard;
}());
exports.AuthGuard = AuthGuard;

//# sourceMappingURL=auth-guard.service.js.map
