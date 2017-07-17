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
var anim_util_1 = require("../util/anim.util");
var CurtainView = (function () {
    function CurtainView(_app) {
        this._app = _app;
    }
    CurtainView.prototype.ngOnInit = function () {
        var _this = this;
        this.scrollSub = this._app.onScroll$.subscribe(function (pos) { return _this.scrollpos = pos; });
    };
    CurtainView.prototype.ngOnDestroy = function () {
        this.scrollSub.unsubscribe();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], CurtainView.prototype, "background", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], CurtainView.prototype, "text", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], CurtainView.prototype, "color", void 0);
    CurtainView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'id-curtain',
            templateUrl: '../template/view/curtain.view.html',
            animations: [anim_util_1.ToggleAnim.bubble],
            host: {
                '[class.curtain]': 'true',
                '[style.top]': "(scrollpos * 0.75) + 'px'",
                '[style.background-color]': 'background'
            }
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent])
    ], CurtainView);
    return CurtainView;
}());
exports.CurtainView = CurtainView;

//# sourceMappingURL=curtain.view.js.map
