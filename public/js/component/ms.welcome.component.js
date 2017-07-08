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
var http_1 = require("@angular/http");
require("rxjs/add/operator/toPromise");
// import { MarketingSiteComponent } from './ms.component';
var app_component_1 = require("./app.component");
var anim_util_1 = require("../util/anim.util");
var WelcomeComponent = (function () {
    function WelcomeComponent(_app, router, http) {
        this._app = _app;
        this.router = router;
        this.http = http;
        this.contact = {
            firstName: "",
            lastName: "",
            email: "",
            company: "",
            team: "",
            objective: ""
        };
        this.toolbarheight = 48;
        this.pageStart = window.innerHeight - (this.toolbarheight + 24);
    }
    WelcomeComponent.prototype.ngOnInit = function () {
        this.setupSize();
    };
    WelcomeComponent.prototype.setupSize = function () {
    };
    WelcomeComponent.prototype.login = function () {
        this._app.login();
    };
    WelcomeComponent.prototype.showContactDialog = function () {
        this.contactDialogVisible = true;
        this._app.backdrop(true);
    };
    WelcomeComponent.prototype.hideContactDialog = function () {
        this.contactDialogVisible = false;
        this.sent = false;
        this.sending = false;
        this._app.backdrop(false);
    };
    WelcomeComponent.prototype.submitContact = function () {
        var _this = this;
        if (!this.contact.firstName || !this.contact.lastName || !this.contact.email) {
            this.contactError = "Please enter your name and email.";
        }
        else {
            this.contactError = "";
            this.sending = true;
            this._app.showLoader();
            this.http.post('/hireUs', this.contact)
                .toPromise()
                .then(function (response) {
                _this._app.hideLoader();
                _this._app.backdrop(true);
                _this.sending = false;
                _this.sent = true;
            });
        }
    };
    WelcomeComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "for-improvisers",
            templateUrl: "../template/improvisers.component.html",
            animations: [
                anim_util_1.DialogAnim.dialog,
                anim_util_1.ToggleAnim.fade
            ]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            http_1.Http])
    ], WelcomeComponent);
    return WelcomeComponent;
}());
exports.WelcomeComponent = WelcomeComponent;

//# sourceMappingURL=ms.welcome.component.js.map
