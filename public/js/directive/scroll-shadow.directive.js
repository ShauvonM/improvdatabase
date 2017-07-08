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
var ScrollShadowDirective = (function () {
    function ScrollShadowDirective(_elementRef) {
        this._elementRef = _elementRef;
        this.element = _elementRef.nativeElement;
    }
    ScrollShadowDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'scroll-wrapper';
        this.element.parentElement.insertBefore(this.wrapper, this.element);
        this.wrapper.appendChild(this.element);
        this.topShadow = document.createElement('div');
        this.topShadow.className = 'shadow-top';
        this.bottomShadow = document.createElement('div');
        this.bottomShadow.className = 'shadow-bottom';
        this.wrapper.appendChild(this.topShadow);
        this.wrapper.appendChild(this.bottomShadow);
        setTimeout(function () {
            _this.calculateShadows();
        });
    };
    ScrollShadowDirective.prototype.ngOnDestroy = function () {
    };
    ScrollShadowDirective.prototype.calculateShadows = function () {
        var scrollHeight = this.element.scrollHeight, height = this.element.offsetHeight, scrollPos = this.element.scrollTop, std = 16, factor = scrollPos / (scrollHeight - height);
        if (scrollHeight == height) {
            this.topShadow.style.height = '0px';
            this.bottomShadow.style.height = '0px';
        }
        else {
            this.topShadow.style.height = (std * factor) + 'px';
            this.bottomShadow.style.height = (std - (std * factor)) + 'px';
        }
    };
    ScrollShadowDirective = __decorate([
        core_1.Directive({
            selector: '.scroll',
            host: {
                '(scroll)': 'calculateShadows()'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], ScrollShadowDirective);
    return ScrollShadowDirective;
}());
exports.ScrollShadowDirective = ScrollShadowDirective;

//# sourceMappingURL=scroll-shadow.directive.js.map
