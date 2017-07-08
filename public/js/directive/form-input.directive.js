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
var FormInputDirective = (function () {
    function FormInputDirective(el, renderer) {
        this.renderer = renderer;
        this.asterisk = true;
        this.helpClicked = new core_1.EventEmitter();
        this.inputElement = el.nativeElement;
    }
    FormInputDirective.prototype.ngOnInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.placeholder = _this.inputElement.getAttribute('placeholder');
            var classes = _this.inputElement.classList;
            _this.divElement = document.createElement('div');
            _this.divElement.className = 'form-input ' + classes;
            if (_this.inputElement.name) {
                _this.divElement.className += ' form-input-' + _this.inputElement.name;
            }
            _this.inputElement.parentElement.insertBefore(_this.divElement, _this.inputElement.nextSibling);
            _this.divElement.appendChild(_this.inputElement);
            if (_this.helpLink) {
                _this.helpLinkElement = document.createElement('a');
                _this.helpLinkElement.innerText = _this.helpLink;
                _this.helpLinkElement.className = 'help';
                _this.divElement.appendChild(_this.helpLinkElement);
                _this.renderer.listen(_this.helpLinkElement, 'click', function (e) { return _this.clickHelp(); });
            }
            _this.inputElement.setAttribute('placeholder', '');
            _this.labelElement = document.createElement('label');
            _this.labelElement.textContent = _this.placeholder;
            if (_this.inputElement.required && _this.asterisk) {
                _this.labelElement.textContent += ' *';
            }
            _this.divElement.appendChild(_this.labelElement);
            setTimeout(function () {
                if (_this.inputElement.value) {
                    _this.focus();
                }
            }, 10);
        }, 100);
    };
    FormInputDirective.prototype.ngOnDestroy = function () {
        // this.divElement.remove();
    };
    FormInputDirective.prototype.focus = function () {
        this.labelElement.className = 'active';
    };
    FormInputDirective.prototype.blur = function () {
        if (!this.inputElement.value) {
            this.labelElement.className = '';
        }
        else {
            this.focus();
        }
    };
    FormInputDirective.prototype.input = function () {
        if (this.helpLinkElement) {
            if (this.inputElement.value) {
                this.helpLinkElement.className = 'help gone';
            }
            else {
                this.helpLinkElement.className = 'help';
            }
        }
    };
    FormInputDirective.prototype.clickHelp = function () {
        this.helpClicked.emit(true);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FormInputDirective.prototype, "error", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FormInputDirective.prototype, "asterisk", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FormInputDirective.prototype, "helpLink", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FormInputDirective.prototype, "helpClicked", void 0);
    FormInputDirective = __decorate([
        core_1.Directive({
            selector: '[formInput]',
            host: {
                '(focus)': 'focus()',
                '(blur)': 'blur()',
                '(input)': 'input()'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            core_1.Renderer2])
    ], FormInputDirective);
    return FormInputDirective;
}());
exports.FormInputDirective = FormInputDirective;

//# sourceMappingURL=form-input.directive.js.map
