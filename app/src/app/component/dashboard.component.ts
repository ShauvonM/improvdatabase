import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from '../../component/app.component';
import { Tool } from '../view/toolbar.view';

import { UserService } from '../../service/user.service';

import { PreferenceUtil } from '../../util/preference.util';

@Component({
    moduleId: module.id,
    selector: "dashboard",
    templateUrl: "../template/dashboard.component.html"
})
export class DashboardComponent implements OnInit {

    title: string = '<span class="light">improv</span><strong>database</strong>';

    constructor(
        public _app: AppComponent,
        private router: Router,
        public userService: UserService
    ) { }

    _tools: Tool[] = [
    ]

    ngOnInit(): void {
        this._app.showBackground(true);
    }

}
