import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { AppHttp } from '../../data/app-http';
import { API } from '../../constants';

import { Game } from '../../model/game';
import { GameMetadata } from '../../model/game-metadata';
import { Tag } from '../../model/tag';
import { Note } from '../../model/note';
import { Team } from '../../model/team';

import { UserService } from '../../service/user.service';
import { GameDatabaseService } from './game-database.service';

import { Util } from '../../util/util';

@Injectable()
export class GameNoteService {
    private notes: Note[] = [];

    constructor(
        private http: AppHttp,
        private userService: UserService,
        private gameService: GameDatabaseService
        ) { }

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

    getNotesForGame(game: Game): Promise<Note[]> {
        return this.http.get(API.gameNotes(game._id))
            .toPromise()
            .then(response => {
                return response.json() as Note[];
            });
    }

    getNotesForTeam(team: Team): Promise<Note[]> {
        return this.http.get(API.teamNotes(team._id))
            .toPromise()
            .then(response => {
                return response.json() as Note[];
            });
    }

    createNote(newNote: Note): Promise<Note> {
        if (!this.userService.can('note_create')) {
            return;
        }

        return this.http.post(API.notes, newNote)
            .toPromise()
            .then(response => {
                return response.json() as Note;
            });
    }

    updateNote(note: Note): Promise<Note> {
        if (!this.userService.can('note_edit')) {
            return;
        }

        return this.http.put(API.getNote(note._id), note)
            .toPromise()
            .then(response => {
                return response.json() as Note;
            });
    }

    deleteNote(note: Note): Promise<boolean> {
        if (!this.userService.can('note_delete')) {
            return;
        }

        return this.http.delete(API.getNote(note._id))
            .toPromise()
            .then(response => {
                return true;
            });
    }

    private handleError(error: any): Promise<any> {
        // console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    }
}