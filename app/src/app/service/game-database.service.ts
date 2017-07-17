import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { AppHttp } from '../../data/app-http';
import { API } from '../../constants';

import { Name } from '../../model/name';
import { Game } from '../../model/game';
import { GameMetadata } from '../../model/game-metadata';
import { Tag } from '../../model/tag';
import { Note } from '../../model/note';

import { SearchResult } from '../../app/view/toolbar.view';

import { UserService } from '../../service/user.service';

import { Util } from '../../util/util';

@Injectable()
export class GameDatabaseService {

    // cache all the things
    private games: Game[] = [];
    private names: Name[] = [];
    private playercounts: GameMetadata[] = [];
    private durations: GameMetadata[] = [];
    private tags: Tag[] = [];

    private sortProperty: string;

    constructor(
        private http: AppHttp,
        private userService: UserService
        ) { }

    private _gamePromise: Promise<Game[]>;
    getGames(): Promise<Game[]> {
        if (!this._gamePromise) {
            this._gamePromise = this.http.get(API.games)
                .toPromise()
                .then(response => {
                    this.games = response.json() as Game[];
                    this._sortGames();
                    return this.games;
                })
                .catch(this.handleError);
        } 
        return this._gamePromise;
    }

    getGame(id: string): Promise<Game> {
        let gameToReturn: Game;
        if (this.games.length > 0) {
            this.games.forEach((game) => {
                if (game._id === id) {
                    gameToReturn = game;
                }
            })
        }

        if (gameToReturn) {
            return Promise.resolve(gameToReturn);
        } else {
            // either no games are loaded or we couldn't find the specified one
            return this.http.get(API.getGame(id))
                .toPromise()
                .then(response => {
                    return response.json() as Game;
                })
                .catch(this.handleError);
        }
    }

    private _sortGames(): Game[] {
        this.games.sort((g1, g2) => {
            if (!g1.names.length) {
                return -1;
            }
            if (!g2.names.length) {
                return 1;
            }

            return g1.names[0].name.localeCompare(g2.names[0].name);
        });
        return this.games;
    }

    private _namePromise: Promise<Name[]>;
    getNames(): Promise<Name[]> {
        if (!this._namePromise) {
            this._namePromise = this.http.get(API.names)
                .toPromise()
                .then(response => {
                    this.names = response.json() as Name[];
                    return this.names;
                })
                .catch(this.handleError);
        }
        return this._namePromise;
    }

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
    createName(gameID: string, name: string): Promise<Name> {
        return this.http.post(API.names, {
            game: gameID,
            name: name
        })
            .toPromise()
            .then(response => {
                let name = response.json() as Name;
                this.names.push(name);

                this.getGame(name.game).then(g => {
                    g.names.unshift(name);
                    this._sortGames();
                });
                return name;
            })
            .catch(this.handleError);
    }

    /**
     * Updates a name on the server, making a PUT call to /api/name/:_id
     */
    saveName(name: Name): Promise<Name> {
        return this.http.put(API.getName(name._id), name)
            .toPromise()
            .then(response => {
                let newName = response.json() as Name;
                let index = Util.indexOfId(this.names, name);
                if (index > -1) {
                    this.names.splice(index, 1, newName);
                } else {
                    this.names.push(newName);
                }
                this._sortGames();
                return newName; 
            })
    }

    saveTag(tag: Tag): Promise<Tag> {
        return this.http.put(API.getTag(tag._id), tag).toPromise()
            .then(response => {
                let index = Util.indexOfId(this.tags, tag);
                let t = response.json() as Tag;
                this.tags.splice(index, 1, t);
                return t;
            });
    }

    newTag(): Promise<Tag> {
        return this.http.post(API.tags, {name: 'New Tag'}).toPromise()
            .then(response => {
                let tag = response.json() as Tag;
                this.tags.push(tag);
                return tag;
            })
    }

    deleteTag(tag: Tag): Promise<boolean> {
        return this.http.delete(API.getTag(tag._id)).toPromise()
            .then(response => {
                let index = Util.indexOfId(this.tags, tag);
                this.tags.splice(index, 1);
                return true;
            })
    }

    private _playerCountPromise: Promise<GameMetadata[]>;
    getPlayerCounts(): Promise<GameMetadata[]> {
        if (!this._playerCountPromise) {
            this._playerCountPromise = this.http.get(API.playerCount)
                .toPromise()
                .then(response => {
                    this.playercounts = response.json() as GameMetadata[];
                    this.sortPlayerCounts();
                    return this.playercounts;
                })
                .catch(this.handleError);
        }
        return this._playerCountPromise;
    }

    private sortPlayerCounts(): void {
        this.playercounts.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }

