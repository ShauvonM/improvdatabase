import { 
    Component,
    OnInit,
    OnDestroy,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    trigger,
    state,
    style,
    transition,
    animate,
    SimpleChanges
} from '@angular/core';
import { Router, ActivatedRoute, Params }   from '@angular/router';

import { PREFERENCE_KEYS } from '../../constants';

import { AppComponent } from "../../component/app.component";

import { GameDatabaseService } from '../service/game-database.service';
import { GameNoteService } from '../service/game-note.service';

import { Game } from '../../model/game';
import { Name } from '../../model/name';
import { GameMetadata } from '../../model/game-metadata';
import { Tag } from '../../model/tag';
import { Note } from '../../model/note';

import { Tool } from '../view/toolbar.view';
import { TabData } from '../../model/tab-data';

import { UserService } from "../../service/user.service";

import { Util } from '../../util/util';
import { TextUtil } from '../../util/text.util';
import { ShrinkAnim } from '../../util/anim.util';

@Component({
    moduleId: module.id,
    selector: 'game-details',
    templateUrl: '../template/game-details.component.html',
    animations: [
        ShrinkAnim.height,
        trigger('expand', [
            state('in', style({height: '*'})),
            transition('void => *', [
                style({height: 0}),
                animate(100)
            ]),
            transition('* => void', [
                style({height: '*'}),
                animate(100, style({height: 0}))
            ])
        ])
    ]
})
export class GameDetailsComponent implements OnInit, OnChanges {

    @Input() game: Game;
    @Output() onClose: EventEmitter<Tool> = new EventEmitter();

    private _gameId: string;

    gameNotFound: boolean;

    dialog: boolean = false;

    isPosting: boolean;

    // tagMap: Object = {};
    notes: Note[] = []

    namesOpen: boolean = false;

    editNameShown: boolean;
    addNameShown: boolean;

    editName: string;

    allPlayerCounts: GameMetadata[] = [];

    allDurations: GameMetadata[] = [];

    addTagShown: boolean;
    newTagText: string;
    tagHints: Tag[];

    descriptionHtml: string;

    editDescriptionShown: boolean;
    newDescriptionText: string;

    createMetadataType: string;

    // playerCountID: string;
    durationID: string;

    showPublicNotes: boolean;
    showTeamNotes: boolean;
    showPrivateNotes: boolean;

    tools: Tool[] = [
        {
            icon: "fa-trash",
            name: "deleteGame",
            text: "Delete Game",
            permission: "game_delete"
        },
        {
            icon: "fa-random",
            name: "randomGame",
            text: "Select Random Game",
            active: false
        }
    ];

    tabs = [
        {
            name: 'Details',
            id: 'details',
            icon: 'rocket'
        },
        {
            name: 'Notes',
            id: 'notes',
            icon: 'sticky-note-o'
        }
    ];
    selectedTab: string = 'notes';

    constructor(
        public _app: AppComponent,
        private gameDatabaseService: GameDatabaseService,
        private gameNoteService: GameNoteService,
        private router: Router,
        private route: ActivatedRoute,
        public userService: UserService
    ) { }

    ngOnInit(): void {
        if (!this.game) {
            this.route.params.forEach((params: Params) => {
                let id = params['id']
                this.gameDatabaseService.getGame(id)
                    .then(game => this.setGame(game),
                        error => {
                            // if (error.status == 404) {
                                this.gameNotFound = true;
                            // }
                        });
            });
        } else {
            this.dialog = true;
            this.setGame(this.game);
        }

        if (this.can('game_edit')) {
            this.gameDatabaseService.getPlayerCounts().then((playerCounts) => {
                this.allPlayerCounts = playerCounts;
            });
            this.gameDatabaseService.getDurations().then((durations) => {
                this.allDurations = durations
            });
        }

        this.showPublicNotes = this.userService.getPreference(PREFERENCE_KEYS.showPublicNotes, 'true') == 'true';
        this.showTeamNotes = this.userService.getPreference(PREFERENCE_KEYS.showTeamNotes, 'true') == 'true';
        this.showPrivateNotes = this.userService.getPreference(PREFERENCE_KEYS.showPrivateNotes, 'true') == 'true';

    }

    ngOnChanges(changes:SimpleChanges): void {
        // make sure that things get set up if the game changes
        if (changes.game && changes.game.previousValue && (!this._gameId || this._gameId != changes.game.currentValue._id)) {
            this.setGame(changes.game.currentValue);
        }
    }

    renderDescription(): void {
        if (this.game.description) {
            let converter = TextUtil.getMarkdownConverter();
            this.descriptionHtml = converter.makeHtml(this.game.description);
        } else {
            this.descriptionHtml = 'No Description';
        }
    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
    }

    can(permission: string): boolean {
        return this.userService.can(permission);
    }

    private _getInput(name?:string): HTMLInputElement {
        name = name || 'editName';
        let i = <HTMLInputElement>document.querySelector('[name="' + name + '"]');
        return i;
    }

