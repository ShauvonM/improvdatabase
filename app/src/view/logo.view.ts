import { 
    Component,
    OnInit,
    OnDestroy,
    Input
} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'logo',
    templateUrl: '../template/view/logo.view.html'
})
export class LogoView implements OnInit, OnDestroy {
    @Input() white: boolean;
    @Input() text: String;

    hover: boolean;

    constructor(
    ) { }

    ngOnInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

    over(): void {
        this.hover = true;
    }

    out(): void {
        this.hover = false;
    }
}
