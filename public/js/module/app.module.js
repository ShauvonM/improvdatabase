"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var http_1 = require("@angular/http");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var animations_1 = require("@angular/platform-browser/animations");
var app_http_1 = require("../data/app-http");
// main components
var app_component_1 = require("../component/app.component");
var ms_welcome_component_1 = require("../component/ms.welcome.component");
var app_routing_module_1 = require("./app-routing.module");
// the shared module is where all of the views and services live
var shared_module_1 = require("./shared.module");
var improvdatabase_module_1 = require("../app/module/improvdatabase.module");
var login_screen_component_1 = require("../component/login-screen.component");
var signup_component_1 = require("../component/signup.component");
var change_password_component_1 = require("../component/change-password.component");
var invite_component_1 = require("../component/invite.component");
var marketing_toolbar_view_1 = require("../view/marketing-toolbar.view");
// import { FormInputDirective } from '../view/form-input.directive';
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                animations_1.BrowserAnimationsModule,
                shared_module_1.SharedModule,
                app_routing_module_1.AppRoutingModule,
                improvdatabase_module_1.ImprovDatabaseModule
            ],
            declarations: [
                login_screen_component_1.LoginScreenComponent,
                app_component_1.AppComponent,
                ms_welcome_component_1.WelcomeComponent,
                signup_component_1.SignupComponent,
                change_password_component_1.ChangePasswordComponent,
                invite_component_1.InviteComponent,
                marketing_toolbar_view_1.MarketingToolbarView
            ],
            bootstrap: [app_component_1.AppComponent],
            providers: [
                common_1.PathLocationStrategy,
                app_http_1.AppHttp
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;

//# sourceMappingURL=app.module.js.map