    private _focusInput(name?:string): void {

        // TODO: figure out how to focus the new input element - probably stupid complicated with Angular
        // http://stackoverflow.com/questions/34522306/angular-2-focus-on-newly-added-input-element

        // but hey, this works for now!
        setTimeout(() => {
            let i = this._getInput(name);
            if (i) {
                i.focus();
            }
        }, 100);
    }

    showEditName(): void {
        this.addNameShown = false;
        if (this.can('name_edit')) {
            if (!this.game.names.length) {
                this.showAddName();
            } else {
                this.editName = this.game.names[0].name;
                this.editNameShown = true;
                this._focusInput();
            }
        }
    }

    showAddName(): void {
        this.editNameShown = false;
        if (this.can('name_create')) {
            this.editName = "";
            this.addNameShown = true;
            this._focusInput();
        }
    }

    saveEditName(): void {
        if (this.editName) {
            if (this.editNameShown) {
                // update the existing name if it is different
                if (this.editName != this.game.names[0].name) {
                    this.game.names[0].name = this.editName;
                    this.gameDatabaseService.saveName(this.game.names[0]);
                }
            } else if (this.addNameShown) {
                // create a new name
                this.gameDatabaseService.createName(this.game._id, this.editName)
                    .then(name => {
                        if (!this.dialog) {
                            this.game.names.unshift(name);
                        }
                    });
            }
        }

        this.editName = "";
        this.editNameShown = false;
        this.addNameShown = false;
    }

    private _saveGame(): void {
        // this._closeAllEdits();
        this.setGame(this.game);

        this.gameDatabaseService.saveGame(this.game)
            .then((game) => {
                //this.setGame(game); not really necessary, because we already set it

                this.setCurtain();
            }, () => {
                // TODO: revert?
            })
    }

    savePlayerCount(playerCount: GameMetadata): void {
        if (this.can('game_edit')) {
            if (!this.game.playerCount || this.game.playerCount._id !== playerCount._id) {
                this.game.playerCount = playerCount;
                this._saveGame();
            }
        }
    }

    saveDuration(duration: GameMetadata): void {
        if (this.can('game_edit')) {
            if (!this.game.duration || this.game.duration._id !== duration._id) {
                this.game.duration = duration;
                this._saveGame();
            }
        }
    }

    showCreateMetadataDialog(show: boolean, type: string): void {
        if (this.can('metadata_create')) {
            this.createMetadataType = type;
            this._app.backdrop(true);
        }
    }
    onCreateMetadataDone(metadata: GameMetadata): void {
        this.createMetadataType = "";
        this._app.backdrop(false);

        if (metadata) {
            if (metadata.type == 'playerCount') {
                // this.allPlayerCounts.push(metadata);
                this.game.playerCount = metadata;
            } else if (metadata.type == 'duration') {
                // this.allDurations.push(metadata);
                this.game.duration = metadata;
            }

            this._saveGame();
        }
    }

    showAddTag(): void {
        if (this.can('game_tag_add')) {
            this.addTagShown = true;

            this._focusInput('addTag');
        }
    }

    _tagTypeDebounce: any;
    _selectedTagIndex: number = -1;
    newTagKeyDown(event: KeyboardEvent): void {

        let key = event.keyCode;

        switch(key) {
            case 13:
                this._selectedTagIndex = -1;

                this.addTagByName();
                break;
            case 27: // escape
                this._selectedTagIndex = -1;

                this.addTagShown = false;
                break;
            case 40: // down
            case 38: // up

                if (key === 40) {
                    if (this._selectedTagIndex < this.tagHints.length - 1) {
                        this._selectedTagIndex++;
                    } else {
                        this._selectedTagIndex = 0;
                    }
                } else {
                    if (this._selectedTagIndex > 0) {
                        this._selectedTagIndex--;
                    } else {
                        this._selectedTagIndex = this.tagHints.length - 1;
                    }
                }
                if (this.tagHints[this._selectedTagIndex]) {
                    this.newTagText = this.tagHints[this._selectedTagIndex].name;
                    this._focusInput('addTag');
                }

                break;
            default:
                clearTimeout(this._tagTypeDebounce);
                this._tagTypeDebounce = setTimeout(() => {
                    this.tagHints = [];
                    if (this.newTagText) {
                        this.gameDatabaseService.searchForTags(this.newTagText)
                            .then(tags => {
                                let max = tags.length > 8 ? 8 : tags.length;
                                for(let cnt = 0; cnt < max; cnt++) {
                                    let tag = tags[cnt];
                                    // only hint tags that aren't already added to this game,
                                    // and only show the first 8 hints, why not
                                    if (!this.gameDatabaseService.gameHasTag(this.game, [tag._id])) {
                                        this.tagHints.push(tag);
                                    }
                                }
                            });
                    }
                }, 100);
                break;
        }
    }

    tagToRemove: Tag;
    removeTag(tag: Tag): void {
        if (!this.can('game_tag_remove')) {
            return;
        }
        this.tagToRemove = tag;
    }

