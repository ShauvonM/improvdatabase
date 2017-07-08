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
require("rxjs/add/operator/toPromise");
var app_http_1 = require("../../data/app-http");
var constants_1 = require("../../constants");
var user_service_1 = require("../../service/user.service");
var game_database_service_1 = require("./game-database.service");
var GameNoteService = (function () {
    function GameNoteService(http, userService, gameService) {
        this.http = http;
        this.userService = userService;
        this.gameService = gameService;
        this.notes = [];
    }
    /**
     * This probably shouldn't be used.
     */
    // private _notePromise: Promise<Note[]>;
    // getNotes(): Promise<Note[]> {
    //     if (!this._notePromise) {
    //         if (this.userService.can('note_public_view')) {
    //             this._notePromise = this.http.get(API.notes)
    //                 .toPromise()
    //                 .then(response => {
    //                     this.notes = response.json() as Note[];
    //                     return this.notes;
    //                 })
    //                 .catch(this.handleError);
    //         } else {
    //             this._notePromise = new Promise<Note[]>((resolve, reject) => {
    //                 resolve([]);
    //             })
    //         }
    //     }
    //     return this._notePromise;
    // }
    GameNoteService.prototype.getNotesForGame = function (game) {
        return this.http.get(constants_1.API.gameNotes(game._id))
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    GameNoteService.prototype.createNote = function (newNote) {
        if (!this.userService.can('note_create')) {
            return;
        }
        return this.http.post(constants_1.API.notes, newNote)
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    GameNoteService.prototype.updateNote = function (note) {
        if (!this.userService.can('note_edit')) {
            return;
        }
        return this.http.put(constants_1.API.getNote(note._id), note)
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    GameNoteService.prototype.deleteNote = function (note) {
        if (!this.userService.can('note_delete')) {
            return;
        }
        return this.http.delete(constants_1.API.getNote(note._id))
            .toPromise()
            .then(function (response) {
            return true;
        });
    };
    GameNoteService.prototype.handleError = function (error) {
        // console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    };
    GameNoteService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp,
            user_service_1.UserService,
            game_database_service_1.GameDatabaseService])
    ], GameNoteService);
    return GameNoteService;
}());
exports.GameNoteService = GameNoteService;

//# sourceMappingURL=game-note.service.js.map
