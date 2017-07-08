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
var LogoView = (function () {
    function LogoView() {
    }
    LogoView.prototype.ngOnInit = function () {
    };
    LogoView.prototype.ngOnDestroy = function () {
    };
    LogoView.prototype.over = function () {
        this.hover = true;
    };
    LogoView.prototype.out = function () {
        this.hover = false;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], LogoView.prototype, "white", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], LogoView.prototype, "text", void 0);
    LogoView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'logo',
            templateUrl: '../template/view/logo.view.html'
        }),
        __metadata("design:paramtypes", [])
    ], LogoView);
    return LogoView;
}());
exports.LogoView = LogoView;

//# sourceMappingURL=logo.view.js.map
