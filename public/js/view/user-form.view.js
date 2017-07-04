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
var app_component_1 = require("../component/app.component");
var user_1 = require("../model/user");
var app_service_1 = require("../service/app.service");
var UserFormView = (function () {
    function UserFormView(_app, appService) {
        this._app = _app;
        this.appService = appService;
        this.isPosting = false;
        this.saveText = "Save";
        this.back = new core_1.EventEmitter();
        this.onValidated = new core_1.EventEmitter();
    }
    UserFormView.prototype.ngOnInit = function () {
        this.newUser = this.user._id == undefined;
        if (this.user.birthday) {
            var birthday = new Date(this.user.birthday);
            if (isNaN(birthday.getDate())) {
                birthday = new Date(parseInt(this.user.birthday));
            }
            this.birthdayDay = birthday.getDate();
            this.birthdayMonth = birthday.getMonth();
            this.birthdayYear = birthday.getFullYear();
        }
    };
    UserFormView.prototype.ngOnDestroy = function () {
    };
    UserFormView.prototype.goBack = function () {
        // this._app.logout();
        this.back.emit(true);
    };
    UserFormView.prototype.submitForm = function () {
        var _this = this;
        this.passwordMatchError = false;
        this.emailConflict = false;
        if (this.password === this.passwordConfirm) {
            this.user.password = this.password;
            if (this.birthdayDay && this.birthdayMonth && this.birthdayYear) {
                var birthday = new Date(0);
                birthday.setDate(this.birthdayDay);
                birthday.setMonth(this.birthdayMonth);
                birthday.setFullYear(this.birthdayYear);
                this.user.birthday = birthday.getTime().toString();
            }
            this.isValidating = true;
            this.appService.validateUser(this.user)
                .then(function (conflict) {
                _this.isValidating = false;
                if (conflict) {
                    if (conflict == 'email') {
                        _this.emailConflict = true;
                    }
                }
                else {
                    _this.onValidated.emit(_this.user);
                    _this.password = "";
                    _this.passwordConfirm = "";
                }
            });
        }
        else {
            this.passwordMatchError = true;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", user_1.User)
    ], UserFormView.prototype, "user", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], UserFormView.prototype, "backText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], UserFormView.prototype, "isPosting", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], UserFormView.prototype, "saveText", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], UserFormView.prototype, "back", void 0);
    __decorate([
        core_1.Output('valid'),
        __metadata("design:type", core_1.EventEmitter)
    ], UserFormView.prototype, "onValidated", void 0);
    UserFormView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'user-form',
            templateUrl: '../template/view/user-form.view.html'
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            app_service_1.AppService])
    ], UserFormView);
    return UserFormView;
}());
exports.UserFormView = UserFormView;

//# sourceMappingURL=user-form.view.js.map
