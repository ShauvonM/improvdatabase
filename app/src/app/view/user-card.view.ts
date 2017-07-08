import { 
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

import 'rxjs/Subscription';
import { Subscription } from 'rxjs/Subscription';

import { TextUtil } from '../../util/text.util';
import { TimeUtil } from '../../util/time.util';

import { UserService } from '../../service/user.service';

import { User } from '../../model/user';
import { Team } from '../../model/team';

@Component({
    moduleId: module.id,
    selector: '.id-user-card',
    templateUrl: '../template/view/user-card.view.html'
})
export class UserCardView implements OnInit, OnDestroy {
    private _timeUtil = TimeUtil;

    @Input() user: User;
    @Input() team: Team;

    @Output() removeUserFromTeam: EventEmitter<User> = new EventEmitter();
    @Output() promoteUser: EventEmitter<User> = new EventEmitter();
    @Output() demoteUser: EventEmitter<User> = new EventEmitter();
    
    admin: boolean;
    userIsMe: boolean;
    amIAdmin: boolean;

    descriptionText: string;

    constructor(
        private userService: UserService
    ) { }

    ngOnInit(): void {

        this.descriptionText = TextUtil.stripTags(this.user.description);

        this.userIsMe = this.user._id == this.userService.getLoggedInUser()._id;

        if (this.team) {
            let teamId = this.team._id;

            this.admin = this.userService.isUserAdminOfTeam(this.user, this.team);
            this.amIAdmin = this.userService.isAdminOfTeam(this.team);
        }
    }

    ngOnDestroy(): void {
        
    }

    _removeUser(): void {
        this.removeUserFromTeam.emit(this.user);
    }

    _promoteUser(): void {
        this.promoteUser.emit(this.user);
    }

    _demoteUser(): void {
        this.demoteUser.emit(this.user);
    }


}
