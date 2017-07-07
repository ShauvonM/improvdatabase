import { NgModule }         from "@angular/core";
import { RouterModule, Routes }     from "@angular/router";

import { AuthGuard } from '../service/auth-guard.service';
import { DashboardComponent } from "../component/dashboard.component";
import { HelpComponent } from "../component/help.component";
import { UnauthorizedComponent } from "../component/unauthorized.component";
import { GameDatabaseComponent } from "../component/game-database.component";
import { AboutComponent }  from "../component/about.component";
import { ContactComponent } from "../component/contact.component";
import { GameDetailsComponent } from '../component/game-details.component';
import { UserComponent } from '../component/user.component';
import { LegalComponent } from "../component/legal.component";
import { TeamListComponent } from '../component/team-list.component';
import { TeamDetailsComponent } from '../component/team-details.component';
import { VideosComponent } from '../component/videos.component';
import { GlossaryComponent } from '../component/glossary.component';

import { AdminComponent } from '../component/admin.component';
import { NotFoundComponent } from '../component/not-found.component';

const routes: Routes = [
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
                component: UnauthorizedComponent
            },
            {
                path: '',
                canActivateChild: [AuthGuard],
                children: [
                    {
                        path: 'dashboard',
                        component: DashboardComponent,
                        data: {
                            action: 'dashboard_page_view'
                        }
                    },
                    {
                        path: 'games',
                        component: GameDatabaseComponent,
                        data: {
                            action: 'game_view'
                        }
                    },
                    {
                        path: 'game/:id',
                        component: GameDetailsComponent,
                        data: {
                            action: 'game_view'
                        }
                    },
                    {
                        path: 'user',
                        component: UserComponent,
                        data: {
                            action: 'account_edit'
                        }
                    },
                    {
                        path: 'admin',
                        component: AdminComponent,
                        data: {
                            admin: true
                        }
                    },
                    {
                        path: 'teams',
                        component: TeamListComponent,
                        data: {
                            action: 'team_page_view'
                        }
                    },
                    {
                        path: 'team/:id',
                        component: TeamDetailsComponent,
                        data: {
                            action: 'team_page_view'
                        }
                    },
                    {
                        path: 'contact/:type',
                        component: ContactComponent,
                        data: {
                            action: 'contact_page_view'
                        }
                    },
                    {
                        path: 'contact',
                        component: ContactComponent,
                        data: {
                            action: 'contact_page_view'
                        }
                    },
                    {
                        path: 'videos',
                        component: VideosComponent,
                        data: {
                            action: 'video_page_view'
                        }
                    },
                    {
                        path: 'glossary',
                        component: GlossaryComponent,
                        data: {
                            action: 'glossary_page_view'
                        }
                    }
                ]
            },
            {
                path: 'about',
                component: AboutComponent
            },
            {
                path: 'help',
                component: HelpComponent
            },
            {
                path: 'legal',
                component: LegalComponent
            },
            {
                path: '**',
                component: NotFoundComponent
            }
        ]
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})

export class ImprovDatabaseRoutingModule {};
