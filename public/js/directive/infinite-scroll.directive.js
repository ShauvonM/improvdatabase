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
var Observable_1 = require("rxjs/Observable");
var app_component_1 = require("../component/app.component");
var InfiniteScrollDirective = (function () {
    function InfiniteScrollDirective(_elementRef, _app) {
        this._elementRef = _elementRef;
        this._app = _app;
        this.load = new core_1.EventEmitter(); // emits an event with the current scroll position
        this._disabled = false;
        this.toolbarHeight = 48;
        this.loadCount = 0;
        this.element = _elementRef.nativeElement;
    }
    InfiniteScrollDirective.prototype.ngOnInit = function () {
        // this.scrollSubscription = Observable.fromEvent(window, 'scroll')
        //     .throttle(() => Observable.timer(300))
        //     .filter(() => !this._disabled)
        //     .subscribe(() => this.handleOnScroll());
        var _this = this;
        this.scrollSubscription = this._app.onScroll$
            .debounce(function () { return Observable_1.Observable.timer(50); })
            .filter(function () { return !_this._disabled && !_this._ignore; })
            .subscribe(function (pos) { return _this.handleOnScroll(pos); });
        setTimeout(function () {
            var rect = _this.element.getBoundingClientRect(); // lol rekt
            _this.offsetTop = rect.top;
            _this.handleOnScroll(0);
        }, 100);
    };
    InfiniteScrollDirective.prototype.ngOnDestroy = function () {
        this.scrollSubscription.unsubscribe();
    };
    InfiniteScrollDirective.prototype.ngOnChanges = function (changes) {
        // if (changes._disabled && !changes._disabled.currentValue) {
        //     this.handleOnScroll();
        // }
    };
    InfiniteScrollDirective.prototype.handleOnScroll = function (pos) {
        pos = pos || document.scrollingElement.scrollTop;
        this.height = this.element.offsetHeight;
        var triggerPoint = (this.offsetTop + this.height) - (window.innerHeight * 0.5);
        if (pos + window.innerHeight >= triggerPoint) {
            this.loadCount++;
            this.load.emit(this.loadCount);
        }
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], InfiniteScrollDirective.prototype, "load", void 0);
    __decorate([
        core_1.Input('disable'),
        __metadata("design:type", Boolean)
    ], InfiniteScrollDirective.prototype, "_disabled", void 0);
    InfiniteScrollDirective = __decorate([
        core_1.Directive({
            selector: '[infiniteScroll]'
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            app_component_1.AppComponent])
    ], InfiniteScrollDirective);
    return InfiniteScrollDirective;
}());
exports.InfiniteScrollDirective = InfiniteScrollDirective;

//# sourceMappingURL=infinite-scroll.directive.js.map
