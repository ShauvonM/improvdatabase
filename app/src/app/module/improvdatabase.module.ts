import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { BrowserModule } from '@angular/platform-browser';
// import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { PathLocationStrategy } from '@angular/common';

import { SharedModule } from '../../module/shared.module';
import { ImprovDatabaseRoutingModule } from './improvdatabase-routing.module';

// services
import { GameDatabaseService } from "../service/game-database.service";
import { AuthGuard } from "../service/auth-guard.service";
import { TeamService } from '../service/team.service';
import { HistoryService } from '../service/history.service';
import { GameNoteService } from '../service/game-note.service';

// main components
// import { AppComponent } from '../component/app.component';
import { UnauthorizedComponent } from "../component/unauthorized.component";
import { DashboardComponent } from '../component/dashboard.component';
import { GameDatabaseComponent } from '../component/game-database.component';
import { AboutComponent } from '../component/about.component';
import { ContactComponent } from '../component/contact.component';
import { UserComponent } from '../component/user.component';
import { GameDetailsComponent } from '../component/game-details.component';
import { HelpComponent } from "../component/help.component";
import { LegalComponent } from "../component/legal.component";
import { AdminComponent } from '../component/admin.component';
import { TeamListComponent } from '../component/team-list.component';
import { TeamDetailsComponent } from '../component/team-details.component';
import { VideosComponent } from '../component/videos.component';
import { GlossaryComponent } from '../component/glossary.component';

import { NotFoundComponent } from '../component/not-found.component';

// sub-views
import { ToolbarView } from '../view/toolbar.view';
import { GameCardView } from '../view/game-card.view';
import { CreateMetadataView } from '../view/create-metadata.view';
import { UserCardView } from '../view/user-card.view';
import { EditableMetadataView } from '../view/editable-metadata.view';
import { DashboardMessageListView } from '../view/dashboard-message-list.view';
import { GameNoteView } from '../view/game-note.view';

// utils

@NgModule({
    imports: [
        // BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        // HttpModule,
        CommonModule,
        SharedModule,
        ImprovDatabaseRoutingModule
     ],
    declarations: [
        UnauthorizedComponent,
        DashboardComponent,
        GameDatabaseComponent,
        AboutComponent,
        ContactComponent,
        UserComponent,
        HelpComponent,
        TeamListComponent,
        TeamDetailsComponent,
        GameDetailsComponent,
        LegalComponent,
        AdminComponent,
        VideosComponent,
        GlossaryComponent,
        
        NotFoundComponent,
        
        ToolbarView,
        GameCardView,
        CreateMetadataView,
        UserCardView,
        EditableMetadataView,
        DashboardMessageListView,
        GameNoteView
    ],
    // bootstrap: [ AppComponent ],
    providers: [
        GameDatabaseService,
        AuthGuard,
        TeamService,
        HistoryService,
        GameNoteService
    ]
})

export class ImprovDatabaseModule { }
