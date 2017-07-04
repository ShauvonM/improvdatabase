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
var util_1 = require("../../util/util");
var GameDatabaseService = (function () {
    function GameDatabaseService(http, userService) {
        this.http = http;
        this.userService = userService;
        // cache all the things
        this.games = [];
        this.names = [];
        this.playercounts = [];
        this.durations = [];
        this.tags = [];
    }
    GameDatabaseService.prototype.getGames = function () {
        var _this = this;
        if (!this._gamePromise) {
            this._gamePromise = this.http.get(constants_1.API.games)
                .toPromise()
                .then(function (response) {
                _this.games = response.json();
                _this._sortGames();
                return _this.games;
            })
                .catch(this.handleError);
        }
        return this._gamePromise;
    };
    GameDatabaseService.prototype.getGame = function (id) {
        var gameToReturn;
        if (this.games.length > 0) {
            this.games.forEach(function (game) {
                if (game._id === id) {
                    gameToReturn = game;
                }
            });
        }
        if (gameToReturn) {
            return Promise.resolve(gameToReturn);
        }
        else {
            // either no games are loaded or we couldn't find the specified one
            return this.http.get(constants_1.API.getGame(id))
                .toPromise()
                .then(function (response) {
                return response.json();
            })
                .catch(this.handleError);
        }
    };
    GameDatabaseService.prototype._sortGames = function () {
        this.games.sort(function (g1, g2) {
            if (!g1.names.length) {
                return -1;
            }
            if (!g2.names.length) {
                return 1;
            }
            return g1.names[0].name.localeCompare(g2.names[0].name);
        });
        return this.games;
    };
    GameDatabaseService.prototype.getNames = function () {
        var _this = this;
        if (!this._namePromise) {
            this._namePromise = this.http.get(constants_1.API.names)
                .toPromise()
                .then(function (response) {
                _this.names = response.json();
                return _this.names;
            })
                .catch(this.handleError);
        }
        return this._namePromise;
    };
    /**
     * A convenience method to search any array of items for any that are linked to a given game id
     *
     * Not currently used anywhere, and it's making Typescript freak out - ain't nobody got time for that
     */
    // private _getItemsByGameID(items: any[], id: number): any[] {
    //     let returnItems: Game[]|Name[] = [];
    //     items.forEach(item => {
    //         if (item.game && item.game == id) {
    //             returnItems.push(item);
    //         } else if (item.games && Util.indexOfId(item.games, id) > -1) {
    //             returnItems.push(item);
    //         }
    //     });
    //     return returnItems;
    // }
    /**
     * Creates a new name for the given gameID, making a post to /api/name
     */
    GameDatabaseService.prototype.createName = function (gameID, name) {
        var _this = this;
        return this.http.post(constants_1.API.names, {
            game: gameID,
            name: name
        })
            .toPromise()
            .then(function (response) {
            var name = response.json();
            _this.names.push(name);
            _this.getGame(name.game).then(function (g) {
                g.names.unshift(name);
                _this._sortGames();
            });
            return name;
        })
            .catch(this.handleError);
    };
    /**
     * Updates a name on the server, making a PUT call to /api/name/:_id
     */
    GameDatabaseService.prototype.saveName = function (name) {
        var _this = this;
        return this.http.put(constants_1.API.getName(name._id), name)
            .toPromise()
            .then(function (response) {
            var newName = response.json();
            var index = util_1.Util.indexOfId(_this.names, name);
            if (index > -1) {
                _this.names.splice(index, 1, newName);
            }
            else {
                _this.names.push(newName);
            }
            _this._sortGames();
            return newName;
        });
    };
    GameDatabaseService.prototype.saveTag = function (tag) {
        var _this = this;
        return this.http.put(constants_1.API.getTag(tag._id), tag).toPromise()
            .then(function (response) {
            var index = util_1.Util.indexOfId(_this.tags, tag);
            var t = response.json();
            _this.tags.splice(index, 1, t);
            return t;
        });
    };
    GameDatabaseService.prototype.newTag = function () {
        var _this = this;
        return this.http.post(constants_1.API.tags, { name: 'New Tag' }).toPromise()
            .then(function (response) {
            var tag = response.json();
            _this.tags.push(tag);
            return tag;
        });
    };
    GameDatabaseService.prototype.deleteTag = function (tag) {
        var _this = this;
        return this.http.delete(constants_1.API.getTag(tag._id)).toPromise()
            .then(function (response) {
            var index = util_1.Util.indexOfId(_this.tags, tag);
            _this.tags.splice(index, 1);
            return true;
        });
    };
    GameDatabaseService.prototype.getPlayerCounts = function () {
        var _this = this;
        if (!this._playerCountPromise) {
            this._playerCountPromise = this.http.get(constants_1.API.playerCount)
                .toPromise()
                .then(function (response) {
                _this.playercounts = response.json();
                _this.sortPlayerCounts();
                return _this.playercounts;
            })
                .catch(this.handleError);
        }
        return this._playerCountPromise;
    };
    GameDatabaseService.prototype.sortPlayerCounts = function () {
        this.playercounts.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    };
    GameDatabaseService.prototype.getPlayerCountById = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getPlayerCounts().then(function (playercounts) {
                playercounts.forEach(function (playercount) {
                    if (playercount._id == id) {
                        resolve(playercount);
                    }
                });
            });
        });
    };
    GameDatabaseService.prototype.createPlayerCount = function (name, min, max, description) {
        var _this = this;
        return this.http.post(constants_1.API.metadata, {
            name: name,
            min: min,
            max: max,
            type: 'playerCount',
            description: description
        })
            .toPromise()
            .then(function (response) {
            var playercount = response.json();
            _this.playercounts.push(playercount);
            _this.sortPlayerCounts();
            return playercount;
        });
    };
    GameDatabaseService.prototype.getDurations = function () {
        var _this = this;
        if (!this._durationPromise) {
            this._durationPromise = this.http.get(constants_1.API.duration)
                .toPromise()
                .then(function (response) {
                _this.durations = response.json();
                _this.sortDurations();
                return _this.durations;
            })
                .catch(this.handleError);
        }
        return this._durationPromise;
    };
    GameDatabaseService.prototype.sortDurations = function () {
        this.durations.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    };
    GameDatabaseService.prototype.getDurationById = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getDurations().then(function (durations) {
                durations.forEach(function (duration) {
                    if (duration._id == id) {
                        resolve(duration);
                    }
                });
            });
        });
    };
    GameDatabaseService.prototype.createDuration = function (name, min, max, description) {
        var _this = this;
        return this.http.post(constants_1.API.metadata, {
            name: name,
            min: min,
            max: max,
            type: 'duration',
            description: description
        })
            .toPromise()
            .then(function (response) {
            var duration = response.json();
            _this.durations.push(duration);
            _this.sortDurations();
            return duration;
        });
    };
    GameDatabaseService.prototype.getTags = function () {
        var _this = this;
        if (!this._tagPromise) {
            if (this.userService.can('tag_view')) {
                this._tagPromise = this.http.get(constants_1.API.tags)
                    .toPromise()
                    .then(function (response) {
                    _this.tags = response.json();
                    return _this.tags;
                })
                    .catch(this.handleError);
            }
            else {
                this._tagPromise = new Promise(function (resolve, reject) {
                    resolve([]);
                });
            }
        }
        return this._tagPromise;
    };
    GameDatabaseService.prototype.getTagById = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getTags().then(function (tags) {
                tags.forEach(function (tag) {
                    if (tag._id == id) {
                        resolve(tag);
                    }
                });
            });
        });
    };
    GameDatabaseService.prototype.gameHasTag = function (game, tagIDs) {
        var foundTagGame = false;
        game.tags.forEach(function (tag) {
            if (util_1.Util.indexOfId(tagIDs, tag) > -1) {
                foundTagGame = true;
                return false;
            }
        });
        return foundTagGame;
    };
    GameDatabaseService.prototype.deleteGame = function (game) {
        var _this = this;
        return this.http.delete(constants_1.API.getGame(game._id))
            .toPromise()
            .then(function (response) {
            _this._removeGameFromArray(game);
            return true;
        });
    };
    GameDatabaseService.prototype._removeGameFromArray = function (game) {
        var index = util_1.Util.indexOfId(this.games, game);
        if (index > -1) {
            this.games.splice(index, 1);
        }
        return index;
    };
    GameDatabaseService.prototype._handleNewGame = function (game, response) {
        var index = this._removeGameFromArray(game);
        var newGame = response.json();
        if (index > -1) {
            this.games.splice(index, 0, newGame);
        }
        else {
            this.games.push(newGame);
        }
        this._sortGames();
        return newGame;
    };
    GameDatabaseService.prototype.saveGame = function (game) {
        var _this = this;
        return this.http.put(constants_1.API.getGame(game._id), game)
            .toPromise()
            .then(function (response) {
            return _this._handleNewGame(game, response);
        })
            .catch(this.handleError);
    };
    GameDatabaseService.prototype.createGame = function () {
        var _this = this;
        return this.http.post(constants_1.API.games, {})
            .toPromise()
            .then(function (response) {
            var game = response.json();
            _this.games.push(game);
            _this._sortGames();
            return game;
        })
            .catch(this.handleError);
    };
    GameDatabaseService.prototype.saveTagToGame = function (game, tag) {
        var _this = this;
        return this.http.post(constants_1.API.gameAddTag(game._id, tag._id), {})
            .toPromise()
            .then(function (response) {
            return _this._handleNewGame(game, response);
        });
    };
    GameDatabaseService.prototype.deleteTagFromGame = function (game, tag) {
        var _this = this;
        return this.http.delete(constants_1.API.gameRemoveTag(game._id, tag._id))
            .toPromise()
            .then(function (response) {
            return _this._handleNewGame(game, response);
        });
    };
    GameDatabaseService.prototype.createTag = function (name, game) {
        var _this = this;
        return this.http.post(constants_1.API.gameCreateTag(game._id, name), { name: name })
            .toPromise()
            .then(function (response) {
            // reset the tags so we have to re-fetch the whole list
            _this._tagPromise = null;
            return _this._handleNewGame(game, response);
        });
    };
    GameDatabaseService.prototype.handleError = function (error) {
        // console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    };
    // TODO: search stuff can be in a separate service
    GameDatabaseService.prototype._searchArray = function (arr, type, idProperty, term) {
        var results = [];
        arr.forEach(function (item) {
            var str = item.name;
            if (str.toLowerCase().indexOf(term) > -1) {
                var regex = new RegExp('(' + term + ')', 'gi');
                str = str.replace(regex, '<strong>$1</strong>');
                var result = {
                    text: str,
                    id: item[idProperty],
                    type: type
                };
                results.push(result);
            }
        });
        return results;
    };
    GameDatabaseService.prototype._sortSearchResults = function (results) {
        results.sort(function (r1, r2) {
            var val1 = r1.text;
            var val2 = r2.text;
            if (val1 > val2) {
                return 1;
            }
            if (val1 < val2) {
                return -1;
            }
            return 0;
        });
        return results;
    };
    GameDatabaseService.prototype.searchForResults = function (term) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            term = term.toLowerCase();
            var searchResults = [];
            if (term) {
                Promise.all([
                    _this.getNames(),
                    _this.getTags(),
                    _this.getDurations(),
                    _this.getPlayerCounts()
                ])
                    .then(function (items) {
                    searchResults = []
                        .concat(_this._searchArray(items[0], 'name', 'game', term))
                        .concat(_this._searchArray(items[1], 'tag', '_id', term))
                        .concat(_this._searchArray(items[2], 'duration', '_id', term))
                        .concat(_this._searchArray(items[3], 'playercount', '_id', term));
                    // TODO: include player count and durations by actual values if the term is a number?
                    searchResults = _this._sortSearchResults(searchResults);
                    resolve(searchResults);
                });
            }
        });
    };
    GameDatabaseService.prototype.searchForTags = function (term) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            term = term.toLocaleLowerCase();
            var matchingTags = [];
            if (term) {
                _this.getTags().then(function (tags) {
                    tags.forEach(function (tag) {
                        if (tag.name.toLocaleLowerCase().indexOf(term) > -1) {
                            matchingTags.push(tag);
                        }
                    });
                    resolve(matchingTags);
                });
            }
        });
    };
    GameDatabaseService.prototype.searchForGames = function (term) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            term = term.toLowerCase();
            var gameResults = [];
            if (term) {
                Promise.all([
                    _this.getGames(),
                    _this.getTags(),
                    _this.getDurations(),
                    _this.getPlayerCounts()
                ])
                    .then(function (items) {
                    // search the tags
                    var tagResults = [];
                    items[1].forEach(function (tag) {
                        if (tag.name.toLowerCase().indexOf(term) > -1) {
                            tagResults.push(tag._id);
                        }
                    });
                    // search the durations
                    var durationResults = [];
                    items[2].forEach(function (duration) {
                        if (duration.name.toLowerCase().indexOf(term) > -1) {
                            durationResults.push(duration._id);
                        }
                    });
                    // search the player counts
                    var playerCountResults = [];
                    items[3].forEach(function (playercount) {
                        if (playercount.name.toLowerCase().indexOf(term) > -1) {
                            playerCountResults.push(playercount._id);
                        }
                    });
                    // loop through the games
                    items[0].forEach(function (game) {
                        // add it if a tag matches or if the playercount or duration matches
                        if (_this.gameHasTag(game, tagResults) ||
                            durationResults.indexOf(game.duration._id) > -1 ||
                            playerCountResults.indexOf(game.playerCount._id) > -1) {
                            gameResults.push(game);
                        }
                        else {
                            // add it if a name matches
                            game.names.forEach(function (name) {
                                if (name.name.toLowerCase().indexOf(term) > -1 &&
                                    util_1.Util.indexOfId(gameResults, game) == -1) {
                                    gameResults.push(game);
                                }
                            });
                        }
                    });
                    resolve(gameResults);
                });
            }
        });
    };
    GameDatabaseService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp,
            user_service_1.UserService])
    ], GameDatabaseService);
    return GameDatabaseService;
}());
exports.GameDatabaseService = GameDatabaseService;

//# sourceMappingURL=game-database.service.js.map
