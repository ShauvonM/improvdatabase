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

import { Address } from '../../model/address';
import { GameMetadata } from '../../model/game-metadata';

export class DropdownOption {
    [key:string]: any;

    name: string;
    _id: string;
    icon?: string;
    description?: string;
}

@Component({
    moduleId: module.id,
    selector: '.id-editable-metadata',
    templateUrl: '../template/view/editable-metadata.view.html'
})
export class EditableMetadataView implements OnInit, OnChanges {

    @ViewChild('metadataInput') inputElement: any;

    @Input() icon: string; // an icon to show if necessary
    @Input() text: string; // the text to show by default
    @Input() model: string|GameMetadata|DropdownOption; // pass an object if you want, this will try to use the name property if it exists
    @Input() blankText: string; // the fallback text to show if there is no text
    @Input() allowBlank: boolean = true;
    @Input() canEdit: boolean; // whether the user can edit this thing

    @Input() type: string; // 'text' 'address' or 'dropdown'

    @Output() save: EventEmitter<any> = new EventEmitter(); // called when the item saves
    @Output() saveAddress: EventEmitter<Address> = new EventEmitter(); // called when the address saves

    editShown: boolean;

    editModel: string;

    // these properties are for address types
    @Input() address: string;
    @Input() city: string;
    @Input() state: string;
    @Input() zip: string;
    @Input() country: string;

    // for dropdowns, the items to show
    @Input() options: DropdownOption[]|GameMetadata[];
    @Input() optionId: string = '_id'; // the property to use as the ID for each option
    @Input() optionDescription: string = 'description'; // the property to use as the title attribute on each option
    @Input() optionText: string = 'name'; // the property to use to get the text for each option
    @Input() optionCreate: boolean = false; // whether to allow creating new dropdown options

    @Output() createOption: EventEmitter<boolean> = new EventEmitter(); // should trigger a dialog or something to create a new option

    private _defaultOptionSelected: boolean;

    constructor(
    ) { }

    ngOnInit(): void {
        if (!this.type) {
            if (this.address) {
                this.type = 'address';
            } else if (this.options) {
                this.type = 'dropdown';
            } else {
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
    }

    setupDropdown(): void {
        if (this.model && (<DropdownOption> this.model).name) {
            this.text = (<DropdownOption> this.model).name;
            this.icon = (<DropdownOption> this.model).icon;
        } else if (!this.allowBlank) {
            this.text = this.options[0].name;
            this.icon = this.options[0].icon;
        }
    }

    ngOnChanges(changes: any): void {
        if (changes.model && this.model && this.text != (<DropdownOption> this.model).name && this.model.hasOwnProperty('name')) {
            this.text = (<DropdownOption> this.model).name;

            if (!this.icon && (<DropdownOption> this.model).icon) {
                this.icon = (<DropdownOption> this.model).icon;
            }
        } else if (changes.options && changes.options.previousValue) {
            if (this._defaultOptionSelected) {
                this.model = this.options[0];
            }
            this.setupDropdown();
        }
    }

    private _focusInput(): void {
        if (this.inputElement) {
            (<HTMLInputElement> this.inputElement.nativeElement).focus();
        }
    }

    setupAddress(): void {
        let address = this.address || '',
            city = this.city || '',
            state = this.state || '',
            zip = this.zip || '',
            country = this.country || '';

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

    showEdit(): void {
        if (this.canEdit) {
            if (this.model) {
                this.editModel = this.optionId ? (<GameMetadata|DropdownOption> this.model)[this.optionId] : this.text;
            } else {
                this.editModel = this.text
            }

            this.editShown = true;
            setTimeout(() => {
                this._focusInput();
            })
        }
    }

    closeEdit(): void {
        this.editShown = false;
        if (this.model) {
            this.editModel = this.optionId ? (<GameMetadata|DropdownOption> this.model)[this.optionId] : this.text;
        } else {
            this.editModel = this.text
        }
    }

    pressEnter(): void {
        (<HTMLInputElement> this.inputElement.nativeElement).blur();
    }

    saveEdit(): void {
        if (this.type == 'address') {
            this.setupAddress();
            this.saveAddress.emit({
                address: this.address,
                city: this.city,
                state: this.state,
                zip: this.zip,
                country: this.country
            });
        } else if (this.type == 'dropdown') {
            if (this.editModel == '-1') {
                // create a new thing!
                this.text = '';
                this.createOption.emit(true);
            } else {
                let selection: any;
                if (this.optionId) {
                    (<DropdownOption[]> this.options).forEach(option => {
                        if (option[this.optionId] == this.editModel) {
                            selection = option;
                        }
                    });
                } else {
                    selection = this.editModel;
                }
                this.text = this.optionText ? selection[this.optionText] : selection;
                if (selection.icon) {
                    this.icon = selection.icon;
                }
                this.model = selection;
                this.save.emit(selection);
            }
        } else if (this.editModel && this.editModel != this.text) {
            this.text = this.editModel;
            this.save.emit(this.editModel);
        }

        this.closeEdit();
    }
}
