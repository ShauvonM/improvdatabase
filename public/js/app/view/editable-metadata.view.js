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
var DropdownOption = (function () {
    function DropdownOption() {
    }
    return DropdownOption;
}());
exports.DropdownOption = DropdownOption;
var EditableMetadataView = (function () {
    function EditableMetadataView() {
        this.allowBlank = true;
        this.save = new core_1.EventEmitter(); // called when the item saves
        this.saveAddress = new core_1.EventEmitter(); // called when the address saves
        this.optionId = '_id'; // the property to use as the ID for each option
        this.optionDescription = 'description'; // the property to use as the title attribute on each option
        this.optionText = 'name'; // the property to use to get the text for each option
        this.optionCreate = false; // whether to allow creating new dropdown options
        this.createOption = new core_1.EventEmitter(); // should trigger a dialog or something to create a new option
    }
    EditableMetadataView.prototype.ngOnInit = function () {
        if (!this.type) {
            if (this.address) {
                this.type = 'address';
            }
            else if (this.options) {
                this.type = 'dropdown';
            }
            else {
                this.type = 'text';
            }
        }
        if (this.type == 'address') {
            this.setupAddress();
        }
        if (this.type == 'dropdown' && !this.model) {
            if (!this.allowBlank) {
                // by default select the first option
                this.model = this.options[0];
                this._defaultOptionSelected = true;
            }
            this.setupDropdown();
        }
        if (!this.text && this.allowBlank) {
            this.text = this.blankText;
        }
    };
    EditableMetadataView.prototype.setupDropdown = function () {
        if (this.model && this.model.name) {
            this.text = this.model.name;
            this.icon = this.model.icon;
        }
        else if (!this.allowBlank) {
            this.text = this.options[0].name;
            this.icon = this.options[0].icon;
        }
    };
    EditableMetadataView.prototype.ngOnChanges = function (changes) {
        if (changes.model && this.model && this.text != this.model.name && this.model.hasOwnProperty('name')) {
            this.text = this.model.name;
            if (!this.icon && this.model.icon) {
                this.icon = this.model.icon;
            }
        }
        else if (changes.options && changes.options.previousValue) {
            if (this._defaultOptionSelected) {
                this.model = this.options[0];
            }
            this.setupDropdown();
        }
    };
    EditableMetadataView.prototype._focusInput = function () {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
        }
    };
    EditableMetadataView.prototype.setupAddress = function () {
        var address = this.address || '', city = this.city || '', state = this.state || '', zip = this.zip || '', country = this.country || '';
        this.text = address;
        if (address && (city || state || zip)) {
            this.text += '<br />';
        }
        this.text += city + ' ' + state;
        if ((city || state) && zip) {
            this.text += ',';
        }
        this.text += ' ' + zip;
        if (this.text && country) {
            this.text += '<br />';
        }
        this.text += country;
        this.text = this.text.trim();
    };
    EditableMetadataView.prototype.showEdit = function () {
        var _this = this;
        if (this.canEdit) {
            if (this.model) {
                this.editModel = this.optionId ? this.model[this.optionId] : this.text;
            }
            else {
                this.editModel = this.text;
            }
            this.editShown = true;
            setTimeout(function () {
                _this._focusInput();
            });
        }
    };
    EditableMetadataView.prototype.closeEdit = function () {
        this.editShown = false;
        if (this.model) {
            this.editModel = this.optionId ? this.model[this.optionId] : this.text;
        }
        else {
            this.editModel = this.text;
        }
    };
    EditableMetadataView.prototype.pressEnter = function () {
        this.inputElement.nativeElement.blur();
    };
    EditableMetadataView.prototype.saveEdit = function () {
        var _this = this;
        if (this.type == 'address') {
            this.setupAddress();
            this.saveAddress.emit({
                address: this.address,
                city: this.city,
                state: this.state,
                zip: this.zip,
                country: this.country
            });
        }
        else if (this.type == 'dropdown') {
            if (this.editModel == '-1') {
                // create a new thing!
                this.text = '';
                this.createOption.emit(true);
            }
            else {
                var selection_1;
                if (this.optionId) {
                    this.options.forEach(function (option) {
                        if (option[_this.optionId] == _this.editModel) {
                            selection_1 = option;
                        }
                    });
                }
                else {
                    selection_1 = this.editModel;
                }
                this.text = this.optionText ? selection_1[this.optionText] : selection_1;
                if (selection_1.icon) {
                    this.icon = selection_1.icon;
                }
                this.model = selection_1;
                this.save.emit(selection_1);
            }
        }
        else if (this.editModel && this.editModel != this.text) {
            this.text = this.editModel;
            this.save.emit(this.editModel);
        }
        this.closeEdit();
    };
    __decorate([
        core_1.ViewChild('metadataInput'),
        __metadata("design:type", Object)
    ], EditableMetadataView.prototype, "inputElement", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "icon", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "text", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], EditableMetadataView.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "blankText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], EditableMetadataView.prototype, "allowBlank", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], EditableMetadataView.prototype, "canEdit", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "type", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], EditableMetadataView.prototype, "save", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], EditableMetadataView.prototype, "saveAddress", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "address", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "city", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "state", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "zip", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "country", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], EditableMetadataView.prototype, "options", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "optionId", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "optionDescription", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "optionText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], EditableMetadataView.prototype, "optionCreate", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], EditableMetadataView.prototype, "createOption", void 0);
    EditableMetadataView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: '.improvplus-editable-metadata',
            templateUrl: '../template/view/editable-metadata.view.html'
        }),
        __metadata("design:paramtypes", [])
    ], EditableMetadataView);
    return EditableMetadataView;
}());
exports.EditableMetadataView = EditableMetadataView;

//# sourceMappingURL=editable-metadata.view.js.map
