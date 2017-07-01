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
var app_component_1 = require("../component/app.component");
var LandingHeroView = (function () {
    function LandingHeroView(_app) {
        this._app = _app;
        this.showContent = true;
        this.improv = false;
        this.video = true;
        this.toolbarheight = 48;
        this.pageStart = window.innerHeight - (this.toolbarheight + 24);
        this.pagepos = this.pageStart;
    }
    LandingHeroView.prototype.ngOnInit = function () {
        var _this = this;
        this.setupSize();
        this.scrollSubscription = this._app.onScroll$.subscribe(function (scrollPos) {
            _this.pagepos = _this.pageStart - scrollPos;
        });
    };
    LandingHeroView.prototype.ngOnDestroy = function () {
        this.scrollSubscription.unsubscribe();
    };
    LandingHeroView.prototype.scrollBelowLanding = function () {
        this._app.scrollTo(this.pageStart - 10, 800);
    };
    LandingHeroView.prototype.setupSize = function () {
        var windowWidth = window.innerWidth, windowHeight = window.innerHeight, targetWidth = (windowHeight * 2500) / 1667;
        if (windowWidth < targetWidth) {
            this.bgheight = windowHeight + 'px';
            this.bgwidth = 'auto';
        }
        else {
            this.bgheight = 'auto';
            this.bgwidth = windowWidth + 'px';
        }
    };
    return LandingHeroView;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], LandingHeroView.prototype, "showContent", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], LandingHeroView.prototype, "improv", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], LandingHeroView.prototype, "video", void 0);
LandingHeroView = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'landing-hero',
        templateUrl: '../template/view/landing-hero.view.html'
    }),
    __metadata("design:paramtypes", [app_component_1.AppComponent])
], LandingHeroView);
exports.LandingHeroView = LandingHeroView;

//# sourceMappingURL=landing-hero.view.js.map
