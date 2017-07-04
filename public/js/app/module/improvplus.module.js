"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpModule } from '@angular/http';
var forms_1 = require("@angular/forms");
// import { PathLocationStrategy } from '@angular/common';
var shared_module_1 = require("../../module/shared.module");
var improvplus_routing_module_1 = require("./improvplus-routing.module");
// services
var game_database_service_1 = require("../service/game-database.service");
var library_service_1 = require("../service/library.service");
var auth_guard_service_1 = require("../service/auth-guard.service");
var team_service_1 = require("../service/team.service");
var history_service_1 = require("../service/history.service");
var game_note_service_1 = require("../service/game-note.service");
// main components
// import { AppComponent } from '../component/app.component';
var unauthorized_component_1 = require("../component/unauthorized.component");
var dashboard_component_1 = require("../component/dashboard.component");
var materials_library_component_1 = require("../component/materials-library.component");
var game_database_component_1 = require("../component/game-database.component");
var about_component_1 = require("../component/about.component");
var contact_component_1 = require("../component/contact.component");
var user_component_1 = require("../component/user.component");
var game_details_component_1 = require("../component/game-details.component");
var help_component_1 = require("../component/help.component");
var legal_component_1 = require("../component/legal.component");
var admin_component_1 = require("../component/admin.component");
var team_list_component_1 = require("../component/team-list.component");
var team_details_component_1 = require("../component/team-details.component");
var videos_component_1 = require("../component/videos.component");
var glossary_component_1 = require("../component/glossary.component");
var not_found_component_1 = require("../component/not-found.component");
// sub-views
var toolbar_view_1 = require("../view/toolbar.view");
var game_card_view_1 = require("../view/game-card.view");
var create_metadata_view_1 = require("../view/create-metadata.view");
var materials_page_view_1 = require("../view/materials-page.view");
var user_card_view_1 = require("../view/user-card.view");
var editable_metadata_view_1 = require("../view/editable-metadata.view");
var dashboard_message_list_view_1 = require("../view/dashboard-message-list.view");
var game_note_view_1 = require("../view/game-note.view");
// utils
var ImprovPlusModule = (function () {
    function ImprovPlusModule() {
    }
    ImprovPlusModule = __decorate([
        core_1.NgModule({
            imports: [
                // BrowserModule,
                forms_1.FormsModule,
                forms_1.ReactiveFormsModule,
                // HttpModule,
                common_1.CommonModule,
                shared_module_1.SharedModule,
                improvplus_routing_module_1.ImprovPlusRoutingModule
            ],
            declarations: [
                unauthorized_component_1.UnauthorizedComponent,
                dashboard_component_1.DashboardComponent,
                materials_library_component_1.MaterialsLibraryComponent,
                game_database_component_1.GameDatabaseComponent,
                about_component_1.AboutComponent,
                contact_component_1.ContactComponent,
                user_component_1.UserComponent,
                help_component_1.HelpComponent,
                team_list_component_1.TeamListComponent,
                team_details_component_1.TeamDetailsComponent,
                game_details_component_1.GameDetailsComponent,
                legal_component_1.LegalComponent,
                admin_component_1.AdminComponent,
                videos_component_1.VideosComponent,
                glossary_component_1.GlossaryComponent,
                not_found_component_1.NotFoundComponent,
                toolbar_view_1.ToolbarView,
                game_card_view_1.GameCardView,
                create_metadata_view_1.CreateMetadataView,
                materials_page_view_1.MaterialsPageView,
                user_card_view_1.UserCardView,
                editable_metadata_view_1.EditableMetadataView,
                dashboard_message_list_view_1.DashboardMessageListView,
                game_note_view_1.GameNoteView
            ],
            // bootstrap: [ AppComponent ],
            providers: [
                game_database_service_1.GameDatabaseService,
                library_service_1.LibraryService,
                auth_guard_service_1.AuthGuard,
                team_service_1.TeamService,
                history_service_1.HistoryService,
                game_note_service_1.GameNoteService
            ]
        })
    ], ImprovPlusModule);
    return ImprovPlusModule;
}());
exports.ImprovPlusModule = ImprovPlusModule;

//# sourceMappingURL=improvplus.module.js.map
