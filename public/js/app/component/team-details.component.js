"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var app_component_1 = require("../../component/app.component");
var team_1 = require("../../model/team");
var user_service_1 = require("../../service/user.service");
var team_service_1 = require("../service/team.service");
var app_service_1 = require("../../service/app.service");
var time_util_1 = require("../../util/time.util");
var text_util_1 = require("../../util/text.util");
var util_1 = require("../../util/util");
var game_note_service_1 = require("../service/game-note.service");
var anim_util_1 = require("../../util/anim.util");
var TeamDetailsComponent = (function () {
    function TeamDetailsComponent(_app, router, route, _service, userService, teamService, noteService, pathLocationStrategy, _location) {
        this._app = _app;
        this.router = router;
        this.route = route;
        this._service = _service;
        this.userService = userService;
        this.teamService = teamService;
        this.noteService = noteService;
        this.pathLocationStrategy = pathLocationStrategy;
        this._location = _location;
        this.tabs = [
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
        this.selectedTab = 'team';
        this.adminActions = [
            'team_subscription_invite',
            'team_invite',
            'team_edit',
            'team_user_promote',
            'team_purchases_view'
        ];
        this.notes = [];
        this._tools = [
            {
                icon: "fa-sign-out",
                name: "leave",
                text: "Leave Company",
                active: false
            }
        ];
        this._timeUtil = time_util_1.TimeUtil;
    }
    TeamDetailsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.user = this.userService.getLoggedInUser();
        this.route.params.forEach(function (params) {
            var id = params['id'];
            _this.getTeam(id);
        });
    };
    TeamDetailsComponent.prototype.onToolClicked = function (tool) {
        switch (tool.name) {
            case "leave":
                this.leave();
                break;
        }
    };
    TeamDetailsComponent.prototype.goBack = function () {
        this._location.back();
    };
    TeamDetailsComponent.prototype.selectTab = function (tab) {
        this.selectedTab = tab.id;
    };
    TeamDetailsComponent.prototype.getDate = function (date) {
        return time_util_1.TimeUtil.simpleDate(date);
    };
    TeamDetailsComponent.prototype.getTime = function (date) {
        return time_util_1.TimeUtil.simpleTime(date);
    };
    TeamDetailsComponent.prototype.getTeam = function (id) {
        var _this = this;
        this.teamService.getTeam(id)
            .then(function (team) { return _this.setTeam(team); });
    };
    TeamDetailsComponent.prototype.can = function (action) {
        var can = this.userService.can(action);
        if (this.adminActions.indexOf(action)) {
            return can && this.isUserAdmin();
        }
        else {
            return can;
        }
    };
    TeamDetailsComponent.prototype.isUserAdmin = function () {
        return this.userService.isAdminOfTeam(this.team);
    };
    TeamDetailsComponent.prototype.setTeam = function (team) {
        var _this = this;
        this.team = team;
        this.primaryColor = team.primaryColor;
        this.secondaryColor = team.secondaryColor;
        this.tertiaryColor = team.tertiaryColor;
        this.renderDescription();
        this.noteService.getNotesForTeam(this.team).then(function (notes) {
            _this.notes = notes;
        });
        this.setCurtain();
    };
    TeamDetailsComponent.prototype.setCurtain = function () {
        this.title = this.team.name;
        this._app.setCurtain({
            text: this.title,
            background: this.primaryColor,
            color: this.secondaryColor
        });
    };
    TeamDetailsComponent.prototype.renderDescription = function () {
        this.descriptionHtml = text_util_1.TextUtil.renderDescription(this.team.description);
    };
    TeamDetailsComponent.prototype._saveTeam = function () {
        this.teamService.saveTeam(this.team);
        this.setCurtain();
    };
    TeamDetailsComponent.prototype.saveEditName = function (name) {
        this.team.name = name;
        this._saveTeam();
    };
    TeamDetailsComponent.prototype.saveEditPhone = function (phone) {
        this.team.phone = phone;
        this._saveTeam();
    };
    TeamDetailsComponent.prototype.saveEditEmail = function (email) {
        this.team.email = email;
        this._saveTeam();
    };
    TeamDetailsComponent.prototype.saveEditUrl = function (url) {
        this.team.url = url;
        this._saveTeam();
    };
    TeamDetailsComponent.prototype.saveEditAddress = function (address) {
        this.team.address = address.address;
        this.team.city = address.city;
        this.team.state = address.state;
        this.team.zip = address.zip;
        this.team.country = address.country;
        this._saveTeam();
    };
    TeamDetailsComponent.prototype.showEditDescription = function () {
        if (this.can('team_edit')) {
            this.newDescriptionText = this.team.description;
            this.editDescriptionShown = true;
        }
    };
    TeamDetailsComponent.prototype.cancelDescription = function () {
        this.editDescriptionShown = false;
    };
    TeamDetailsComponent.prototype.saveDescription = function () {
        this.team.description = this.newDescriptionText;
        this._saveTeam();
        this.cancelDescription();
        this.renderDescription();
    };
    TeamDetailsComponent.prototype.selectUser = function (user) {
        if (this.selectedUser !== user) {
            this.selectedUser = user;
        }
        else {
            this.selectedUser = null;
        }
    };
    TeamDetailsComponent.prototype.invite = function () {
        this._app.backdrop(true);
        this.showInviteDialog = true;
        this.inviteEmail = '';
        this.inviteError = '';
    };
    TeamDetailsComponent.prototype.cancelInviteDialog = function () {
        this._app.backdrop(false);
        this.showInviteDialog = false;
        this.inviteStatus = '';
    };
    TeamDetailsComponent.prototype.submitInvite = function () {
        var _this = this;
        this.isPosting = true;
        this.inviteError = '';
        this.teamService.invite(this.team, this.inviteEmail)
            .then(function (invite) {
            _this.team.invites.push(invite);
            _this.isPosting = false;
            _this.inviteStatus = 'wait';
            _this.inviteModel = invite;
            if (invite) {
                setTimeout(function () {
                    if (!invite.inviteUser || _this.userService.isExpired(invite.inviteUser)) {
                        _this.inviteStatus = 'new';
                    }
                    else {
                        _this.inviteStatus = 'exists';
                    }
                }, 300);
            }
        }, function (error) {
            _this.isPosting = false;
            var response = error.json();
            if (response.error && response.error == 'invite already exists') {
                _this.inviteError = 'That email address has already been invited to ' + _this.team.name + '.';
            }
            else if (response.error && response.error == 'out of subscriptions') {
                _this.inviteError = 'Your team is out of subscriptions, so you cannot invite that user until you purchase more (or until they purchase a subscription on their own).';
            }
            else {
                _this.inviteError = 'There was some sort of problem sending that invite.';
            }
        });
    };
    TeamDetailsComponent.prototype.selectInvite = function (invite) {
        if (this.selectedInvite && this.selectedInvite._id == invite._id) {
            this.selectedInvite = null;
        }
        else {
            this.selectedInvite = invite;
        }
    };
    TeamDetailsComponent.prototype.cancelInvite = function (invite) {
        var _this = this;
        this.selectedInvite = invite;
        this._app.dialog('Cancel an Invitation', 'Are you sure you want to revoke your invitation to ' + invite.email + '? We already sent them the invite, but the link inside will no longer work. We will not notify them that it was cancelled.', 'Yes', function () {
            _this.userService.cancelInvite(invite).then(function (done) {
                if (done) {
                    var index = util_1.Util.indexOfId(_this.team.invites, invite);
                    if (index > -1) {
                        _this.team.invites.splice(index, 1);
                    }
                }
            });
        });
    };
    TeamDetailsComponent.prototype.leave = function () {
        var _this = this;
        var body = "\n            <p>Are you sure you want to leave this team? You will no longer have access to any of the team's resources.</p>\n        ";
        this._app.dialog('Leave ' + this.team.name + '?', body, 'Yes', function () {
            _this.userService.leaveTeam(_this.team).then(function (user) {
                _this.router.navigate(['/app/dashboard']);
                setTimeout(function () {
                    _this._app.dialog('It is done', 'You have successfully left ' + _this.team.name + '.');
                }, 500);
            });
        });
    };
    TeamDetailsComponent.prototype.getUserName = function (user) {
        return user.firstName ? user.firstName : 'this user';
    };
    TeamDetailsComponent.prototype.removeUserFromTeam = function (user) {
        var _this = this;
        this._app.dialog('Remove ' + this.getUserName(user) + ' from the Company?', 'Are you sure you want to remove them from the Company?', 'Yes', function () {
            _this.teamService.removeUserFromTeam(_this.team, user).then(function (team) {
                _this.setTeam(team);
            });
        });
    };
    TeamDetailsComponent.prototype.promoteUser = function (user) {
        var _this = this;
        this._app.dialog('Promote ' + this.getUserName(user) + ' to Company Admin?', 'As a Company Admin, they will be able to view the Company\'s purchase history, add or remove users, and make purchases for the Company.', 'Yes', function () {
            _this.teamService.promoteUser(_this.team, user).then(function (team) {
                _this.setTeam(team);
            });
        });
    };
    TeamDetailsComponent.prototype.demoteUser = function (user) {
        var _this = this;
        this._app.dialog('Demote ' + this.getUserName(user) + '?', 'This user will no longer have Company Admin privelages.', 'Yes', function () {
            _this.teamService.demoteUser(_this.team, user).then(function (team) {
                _this.setTeam(team);
            });
        });
    };
    // settings
    TeamDetailsComponent.prototype.setColor = function (color, which) {
        this[which + 'Color'] = color;
        this.setCurtain();
    };
    TeamDetailsComponent.prototype.saveColor = function (open, which) {
        var index = which + 'Color', whichColor = this[index];
        // TODO: figure out a better way to ignore that default ( do we need to? )
        if (!open && whichColor != this.team[index]) {
            // the selector has been closed, and it was set to a color that isn't already the team's color
            this.team[index] = whichColor;
            this._saveTeam();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", team_1.Team)
    ], TeamDetailsComponent.prototype, "team", void 0);
    TeamDetailsComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "team-details",
            templateUrl: "../template/team-details.component.html",
            animations: [anim_util_1.DialogAnim.dialog]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            router_1.ActivatedRoute,
            app_service_1.AppService,
            user_service_1.UserService,
            team_service_1.TeamService,
            game_note_service_1.GameNoteService,
            common_1.PathLocationStrategy,
            common_1.Location])
    ], TeamDetailsComponent);
    return TeamDetailsComponent;
}());
exports.TeamDetailsComponent = TeamDetailsComponent;

//# sourceMappingURL=team-details.component.js.map
