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
var util_1 = require("../../util/util");
var time_util_1 = require("../../util/time.util");
var EditableMetadataView = (function () {
    function EditableMetadataView() {
        this.type = 'text';
        this.optionCreate = false; // whether to allow creating new dropdown options
        this.allowBlank = true; // if false, the default text will come from the first option
        /**
         * Events
         */
        this.save = new core_1.EventEmitter(); // called when the item saves
        this.saveAddress = new core_1.EventEmitter(); // called when the address saves
        this.createOption = new core_1.EventEmitter(); // should trigger a dialog or something to create a new option
    }
    EditableMetadataView.prototype.ngOnInit = function () {
        // automatically figure out the type, if possible
        if (this.address) {
            this.type = 'address';
        }
        else if (this.options) {
            this.type = 'dropdown';
        }
        else if (this.date) {
            this.type = 'date';
        }
        // set up the useOptions array if necessary
        this.digestOptions();
        // digest the address input
        this.digestAddress();
        // digest the date input
        this.digestDate();
        // generate the text to display, based on the type of thing this is
        if (this.type == 'text') {
            // you can set it up with either the text or model options
            if (this.model && !this.text) {
                this.text = this.model;
            }
            else if (!this.model && this.text) {
                this.model = this.text;
            }
        }
        else if (this.type == 'address') {
            this.setupAddress();
        }
        else if (this.type == 'dropdown' && !this.model) {
            if (!this.allowBlank) {
                // initially we want to set the default option here to make sure it is set
                this.model = this.useOptions[0]._id;
                this._defaultOptionSelected = true;
            }
            this.setupDropdown();
        }
        else if (this.type == 'date') {
            this.setupDate();
        }
        // if we went through any setup and still don't have any text to display, only now do we use the blank text
        // if (!this.text && this.allowBlank) {
        //     this.text = this.blankText;
        //     this.model = '';
        // }
    };
    EditableMetadataView.prototype.ngOnChanges = function (changes) {
        // if the model changes externally, we should react to it
        var selection = this._getSelectedOption();
        if (changes.model
            && this.model
            && selection
            && selection.name !== this.text) {
            // the model has changed externally, so we should react to that
            // reset the text and icon
            // this method works even if we aren't a dropdown
            this.setupDropdown();
        }
        else if (changes.options && changes.options.previousValue) {
            // the options have changed, so we have to update our internal values
            this.digestOptions();
            if (this._defaultOptionSelected) {
                // reset the selection because the first item might have changed
                this.model = this.useOptions[0]._id;
            }
            this.setupDropdown();
        }
    };
    /** UTILITY METHODS */
    /**
     * Ensures that the internal useOptions array is an array of DropdownOption objects
     * @param options an array of either strings or dropdownoptions
     */
    EditableMetadataView.prototype.digestOptions = function () {
        var _this = this;
        this.useOptions = [];
        if (this.options && this.options.length) {
            if (this.options[0]._id) {
                this.useOptions = this.options;
            }
            else {
                this.options.forEach(function (o) {
                    _this.useOptions.push({
                        name: o.toString(),
                        _id: o.toString()
                    });
                });
            }
        }
    };
    /**
     * Convert the Address input object into the internal string properties
     */
    EditableMetadataView.prototype.digestAddress = function () {
        if (this.address) {
            this.useAddress = {
                address: this.address.address,
                city: this.address.city,
                state: this.address.state,
                zip: this.address.zip,
                country: this.address.country
            };
        }
    };
    EditableMetadataView.prototype.digestDate = function () {
        if (this.date && (this.date.month)) {
            var date = this.date;
            this.useDate = {
                month: date.month,
                day: date.day,
                year: date.year
            };
        }
        else if ((this.type == 'date' && this.model)
            || (this.date && this.date.getTime)) {
            var date = void 0;
            if (this.date) {
                date = this.date;
            }
            else {
                if (!isNaN(parseInt(this.model))) {
                    // we can assume this is a unix epoch timestamp
                    date = new Date(parseInt(this.model));
                }
                else {
                    // hopefully it's some sort of date parseable string
                    date = new Date(this.model);
                }
            }
            this.useDate = {
                month: date.getMonth(),
                day: date.getDate(),
                year: date.getFullYear()
            };
        }
    };
    /** Sets focus in the input element (fancy that) */
    EditableMetadataView.prototype._focusInput = function () {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
        }
    };
    /** Triggers a blur on the input element when the user hits enter */
    EditableMetadataView.prototype.pressEnter = function () {
        this.inputElement.nativeElement.blur();
    };
    /**
     * Returns the selected dropdown option (or null), using the internal model property
     * This method handles converting the model into a DropdownOption
     */
    EditableMetadataView.prototype._getSelectedOption = function () {
        if (this.model) {
            if (this.model._id && this.model.name) {
                return this.model;
            }
            else if (this.type == 'dropdown') {
                var index = util_1.Util.indexOfId(this.useOptions, this.model);
                if (index > -1) {
                    return this.useOptions[index];
                }
            }
            else {
                // if this isn't a dropdown, the model is just a string, so we just need it
                return {
                    _id: this.model,
                    name: this.model
                };
            }
        }
    };
    /** */
    /** SETUP METHODS
     *  These generate the text and icon properties for any types that need to be set up
     *  They should leave this.text blank - don't fall back on the blankText here
     */
    /**
     * Generates the text to display from the passed address data
     */
    EditableMetadataView.prototype.setupAddress = function () {
        if (this.useAddress) {
            var address = this.useAddress.address || '', city = this.useAddress.city || '', state = this.useAddress.state || '', zip = this.useAddress.zip || '', country = this.useAddress.country || '';
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
        }
    };
    /**
     * Generate the text and icon from the selected dropdown option
     */
    EditableMetadataView.prototype.setupDropdown = function () {
        var selection = this._getSelectedOption();
        if (selection) {
            // this means something is actually selected, so we can show its info
            this.text = selection.name;
            this.icon = selection.icon || this.icon;
        }
        else if (!this.allowBlank) {
            // if we can't have blank, we should default to the first option
            this.text = this.useOptions[0].name;
            this.icon = this.useOptions[0].icon || this.icon;
        }
        else {
            // we're blank
            this.text = '';
        }
    };
    /**
     * Set up the text with the currently set date info
     */
    EditableMetadataView.prototype.setupDate = function () {
        if (this.useDate) {
            var date = new Date();
            date.setTime(0); // reset the time
            date.setMonth(this.useDate.month);
            date.setDate(this.useDate.day);
            date.setFullYear(this.useDate.year);
            this.text = time_util_1.TimeUtil.simpleDate(date);
            return date;
        }
        else {
            this.text = '';
            return null;
        }
    };
    /** END OF SETUP */
    /** UX METHODS */
    /**
     * Toggle the UI to show the edit controls instead of the text property
     */
    EditableMetadataView.prototype.showEdit = function () {
        var _this = this;
        if (this.canEdit) {
            // we will actually edit a copy of the stored model, so we can revert it if we want
            this.useModel = this.model._id || this.model;
            this.editShown = true;
            setTimeout(function () {
                _this._focusInput();
            });
        }
    };
    /**
     * Resets the control, reverting any changes
     */
    EditableMetadataView.prototype.closeEdit = function () {
        this.editShown = false;
        // discard changes
        this.useModel = '';
        // this will revert the address params
        this.digestAddress();
        // this will revert the date params
        this.digestDate();
    };
    /**
     * Saves the user's input and then broadcasts the new value to the output
     */
    EditableMetadataView.prototype.saveEdit = function () {
        if (this.type == 'address') {
            // update the displayed text
            this.setupAddress();
            // output the new values
            this.saveAddress.emit(this.useAddress);
            this.address = this.useAddress;
        }
        else if (this.type == 'dropdown') {
            if (this.useModel == '-1') {
                // create a new thing!
                this.text = '...';
                this.createOption.emit(true);
            }
            else {
                this.model = this.useModel;
                this._defaultOptionSelected = false;
                this.setupDropdown();
                this.save.emit(this._getSelectedOption());
            }
        }
        else if (this.type == 'date') {
            var date = this.setupDate();
            // just to avoid too many translations, we can just output the unix timestamp as a string
            this.save.emit(date.getTime().toString());
            this.date = this.useDate;
        }
        else if (this.useModel && this.useModel != this.model) {
            this.model = this.useModel;
            this.text = this.model;
            this.save.emit(this.model);
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
    ], EditableMetadataView.prototype, "type", void 0);
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
        __metadata("design:type", String)
    ], EditableMetadataView.prototype, "blankText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], EditableMetadataView.prototype, "canEdit", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], EditableMetadataView.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], EditableMetadataView.prototype, "address", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], EditableMetadataView.prototype, "options", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], EditableMetadataView.prototype, "optionCreate", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], EditableMetadataView.prototype, "allowBlank", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], EditableMetadataView.prototype, "date", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], EditableMetadataView.prototype, "save", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], EditableMetadataView.prototype, "saveAddress", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], EditableMetadataView.prototype, "createOption", void 0);
    EditableMetadataView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: '.id-editable-metadata',
            templateUrl: '../template/view/editable-metadata.view.html'
        }),
        __metadata("design:paramtypes", [])
    ], EditableMetadataView);
    return EditableMetadataView;
}());
exports.EditableMetadataView = EditableMetadataView;

//# sourceMappingURL=editable-metadata.view.js.map
