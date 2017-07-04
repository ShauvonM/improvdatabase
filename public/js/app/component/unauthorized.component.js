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
var app_component_1 = require("../../component/app.component");
var user_service_1 = require("../../service/user.service");
var UnauthorizedComponent = (function () {
    function UnauthorizedComponent(_app, router, userService) {
        this._app = _app;
        this.router = router;
        this.userService = userService;
        this.title = '';
        this._tools = [];
    }
    UnauthorizedComponent.prototype.ngOnInit = function () {
    };
    UnauthorizedComponent.prototype.can = function (permission) {
        return this.userService.can(permission);
    };
    UnauthorizedComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "unauthorized",
            templateUrl: "../template/unauthorized.component.html"
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            user_service_1.UserService])
    ], UnauthorizedComponent);
    return UnauthorizedComponent;
}());
exports.UnauthorizedComponent = UnauthorizedComponent;

//# sourceMappingURL=unauthorized.component.js.map
