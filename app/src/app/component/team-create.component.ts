import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent} from '../../component/app.component';
import { AppService } from '../../service/app.service';
import { TeamService } from '../service/team.service';
import { UserService } from '../../service/user.service';

import { Tool } from '../view/toolbar.view';
import { Team } from '../../model/team';

@Component({
    moduleId: module.id,
    selector: "team-create",
    templateUrl: "../template/team-create.component.html"
})
export class TeamCreateComponent implements OnInit {

    teamName: string;

    isPosting: boolean = false;

    nameError: string;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private _service: AppService,
        private teamService: TeamService,
        private userService: UserService
    ) { }

    _tools: Tool[] = [
    ]

    ngOnInit(): void {

        this._app.showBackground(true);

    }

    createTeam(): void {
        this.isPosting = true;

        let team = new Team();
        team.name = this.teamName;

        // TODO: a toggle to set whether the team has its own email address, or just use the current users?

        this.teamService.createTeam(team)
            .then(team => {
                this.userService.addAdminTeam(team);
                this.router.navigate(['app', 'team', team._id]);
            })
            .catch(e => {
                let data = e.json();
                if (data.conflict == 'name') {
                    this.nameError = 'A team with that name is already registered on the database.';
                } else {
                    this.nameError = 'An error occurred. Please try again.';
                }
                this.isPosting = false;
            })
    }

}
