import { 
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

import 'rxjs/Subscription';
import { Subscription } from 'rxjs/Subscription';

import { TimeUtil } from '../../util/time.util';

import { TeamService } from '../service/team.service';
import { Team } from '../../model/team';

@Component({
    moduleId: module.id,
    selector: '.id-team-card',
    templateUrl: '../template/view/team-card.view.html',
    host: {
        '[class.card]': 'true'
    }
})
export class TeamCardView implements OnInit {

    @Input() team: Team;
    @Input() admin: boolean;

    @Output() selectTeam: EventEmitter<Team> = new EventEmitter();

    constructor(
        private teamService: TeamService
    ) { }

    ngOnInit(): void {

        
    }

    private _selectTeam(team: Team): void {
        this.selectTeam.emit(team);
    }

    getDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    getTime(date: string): string {
        return TimeUtil.simpleTime(date);
    }

}
