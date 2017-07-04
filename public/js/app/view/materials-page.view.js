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
var app_component_1 = require("../../component/app.component");
var library_service_1 = require("../service/library.service");
var library_1 = require("../../model/library");
var team_1 = require("../../model/team");
var MaterialsPageView = (function () {
    function MaterialsPageView(_app, libraryService) {
        this._app = _app;
        this.libraryService = libraryService;
        this.tabs = [
            {
                name: 'Packages',
                id: 'packages',
                icon: 'book'
            },
            {
                name: 'Materials',
                id: 'materials',
                icon: 'file-text'
            }
        ];
        this.selectedTab = 'packages';
    }
    MaterialsPageView.prototype.ngOnInit = function () {
        if (this.team && !this.library) {
            this.library = this.team.library || new library_1.Library();
        }
        if (!this.library.packages.length) {
            this.selectedTab = 'materials';
        }
    };
    MaterialsPageView.prototype.selectTab = function (tab) {
        this.selectedTab = tab.id;
    };
    MaterialsPageView.prototype.selectMaterial = function (material) {
        if (material.versions.length > 0) {
            this.libraryService.downloadMaterial(material._id);
        }
        else {
            this._app.dialog('Whoops', 'We seem to have not published any versions of that Material Item. Hopefully we\'re actively working to fix it. Try again in a few minutes, and if you still get this message, please let us know. You can email us at contact@improvpl.us or use the "Report a Bug" feature in the App menu.', 'Okay Then', null, true);
        }
    };
    MaterialsPageView.prototype.findPackageById = function (id) {
        var pkg;
        this.library.packages.forEach(function (thispkg) {
            if (thispkg._id == id) {
                pkg = thispkg;
                return false;
            }
        });
        return pkg;
    };
    MaterialsPageView.prototype.selectPackage = function (pkg) {
        this.selectPackageById(pkg._id);
    };
    MaterialsPageView.prototype.selectPackageById = function (id) {
        this.libraryService.downloadPackage(id);
    };
    MaterialsPageView.prototype.versionTag = function (m) {
        var v = this.libraryService.getLatestVersionForMaterialItem(m);
        // TODO: show the date this was released
        if (v) {
            return "version " + v.ver;
        }
        else {
            return "no version published";
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", library_1.Library)
    ], MaterialsPageView.prototype, "library", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", team_1.Team)
    ], MaterialsPageView.prototype, "team", void 0);
    MaterialsPageView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: '.materials-page',
            templateUrl: '../template/view/materials-page.view.html'
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            library_service_1.LibraryService])
    ], MaterialsPageView);
    return MaterialsPageView;
}());
exports.MaterialsPageView = MaterialsPageView;

//# sourceMappingURL=materials-page.view.js.map