    getPlayerCountById(id: String): Promise<GameMetadata> {
        return new Promise<GameMetadata>((resolve, reject) => {
            this.getPlayerCounts().then((playercounts) => {
                playercounts.forEach((playercount) => {
                    if (playercount._id == id) {
                        resolve(playercount);
                    }
                });
            })
        });
    }

    createPlayerCount(name: string, min: number, max: number, description: string): Promise<GameMetadata> {
        return this.http.post(API.metadata,
            {
                name: name,
                min: min,
                max: max,
                type: 'playerCount',
                description: description
            })
            .toPromise()
            .then((response) => {
                let playercount = response.json() as GameMetadata;
                this.playercounts.push(playercount);
                this.sortPlayerCounts();
                return playercount;
            });
    }

    private _durationPromise: Promise<GameMetadata[]>;
    getDurations(): Promise<GameMetadata[]> {
        if (!this._durationPromise) {
            this._durationPromise = this.http.get(API.duration)
                .toPromise()
                .then(response => {
                    this.durations = response.json() as GameMetadata[];
                    this.sortDurations();
                    return this.durations;
                })
                .catch(this.handleError);
        }
        return this._durationPromise;
    }

    private sortDurations(): void {
        this.durations.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }

    getDurationById(id: String): Promise<GameMetadata> {
        return new Promise<GameMetadata>((resolve, reject) => {
            this.getDurations().then((durations) => {
                durations.forEach((duration) => {
                    if (duration._id == id) {
                        resolve(duration);
                    }
                });
            })
        });
    }

    createDuration(name: string, min: number, max: number, description: string): Promise<GameMetadata> {
        return this.http.post(API.metadata,
            {
                name: name,
                min: min,
                max: max,
                type: 'duration',
                description: description
            })
            .toPromise()
            .then((response) => {
                let duration = response.json() as GameMetadata;
                this.durations.push(duration);
                this.sortDurations();
                return duration;
            });
    }

    private _tagPromise: Promise<Tag[]>;
    getTags(): Promise<Tag[]> {
        if (!this._tagPromise) {
            if (this.userService.can('tag_view')) {
                this._tagPromise = this.http.get(API.tags)
                    .toPromise()
                    .then(response => {
                        this.tags = response.json() as Tag[];
                        return this.tags;
                    })
                    .catch(this.handleError);
            } else {
                this._tagPromise = new Promise<Tag[]>((resolve, reject) => {
                    resolve([]);
                });
            }
        }
        return this._tagPromise;
    }

    getTagById(id: String): Promise<Tag> {
        return new Promise<Tag>((resolve, reject) => {
            this.getTags().then((tags) => {
                tags.forEach((tag) => {
                    if (tag._id == id) {
                        resolve(tag);
                    }
                });
            });
        });
    }

    gameHasTag(game: Game, tagIDs: string[]): boolean {
        let foundTagGame: boolean = false;
        (<Tag[]> game.tags).forEach((tag) => {
            if (Util.indexOfId(tagIDs, tag) > -1) {
                foundTagGame = true;
                return false;
            }
        });
        return foundTagGame;
    }

    deleteGame(game: Game): Promise<boolean> {
        return this.http.delete(API.getGame(game._id))
            .toPromise()
            .then((response) => {
                this._removeGameFromArray(game);
                return true;
            })
    }

    private _removeGameFromArray(game: Game): number {
        let index = Util.indexOfId(this.games, game);

        if (index > -1) {
            this.games.splice(index, 1);
        }
        return index;
    }

    private _handleNewGame(game: Game, response: Response): Game {
        let index = this._removeGameFromArray(game);
        let newGame = response.json() as Game;
        if (index > -1) {
            this.games.splice(index, 0, newGame);
        } else {
            this.games.push(newGame);
        }
        this._sortGames();
        return newGame;
    }

    saveGame(game: Game): Promise<Game> {
        return this.http.put(API.getGame(game._id), game)
            .toPromise()
            .then((response) => {
                return this._handleNewGame(game, response);
            })
            .catch(this.handleError);
    }

    createGame(): Promise<Game> {
        return this.http.post(API.games, {})
            .toPromise()
            .then((response) => {
                let game = response.json() as Game;
                this.games.push(game);
                this._sortGames();
                return game;
            })
            .catch(this.handleError);
    }

    saveTagToGame(game: Game, tag: Tag): Promise<Game> {
        return this.http.post(API.gameAddTag(game._id, tag._id), {})
            .toPromise()
            .then(response => {
                return this._handleNewGame(game, response);
            });
    }

