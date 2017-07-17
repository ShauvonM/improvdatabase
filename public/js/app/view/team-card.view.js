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
require("rxjs/Subscription");
var time_util_1 = require("../../util/time.util");
var team_service_1 = require("../service/team.service");
var team_1 = require("../../model/team");
var TeamCardView = (function () {
    function TeamCardView(teamService) {
        this.teamService = teamService;
        this.selectTeam = new core_1.EventEmitter();
    }
    TeamCardView.prototype.ngOnInit = function () {
    };
    TeamCardView.prototype._selectTeam = function (team) {
        this.selectTeam.emit(team);
    };
    TeamCardView.prototype.getDate = function (date) {
        return time_util_1.TimeUtil.simpleDate(date);
    };
    TeamCardView.prototype.getTime = function (date) {
        return time_util_1.TimeUtil.simpleTime(date);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", team_1.Team)
    ], TeamCardView.prototype, "team", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], TeamCardView.prototype, "admin", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], TeamCardView.prototype, "selectTeam", void 0);
    TeamCardView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: '.id-team-card',
            templateUrl: '../template/view/team-card.view.html',
            host: {
                '[class.card]': 'true'
            }
        }),
        __metadata("design:paramtypes", [team_service_1.TeamService])
    ], TeamCardView);
    return TeamCardView;
}());
exports.TeamCardView = TeamCardView;

//# sourceMappingURL=team-card.view.js.map