    doRemoveTag(): void {
        if (!this.can('game_tag_remove')) {
            return;
        }
        let index = Util.indexOfId(this.game.tags, this.tagToRemove);
        if (index > -1) {
            this.game.tags.splice(index, 1);
        }
        this.gameDatabaseService.deleteTagFromGame(this.game, this.tagToRemove).then(() => {
            this.setGame(this.game);
        });
    }

    cancelRemoveTag(event: MouseEvent): void {
        this.tagToRemove = null;

        event.preventDefault();
        event.cancelBubble = true;
    }

    tagSaving: boolean;

    addTagByName(): void {
        let tag: Tag;
        // see if any of the hints match the input exactly
        this.tagHints.forEach(hint => {
            if (hint.name.toLocaleLowerCase() == this.newTagText.toLocaleLowerCase()) {
                tag = hint;
            }
        });

        if (tag) {
            this.addTag(tag);
        } else {
            if (this.can('tag_create')) {
                this.tagSaving = true;
                // if there were no matches, we'll create a new tag
                this.gameDatabaseService.createTag(this.newTagText, this.game)
                    .then(game => {
                        this.tagSaving = false;
                        this.game.tags = game.tags
                    });
            }
        }

        this.newTagText = "";
        this.tagHints = [];
        this._selectedTagIndex = -1;
    }

    addTag(tag: Tag): void {
        if (this.can('game_tag_add')) {
            this.tagSaving = true;

            (<Tag[]> this.game.tags).push(tag);
            (<Tag[]> this.game.tags).sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            this.gameDatabaseService.saveTagToGame(this.game, tag)
                .then(game => {
                    this.tagSaving = false;
                    this.setGame(game);
                });
            
            this.newTagText = "";
            this.tagHints = [];
        }
    }

    showEditDescription(): void {
        this.newDescriptionText =this.game.description;
        this.editDescriptionShown = true;
    }

    cancelEditDescription(): void {
        this.newDescriptionText = '';
        this.editDescriptionShown = false;
    }

    saveDescription(): void {
        this.game.description = this.newDescriptionText;
        this.renderDescription();
        this.gameDatabaseService.saveGame(this.game);
        this.editDescriptionShown = false;
    }

    setGame(game: Game): void {
        if (!game) {
            this.gameNotFound = true;
        } else {
            this._gameId = game._id;

            this.game = game;

            if (this.game.names && this.game.names.length) {
                this.gameNoteService.getNotesForGame(this.game)
                    .then((notes) => {
                        this.notes = notes
                    });
            }

            this.renderDescription();

            if (!this.dialog) {
                this.setCurtain();
            }
        }
    }

    setCurtain(): void {
        this._app.setCurtain({
            text: this.game && this.game.names.length ? this.game.names[0].name : 'New Game'
        });
    }

    getPublicNotes(): Note[] {
        let notes = this.notes.filter(note => {
            return note.public;
        });
        return notes;
    }

    getPrivateNotes(): Note[] {
        let notes = this.notes.filter(note => {
            return !note.public && (!note.teams || !note.teams.length);
        });
        return notes;
    }

    getTeamNotes(): Note[] {
        let notes = this.notes.filter(note => {
            return !note.public && note.teams && note.teams.length;
        })
        return notes;
    }

    closePage(): void {
        if (this.dialog) {
            this.onClose.emit();
        } else {
            this.router.navigate(['/app/games']);
        }
    }

    toggleNames(): void {
        this.namesOpen = !this.namesOpen;
    }

    onToolClicked(tool: Tool): void {
        switch (tool.name) {
            case "randomGame":
                if (this.dialog) {
                    this.onClose.emit(tool);
                } else {
                    this.router.navigate(['/app/games', {random: 'random'}]);
                }
                break;
            case "deleteGame":
                this._app.dialog("Delete Game?",
                    "Are you sure you want to delete this game. There is no turning back from this.",
                    "Delete",
                    () => {
                        this.gameDatabaseService.deleteGame(this.game)
                            .then(() => {
                                this.closePage();
                            })
                    });
                break;
        }
    }

    noteCreated(note: Note): void {
        this.notes.push(note);
    }

    removeNote(note: Note): void {
        let index = Util.indexOfId(this.notes, note);
        if (index > -1) {
            this.notes.splice(index, 1);
        }
    }

    togglePublicNotes(): void {
        setTimeout(() => {
            this.userService.setPreference(PREFERENCE_KEYS.showPublicNotes, ''+this.showPublicNotes);
        }, 10);
    }

    toggleTeamNotes(): void {
        setTimeout(() => {
            this.userService.setPreference(PREFERENCE_KEYS.showTeamNotes, ''+this.showTeamNotes);
        }, 10);
    }

    togglePrivateNotes(): void {
        setTimeout(() => {
            this.userService.setPreference(PREFERENCE_KEYS.showPrivateNotes, ''+this.showPrivateNotes);
        }, 10);
    }

}