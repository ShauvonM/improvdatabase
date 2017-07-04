"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
// import { BrowserModule } from '@angular/platform-browser';
var forms_1 = require("@angular/forms");
var logo_view_1 = require("../view/logo.view");
var login_view_1 = require("../view/login.view");
var user_form_view_1 = require("../view/user-form.view");
var landing_hero_view_1 = require("../view/landing-hero.view");
var legal_view_1 = require("../view/legal.view");
// services
var user_service_1 = require("../service/user.service");
var cart_service_1 = require("../service/cart.service");
var app_service_1 = require("../service/app.service");
var form_input_directive_1 = require("../directive/form-input.directive");
var bracket_card_directive_1 = require("../directive/bracket-card.directive");
var draggable_directive_1 = require("../directive/draggable.directive");
var droppable_directive_1 = require("../directive/droppable.directive");
var form_switch_directive_1 = require("../directive/form-switch.directive");
var infinite_scroll_directive_1 = require("../directive/infinite-scroll.directive");
var SharedModule = (function () {
    function SharedModule() {
    }
    SharedModule = __decorate([
        core_1.NgModule({
            imports: [
                // BrowserModule,
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule
            ],
            declarations: [
                logo_view_1.LogoView,
                login_view_1.LoginView,
                user_form_view_1.UserFormView,
                landing_hero_view_1.LandingHeroView,
                legal_view_1.LegalView,
                form_input_directive_1.FormInputDirective,
                bracket_card_directive_1.BracketCardDirective,
                draggable_directive_1.DraggableDirective,
                droppable_directive_1.DroppableDirective,
                form_switch_directive_1.FormSwitchDirective,
                infinite_scroll_directive_1.InfiniteScrollDirective
            ],
            exports: [
                logo_view_1.LogoView,
                login_view_1.LoginView,
                user_form_view_1.UserFormView,
                landing_hero_view_1.LandingHeroView,
                legal_view_1.LegalView,
                form_input_directive_1.FormInputDirective,
                bracket_card_directive_1.BracketCardDirective,
                draggable_directive_1.DraggableDirective,
                droppable_directive_1.DroppableDirective,
                form_switch_directive_1.FormSwitchDirective,
                infinite_scroll_directive_1.InfiniteScrollDirective
            ],
            providers: [
                app_service_1.AppService,
                user_service_1.UserService,
                cart_service_1.CartService
            ]
        })
    ], SharedModule);
    return SharedModule;
}());
exports.SharedModule = SharedModule;

//# sourceMappingURL=shared.module.js.map
