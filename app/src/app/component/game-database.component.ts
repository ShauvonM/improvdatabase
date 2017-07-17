import {
    Component,
    OnInit,
    trigger,
    state,
    style,
    transition,
    animate,
    ViewChild,
    QueryList
} from '@angular/core';
import { PathLocationStrategy } from '@angular/common';

import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/Subscription';
import { Subscription } from 'rxjs/Subscription';

import { AppComponent } from '../../component/app.component';
import { Tool, SearchResult } from '../view/toolbar.view';

import { GameDatabaseService } from '../service/game-database.service';
import { UserService } from "../../service/user.service";

import { Game } from '../../model/game';
import { Name } from '../../model/name';
import { Tag } from '../../model/tag';

import { GameDetailsComponent } from './game-details.component';

export class GameFilter {
    property: string;
    value: string;
}

@Component({
    moduleId: module.id,
    selector: "game-database",
    templateUrl: '../template/game-database.component.html',
    animations: [
        trigger('flyInOut', [
            state('in',   style({
                opacity: 1
            })),
            transition('void => *', [
                style({opacity: 0}),
                animate(100)
            ]),
            transition('* => void', [
                animate(100, style({opacity: 0}))
            ])
        ])
    ]
})
export class GameDatabaseComponent implements OnInit {
    games: Game[] = [];
    names: Name[] = [];
    selectedGame: Game;

    private _gameDisplayCount: number = 0;
    allGamesAreDisplayed: boolean;

    previousScrollPosition: number;

    _titleBase: string = '<span class="light">game</span><strong>database</strong>';
    title: string;

    searchResults: SearchResult[] = [];
    filter: GameFilter;
    searchTerm: string;

    isLoadingGames: boolean;

    @ViewChild(GameDetailsComponent) gameDetailsComponent: GameDetailsComponent;

    constructor(
        private _app: AppComponent,
        private route: ActivatedRoute,
        private router: Router,
        private gameDatabaseService: GameDatabaseService,
        private pathLocationStrategy: PathLocationStrategy,
        public userService: UserService
    ) { }

    private tools: Tool[] = [
        {
            icon: "fa-random",
            name: "randomGame",
            text: "Select Random Game",
            active: false
        }
    ];

    ngOnInit(): void {

        this.setTitle();

        // this._app.showLoader();
        this._app.showBackground(true);
        this.getGames();

        this.pathLocationStrategy.onPopState(() => this._reset());

    }

    setTitle(): void {
        if (this.filter) {
            this.title = "back";
        } else {
            this.title = this._titleBase;
        }
    }

    getGames(): void {
        this.gameDatabaseService.getGames().then(games => {
            games = this._filterGames(games);
            this._loadGames(games);
        });
    }

    getGamesSearch(term: string): void {
        //this._setPath("/games;search=" + term);
        this.gameDatabaseService.searchForGames(term).then(games => this._loadGames(games))
    }

    loadMoreGames(page: number): void {
        if (!this.allGamesAreDisplayed) {
            this.isLoadingGames = true;
            this._gameDisplayCount = 30 * page;
            this.getGames();
        }
    }

    private _loadGames(games: Game[]): void {
        setTimeout(() => {
            this._app.hideLoader();
            this.isLoadingGames = false;

            if (games.length > this._gameDisplayCount) {
                this.games = games.slice(0, this._gameDisplayCount);
            } else {
                this.games = games;
                this.allGamesAreDisplayed = true;
            }
            this.onGamesLoaded();
        }, 150);
    }

    private _filterGames(games: Game[]): Game[] {
        if (this.filter) {
            //this._setPath("/games;filter=" + this.filter.property + ",value=" + this.filter.value);
            return games.filter((game) => {
                // don't show things without names if we can't edit them
                if (!game.names.length && !this.userService.can('game_edit')) {
                    return false;
                }
                if (this.filter.property == 'TagID') {
                    for (var tagIDIndex = 0; tagIDIndex < game.tags.length; tagIDIndex++) {
                        if ((<Tag> game.tags[tagIDIndex])._id == this.filter.value) {
                            return true;
                        }
                    }
                    return false;
                } else if (game[this.filter.property] && game[this.filter.property]._id) {
                    return game[this.filter.property]._id == this.filter.value;
                } else {
                    return game[this.filter.property] == this.filter.value;
                }
            });
        } else {
            return games;
        }
    }

