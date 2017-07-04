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
var DroppableDirective = (function () {
    function DroppableDirective(_elementRef) {
        this._elementRef = _elementRef;
        this.dropped = new core_1.EventEmitter();
    }
    DroppableDirective.prototype.ngOnInit = function () {
        var _this = this;
        var el = this._elementRef.nativeElement;
        el.addEventListener('dragenter', function (e) {
            el.classList.add('over');
        });
        el.addEventListener('dragleave', function (e) {
            el.classList.remove('over');
        });
        el.addEventListener('dragover', function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        });
        el.addEventListener('drop', function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            el.classList.remove('over');
            var data = e.dataTransfer.getData('text');
            _this.dropped.emit(data);
            return false;
        });
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DroppableDirective.prototype, "dropped", void 0);
    DroppableDirective = __decorate([
        core_1.Directive({
            selector: '[makeDroppable]'
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], DroppableDirective);
    return DroppableDirective;
}());
exports.DroppableDirective = DroppableDirective;

//# sourceMappingURL=droppable.directive.js.map
