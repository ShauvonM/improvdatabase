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
var DraggableDirective = (function () {
    function DraggableDirective(_elementRef) {
        this._elementRef = _elementRef;
    }
    DraggableDirective.prototype.ngOnInit = function () {
        var _this = this;
        var el = this._elementRef.nativeElement;
        el.draggable = true;
        el.addEventListener('dragstart', function (e) {
            el.classList.add('drag-src');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text', _this.data);
        });
        el.addEventListener('dragend', function (e) {
            e.preventDefault();
            el.classList.remove('drag-src');
        });
    };
    __decorate([
        core_1.Input('makeDraggable'),
        __metadata("design:type", String)
    ], DraggableDirective.prototype, "data", void 0);
    DraggableDirective = __decorate([
        core_1.Directive({
            selector: '[makeDraggable]'
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], DraggableDirective);
    return DraggableDirective;
}());
exports.DraggableDirective = DraggableDirective;

//# sourceMappingURL=draggable.directive.js.map
