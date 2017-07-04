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
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
require("rxjs/Subscription");
var app_component_1 = require("../../component/app.component");
var game_database_service_1 = require("../service/game-database.service");
var user_service_1 = require("../../service/user.service");
var GameFilter = (function () {
    function GameFilter() {
    }
    return GameFilter;
}());
exports.GameFilter = GameFilter;
var GameDatabaseComponent = (function () {
    function GameDatabaseComponent(_app, route, router, gameDatabaseService, pathLocationStrategy, userService) {
        this._app = _app;
        this.route = route;
        this.router = router;
        this.gameDatabaseService = gameDatabaseService;
        this.pathLocationStrategy = pathLocationStrategy;
        this.userService = userService;
        this.games = [];
        this.names = [];
        this._gameDisplayCount = 0;
        this._titleBase = '<span class="light">game</span><strong>database</strong>';
        this.searchResults = [];
        this.tools = [
            {
                icon: "fa-random",
                name: "randomGame",
                text: "Select Random Game",
                active: false
            }
        ];
    }
    GameDatabaseComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.setTitle();
        this._app.showLoader();
        this._app.showBackground(true);
        this.getGames();
        this.pathLocationStrategy.onPopState(function () {
            _this.selectedGame = null;
            _this._app.showBackground(true);
        });
    };
    GameDatabaseComponent.prototype.setTitle = function () {
        if (this.filter) {
            this.title = "back";
        }
        else {
            this.title = this._titleBase;
        }
    };
    GameDatabaseComponent.prototype.getGames = function () {
        var _this = this;
        this.gameDatabaseService.getGames().then(function (games) {
            games = _this._filterGames(games);
            _this._loadGames(games);
        });
    };
    GameDatabaseComponent.prototype.getGamesSearch = function (term) {
        var _this = this;
        //this._setPath("/games;search=" + term);
        this.gameDatabaseService.searchForGames(term).then(function (games) { return _this._loadGames(games); });
    };
    GameDatabaseComponent.prototype.loadMoreGames = function (page) {
        if (!this.allGamesAreDisplayed) {
            this.isLoadingGames = true;
            this._gameDisplayCount = 30 * page;
            this.getGames();
        }
    };
    GameDatabaseComponent.prototype._loadGames = function (games) {
        var _this = this;
        setTimeout(function () {
            _this._app.hideLoader();
            _this.isLoadingGames = false;
            if (games.length > _this._gameDisplayCount) {
                _this.games = games.slice(0, _this._gameDisplayCount);
            }
            else {
                _this.games = games;
                _this.allGamesAreDisplayed = true;
            }
            _this.onGamesLoaded();
        }, 150);
    };
    GameDatabaseComponent.prototype._filterGames = function (games) {
        var _this = this;
        if (this.filter) {
            //this._setPath("/games;filter=" + this.filter.property + ",value=" + this.filter.value);
            return games.filter(function (game) {
                // don't show things without names if we can't edit them
                if (!game.names.length && !_this.userService.can('game_edit')) {
                    return false;
                }
                if (_this.filter.property == 'TagID') {
                    for (var tagIDIndex = 0; tagIDIndex < game.tags.length; tagIDIndex++) {
                        if (game.tags[tagIDIndex]._id == _this.filter.value) {
                            return true;
                        }
                    }
                    return false;
                }
                else if (game[_this.filter.property] && game[_this.filter.property]._id) {
                    return game[_this.filter.property]._id == _this.filter.value;
                }
                else {
                    return game[_this.filter.property] == _this.filter.value;
                }
            });
        }
        else {
            return games;
        }
    };
    GameDatabaseComponent.prototype.onGamesLoaded = function () {
        var _this = this;
        // navigate to games;random=random to load a random game
        this.route.params.forEach(function (params) {
            if (params['random']) {
                _this.pathLocationStrategy.replaceState({}, "", "/app/games", "");
                _this.selectRandomGame();
            }
        });
    };
    GameDatabaseComponent.prototype.trackByGames = function (index, game) {
        return game._id;
    };
    GameDatabaseComponent.prototype.onSelect = function (game) {
        // remember the scroll position so we can return there when the user comes back
        if (!this.selectedGame) {
            this.previousScrollPosition = window.scrollY;
        }
        this._app.showBackground(false);
        if (!game) {
            this.selectedGame = null;
        }
        else {
            this.selectedGame = game;
        }
        var newPath = "/app/game/" + this.selectedGame._id;
        this._app.setPath(newPath);
        window.scrollTo(0, 0);
    };
    // private _setPath(path: string): void {
    //     if (this.pathLocationStrategy.path().indexOf("/game/") > -1) {
    //         this.pathLocationStrategy.replaceState({}, "", path, "");
    //     } else {
    //         this.pathLocationStrategy.pushState({}, "", path, "");
    //     }
    // }
    GameDatabaseComponent.prototype.selectRandomGame = function () {
        var _this = this;
        // reload the games, because we don't want to limit ourselves by just what has been loaded by the infinite scroll
        this.gameDatabaseService.getGames().then(function (games) {
            games = _this._filterGames(games);
            var i = Math.floor((Math.random() * games.length));
            _this.onSelect(games[i]);
        });
    };
    GameDatabaseComponent.prototype.closeDetails = function (tool) {
        var _this = this;
        if (tool && tool.name) {
            this.onToolClicked(tool);
        }
        else {
            this._goBack();
            setTimeout(function () {
                window.scrollTo(0, _this.previousScrollPosition);
                _this.previousScrollPosition = 0;
            }, 10);
        }
    };
    GameDatabaseComponent.prototype.onToolClicked = function (tool) {
        switch (tool.name) {
            case "showTags":
                tool.active = !tool.active;
                break;
            case "randomGame":
                this.selectRandomGame();
                break;
        }
    };
    GameDatabaseComponent.prototype.ngOnDestroy = function () {
    };
    GameDatabaseComponent.prototype.onSearchResultClick = function (result) {
        var _this = this;
        console.log(result);
        switch (result.type) {
            case 'search':
                if (result.text) {
                    this.filter = {
                        "property": "search",
                        "value": ""
                    };
                    this.searchTerm = result.text;
                    this.getGamesSearch(result.text);
                    this.setTitle();
                }
                else {
                    //this._goBack();
                    this.clearFilter();
                }
                return;
            case 'name':
                this.gameDatabaseService.getGame(result.id)
                    .then(function (game) { return _this.onSelect(game); });
                return;
            case 'tag':
                this.filter = {
                    "property": 'TagID',
                    "value": result.id
                };
                break;
            case 'duration':
                this.filter = {
                    "property": 'duration',
                    "value": result.id
                };
                break;
            case 'playercount':
                this.filter = {
                    "property": 'playerCount',
                    "value": result.id
                };
                break;
        }
        this.getGames();
        this.setTitle();
    };
    GameDatabaseComponent.prototype.onSearch = function (term) {
        var _this = this;
        this.gameDatabaseService.searchForResults(term)
            .then(function (results) { return _this.searchResults = results; });
    };
    GameDatabaseComponent.prototype._goBack = function () {
        this.pathLocationStrategy.back();
    };
    GameDatabaseComponent.prototype.clearFilter = function () {
        // TODO: back button should clear filters
        this.filter = null;
        this.getGames();
        this.setTitle();
    };
    GameDatabaseComponent.prototype.createGame = function () {
        var _this = this;
        if (this.userService.can('game_create')) {
            this.gameDatabaseService.createGame()
                .then(function (game) {
                _this.onSelect(game);
            });
        }
    };
    GameDatabaseComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "game-database",
            templateUrl: '../template/game-database.component.html',
            animations: [
                core_1.trigger('flyInOut', [
                    core_1.state('in', core_1.style({
                        opacity: 1
                    })),
                    core_1.transition('void => *', [
                        core_1.style({ opacity: 0 }),
                        core_1.animate(100)
                    ]),
                    core_1.transition('* => void', [
                        core_1.animate(100, core_1.style({ opacity: 0 }))
                    ])
                ])
            ]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.ActivatedRoute,
            router_1.Router,
            game_database_service_1.GameDatabaseService,
            common_1.PathLocationStrategy,
            user_service_1.UserService])
    ], GameDatabaseComponent);
    return GameDatabaseComponent;
}());
exports.GameDatabaseComponent = GameDatabaseComponent;

//# sourceMappingURL=game-database.component.js.map
