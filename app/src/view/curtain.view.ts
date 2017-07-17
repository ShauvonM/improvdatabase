import { 
    Component,
    OnInit,
    OnDestroy,
    Input
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AppComponent } from '../component/app.component';

import { ToggleAnim } from '../util/anim.util';

export interface CurtainInterface {
    background?: string;
    text?: string;
    color?: string;
}

@Component({
    moduleId: module.id,
    selector: 'id-curtain',
    templateUrl: '../template/view/curtain.view.html',
    animations: [ToggleAnim.bubble],
    host: {
        '[class.curtain]': 'true',
        '[style.top]': "(scrollpos * 0.75) + 'px'",
        '[style.background-color]': 'background'
    }
})
export class CurtainView implements OnInit, OnDestroy, CurtainInterface {
    
    // [style.top]="(scrollpos * 0.75) + 'px'"
    // [style.background-color]="curtainBackground"
    scrollpos: number;

    @Input() background: string;
    @Input() text: string;
    @Input() color: string;

    scrollSub: Subscription;

    constructor(
        private _app: AppComponent
    ) { }

    ngOnInit(): void {
        this.scrollSub = this._app.onScroll$.subscribe(pos => this.scrollpos = pos);
    }

    ngOnDestroy(): void {
        this.scrollSub.unsubscribe();
    }

}
