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
var game_database_service_1 = require("../service/game-database.service");
var user_service_1 = require("../../service/user.service");
var anim_util_1 = require("../../util/anim.util");
var CreateMetadataView = (function () {
    function CreateMetadataView(userService, gameDatabaseService) {
        this.userService = userService;
        this.gameDatabaseService = gameDatabaseService;
        this.done = new core_1.EventEmitter();
    }
    CreateMetadataView.prototype.ngOnInit = function () {
        this.outputType = this.type == 'playerCount' ? 'Player Count' : 'Duration';
    };
    CreateMetadataView.prototype.createMetadata = function () {
        var _this = this;
        this.isPosting = true;
        if (this.userService.can('metadata_create')) {
            if (this.type == "playerCount") {
                // create a new player count
                this.gameDatabaseService.createPlayerCount(this.name, this.min, this.max, this.description)
                    .then(function (playercount) {
                    _this.doDone(playercount);
                });
            }
            else {
                // create a new Duration
                this.gameDatabaseService.createDuration(this.name, this.min, this.max, this.description)
                    .then(function (duration) {
                    _this.doDone(duration);
                });
            }
        }
        else {
            this.cancel();
        }
    };
    CreateMetadataView.prototype.doDone = function (item) {
        this.isPosting = false;
        this.name = '';
        this.min = 0;
        this.max = 0;
        this.description = '';
        this.done.emit(item);
    };
    CreateMetadataView.prototype.cancel = function () {
        this.done.emit(null);
        return false;
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], CreateMetadataView.prototype, "done", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], CreateMetadataView.prototype, "type", void 0);
    CreateMetadataView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "create-metadata",
            templateUrl: "../template/view/create-metadata.view.html",
            animations: [
                anim_util_1.DialogAnim.dialog,
                anim_util_1.ToggleAnim.fade
            ]
        }),
        __metadata("design:paramtypes", [user_service_1.UserService,
            game_database_service_1.GameDatabaseService])
    ], CreateMetadataView);
    return CreateMetadataView;
}());
exports.CreateMetadataView = CreateMetadataView;

//# sourceMappingURL=create-metadata.view.js.map
