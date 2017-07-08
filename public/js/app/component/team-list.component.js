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
var team_service_1 = require("../service/team.service");
var time_util_1 = require("../../util/time.util");
var TeamListComponent = (function () {
    function TeamListComponent(_app, _router, teamService) {
        this._app = _app;
        this._router = _router;
        this.teamService = teamService;
        this.title = '<span class="light">your</span><strong>teams</strong>';
        this._tools = [];
    }
    TeamListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.teamService.fetchTeams().then(function (u) {
            _this.memberOfTeams = u.memberOfTeams;
            _this.adminOfTeams = u.adminOfTeams;
        });
    };
    TeamListComponent.prototype.selectTeam = function (team) {
        this._router.navigate(['/app/team', team._id]);
    };
    TeamListComponent.prototype.getDate = function (date) {
        return time_util_1.TimeUtil.simpleDate(date);
    };
    TeamListComponent.prototype.getTime = function (date) {
        return time_util_1.TimeUtil.simpleTime(date);
    };
    TeamListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "team-list",
            templateUrl: "../template/team-list.component.html"
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            team_service_1.TeamService])
    ], TeamListComponent);
    return TeamListComponent;
}());
exports.TeamListComponent = TeamListComponent;

//# sourceMappingURL=team-list.component.js.map