    deleteTagFromGame(game: Game, tag: Tag): Promise<Game> {
        return this.http.delete(API.gameRemoveTag(game._id, tag._id))
            .toPromise()
            .then(response => {
                return this._handleNewGame(game, response);
            })
    }

    createTag(name: string, game: Game): Promise<Game> {
        return this.http.post(API.gameCreateTag(game._id, name), { name: name })
            .toPromise()
            .then(response => {
                // reset the tags so we have to re-fetch the whole list
                this._tagPromise = null;
                return this._handleNewGame(game, response);
            });
    }

    private handleError(error: any): Promise<any> {
        // console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    }

    // TODO: search stuff can be in a separate service

    private _searchArray(arr: any[], type: string, idProperty: string, term: string): SearchResult[] {
        let results: SearchResult[] = [];
        arr.forEach((item) => {
            let str = item.name;

            if (str.toLowerCase().indexOf(term) > -1) {
                var regex = new RegExp('(' + term + ')', 'gi');
                str = str.replace(regex, '<strong>$1</strong>');

                let result: SearchResult = {
                    text: str,
                    id: item[idProperty],
                    type: type
                }
                results.push(result);
            }
        });
        return results;
    }
    private _sortSearchResults(results: SearchResult[]): SearchResult[] {
        results.sort((r1, r2) => {
            let val1 = r1.text;
            let val2 = r2.text;
            if (val1 > val2) {
                return 1;
            }
            if (val1 < val2) {
                return -1;
            }
            return 0;
        });
        return results;
    }

    searchForResults(term: string): Promise<SearchResult[]> {
        return new Promise<SearchResult[]>((resolve, reject) => {
            term = term.toLowerCase();
            let searchResults: SearchResult[] = [];
            if (term) {
                Promise.all([
                    this.getNames(),
                    this.getTags(),
                    this.getDurations(),
                    this.getPlayerCounts()
                ])
                    .then((items) => {
                        searchResults = []
                            .concat(this._searchArray(items[0], 'name', 'game', term))
                            .concat(this._searchArray(items[1], 'tag', '_id', term))
                            .concat(this._searchArray(items[2], 'duration', '_id', term))
                            .concat(this._searchArray(items[3], 'playercount', '_id', term));

                        // TODO: include player count and durations by actual values if the term is a number?

                        searchResults = this._sortSearchResults(searchResults);

                        resolve(searchResults);
                    });
            }
        });
    }

    searchForTags(term: string): Promise<Tag[]> {
        return new Promise<Tag[]>((resolve, reject) => {
            term = term.toLocaleLowerCase();
            let matchingTags: Tag[] = [];
            if (term) {
                this.getTags().then(tags => {
                    tags.forEach(tag => {
                        if (tag.name.toLocaleLowerCase().indexOf(term) > -1) {
                            matchingTags.push(tag);
                        }
                    });
                    resolve(matchingTags);
                });
            }
        })
    }

    searchForGames(term: string): Promise<Game[]> {
        return new Promise<Game[]>((resolve, reject) => {
            term = term.toLowerCase();
            let gameResults: Game[] = [];
            if (term) {
                Promise.all([
                    this.getGames(),
                    this.getTags(),
                    this.getDurations(),
                    this.getPlayerCounts()
                ])
                    .then((items) => {
                        
                        // search the tags
                        let tagResults: string[] = [];
                        items[1].forEach((tag) => {
                            if (tag.name.toLowerCase().indexOf(term) > -1) {
                                tagResults.push(tag._id);
                            }
                        });

                        // search the durations
                        let durationResults: String[] = [];
                        items[2].forEach((duration) => {
                            if (duration.name.toLowerCase().indexOf(term) > -1) {
                                durationResults.push(duration._id);
                            }
                        });

                        // search the player counts
                        let playerCountResults: String[] = [];
                        items[3].forEach((playercount) => {
                            if (playercount.name.toLowerCase().indexOf(term) > -1) {
                                playerCountResults.push(playercount._id);
                            }
                        });

                        // loop through the games
                        items[0].forEach((game) => {
                            // add it if a tag matches or if the playercount or duration matches
                            if (this.gameHasTag(game, tagResults) ||
                                    durationResults.indexOf(game.duration._id) > -1 ||
                                    playerCountResults.indexOf(game.playerCount._id) > -1 ) {
                                gameResults.push(game);
                            } else {
                                // add it if a name matches
                                game.names.forEach((name) => {
                                    if (name.name.toLowerCase().indexOf(term) > -1 &&
                                            Util.indexOfId(gameResults, game) == -1) {
                                        gameResults.push(game);
                                    }
                                });
                            }
                        });

                        resolve(gameResults);
                    });
            }
        });
    }
}
