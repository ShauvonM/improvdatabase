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
require("rxjs/Subject");
var router_1 = require("@angular/router");
var app_component_1 = require("../../component/app.component");
var user_service_1 = require("../../service/user.service");
var Tool = (function () {
    function Tool() {
        this.active = false;
    }
    return Tool;
}());
exports.Tool = Tool;
var SearchResult = (function () {
    function SearchResult() {
    }
    return SearchResult;
}());
exports.SearchResult = SearchResult;
var ToolbarView = (function () {
    function ToolbarView(_app, router, userService) {
        /* I won't use this, but here is how to subscribe to router events!
        // when changing route, reset the toolbar
        router.events.subscribe(val => {
            if (val instanceof RoutesRecognized) {
                this.setTitle("");
                this.setTools([]);
            }
        })
        */
        this._app = _app;
        this.router = router;
        this.userService = userService;
        this.title = "";
        this.tools = [];
        this.allowedTools = [];
        this.showBack = false;
        this.showFilterClear = false;
        this.showSearch = false;
        this.searchResults = [];
        this.toolClicked = new core_1.EventEmitter();
        this.goBack = new core_1.EventEmitter();
        this.search = new core_1.EventEmitter();
        this.searchResultClick = new core_1.EventEmitter();
        this.searchOpen = false;
        this.searchActive = false;
        // TODO: pre-populate results with history and favorites
    }
    ToolbarView.prototype.ngOnInit = function () {
        var _this = this;
        // let perms = this.userService.getPermissions();
        this.tools.forEach(function (tool) {
            if (!tool.permission || _this.userService.can(tool.permission)) {
                _this.allowedTools.push(tool);
            }
        });
    };
    ToolbarView.prototype.setTitle = function (title) {
        this.title = title;
    };
    ToolbarView.prototype.setTools = function (tools) {
        this.tools = tools;
    };
    ToolbarView.prototype.toolClick = function (tool) {
        this.toolClicked.emit(tool);
    };
    ToolbarView.prototype.toggleNav = function () {
        this._app.toggleNav();
    };
    ToolbarView.prototype.back = function () {
        if (this.searchActive) {
            this.clearSearch();
        }
        else {
            this.goBack.emit();
        }
    };
    ToolbarView.prototype.openSearch = function () {
        this.searchOpen = true;
    };
    ToolbarView.prototype.closeSearch = function () {
        this.searchOpen = false;
    };
    ToolbarView.prototype.clearSearch = function () {
        if (this.searchActive) {
            this.searchResultClick.emit({
                "type": "search",
                "text": ""
            });
        }
        this.searchTerm = "";
        this.searchActive = false;
        this.closeSearch();
    };
    ToolbarView.prototype.typeSearch = function (event) {
        var _this = this;
        if (event.keyCode == 13) {
            this.searchResultClick.emit({
                "type": "search",
                "text": this.searchTerm
            });
            this.searchActive = true;
        }
        else {
            clearTimeout(this._typeDebounce);
            this._typeDebounce = setTimeout(function () {
                _this.search.emit(_this.searchTerm);
            }, 300);
        }
    };
    ToolbarView.prototype.clickResult = function (result) {
        this.searchResultClick.emit(result);
        this.clearSearch();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], ToolbarView.prototype, "title", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ToolbarView.prototype, "tools", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarView.prototype, "showBack", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarView.prototype, "showFilterClear", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarView.prototype, "showSearch", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ToolbarView.prototype, "searchResults", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarView.prototype, "toolClicked", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ToolbarView.prototype, "goBack", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarView.prototype, "search", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarView.prototype, "searchResultClick", void 0);
    ToolbarView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: '.toolbar',
            templateUrl: '../template/view/toolbar.view.html'
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            user_service_1.UserService])
    ], ToolbarView);
    return ToolbarView;
}());
exports.ToolbarView = ToolbarView;

//# sourceMappingURL=toolbar.view.js.map
