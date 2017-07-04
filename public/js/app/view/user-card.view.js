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
var text_util_1 = require("../../util/text.util");
var time_util_1 = require("../../util/time.util");
var user_service_1 = require("../../service/user.service");
var user_1 = require("../../model/user");
var team_1 = require("../../model/team");
var UserCardView = (function () {
    function UserCardView(userService) {
        this.userService = userService;
        this._timeUtil = time_util_1.TimeUtil;
        this.removeUserFromTeam = new core_1.EventEmitter();
        this.promoteUser = new core_1.EventEmitter();
        this.demoteUser = new core_1.EventEmitter();
    }
    UserCardView.prototype.ngOnInit = function () {
        this.descriptionText = text_util_1.TextUtil.stripTags(this.user.description);
        this.userIsMe = this.user._id == this.userService.getLoggedInUser()._id;
        if (this.team) {
            var teamId = this.team._id;
            this.admin = this.userService.isUserAdminOfTeam(this.user, this.team);
            this.amIAdmin = this.userService.isAdminOfTeam(this.team);
        }
    };
    UserCardView.prototype.ngOnDestroy = function () {
    };
    UserCardView.prototype._removeUser = function () {
        this.removeUserFromTeam.emit(this.user);
    };
    UserCardView.prototype._promoteUser = function () {
        this.promoteUser.emit(this.user);
    };
    UserCardView.prototype._demoteUser = function () {
        this.demoteUser.emit(this.user);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", user_1.User)
    ], UserCardView.prototype, "user", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", team_1.Team)
    ], UserCardView.prototype, "team", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], UserCardView.prototype, "removeUserFromTeam", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], UserCardView.prototype, "promoteUser", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], UserCardView.prototype, "demoteUser", void 0);
    UserCardView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: '.improvplus-user-card',
            templateUrl: '../template/view/user-card.view.html'
        }),
        __metadata("design:paramtypes", [user_service_1.UserService])
    ], UserCardView);
    return UserCardView;
}());
exports.UserCardView = UserCardView;

//# sourceMappingURL=user-card.view.js.map
