import {
    Directive,
    ElementRef,
    OnInit,
    Input,
    Output,
    EventEmitter,
    Renderer2,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[formSwitch]',
    providers: [NgModel],
    host: {
        '(ngModelChange)': 'onModelChange($event)'
    }
})
export class FormSwitchDirective implements OnInit, OnChanges {

    inputElement: HTMLInputElement;

    wrapper: HTMLSpanElement;
    control: HTMLSpanElement;
    partial: HTMLElement;

    @Input('partial') partialActive: boolean;

    // private _on: boolean;

    constructor(
        el: ElementRef,
        private renderer: Renderer2,
        private model: NgModel
        ) {
        this.inputElement = el.nativeElement;
    }

    ngOnInit(): void {
        let classes = this.inputElement.className;

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

        let clickHandler;
        if (this.wrapper.parentElement.tagName.toLowerCase() == 'label') {
            clickHandler = this.wrapper.parentElement;
        } else {
            clickHandler = this.wrapper;
        }

        this.renderer.listen(clickHandler, 'click', e => this.click(e));

        setTimeout(() => {
            if (this.model.model) {
                this.wrapper.classList.add('on');
            }
        }, 50);
    }

    ngOnChanges(changes: any): void {
        if (changes.partialActive && changes.partialActive.currentValue) {
            this.partial = document.createElement('i');
            this.partial.className = 'fa fa-asterisk';
            this.control.appendChild(this.partial);
        } else if (changes.partialActive && this.partial) {
            this.partial.remove();
            this.partial = null;
        }
    }

    onModelChange(model: boolean): void {
        if (model) {
            this.wrapper.classList.add('on');
        } else {
            this.wrapper.classList.remove('on');
        }
    }

    check(): void {
        setTimeout(() => {
            this.onModelChange(this.model.model);
        });
    }

    click(event: MouseEvent): void {        
        this.inputElement.checked = !this.model.model;
        this.inputElement.dispatchEvent(new Event('change'));

        event.preventDefault();
    }
    
}