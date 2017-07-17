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
var forms_1 = require("@angular/forms");
var FormSwitchDirective = (function () {
    // private _on: boolean;
    function FormSwitchDirective(el, renderer, model) {
        this.renderer = renderer;
        this.model = model;
        this.inputElement = el.nativeElement;
    }
    FormSwitchDirective.prototype.ngOnInit = function () {
        var _this = this;
        var classes = this.inputElement.className;
        this.inputElement.setAttribute('type', 'checkbox');
        this.wrapper = document.createElement('span');
        this.wrapper.className = classes + ' form-switch';
        if (this.inputElement.name) {
            this.wrapper.className += ' form-switch-' + this.inputElement.name;
        }
        this.inputElement.parentElement.insertBefore(this.wrapper, this.inputElement);
        this.wrapper.appendChild(this.inputElement);
        this.control = document.createElement('i');
        this.control.className = 'control';
        this.wrapper.appendChild(this.control);
        var clickHandler;
        if (this.wrapper.parentElement.tagName.toLowerCase() == 'label') {
            clickHandler = this.wrapper.parentElement;
        }
        else {
            clickHandler = this.wrapper;
        }
        this.renderer.listen(clickHandler, 'click', function (e) { return _this.click(e); });
        setTimeout(function () {
            if (_this.model.model) {
                _this.wrapper.classList.add('on');
            }
        }, 50);
    };
    FormSwitchDirective.prototype.ngOnChanges = function (changes) {
        if (changes.partialActive && changes.partialActive.currentValue) {
            this.partial = document.createElement('i');
            this.partial.className = 'fa fa-asterisk';
            this.control.appendChild(this.partial);
        }
        else if (changes.partialActive && this.partial) {
            this.partial.remove();
            this.partial = null;
        }
    };
    FormSwitchDirective.prototype.onModelChange = function (model) {
        if (model) {
            this.wrapper.classList.add('on');
        }
        else {
            this.wrapper.classList.remove('on');
        }
    };
    FormSwitchDirective.prototype.check = function () {
        var _this = this;
        setTimeout(function () {
            _this.onModelChange(_this.model.model);
        });
    };
    FormSwitchDirective.prototype.click = function (event) {
        this.inputElement.checked = !this.model.model;
        this.inputElement.dispatchEvent(new Event('change'));
        event.preventDefault();
    };
    __decorate([
        core_1.Input('partial'),
        __metadata("design:type", Boolean)
    ], FormSwitchDirective.prototype, "partialActive", void 0);
    FormSwitchDirective = __decorate([
        core_1.Directive({
            selector: '[formSwitch]',
            providers: [forms_1.NgModel],
            host: {
                '(ngModelChange)': 'onModelChange($event)'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            core_1.Renderer2,
            forms_1.NgModel])
    ], FormSwitchDirective);
    return FormSwitchDirective;
}());
exports.FormSwitchDirective = FormSwitchDirective;

//# sourceMappingURL=form-switch.directive.js.map
