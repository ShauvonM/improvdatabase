import { 
    Component,
    OnInit,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef
} from '@angular/core';

import { Util } from '../../util/util';
import { TimeUtil } from '../../util/time.util';

// this is designed to work with models pulled from Mongo (like the GameMetadata model)
export interface Option {
    name: string; // the text to display for this item
    _id: string; // the unique id for this item, perhaps inherited from Mongo
    icon?: string; // if set, will show a specific icon for that item
    description?: string; // if set, will serve as the 'title' parameter on the option
}

export interface Address {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface DateInput {
    month: number;
    day: number;
    year: number;
}

@Component({
    moduleId: module.id,
    selector: '.id-editable-metadata',
    templateUrl: '../template/view/editable-metadata.view.html'
})
export class EditableMetadataView implements OnInit, OnChanges {

    @ViewChild('metadataInput') inputElement: any;

    @Input() type: 'text'|'address'|'dropdown'|'date' = 'text';

    /**
     * Standard options
     */
    @Input() icon: string; // an icon to show if necessary
    @Input() text: string; // the text to show when not editing
    @Input() blankText: string; // the fallback text to show if there is no text
    @Input() canEdit: boolean; // whether the user can edit this thing

    @Input() model: string|Option; // the selected object
        // for dropdowns, this will be the _id of the selected option (or the selected option itself)
        // for text, this is the user input
        // for date, you can pass in a date object, an ISO string, or a Unix epoch time (as a string)
        // address type doesn't use this

    /**
     * Address type input
     * We take an object as input, and then convert it to an internal property
     */
    @Input() address: Address;
    useAddress: Address;

    /**
     * Dropdown type options
     */
    @Input() options: string[]|Option[]; // options to show in the dropdown
    @Input() optionCreate: boolean = false; // whether to allow creating new dropdown options
    @Input() allowBlank: boolean = true; // if false, the default text will come from the first option

    /**
     * Date type input, for manually setting the date (you can use the model input to pass a timestamp)
     * Like address, we take an object as input, and convert it to an internal property
     */
    @Input() date: DateInput|Date;
    useDate: DateInput;

    /**
     * Events
     */
    @Output() save: EventEmitter<string|Option> = new EventEmitter(); // called when the item saves
    @Output() saveAddress: EventEmitter<Address> = new EventEmitter(); // called when the address saves
    @Output() createOption: EventEmitter<boolean> = new EventEmitter(); // should trigger a dialog or something to create a new option

    /**
     * Internal properties
     */
    editShown: boolean; // if true, the control is shown, if false, the 'text' object is shown
    useOptions: Option[]; // the options to actually show in the dropdown (digested from the input)
    useModel: string|Option; // a clone of the model to actually use in the template, so we can revert changes if necessary

    private _defaultOptionSelected: boolean; // just in case we pick a default option, we can remember that

    constructor(
    ) { }

    ngOnInit(): void {
        // automatically figure out the type, if possible
        if (this.address) {
            this.type = 'address';
        } else if (this.options) {
            this.type = 'dropdown';
        } else if (this.date) {
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
                this.text = <string> this.model;
            } else if (!this.model && this.text) {
                this.model = this.text;
            }
        } else if (this.type == 'address') {
            this.setupAddress();
        } else if (this.type == 'dropdown' && !this.model) {
            if (!this.allowBlank) {
                // initially we want to set the default option here to make sure it is set
                this.model = this.useOptions[0]._id;
                this._defaultOptionSelected = true;
            }
            this.setupDropdown();
        } else if (this.type == 'date') {
            this.setupDate();
        }

        // if we went through any setup and still don't have any text to display, only now do we use the blank text
        // if (!this.text && this.allowBlank) {
        //     this.text = this.blankText;
        //     this.model = '';
        // }
    }

    ngOnChanges(changes: any): void {
        // if the model changes externally, we should react to it
        let selection = this._getSelectedOption();

        if (changes.model 
                && this.model 
                && selection
                && selection.name !== this.text) {
            // the model has changed externally, so we should react to that
            
            // reset the text and icon
            // this method works even if we aren't a dropdown
            this.setupDropdown();

        } else if (changes.options && changes.options.previousValue) {
            // the options have changed, so we have to update our internal values
            this.digestOptions();
            if (this._defaultOptionSelected) {
                // reset the selection because the first item might have changed
                this.model = this.useOptions[0]._id;
            }
            this.setupDropdown();
        }
    }

/** UTILITY METHODS */
    /**
     * Ensures that the internal useOptions array is an array of DropdownOption objects
     * @param options an array of either strings or dropdownoptions
     */
    private digestOptions(): void {
        this.useOptions = [];
        if (this.options && this.options.length) {
            if ((<Option> this.options[0])._id) {
                this.useOptions = <Option[]> this.options;
            } else {
                (<string[]> this.options).forEach(o => {
                    this.useOptions.push({
                        name: o.toString(),
                        _id: o.toString()
                    });
                });
            }
        }
    }

