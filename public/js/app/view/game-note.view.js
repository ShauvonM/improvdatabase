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
var time_util_1 = require("../../util/time.util");
var constants_1 = require("../../constants");
var user_service_1 = require("../../service/user.service");
var game_1 = require("../../model/game");
var note_1 = require("../../model/note");
var game_note_service_1 = require("../service/game-note.service");
var anim_util_1 = require("../../util/anim.util");
var util_1 = require("../../util/util");
var text_util_1 = require("../../util/text.util");
var GameNoteView = (function () {
    function GameNoteView(userService, noteService) {
        this.userService = userService;
        this.noteService = noteService;
        this.create = new core_1.EventEmitter();
        this.remove = new core_1.EventEmitter();
        this.showUserName = true;
        this.showControls = true;
    }
    GameNoteView.prototype.ngOnInit = function () {
        var _this = this;
        this.superAdmin = this.userService.isSuperAdmin();
        if (this.userService.getTeams().length || this.userService.getAdminTeams().length) {
            this.showTeamShare = true;
        }
        if (!this.note) {
            setTimeout(function () {
                _this.setupNoteEdit();
            }, 100);
        }
        else {
            var user_1 = this.userService.getLoggedInUser();
            if (this.note.addedUser._id == user_1._id) {
                this.showUserName = false;
            }
            if (this.note.modifiedUser && this.note.addedUser._id != this.note.modifiedUser._id) {
                this.modifiedName = '<em>(edited by ' + this.note.modifiedUser.firstName + ' ' + this.note.modifiedUser.lastName + ')</em>';
            }
            this.renderDescription();
            this.showText = true;
            if (this.superAdmin || this.note.addedUser._id == user_1._id) {
                this.editable = true;
            }
            this.note.teams.forEach(function (team) {
                if (util_1.Util.indexOfId(user_1.adminOfTeams, team) > -1) {
                    _this.editable = true;
                }
            });
            this.simpleDate = time_util_1.TimeUtil.postTime(this.note.dateModified);
        }
    };
    GameNoteView.prototype.ngOnChanges = function (changes) {
        if (changes.game) {
            this.setupContextOptions();
        }
    };
    GameNoteView.prototype.setupContextOptions = function () {
        var _this = this;
        this.noteContextOptions = [];
        if (this.game.names.length) {
            this.noteContextOptions.push({
                name: 'This game: ' + this.game.names[0].name,
                _id: 'game',
                icon: 'rocket',
                description: 'This note will only apply to this game.'
            });
        }
        if (this.game.playerCount) {
            this.noteContextOptions.push({
                name: this.game.playerCount.name + ' Players',
                _id: 'metadata_' + this.game.playerCount._id,
                icon: 'users',
                description: 'This note will apply to any game involving \'' + this.game.playerCount.name + '\' player count.'
            });
        }
        if (this.game.duration) {
            this.noteContextOptions.push({
                name: this.game.duration.name,
                _id: 'metadata_' + this.game.duration._id,
                icon: 'users',
                description: 'This note will apply to any game involving \'' + this.game.duration.name + '\' duration.'
            });
        }
        this.game.tags.forEach(function (tag) {
            _this.noteContextOptions.push({
                name: tag.name,
                _id: 'tag_' + tag._id,
                icon: 'hashtag',
                description: 'This note will apply to any game tagged \'' + tag.name + '\'.'
            });
        });
    };
    GameNoteView.prototype.renderDescription = function () {
        if (this.note && this.note.description) {
            this.descriptionHtml = text_util_1.TextUtil.getMarkdownConverter().makeHtml(this.note.description);
        }
        else {
            this.descriptionHtml = '';
        }
    };
    GameNoteView.prototype.setupNoteEdit = function () {
        var _this = this;
        if (this.note && !this.editable) {
            return;
        }
        this.showText = false;
        var delay = this.note ? 100 : 1;
        setTimeout(function () {
            _this.showEdit = true;
            _this.noteContext = '';
            if (_this.note) {
                _this.noteInput = _this.note.description;
                if (_this.note.teams && _this.note.teams.length) {
                    _this.noteTeam = true;
                }
                else {
                    _this.noteTeam = false;
                }
                if (_this.note.game) {
                    _this.noteContext = 'game';
                }
                else if (_this.note.metadata) {
                    _this.noteContext = 'metadata_' + _this.note.metadata._id;
                }
                else if (_this.note.tag) {
                    _this.noteContext = 'tag_' + _this.note.tag._id;
                }
                _this.notePublic = _this.note.public;
            }
            else {
                _this.noteTeam = _this.userService.getPreference(constants_1.PREFERENCE_KEYS.shareNotesWithTeam, 'false') == 'true';
            }
        }, delay);
    };
    GameNoteView.prototype.cancelEdit = function () {
        var _this = this;
        this.showEdit = false;
        this.showText = false;
        setTimeout(function () {
            _this.showText = true;
        }, 200);
    };
    GameNoteView.prototype.setNoteContext = function (context) {
        this.noteContext = context._id;
    };
    GameNoteView.prototype.saveNote = function () {
        var _this = this;
        if (!this.noteContext) {
            this.noteContext = this.noteContextOptions[0]._id;
        }
        var note = this.note || new note_1.Note();
        note.description = this.noteInput;
        this.renderDescription();
        if (this.noteContext == 'game') {
            note.game = this.game._id;
        }
        else if (this.noteContext.indexOf('tag_') > -1) {
            note.tag = this.noteContext.replace('tag_', '');
        }
        else if (this.noteContext.indexOf('metadata_') > -1) {
            note.metadata = this.noteContext.replace('metadata_', '');
        }
        note.public = this.notePublic;
        if (this.noteTeam) {
            note.teams = [].concat(this.userService.getTeams(), this.userService.getAdminTeams());
        }
        else {
            note.teams = [];
        }
        this.userService.setPreference(constants_1.PREFERENCE_KEYS.shareNotesWithTeam, this.noteTeam);
        this.isPosting = true;
        if (this.note) {
            this.noteService.updateNote(note).then(function (note) {
                _this.isPosting = false;
                _this.cancelEdit();
            });
        }
        else {
            this.noteService.createNote(note).then(function (note) {
                _this.isPosting = false;
                _this.noteInput = '';
                _this.create.emit(note);
            });
        }
    };
    GameNoteView.prototype.deleteNote = function () {
        var _this = this;
        this.showControls = false;
        setTimeout(function () {
            _this.showDeleteConfirm = true;
        }, 250);
    };
    GameNoteView.prototype.cancelDelete = function () {
        var _this = this;
        this.showDeleteConfirm = false;
        setTimeout(function () {
            _this.showControls = true;
        }, 250);
    };
    GameNoteView.prototype.doDeleteNote = function () {
        var _this = this;
        this.noteService.deleteNote(this.note).then(function () {
            _this.remove.emit(_this.note);
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", note_1.Note)
    ], GameNoteView.prototype, "note", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", game_1.Game)
    ], GameNoteView.prototype, "game", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], GameNoteView.prototype, "create", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], GameNoteView.prototype, "remove", void 0);
    __decorate([
        core_1.ViewChild('description'),
        __metadata("design:type", core_1.ElementRef)
    ], GameNoteView.prototype, "descriptionElement", void 0);
    __decorate([
        core_1.ViewChild('noteinput'),
        __metadata("design:type", core_1.ElementRef)
    ], GameNoteView.prototype, "inputElement", void 0);
    GameNoteView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: '.improvplus-game-note',
            templateUrl: '../template/view/game-note.view.html',
            animations: [anim_util_1.ShrinkAnim.height]
        }),
        __metadata("design:paramtypes", [user_service_1.UserService,
            game_note_service_1.GameNoteService])
    ], GameNoteView);
    return GameNoteView;
}());
exports.GameNoteView = GameNoteView;

//# sourceMappingURL=game-note.view.js.map
