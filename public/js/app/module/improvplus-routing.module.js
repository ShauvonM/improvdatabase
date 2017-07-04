"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var auth_guard_service_1 = require("../service/auth-guard.service");
var dashboard_component_1 = require("../component/dashboard.component");
var materials_library_component_1 = require("../component/materials-library.component");
var help_component_1 = require("../component/help.component");
var unauthorized_component_1 = require("../component/unauthorized.component");
var game_database_component_1 = require("../component/game-database.component");
var about_component_1 = require("../component/about.component");
var contact_component_1 = require("../component/contact.component");
var game_details_component_1 = require("../component/game-details.component");
var user_component_1 = require("../component/user.component");
var legal_component_1 = require("../component/legal.component");
var team_list_component_1 = require("../component/team-list.component");
var team_details_component_1 = require("../component/team-details.component");
var videos_component_1 = require("../component/videos.component");
var glossary_component_1 = require("../component/glossary.component");
var admin_component_1 = require("../component/admin.component");
var not_found_component_1 = require("../component/not-found.component");
var routes = [
    {
        path: 'app',
        children: [
            {
                path: '',
                redirectTo: '/app/dashboard',
                pathMatch: 'full'
            },
            {
                path: 'unauthorized',
                component: unauthorized_component_1.UnauthorizedComponent
            },
            {
                path: '',
                canActivateChild: [auth_guard_service_1.AuthGuard],
                children: [
                    {
                        path: 'dashboard',
                        component: dashboard_component_1.DashboardComponent,
                        data: {
                            action: 'dashboard_page_view'
                        }
                    },
                    {
                        path: 'materials',
                        component: materials_library_component_1.MaterialsLibraryComponent,
                        data: {
                            action: 'material_page_view'
                        }
                    },
                    {
                        path: 'materials/:packageSlug',
                        component: materials_library_component_1.MaterialsLibraryComponent,
                        data: {
                            action: 'material_page_view'
                        }
                    },
                    {
                        path: 'games',
                        component: game_database_component_1.GameDatabaseComponent,
                        data: {
                            action: 'game_view'
                        }
                    },
                    {
                        path: 'game/:id',
                        component: game_details_component_1.GameDetailsComponent,
                        data: {
                            action: 'game_view'
                        }
                    },
                    {
                        path: 'user',
                        component: user_component_1.UserComponent,
                        data: {
                            action: 'account_edit'
                        }
                    },
                    {
                        path: 'admin',
                        component: admin_component_1.AdminComponent,
                        data: {
                            admin: true
                        }
                    },
                    {
                        path: 'teams',
                        component: team_list_component_1.TeamListComponent,
                        data: {
                            action: 'team_page_view'
                        }
                    },
                    {
                        path: 'team/:id',
                        component: team_details_component_1.TeamDetailsComponent,
                        data: {
                            action: 'team_page_view'
                        }
                    },
                    {
                        path: 'contact/:type',
                        component: contact_component_1.ContactComponent,
                        data: {
                            action: 'contact_page_view'
                        }
                    },
                    {
                        path: 'contact',
                        component: contact_component_1.ContactComponent,
                        data: {
                            action: 'contact_page_view'
                        }
                    },
                    {
                        path: 'videos',
                        component: videos_component_1.VideosComponent,
                        data: {
                            action: 'video_page_view'
                        }
                    },
                    {
                        path: 'glossary',
                        component: glossary_component_1.GlossaryComponent,
                        data: {
                            action: 'glossary_page_view'
                        }
                    }
                ]
            },
            {
                path: 'about',
                component: about_component_1.AboutComponent
            },
            {
                path: 'help',
                component: help_component_1.HelpComponent
            },
            {
                path: 'legal',
                component: legal_component_1.LegalComponent
            },
            {
                path: '**',
                component: not_found_component_1.NotFoundComponent
            }
        ]
    },
    {
        path: '**',
        component: not_found_component_1.NotFoundComponent
    }
];
var ImprovPlusRoutingModule = (function () {
    function ImprovPlusRoutingModule() {
    }
    ImprovPlusRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forChild(routes)],
            exports: [router_1.RouterModule]
        })
    ], ImprovPlusRoutingModule);
    return ImprovPlusRoutingModule;
}());
exports.ImprovPlusRoutingModule = ImprovPlusRoutingModule;
;

//# sourceMappingURL=improvplus-routing.module.js.map