    /**
     * Convert the Address input object into the internal string properties
     */
    private digestAddress(): void {
        if (this.address) {
            this.useAddress = {
                address: this.address.address,
                city: this.address.city,
                state: this.address.state,
                zip: this.address.zip,
                country: this.address.country
            }
        }
    }

    private digestDate(): void {
        if (this.date && ((<DateInput> this.date).month)) {
            let date = <DateInput> this.date;
            this.useDate = {
                month: date.month,
                day: date.day,
                year: date.year
            };
        } else if ((this.type == 'date' && this.model)
                    || (this.date && (<Date> this.date).getTime)) {

            let date;
            if (this.date) {
                date = <Date> this.date;
            } else {
                if (!isNaN(parseInt(<string> this.model))) {
                    // we can assume this is a unix epoch timestamp
                    date = new Date(parseInt(<string> this.model));
                } else {
                    // hopefully it's some sort of date parseable string
                    date = new Date(<string> this.model);
                }
            }
            this.useDate = {
                month: date.getMonth(),
                day: date.getDate(),
                year: date.getFullYear()
            };
        }
    }

    /** Sets focus in the input element (fancy that) */
    private _focusInput(): void {
        if (this.inputElement) {
            (<HTMLInputElement> this.inputElement.nativeElement).focus();
        }
    }

    /** Triggers a blur on the input element when the user hits enter */
    pressEnter(): void {
        (<HTMLInputElement> this.inputElement.nativeElement).blur();
    }

    /**
     * Returns the selected dropdown option (or null), using the internal model property
     * This method handles converting the model into a DropdownOption
     */
    private _getSelectedOption(): Option {
        if (this.model) {
            if ((<Option> this.model)._id && (<Option> this.model).name) {
                return <Option> this.model;
            }else if (this.type == 'dropdown') {
                let index = Util.indexOfId(this.useOptions, this.model);
                if (index > -1) {
                    return this.useOptions[index];
                }
            } else {
                // if this isn't a dropdown, the model is just a string, so we just need it
                return {
                    _id: <string> this.model,
                    name: <string> this.model
                };
            }
        }
    }
/** */


/** SETUP METHODS
 *  These generate the text and icon properties for any types that need to be set up
 *  They should leave this.text blank - don't fall back on the blankText here
 */
    /**
     * Generates the text to display from the passed address data
     */
    setupAddress(): void {
        if (this.useAddress) {
            let address = this.useAddress.address || '',
                city = this.useAddress.city || '',
                state = this.useAddress.state || '',
                zip = this.useAddress.zip || '',
                country = this.useAddress.country || '';

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
    }

    /**
     * Generate the text and icon from the selected dropdown option
     */
    setupDropdown(): void {
        let selection = this._getSelectedOption();
        if (selection) {
            // this means something is actually selected, so we can show its info
            this.text = selection.name;
            this.icon = selection.icon || this.icon;
        } else if (!this.allowBlank) {
            // if we can't have blank, we should default to the first option
            this.text = this.useOptions[0].name;
            this.icon = this.useOptions[0].icon || this.icon;
        } else {
            // we're blank
            this.text = '';
        }
    }

    /**
     * Set up the text with the currently set date info
     */
    setupDate(): Date {
        if (this.useDate) {
            let date = new Date();
            date.setTime(0); // reset the time
            date.setMonth(this.useDate.month);
            date.setDate(this.useDate.day);
            date.setFullYear(this.useDate.year);

            this.text = TimeUtil.simpleDate(date);
            return date;
        } else {
            this.text = '';
            return null;
        }
    }
/** END OF SETUP */

/** UX METHODS */
    /**
     * Toggle the UI to show the edit controls instead of the text property
     */
    showEdit(): void {
        if (this.canEdit) {
            // we will actually edit a copy of the stored model, so we can revert it if we want
            this.useModel = (<Option> this.model)._id || this.model;

            this.editShown = true;
            setTimeout(() => {
                this._focusInput();
            })
        }
    }

    /**
     * Resets the control, reverting any changes
     */
    closeEdit(): void {
        this.editShown = false;
        // discard changes
        this.useModel = '';
        // this will revert the address params
        this.digestAddress();
        // this will revert the date params
        this.digestDate();
    }

    /**
     * Saves the user's input and then broadcasts the new value to the output
     */
    saveEdit(): void {
        if (this.type == 'address') {
            // update the displayed text
            this.setupAddress();
            // output the new values
            this.saveAddress.emit(this.useAddress);
            this.address = this.useAddress;
        } else if (this.type == 'dropdown') {
            if (this.useModel == '-1') {
                // create a new thing!
                this.text = '...';
                this.createOption.emit(true);
            } else {
                this.model = this.useModel;
                this._defaultOptionSelected = false;

                this.setupDropdown();

                this.save.emit(this._getSelectedOption());
            }
        } else if (this.type == 'date') {
            
            let date = this.setupDate();
            // just to avoid too many translations, we can just output the unix timestamp as a string
            this.save.emit(date.getTime().toString());
            this.date = this.useDate;

        } else if (this.useModel && this.useModel != this.model) {
            this.model = this.useModel;
            this.text = <string> this.model;
            this.save.emit(this.model);
        }

        this.closeEdit();
    }
}
