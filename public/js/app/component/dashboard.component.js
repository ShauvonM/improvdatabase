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
var DashboardComponent = (function () {
    function DashboardComponent(_app, router, userService) {
        this._app = _app;
        this.router = router;
        this.userService = userService;
        this.title = '<span class="light">improv</span><strong>plus</strong>';
        this._tools = [];
    }
    DashboardComponent.prototype.ngOnInit = function () {
        this._app.showBackground(true);
    };
    DashboardComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "dashboard",
            templateUrl: "../template/dashboard.component.html"
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            user_service_1.UserService])
    ], DashboardComponent);
    return DashboardComponent;
}());
exports.DashboardComponent = DashboardComponent;

//# sourceMappingURL=dashboard.component.js.map
