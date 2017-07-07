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
var app_service_1 = require("../../service/app.service");
var history_service_1 = require("../service/history.service");
var game_database_service_1 = require("../service/game-database.service");
var user_service_1 = require("../../service/user.service");
var time_util_1 = require("../../util/time.util");
var app_http_1 = require("../../data/app-http");
var util_1 = require("../../util/util");
var anim_util_1 = require("../../util/anim.util");
var AdminComponent = (function () {
    function AdminComponent(_app, router, _service, userService, historyService, gameService, http) {
        this._app = _app;
        this.router = router;
        this._service = _service;
        this.userService = userService;
        this.historyService = historyService;
        this.gameService = gameService;
        this.http = http;
        this.title = '<span class="light">super</span><strong>admin</strong>';
        this.tabs = [
            {
                name: 'History',
                id: 'history',
                icon: 'history'
            }
        ];
        this.selectedTab = 'history';
        this.historyDisplayCount = 0;
        this.historyShowStuff = true;
        this._tools = [
            {
                icon: "fa-database",
                name: "backup",
                text: "Back Up Database"
            },
            {
                icon: "fa-cloud-upload",
                name: "restoredb",
                text: "Restore Database from Backup"
            }
        ];
    }
    AdminComponent.prototype.onToolClicked = function (tool) {
        switch (tool.name) {
            case "backup":
                this.doBackup();
                break;
            case "restoredb":
                this.restore();
                break;
        }
    };
    AdminComponent.prototype.ngOnInit = function () {
        this.getHistory();
    };
    AdminComponent.prototype.selectTab = function (tab) {
        this.selectedTab = tab.id;
    };
    AdminComponent.prototype.back = function () {
    };
    AdminComponent.prototype.simpleDate = function (date) {
        return time_util_1.TimeUtil.simpleDate(date);
    };
    AdminComponent.prototype.simpleDateTime = function (date) {
        return time_util_1.TimeUtil.simpleDate(date) + ' ' + time_util_1.TimeUtil.simpleTime(date);
    };
    AdminComponent.prototype.getHistory = function () {
        var _this = this;
        this.historyService.getAllHistory().then(function (histories) {
            _this.rawHistories = histories;
            _this.filterHistory();
        });
    };
    AdminComponent.prototype.getHistoryIcon = function (history) {
        switch (history.action) {
            case 'game_edit':
                return 'fa-rocket';
            case 'change_password':
                return 'fa-key';
            case 'note_edit':
                return 'fa-sticky-note';
            case 'account_edit':
                return 'fa-user';
            case 'team_join':
                return 'fa-user-plus';
            case 'team_leave':
                return 'fa-user-times';
            case 'team_user_promote':
                return 'fa-black-tie';
            case 'login':
                return 'fa-sign-in';
            case 'logout':
                return 'fa-sign-out';
            case 'refresh':
                return 'fa-refresh';
            default:
                return 'fa-history';
        }
    };
    AdminComponent.prototype.historyLink = function (event, history) {
        switch (history.action) {
            case 'game_edit':
            case 'game_tag_add':
            case 'game_tag_remove':
                this.router.navigate(['/app/game', history.target]);
                break;
        }
        event.preventDefault();
    };
    AdminComponent.prototype.expandHistory = function (history) {
        var _this = this;
        if (this.expandedHistory == history ||
            history.action == 'login' || history.action == 'logout' || history.action == 'refresh') {
            this.expandedHistory = null;
            return;
        }
        this.expandedHistory = history;
        var target = history.target, reference = history.reference;
        this.expandedHistoryTargetName = 'loading';
        switch (history.action) {
            case 'game_edit':
                this.gameService.getGame(target).then(function (game) {
                    if (game.names.length) {
                        _this.expandedHistoryTargetName = game.names[0].name;
                    }
                    else {
                        _this.expandedHistoryTargetName = '';
                    }
                });
                break;
            case 'game_tag_add':
                this.gameService.getGame(target).then(function (game) {
                    _this.expandedHistoryTargetName = '';
                    if (game.tags.length) {
                        var index = util_1.Util.indexOfId(game.tags, reference);
                        if (index > -1) {
                            _this.expandedHistoryTargetName = '<span class="tag"><i class="fa fa-hashtag"></i> ' + game.tags[index].name + '</span> &gt; ';
                        }
                    }
                    if (game.names.length) {
                        _this.expandedHistoryTargetName += game.names[0].name;
                    }
                });
                break;
            case 'game_tag_remove':
                this.gameService.getGame(target).then(function (game) {
                    _this.expandedHistoryTargetName = '';
                    _this.expandedHistoryTargetName = '<span class="tag"><i class="fa fa-remove"></i> ' + reference + '</span> &lt; ';
                    if (game.names.length) {
                        _this.expandedHistoryTargetName += game.names[0].name;
                    }
                });
                break;
            default:
                this.expandedHistoryTargetName = '';
                break;
        }
    };
    AdminComponent.prototype.filterHistory = function () {
        var _this = this;
        setTimeout(function () {
            var count = 0;
            _this.histories = [];
            _this.rawHistories.some(function (h) {
                var include;
                if (h.action == 'refresh') {
                    include = _this.historyShowRefresh;
                }
                else if (h.action == 'login' || h.action == 'logout') {
                    include = _this.historyShowLogin;
                }
                else {
                    include = _this.historyShowStuff;
                }
                if (include) {
                    _this.histories.push(h);
                    count++;
                    if (count >= _this.historyDisplayCount) {
                        return true;
                    }
                }
                return false;
            });
            setTimeout(function () {
                _this.isPosting = false;
            }, 10);
        }, 10);
    };
    AdminComponent.prototype.loadMoreHistory = function (count) {
        this.isPosting = true;
        this.historyDisplayCount = (30 * count);
        this.filterHistory();
    };
    AdminComponent.prototype.doBackup = function () {
        var _this = this;
        this.http.get('/api/backup').toPromise().then(function (response) {
            var data = response.json();
            _this._app.toast(data.timestamp);
        });
    };
    AdminComponent.prototype.restore = function () {
        var _this = this;
        this._app.dialog('Are you sure?', 'Restoring the database backup cannot be undone or stopped.', 'Do it', function (timestamp) {
            setTimeout(function () {
                _this._app.toast('Restoring data . . .');
                _this._app.showLoader();
                _this.http.put('/api/restore', { timestamp: timestamp }).toPromise().then(function (response) {
                    _this._app.hideLoader();
                    _this._app.toast('Data restored');
                });
            }, 10);
        }, false, 'Timestamp');
    };
    __decorate([
        core_1.ViewChild('versionFileInput'),
        __metadata("design:type", core_1.ElementRef)
    ], AdminComponent.prototype, "versionFileInput", void 0);
    AdminComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "admin",
            templateUrl: "../template/admin.component.html",
            animations: [anim_util_1.DialogAnim.dialog]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            app_service_1.AppService,
            user_service_1.UserService,
            history_service_1.HistoryService,
            game_database_service_1.GameDatabaseService,
            app_http_1.AppHttp])
    ], AdminComponent);
    return AdminComponent;
}());
exports.AdminComponent = AdminComponent;

//# sourceMappingURL=admin.component.js.map