    onGamesLoaded(): void {
        // navigate to games;random=random to load a random game
        this.route.params.forEach((params: Params) => {
            if (params['random']) {
                this.pathLocationStrategy.replaceState({}, "", "/app/games", "");
                this.selectRandomGame();
            }
        })
    }

    trackByGames(index: number, game: Game) {
        return game._id;
    }

    private _reset(): void {
        this.selectedGame = null;
        this._app.showBackground(true);
        this._app.setCurtain({});
    }

    onSelect(game: Game): void {
        // remember the scroll position so we can return there when the user comes back
        if (!this.selectedGame) {
            this.previousScrollPosition = window.scrollY;
        }

        this._app.showBackground(false);

        if (!game) {
            this._reset();
        } else {
            this.selectedGame = game;

            setTimeout(() => {
                if (this.gameDetailsComponent) {
                    this.gameDetailsComponent.setCurtain();
                }
            });
        }
    
        let newPath = "/app/game/" + this.selectedGame._id;
        this._app.setPath(newPath);

        window.scrollTo(0, 0);
    }

    // private _setPath(path: string): void {
    //     if (this.pathLocationStrategy.path().indexOf("/game/") > -1) {
    //         this.pathLocationStrategy.replaceState({}, "", path, "");
    //     } else {
    //         this.pathLocationStrategy.pushState({}, "", path, "");
    //     }
    // }

    selectRandomGame(): void {
        // reload the games, because we don't want to limit ourselves by just what has been loaded by the infinite scroll
        this.gameDatabaseService.getGames().then(games => {
            games = this._filterGames(games);

            let i = Math.floor((Math.random() * games.length));
            this.onSelect(games[i]);
        });
    }

    closeDetails(tool: Tool): void {
        if (tool && tool.name) {
            this.onToolClicked(tool);
        } else {
            this._goBack();

            setTimeout(() => {
                window.scrollTo(0, this.previousScrollPosition);
                this.previousScrollPosition = 0;
            }, 10);
        }
    }

    onToolClicked(tool: Tool): void {
        switch (tool.name) {
            case "showTags":
                tool.active = !tool.active;
                break;
            case "randomGame":
                this.selectRandomGame();
                break;
        }
    }

    onSearchResultClick(result: SearchResult): void {
        switch(result.type) {
            case 'search':
                if (result.text) {
                    this.filter = {
                        "property": "search",
                        "value" : ""
                    }
                    this.searchTerm = result.text;
                    this.getGamesSearch(result.text);
                    this.setTitle();
                } else {
                    //this._goBack();
                    this.clearFilter();
                }
                return;
            case 'name':
                this.gameDatabaseService.getGame(result.id)
                    .then((game) => this.onSelect(game));
                return;
            case 'tag':
                this.filter = {
                    "property": 'TagID',
                    "value": result.id
                }
                break;
            case 'duration':
                this.filter = {
                    "property": 'duration',
                    "value": result.id
                }
                break;
            case 'playercount':
                this.filter = {
                    "property": 'playerCount',
                    "value": result.id
                }
                break;
        }
        this.getGames();
        this.setTitle();
    }

    onSearch(term: string): void {
        this.gameDatabaseService.searchForResults(term)
            .then((results) => this.searchResults = results);
    }

    private _goBack(): void {
        this.pathLocationStrategy.back();
    }

    clearFilter(): void {
        // TODO: back button should clear filters
        this.filter = null;
        this.getGames();
        this.setTitle();
    }

    createGame(): void {
        if (this.userService.can('game_create')) {
            this.gameDatabaseService.createGame()
                .then(game => {
                    this.onSelect(game);
                });
        }
    }

}
