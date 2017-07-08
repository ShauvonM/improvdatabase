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
var constants_1 = require("../constants");
var app_component_1 = require("../component/app.component");
var MarketingToolbarView = (function () {
    function MarketingToolbarView(_app) {
        this._app = _app;
    }
    MarketingToolbarView.prototype.ngOnInit = function () {
    };
    MarketingToolbarView.prototype.clickIcon = function () {
        if (window.innerWidth <= constants_1.MOBILE_WIDTH) {
            this.open = !this.open;
        }
        else {
            this._app.login();
        }
    };
    MarketingToolbarView.prototype.login = function () {
        this._app.login();
    };
    __decorate([
        core_1.ViewChild('toolbar'),
        __metadata("design:type", core_1.ElementRef)
    ], MarketingToolbarView.prototype, "toolbarRef", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], MarketingToolbarView.prototype, "on", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], MarketingToolbarView.prototype, "onWhenOpen", void 0);
    MarketingToolbarView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'marketing-toolbar',
            templateUrl: '../template/view/marketing-toolbar.view.html'
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent])
    ], MarketingToolbarView);
    return MarketingToolbarView;
}());
exports.MarketingToolbarView = MarketingToolbarView;

//# sourceMappingURL=marketing-toolbar.view.js.map
