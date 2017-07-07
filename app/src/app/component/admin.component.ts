import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent} from '../../component/app.component';
import { Tool } from '../view/toolbar.view';

import { API } from '../../constants';

import { TabData } from '../../model/tab-data';

import { AppService } from '../../service/app.service';
import { HistoryService } from '../service/history.service';
import { GameDatabaseService } from '../service/game-database.service';

import { Subscription } from '../../model/subscription';
import { HistoryModel } from '../../model/history';
import { Tag } from '../../model/tag';

import { UserService } from '../../service/user.service';

import { TimeUtil } from '../../util/time.util';

import { AppHttp } from '../../data/app-http';

import { Util } from '../../util/util';
import { DialogAnim } from '../../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "admin",
    templateUrl: "../template/admin.component.html",
    animations: [DialogAnim.dialog]
})
export class AdminComponent implements OnInit {

    @ViewChild('versionFileInput') versionFileInput: ElementRef;

    title: string = '<span class="light">super</span><strong>admin</strong>';

    tabs: TabData[] = [
        {
            name: 'History',
            id: 'history',
            icon: 'history'
        }
    ];
    selectedTab: string = 'history';

    newVersionFile: File;

    histories: HistoryModel[];
    historyDisplayCount: number = 0;
    rawHistories: HistoryModel[];
    historyShowRefresh: boolean;
    historyShowLogin: boolean;
    historyShowStuff: boolean = true;

    isPosting: boolean;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private _service: AppService,
        private userService: UserService,
        private historyService: HistoryService,
        private gameService: GameDatabaseService,
        private http: AppHttp
    ) { }

    _tools: Tool[] = [
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
    ]

    onToolClicked(tool: Tool): void {
        switch (tool.name) {
            case "backup":
                this.doBackup();
                break;
            case "restoredb":
                this.restore();
                break;
        }
    }

    ngOnInit(): void {
        this.getHistory();
    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
    }

    back(): void {
    }

    simpleDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    simpleDateTime(date: string): string {
        return TimeUtil.simpleDate(date) + ' ' + TimeUtil.simpleTime(date);
    }

    getHistory(): void {
        this.historyService.getAllHistory().then(histories => {
            this.rawHistories = histories;
            this.filterHistory();
        });
    }

    getHistoryIcon(history: HistoryModel): string {
        switch(history.action) {
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
    }

    historyLink(event: MouseEvent, history: HistoryModel): void {
        switch(history.action) {
            case 'game_edit':
            case 'game_tag_add':
            case 'game_tag_remove':
                this.router.navigate(['/app/game', history.target]);
                break;
        }

        event.preventDefault();

    }

    expandedHistory: HistoryModel;
    expandedHistoryTargetName: string;
    expandHistory(history: HistoryModel): void {
        if (this.expandedHistory == history ||
                history.action == 'login' || history.action == 'logout' || history.action == 'refresh') {

            this.expandedHistory = null;
            return;
        }

        this.expandedHistory = history;

        let target = history.target,
            reference = history.reference;

        this.expandedHistoryTargetName = 'loading';

        switch(history.action) {
            case 'game_edit':
                this.gameService.getGame(target).then(game => {
                    if (game.names.length) {
                        this.expandedHistoryTargetName = game.names[0].name;
                    } else {
                        this.expandedHistoryTargetName = '';
                    }
                });
                break;
            case 'game_tag_add':
                this.gameService.getGame(target).then(game => {
                    this.expandedHistoryTargetName = '';
                    if (game.tags.length) {
                        let index = Util.indexOfId(game.tags, reference);
                        if (index > -1) {
                            this.expandedHistoryTargetName = '<span class="tag"><i class="fa fa-hashtag"></i> ' + (<Tag> game.tags[index]).name + '</span> &gt; ';
                        }
                    }

                    if (game.names.length) {
                        this.expandedHistoryTargetName += game.names[0].name;
                    }
                })
                break;
            case 'game_tag_remove':
                this.gameService.getGame(target).then(game => {
                    this.expandedHistoryTargetName = '';
                    this.expandedHistoryTargetName = '<span class="tag"><i class="fa fa-remove"></i> ' + reference + '</span> &lt; ';

                    if (game.names.length) {
                        this.expandedHistoryTargetName += game.names[0].name;
                    }
                })
                break;
            default:
                this.expandedHistoryTargetName = '';
                break;
        }
    }

    filterHistory(): void {
        setTimeout(() => {
            let count = 0;
            this.histories = [];
            this.rawHistories.some(h => {
                let include;
                if (h.action == 'refresh') {
                    include = this.historyShowRefresh;
                } else if (h.action == 'login' || h.action == 'logout' ) {
                    include = this.historyShowLogin;
                } else {
                    include = this.historyShowStuff;
                }
                if (include) {
                    this.histories.push(h)
                    count++;
                    if (count >= this.historyDisplayCount) {
                        return true;
                    }
                }
                return false;
            });
            setTimeout(() => {
                this.isPosting = false;
            }, 10);
        }, 10);
    }

    loadMoreHistory(count: number): void {
        this.isPosting = true;

        this.historyDisplayCount = (30 * count);
        this.filterHistory();
    }

    doBackup(): void {
        this.http.get('/api/backup').toPromise().then(response => {
            let data = response.json();
            this._app.toast(data.timestamp);
        })
    }

    restore(): void {
        this._app.dialog('Are you sure?', 'Restoring the database backup cannot be undone or stopped.', 'Do it', (timestamp: string) => {
            setTimeout(() => {
                this._app.toast('Restoring data . . .');
                this._app.showLoader();
                this.http.put('/api/restore', {timestamp: timestamp}).toPromise().then(response => {
                    this._app.hideLoader();
                    this._app.toast('Data restored');
                });
            }, 10);
        }, false, 'Timestamp');
    }

}
