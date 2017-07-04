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
var app_component_1 = require("../../component/app.component");
var user_service_1 = require("../../service/user.service");
var NotFoundComponent = (function () {
    function NotFoundComponent(_app, router, userService, _location) {
        this._app = _app;
        this.router = router;
        this.userService = userService;
        this._location = _location;
    }
    NotFoundComponent.prototype.ngOnInit = function () {
        this._app.showBackground(true);
    };
    NotFoundComponent.prototype.goback = function () {
        this._location.back();
    };
    NotFoundComponent.prototype.dashboard = function () {
        this.router.navigate(['/app/dashboard']);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], NotFoundComponent.prototype, "injected", void 0);
    NotFoundComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "not-found",
            templateUrl: '../template/not-found.component.html'
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            user_service_1.UserService,
            common_1.Location])
    ], NotFoundComponent);
    return NotFoundComponent;
}());
exports.NotFoundComponent = NotFoundComponent;

//# sourceMappingURL=not-found.component.js.map
