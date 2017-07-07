import { 
    Component,
    OnInit,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef
} from '@angular/core';

import { TimeUtil } from '../../util/time.util';
import { PREFERENCE_KEYS } from '../../constants';

import { UserService } from '../../service/user.service';

import { Game } from '../../model/game';
import { Note } from '../../model/note';
import { Tag } from '../../model/tag';
import { GameMetadata } from '../../model/game-metadata';

import { DropdownOption } from '../view/editable-metadata.view';

import { GameNoteService } from '../service/game-note.service';

import { ShrinkAnim } from '../../util/anim.util';

import { Util } from '../../util/util';
import { TextUtil } from '../../util/text.util';

@Component({
    moduleId: module.id,
    selector: '.id-game-note',
    templateUrl: '../template/view/game-note.view.html',
    animations: [ShrinkAnim.height]
})
export class GameNoteView implements OnInit, OnChanges {

    @Input() note: Note;
    @Input() game: Game;

    @Output() create: EventEmitter<Note> = new EventEmitter();
    @Output() remove: EventEmitter<Note> = new EventEmitter();

    @ViewChild('description') descriptionElement: ElementRef;
    @ViewChild('noteinput') inputElement: ElementRef;

    descriptionHtml: string;

    showEdit: boolean;
    editable: boolean;
    showText: boolean;

    showUserName: boolean = true;
    showTeamShare: boolean;
    modifiedName: string;

    superAdmin: boolean;

    isPosting: boolean;

    noteInput: string;
    noteContext: string;
    noteContextOptions: DropdownOption[];
    notePublic: boolean;
    noteTeam: boolean;

    showControls: boolean = true;
    showDeleteConfirm: boolean;

    simpleDate: string;

    constructor(
        private userService: UserService,
        private noteService: GameNoteService
    ) { }
    
    ngOnInit() {

        this.superAdmin = this.userService.isSuperAdmin();

        if (this.userService.getTeams().length || this.userService.getAdminTeams().length) {
            this.showTeamShare = true;
        }

        if (!this.note) {
            setTimeout(() => {
                this.setupNoteEdit();
            }, 100);
        } else {
            let user = this.userService.getLoggedInUser();

            if (this.note.addedUser._id == user._id) {
                this.showUserName = false;
            }

            if (this.note.modifiedUser && this.note.addedUser._id != this.note.modifiedUser._id) {
                this.modifiedName = '<em>(edited by ' + this.note.modifiedUser.firstName + ' ' + this.note.modifiedUser.lastName + ')</em>';
            }

            this.renderDescription();
            this.showText = true;

            if (this.superAdmin || this.note.addedUser._id == user._id) {
                this.editable = true;
            }

            this.note.teams.forEach(team => {
                if (Util.indexOfId(user.adminOfTeams, team) > -1) {
                    this.editable = true;
                }
            });

            this.simpleDate = TimeUtil.postTime(this.note.dateModified);
        }
    }

    ngOnChanges(changes: any): void {
        if (changes.game) {
            this.setupContextOptions();
        }
    }

    setupContextOptions(): void {
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

        (<Tag[]> this.game.tags).forEach(tag => {
            this.noteContextOptions.push({
                name: tag.name,
                _id: 'tag_' + tag._id,
                icon: 'hashtag',
                description: 'This note will apply to any game tagged \'' + tag.name + '\'.'
            })
        });
    }

    renderDescription(): void {
        if (this.note && this.note.description) {
            this.descriptionHtml = TextUtil.getMarkdownConverter().makeHtml(this.note.description);
        } else {
            this.descriptionHtml = '';
        }
    }

    setupNoteEdit(): void {
        if (this.note && !this.editable) {
            return;
        }
        this.showText = false;

        let delay = this.note ? 100 : 1;

        setTimeout(() => {
            this.showEdit = true;

            this.noteContext = '';

            if (this.note) {
                this.noteInput = this.note.description;
                if (this.note.teams && this.note.teams.length) {
                    this.noteTeam = true;
                } else {
                    this.noteTeam = false;
                }
                if (this.note.game) {
                    this.noteContext = 'game';
                } else if (this.note.metadata) {
                    this.noteContext = 'metadata_' + (<GameMetadata> this.note.metadata)._id;
                } else if (this.note.tag) {
                    this.noteContext = 'tag_' + (<Tag> this.note.tag)._id;
                }

                this.notePublic = this.note.public;
            } else {
                this.noteTeam = this.userService.getPreference(PREFERENCE_KEYS.shareNotesWithTeam, 'false') == 'true';
            }
        }, delay);

    }

    cancelEdit(): void {
        this.showEdit = false;
        this.showText = false;
        setTimeout(() => {
            this.showText = true;
        }, 200);
    }

    setNoteContext(context: DropdownOption): void {
        this.noteContext = context._id;
    }

    saveNote(): void {
        if (!this.noteContext) {
            this.noteContext = this.noteContextOptions[0]._id;
        }

        let note = this.note || new Note();

        note.description = this.noteInput;
        this.renderDescription();
        
        if (this.noteContext == 'game') {
            note.game = this.game._id;
        } else if (this.noteContext.indexOf('tag_') > -1) {
            note.tag = this.noteContext.replace('tag_', '');
        } else if (this.noteContext.indexOf('metadata_') > -1) {
            note.metadata = this.noteContext.replace('metadata_', '');
        }

        note.public = this.notePublic;

        if (this.noteTeam) {
            note.teams = [].concat(this.userService.getTeams(), this.userService.getAdminTeams());
        } else {
            note.teams = [];
        }
        this.userService.setPreference(PREFERENCE_KEYS.shareNotesWithTeam, this.noteTeam);

        this.isPosting = true;

        if (this.note) {

            this.noteService.updateNote(note).then(note => {
                this.isPosting = false;
                this.cancelEdit();
            });

        } else {

            this.noteService.createNote(note).then(note => {
                this.isPosting = false;
                this.noteInput = '';
                this.create.emit(note);
            });

        }

    }

    deleteNote(): void {
        this.showControls = false;
        setTimeout(() => {
            this.showDeleteConfirm = true;
        }, 250);
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        setTimeout(() => {
            this.showControls = true;
        }, 250);
    }

    doDeleteNote(): void {
        this.noteService.deleteNote(this.note).then(() => {
            this.remove.emit(this.note);
        });
    }

}