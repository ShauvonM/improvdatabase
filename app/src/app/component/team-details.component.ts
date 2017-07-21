import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location, PathLocationStrategy } from '@angular/common';

import { ColorPickerService } from 'ngx-color-picker';

import { COLORS } from '../../constants';

import {AppComponent} from '../../component/app.component';
import { Tool } from '../view/toolbar.view';

import { TabData } from '../../model/tab-data';

import { User } from '../../model/user';
import { Team } from '../../model/team';
import { Purchase } from '../../model/purchase';
import { Invite } from '../../model/invite';
import { Subscription } from '../../model/subscription';

import { Address } from '../view/editable-metadata.view';

import { UserService } from '../../service/user.service';
import { TeamService } from '../service/team.service';
import { AppService } from '../../service/app.service';

import { TimeUtil } from '../../util/time.util';
import { TextUtil } from '../../util/text.util';
import { Util } from '../../util/util';

import { GameNoteService } from '../service/game-note.service';
import { Note } from '../../model/note';

import { DialogAnim, ToggleAnim } from '../../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "team-details",
    templateUrl: "../template/team-details.component.html",
    animations: [DialogAnim.dialog]
})
export class TeamDetailsComponent implements OnInit {
    [index: string]: any;

    title: string;

    @Input() team: Team;
    user: User;

    tabs: TabData[] = [
        {
            name: 'Team Details',
            id: 'team',
            icon: 'users'
        },
        {
            name: 'Team Notes',
            id: 'notes',
            icon: 'sticky-note'
        },
        {
            name: 'Members',
            id: 'members',
            icon: 'user-plus'
        },
        {
            name: 'Settings',
            id: 'settings',
            icon: 'sliders'
        }
    ];

    selectedTab: string = 'team';

    private adminActions = [
        'team_subscription_invite',
        'team_invite',
        'team_edit',
        'team_user_promote',
        'team_purchases_view'
    ]

    address: string;

    selectedUser: User;

    isPosting: boolean;

    descriptionHtml: string;

    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;

    notes: Note[] = [];

    constructor(
        public _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private _service: AppService,
        private userService: UserService,
        private teamService: TeamService,
        private noteService: GameNoteService,
        private pathLocationStrategy: PathLocationStrategy,
        private _location: Location
    ) { }

    _tools: Tool[] = [
        {
            icon: "fa-sign-out",
            name: "leave",
            text: "Leave Company",
            active: false
        }
    ]

    _timeUtil = TimeUtil;

