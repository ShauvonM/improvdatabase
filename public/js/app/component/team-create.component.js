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
var app_component_1 = require("../../component/app.component");
var app_service_1 = require("../../service/app.service");
var team_service_1 = require("../service/team.service");
var user_service_1 = require("../../service/user.service");
var team_1 = require("../../model/team");
var TeamCreateComponent = (function () {
    function TeamCreateComponent(_app, router, _service, teamService, userService) {
        this._app = _app;
        this.router = router;
        this._service = _service;
        this.teamService = teamService;
        this.userService = userService;
        this.userEmail = true;
        this.isPosting = false;
        this._tools = [];
    }
    TeamCreateComponent.prototype.ngOnInit = function () {
        this._app.showBackground(true);
    };
    TeamCreateComponent.prototype.createTeam = function () {
        var _this = this;
        this.isPosting = true;
        var team = new team_1.Team();
        team.name = this.teamName;
        if (!this.userEmail && this.teamEmail) {
            team.email = this.teamEmail;
        }
        // TODO: a toggle to set whether the team has its own email address, or just use the current users?
        this.teamService.createTeam(team)
            .then(function (team) {
            _this.userService.addAdminTeam(team);
            _this.router.navigate(['app', 'team', team._id]);
        })
            .catch(function (e) {
            var data = e.json();
            if (data.conflict == 'name') {
                _this.nameError = 'A team with that name is already registered on the database.';
            }
            else {
                _this.nameError = 'An error occurred. Please try again.';
            }
            _this.isPosting = false;
        });
    };
    TeamCreateComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "team-create",
            templateUrl: "../template/team-create.component.html"
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            app_service_1.AppService,
            team_service_1.TeamService,
            user_service_1.UserService])
    ], TeamCreateComponent);
    return TeamCreateComponent;
}());
exports.TeamCreateComponent = TeamCreateComponent;

//# sourceMappingURL=team-create.component.js.map
