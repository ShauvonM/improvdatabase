import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent} from '../../component/app.component';
import { Tool } from '../view/toolbar.view';
import { Team } from '../../model/team';

import { TeamService } from '../service/team.service';

import { TimeUtil } from '../../util/time.util';

@Component({
    moduleId: module.id,
    selector: "team-list",
    templateUrl: "../template/team-list.component.html"
})
export class TeamListComponent implements OnInit {

    title: string = 'Your Teams';

    memberOfTeams: Team[];
    adminOfTeams: Team[];

    constructor(
        public _app: AppComponent,
        private _router: Router,
        private teamService: TeamService
    ) { }

    _tools: Tool[] = [
    ]

    ngOnInit(): void {
        this.teamService.fetchTeams().then(u => {
            this.memberOfTeams = <Team[]> u.memberOfTeams;
            this.adminOfTeams = <Team[]> u.adminOfTeams;
        });
    }

    selectTeam(team: Team): void {
        this._router.navigate(['/app/team', team._id]);
    }

    getDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    getTime(date: string): string {
        return TimeUtil.simpleTime(date);
    }

}