    ngOnInit(): void {
        this.user = this.userService.getLoggedInUser();

        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            this.getTeam(id);
        });
    }

    onToolClicked(tool: Tool): void {
        switch (tool.name) {
            case "leave":
                this.leave();
                break;
        }
    }

    goBack(): void {
        this._location.back();
    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
    }

    getDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    getTime(date: string): string {
        return TimeUtil.simpleTime(date);
    }

    getTeam(id: string): void {
        this.teamService.getTeam(id)
            .then(team => this.setTeam(team));
    }

    can(action: string): boolean {
        let can = this.userService.can(action);

        if (this.adminActions.indexOf(action)) {
            return can && this.isUserAdmin();
        } else {
            return can;
        }
    }

    isUserAdmin(): boolean {
        return this.userService.isAdminOfTeam(this.team);
    }

    setTeam(team: Team): void {
        this.team = team;

        this.primaryColor = team.primaryColor;
        this.secondaryColor = team.secondaryColor;
        this.tertiaryColor = team.tertiaryColor;

        this.renderDescription();

        this.noteService.getNotesForTeam(this.team).then(notes => {
            this.notes = notes;
        });

        this.setCurtain();
    }

    private setCurtain() {
        this.title = this.team.name;
        this._app.setCurtain({
            text: this.title,
            background: this.primaryColor,
            color: this.secondaryColor
        });
    }

    renderDescription(): void {
        this.descriptionHtml = TextUtil.renderDescription(this.team.description);
    }

    private _saveTeam(): void {
        this.teamService.saveTeam(this.team);
        this.setCurtain();
    }

    saveEditName(name: string): void {
        this.team.name = name;
        this._saveTeam();
    }

    saveEditPhone(phone: string): void {
        this.team.phone = phone;
        this._saveTeam();
    }

    saveEditEmail(email: string): void {
        this.team.email = email;
        this._saveTeam();
    }

    saveEditUrl(url: string): void {
        this.team.url = url;
        this._saveTeam();
    }

    saveEditAddress(address: Address): void {
        this.team.address = address.address;
        this.team.city = address.city;
        this.team.state = address.state;
        this.team.zip = address.zip;
        this.team.country = address.country;

        this._saveTeam();
    }

    newDescriptionText: string;
    editDescriptionShown: boolean;
    showEditDescription(): void {
        if (this.can('team_edit')) {
            this.newDescriptionText = this.team.description;
            this.editDescriptionShown = true;
        }
    }

    cancelDescription(): void {
        this.editDescriptionShown = false;
    }

    saveDescription(): void {
        this.team.description = this.newDescriptionText;
        this._saveTeam();
        this.cancelDescription();
        this.renderDescription();
    }

    selectUser(user: User): void {
        if (this.selectedUser !== user) {
            this.selectedUser = user;
        } else {
            this.selectedUser = null;
        }
    }

    showInviteDialog: boolean;
    inviteEmail: string;
    inviteStatus: string;
    inviteModel: Invite;
    inviteError: string;

    selectedInvite: Invite;

    invite(): void {
        this._app.backdrop(true);

        this.showInviteDialog = true;
        this.inviteEmail = '';
        this.inviteError = '';
    }

    cancelInviteDialog(): void {
        this._app.backdrop(false);
        
        this.showInviteDialog = false;
        this.inviteStatus = '';
    }

    submitInvite(): void {
        this.isPosting = true;
        this.inviteError = '';

        this.teamService.invite(this.team, this.inviteEmail)
            .then(invite => {
                this.team.invites.push(invite);

                this.isPosting = false;
                this.inviteStatus = 'wait';
                this.inviteModel = invite;
                if (invite) {
                    setTimeout(() => {
                        if (!invite.inviteUser || this.userService.isExpired(invite.inviteUser)) {
                            this.inviteStatus = 'new';
                        } else {
                            this.inviteStatus = 'exists';
                        }
                    }, 300);
                }
            }, error => {
                this.isPosting = false;
                let response = error.json();
                if (response.error && response.error == 'invite already exists') {
                    this.inviteError = 'That email address has already been invited to ' + this.team.name + '.';
                } else if (response.error && response.error == 'out of subscriptions') {
                    this.inviteError = 'Your team is out of subscriptions, so you cannot invite that user until you purchase more (or until they purchase a subscription on their own).'
                } else {
                    this.inviteError = 'There was some sort of problem sending that invite.';
                }
            })
    }

    selectInvite(invite: Invite): void {
        if (this.selectedInvite && this.selectedInvite._id == invite._id) {
            this.selectedInvite = null;
        } else {
            this.selectedInvite = invite;
        }
    }

    cancelInvite(invite: Invite): void {
        this.selectedInvite = invite;
        this._app.dialog('Cancel an Invitation', 'Are you sure you want to revoke your invitation to ' + invite.email + '? We already sent them the invite, but the link inside will no longer work. We will not notify them that it was cancelled.', 'Yes',
            () => {
                this.userService.cancelInvite(invite).then(done => {
                    if (done) {
                        let index = Util.indexOfId(this.team.invites, invite);

                        if (index > -1) {
                            this.team.invites.splice(index, 1);
                        }
                    }
                })
            });
    }

    leave(): void {
        let body = `
            <p>Are you sure you want to leave this team? You will no longer have access to any of the team's resources.</p>
        `;

        this._app.dialog('Leave ' + this.team.name + '?', body, 'Yes', () => {

            this.userService.leaveTeam(this.team).then(user => {

                this.router.navigate(['/app/dashboard']);

                setTimeout(() => {
                    this._app.dialog('It is done', 'You have successfully left ' + this.team.name + '.');
                }, 500);

            });

        });
    }

    getUserName(user: User): string {
        return user.firstName ? user.firstName : 'this user';
    }

    removeUserFromTeam(user: User): void {
        this._app.dialog('Remove ' + this.getUserName(user) + ' from the Company?',
            'Are you sure you want to remove them from the Company?', 'Yes', () => {
                this.teamService.removeUserFromTeam(this.team, user).then(team => {
                    this.setTeam(team);
                });
            });
    }

    promoteUser(user: User): void {
        this._app.dialog('Promote ' + this.getUserName(user) + ' to Company Admin?',
            'As a Company Admin, they will be able to view the Company\'s purchase history, add or remove users, and make purchases for the Company.', 'Yes',
            () => {
                this.teamService.promoteUser(this.team, user).then(team => {
                    this.setTeam(team);
                });
            });
    }

    demoteUser(user: User): void {
        this._app.dialog('Demote ' + this.getUserName(user) + '?',
            'This user will no longer have Company Admin privelages.', 'Yes',
            () => {
                this.teamService.demoteUser(this.team, user).then(team => {
                    this.setTeam(team);
                });
            });
    }

    // settings

    setColor(color: string, which: string): void {
        this[which + 'Color'] = color;

        this.setCurtain();
    }
    saveColor(open: boolean, which: string): void {
        let index = which + 'Color',
            whichColor = this[index];

        // TODO: figure out a better way to ignore that default ( do we need to? )
        if (!open && whichColor != this.team[index]) {
            // the selector has been closed, and it was set to a color that isn't already the team's color
            this.team[index] = whichColor;
            this._saveTeam();
        }
    }

}
