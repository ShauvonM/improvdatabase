import {
    Directive,
    ElementRef,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AppComponent } from '../component/app.component';

@Directive({
    selector: '.scroll',
    host: {
        '(scroll)': 'calculateShadows()'
    }
})
export class ScrollShadowDirective implements OnInit, OnDestroy {

    element: HTMLElement;

    wrapper: HTMLDivElement;

    topShadow: HTMLDivElement;
    bottomShadow: HTMLDivElement;

    constructor(
        private _elementRef: ElementRef
    ) {
        this.element = _elementRef.nativeElement;
    }

    ngOnInit() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'scroll-wrapper';

        this.element.parentElement.insertBefore(this.wrapper, this.element);
        this.wrapper.appendChild(this.element);

        this.topShadow = document.createElement('div');
        this.topShadow.className = 'shadow-top';

        this.bottomShadow = document.createElement('div');
        this.bottomShadow.className = 'shadow-bottom';

        this.wrapper.appendChild(this.topShadow);
        this.wrapper.appendChild(this.bottomShadow);

        setTimeout(() => {
            this.calculateShadows();
        });
    }

    ngOnDestroy() {
        
    }

    calculateShadows() {

        let scrollHeight = this.element.scrollHeight,
            height = this.element.offsetHeight,
            scrollPos = this.element.scrollTop,
            std = 16,
            factor = scrollPos / (scrollHeight - height);

        if (scrollHeight == height) {
            this.topShadow.style.height = '0px';
            this.bottomShadow.style.height = '0px';
        } else {
            this.topShadow.style.height = (std * factor) + 'px';
            this.bottomShadow.style.height = (std - (std * factor)) + 'px';
        }

    }
}