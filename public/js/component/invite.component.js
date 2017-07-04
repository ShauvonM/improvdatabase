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
var app_component_1 = require("./app.component");
var user_service_1 = require("../service/user.service");
var anim_util_1 = require("../util/anim.util");
var InviteComponent = (function () {
    function InviteComponent(_app, router, route, userService) {
        this._app = _app;
        this.router = router;
        this.route = route;
        this.userService = userService;
        this.dialogStatus = 'default';
    }
    InviteComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.userService.getLoggedInUser()) {
            this.userService.logout(true);
        }
        this.route.params.forEach(function (params) {
            _this.inviteId = params['id'];
        });
        this._app.backdrop(true);
    };
    InviteComponent.prototype.submitInvite = function () {
        var _this = this;
        this.userService.acceptInvite(this.inviteId, this.email, this.password, this.userName)
            .catch(function (error) {
            _this.dialogStatus = 'shake';
            var data = error.json();
            if (data.error) {
                switch (data.error) {
                    case 'unknown invite':
                        _this.error = 'That is apparently not a valid invite code.';
                        break;
                    case 'invite taken':
                        _this.error = 'Someone seems to have claimed that invite code already.';
                        break;
                    case 'wrong email':
                        _this.error = 'For security reasons, enter the email address that this invite code was sent to. You can change it later.';
                        break;
                    default:
                        _this.error = data.error;
                        break;
                }
            }
        })
            .then(function (user) {
            if (user) {
                _this.userService.login(_this.email, _this.password);
            }
        });
    };
    __decorate([
        core_1.HostBinding('class.dialog-container'),
        core_1.HostBinding('class.show'),
        __metadata("design:type", String)
    ], InviteComponent.prototype, "inviteId", void 0);
    InviteComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "invite",
            templateUrl: '../template/invite.component.html',
            animations: [
                anim_util_1.DialogAnim.dialog
            ]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            router_1.ActivatedRoute,
            user_service_1.UserService])
    ], InviteComponent);
    return InviteComponent;
}());
exports.InviteComponent = InviteComponent;

//# sourceMappingURL=invite.component.js.map
