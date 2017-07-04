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
var BracketCardDirective = (function () {
    function BracketCardDirective(el) {
        this.fixed = true;
        this.ANIM_DELAY = 400;
        this.card = el.nativeElement;
    }
    BracketCardDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.contentOpen = this.card.querySelector('.body-open');
        this.contentDefault = this.card.querySelector('.body-default');
        if (!this.contentOpen) {
            this.isOpen = true;
        }
        this.isDefault = true;
        setTimeout(function () {
            // this is delayed so any enter transition doesn't cause problems
            _this._saveDimens();
            if (_this.contentDefault) {
                _this.contentDefault.style.height = _this.contentDefault.offsetHeight + 'px';
            }
        }, 500);
    };
    BracketCardDirective.prototype._saveDimens = function () {
        this.card.dataset.width = this.card.offsetWidth.toString();
        this.card.dataset.height = this.card.offsetHeight.toString();
        if (this.contentDefault && !this.card.dataset.contentheight) {
            this.card.dataset.contentheight = this.contentDefault.offsetHeight.toString();
        }
    };
    BracketCardDirective.prototype.close = function (delay) {
        var _this = this;
        if (this.isClosed) {
            return;
        }
        delay = delay || 10;
        this._saveDimens();
        setTimeout(function () {
            if (window.innerWidth < 500) {
                _this._closeVertical();
            }
            else {
                _this._closeHorizontal();
            }
            _this.isOpen = false;
            _this.isDefault = false;
            _this.isClosed = true;
            _this.card.classList.remove('card-open');
            _this.card.classList.add('card-closed');
        }, delay);
    };
    BracketCardDirective.prototype._closeVertical = function () {
        var _this = this;
        var children = this.card.children;
        var _loop_1 = function (i) {
            var child = children[i];
            setTimeout(function () {
                child.style.opacity = '0';
            }, 10);
        };
        for (var i = 0; i < children.length; i++) {
            _loop_1(i);
        }
        this.card.style.height = this.card.offsetHeight + 'px';
        this.card.style.overflow = 'hidden';
        setTimeout(function () {
            _this.card.style.height = '0px';
            _this.card.style.opacity = '0.5';
        }, 10);
    };
    BracketCardDirective.prototype._closeHorizontal = function () {
        var _this = this;
        var children = this.card.children;
        var _loop_2 = function (i) {
            var child = children[i];
            child.style.width = child.offsetWidth + 'px';
            child.style.boxSizing = 'border-box';
            child.style.transform = 'translateX(-50%)';
            child.style.marginLeft = '50%';
            setTimeout(function () {
                child.style.opacity = '0';
            }, 10);
        };
        for (var i = 0; i < children.length; i++) {
            _loop_2(i);
        }
        this.card.style.width = this.card.offsetWidth + 'px';
        this.card.style.overflow = 'hidden';
        setTimeout(function () {
            _this.card.style.flexGrow = '0';
            _this.card.style.width = '0px';
            _this.card.style.opacity = '0.5';
            if (_this.contentDefault) {
                // setTimeout(() => {
                // this.contentDefault.style.height = '50px';
                // }, this.ANIM_DELAY * 2)
                _this.contentDefault.style.height = _this.card.dataset.contentheight + 'px';
            }
        }, 10);
    };
    BracketCardDirective.prototype._closeContent = function () {
        var _this = this;
        setTimeout(function () {
            _this.card.style.maxWidth = '';
            var height = _this.card.dataset.contentheight;
            _this.contentDefault.style.height = height + 'px';
            _this.contentOpen.style.opacity = '0';
            setTimeout(function () {
                _this.contentDefault.style.opacity = '1';
            }, _this.ANIM_DELAY);
        }, 10);
    };
    BracketCardDirective.prototype.open = function (delay) {
        var _this = this;
        delay = delay || 10;
        // if the width isn't already 0, it's already open
        if (!this.contentOpen && this.card.style.height !== '0px' && this.card.style.width !== '0px') {
            return;
        }
        setTimeout(function () {
            if (_this.contentOpen) {
                _this._openContent();
            }
            else {
                _this._openBasic();
            }
            _this.isClosed = false;
            _this.isOpen = true;
            _this.isDefault = !_this.contentOpen;
            _this.card.classList.remove('card-closed');
            _this.card.classList.add('card-open');
        }, delay);
    };
    BracketCardDirective.prototype._openBasic = function () {
        var _this = this;
        var height = this.card.dataset.height, width = this.card.dataset.width;
        var children = this.card.children;
        var _loop_3 = function (i) {
            var child = children[i];
            child.style.opacity = '0';
            if (!child.classList.contains('body-open')) {
                setTimeout(function () {
                    child.style.opacity = '1';
                }, this_1.ANIM_DELAY);
            }
        };
        var this_1 = this;
        for (var i = 0; i < children.length; i++) {
            _loop_3(i);
        }
        this.card.style.overflow = 'hidden';
        setTimeout(function () {
            _this.card.style.height = height + 'px';
            _this.card.style.width = width + 'px';
            _this.card.style.opacity = '1';
            setTimeout(function () {
                _this.card.style.flexGrow = '';
                _this.card.style.width = '';
                _this.card.style.height = '';
                _this.card.style.overflow = '';
            }, _this.ANIM_DELAY);
        }, 10);
    };
    BracketCardDirective.prototype._openContent = function () {
        var _this = this;
        var children = this.card.children;
        var _loop_4 = function (i) {
            var child = children[i];
            if (!child.classList.contains('body-open') && !child.classList.contains('body-default')) {
                child.style.opacity = '0';
                setTimeout(function () {
                    child.style.opacity = '1';
                }, this_2.ANIM_DELAY);
            }
        };
        var this_2 = this;
        for (var i = 0; i < children.length; i++) {
            _loop_4(i);
        }
        setTimeout(function () {
            if (!_this.fixed) {
                _this.card.style.maxWidth = '100%';
                _this.card.style.width = '';
                _this.card.style.flexGrow = '';
            }
            else {
                var width = _this.card.dataset.width;
                _this.card.style.width = width + 'px';
            }
            _this.contentDefault.style.height = _this.card.dataset.contentheight + 'px';
            _this.contentDefault.style.opacity = '0';
            _this.card.style.opacity = "1";
            _this.contentOpen.removeAttribute('style');
            setTimeout(function () {
                _this.contentDefault.style.height = _this.contentOpen.offsetHeight + 'px';
                _this.contentOpen.style.opacity = '1';
            }, _this.ANIM_DELAY);
        }, 10);
    };
    BracketCardDirective.prototype.reset = function (delay) {
        var _this = this;
        delay = delay || 10;
        setTimeout(function () {
            if (_this.isOpen && _this.contentOpen) {
                _this._closeContent();
            }
            else if (_this.isClosed) {
                _this._openBasic();
            }
            _this.isClosed = false;
            _this.isOpen = false;
            _this.isDefault = true;
            _this.card.classList.remove('card-open');
            _this.card.classList.remove('card-closed');
        }, delay);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], BracketCardDirective.prototype, "error", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], BracketCardDirective.prototype, "key", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], BracketCardDirective.prototype, "fixed", void 0);
    BracketCardDirective = __decorate([
        core_1.Directive({
            selector: '[bracketCard]'
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], BracketCardDirective);
    return BracketCardDirective;
}());
exports.BracketCardDirective = BracketCardDirective;

//# sourceMappingURL=bracket-card.directive.js.map
