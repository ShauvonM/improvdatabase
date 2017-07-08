import { 
    Component,
    OnInit,
    OnDestroy,
    Input
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AppComponent } from '../component/app.component';

@Component({
    moduleId: module.id,
    selector: 'landing-hero',
    templateUrl: '../template/view/landing-hero.view.html'
})
export class LandingHeroView implements OnInit, OnDestroy {

    @Input() showContent: boolean = true;
    @Input() improv: boolean = false;
    @Input() video: boolean = true;

    bgheight: string;
    bgwidth: string;

    scrollSubscription: Subscription;
    
    toolbarheight = 48;
    pageStart = window.innerHeight - (this.toolbarheight + 24);
    pagepos: number = this.pageStart;

    constructor(
        private _app: AppComponent
    ) { }

    ngOnInit(): void {
        this.setupSize();

        this.scrollSubscription = this._app.onScroll$.subscribe(scrollPos => {
            this.pagepos = this.pageStart - scrollPos;
        });
    }

    ngOnDestroy(): void {
        this.scrollSubscription.unsubscribe();
    }

    scrollBelowLanding(): void {
        this._app.scrollTo(this.pageStart - 10, 800);
    }

    setupSize(): void {
        let windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            targetWidth = (windowHeight * 2500) / 1667;

        if (windowWidth < targetWidth) {
            this.bgheight = windowHeight + 'px';
            this.bgwidth = 'auto';
        } else {
            this.bgheight = 'auto';
            this.bgwidth = windowWidth + 'px';
        }
    }

}
