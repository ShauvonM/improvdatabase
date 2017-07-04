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
var router_1 = require("@angular/router");
var app_component_1 = require("../../component/app.component");
var tag_1 = require("../../model/tag");
var game_database_service_1 = require("../service/game-database.service");
var user_service_1 = require("../../service/user.service");
var util_1 = require("../../util/util");
var GlossaryComponent = (function () {
    function GlossaryComponent(_app, router, gameService, userService) {
        this._app = _app;
        this.router = router;
        this.gameService = gameService;
        this.userService = userService;
        this.title = '<span class="light">glossary</span>';
        this.toggleGamelessTags = false;
        this.toggleAllTags = false;
        this._tagDisplayCount = 0;
        this._tools = [];
    }
    GlossaryComponent.prototype.ngOnInit = function () {
        this.superAdmin = this.userService.isSuperAdmin();
    };
    GlossaryComponent.prototype.allTagsToggle = function () {
        var _this = this;
        setTimeout(function () {
            _this.getTags();
        }, 100);
    };
    GlossaryComponent.prototype.getTags = function () {
        var _this = this;
        this.selectedTag = null;
        this.isLoadingTags = true;
        this.gameService.getTags().then(function (tags) {
            var filteredtags = tags.filter(function (tag) {
                if (_this.toggleGamelessTags) {
                    return tag.games.length == 0;
                }
                else {
                    var pass = _this.toggleAllTags || !!tag.description;
                    if (_this.filter) {
                        pass = pass &&
                            (tag.name.toLowerCase().indexOf(_this.filter.toLowerCase()) > -1 ||
                                tag.description.toLowerCase().indexOf(_this.filter.toLowerCase()) > -1);
                    }
                    return pass;
                }
            }).sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            if (filteredtags.length > _this._tagDisplayCount) {
                _this.tags = filteredtags.slice(0, _this._tagDisplayCount);
                _this.allTagsAreDisplayed = false;
            }
            else {
                _this.tags = filteredtags;
                _this.allTagsAreDisplayed = true;
            }
            _this.isLoadingTags = false;
        });
    };
    GlossaryComponent.prototype.loadMoreTags = function (page) {
        if (!this.allTagsAreDisplayed) {
            this._tagDisplayCount = 30 * page;
            this.getTags();
        }
    };
    GlossaryComponent.prototype.onSelect = function (tag) {
        if (this.selectedTag && this.selectedTag._id == tag._id) {
            return;
        }
        this.selectedTag = tag;
        this.tagName = tag.name;
        this.tagDescription = tag.description;
    };
    GlossaryComponent.prototype.saveTag = function () {
        var _this = this;
        this.savingTag = this.selectedTag;
        this.savingTag.name = this.tagName;
        this.savingTag.description = this.tagDescription;
        this.gameService.saveTag(this.savingTag).then(function (tag) {
            _this.savingTag = null;
        });
        setTimeout(function () {
            _this.selectedTag = null;
        }, 10);
    };
    GlossaryComponent.prototype.deleteTag = function () {
        var _this = this;
        var index = util_1.Util.indexOfId(this.tags, this.selectedTag);
        this.gameService.deleteTag(this.selectedTag);
        setTimeout(function () {
            _this.tags.splice(index, 1);
            _this.selectedTag = null;
        }, 10);
    };
    GlossaryComponent.prototype.onSearch = function (result) {
        if (result.type == 'search') {
            this.filter = result.text;
            this.getTags();
        }
    };
    GlossaryComponent.prototype.clearFilter = function () {
        this.filter = '';
        this.getTags();
    };
    GlossaryComponent.prototype.createTag = function () {
        var _this = this;
        this.savingTag = new tag_1.Tag();
        this.tags.unshift(this.savingTag);
        this.gameService.newTag().then(function (tag) {
            _this.tags.splice(0, 1, tag);
            _this.savingTag = null;
        });
    };
    GlossaryComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "glossary",
            templateUrl: "../template/glossary.component.html"
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            game_database_service_1.GameDatabaseService,
            user_service_1.UserService])
    ], GlossaryComponent);
    return GlossaryComponent;
}());
exports.GlossaryComponent = GlossaryComponent;

//# sourceMappingURL=glossary.component.js.map
