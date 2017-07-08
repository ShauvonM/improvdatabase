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
require("rxjs/add/operator/toPromise");
var app_http_1 = require("../../data/app-http");
var constants_1 = require("../../constants");
var user_service_1 = require("../../service/user.service");
var LibraryService = (function () {
    function LibraryService(http, userService) {
        this.http = http;
        this.userService = userService;
    }
    /**
     * Get the materials that you own
     */
    LibraryService.prototype.getOwnedMaterials = function () {
        return this.http.get(constants_1.API.userMaterials(this.userService.getLoggedInUser()._id))
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    /**
     * Get the materials that a team owns (will die )
     */
    LibraryService.prototype.getTeamMaterials = function (teamId) {
        return this.http.get(constants_1.API.teamMaterials(teamId))
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LibraryService.prototype.downloadMaterial = function (id) {
        this.http.get(constants_1.API.getMaterial(id))
            .toPromise()
            .then(function (response) {
            var url = response.json().url;
            window.open(location.origin + url);
        });
    };
    LibraryService.prototype.downloadPackage = function (id) {
        this.http.get(constants_1.API.getPackage(id))
            .toPromise()
            .then(function (response) {
            var url = response.json().url;
            window.open(location.origin + url);
        });
    };
    /**
     * Util method to sort a material item's versions
     * @param m the material item to find the latest version for
     */
    LibraryService.prototype.getLatestVersionForMaterialItem = function (m) {
        m.versions.sort(function (a, b) {
            return b.ver - a.ver;
        });
        return m.versions[0];
    };
    // this is for admin - perhaps admin items should live in their own service?
    LibraryService.prototype.getAllMaterials = function () {
        return this.http.get(constants_1.API.getMaterial('all'))
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LibraryService.prototype.getAllPackages = function () {
        return this.http.get(constants_1.API.getPackage('all'))
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LibraryService.prototype.createMaterial = function () {
        if (this.userService.can('material_create')) {
            return this.http.post(constants_1.API.materials, {})
                .toPromise()
                .then(function (response) {
                return response.json();
            });
        }
    };
    LibraryService.prototype.createPackage = function () {
        if (this.userService.can('package_create')) {
            return this.http.post(constants_1.API.package, {})
                .toPromise()
                .then(function (response) {
                return response.json();
            });
        }
    };
    LibraryService.prototype.deleteMaterial = function (material) {
        if (this.userService.can('material_delete')) {
            return this.http.delete(constants_1.API.getMaterial(material._id))
                .toPromise()
                .then(function (response) {
                return true;
            });
        }
    };
    LibraryService.prototype.deletePackage = function (p) {
        if (this.userService.can('package_delete')) {
            return this.http.delete(constants_1.API.getPackage(p._id))
                .toPromise()
                .then(function (response) {
                return true;
            });
        }
    };
    LibraryService.prototype.saveMaterial = function (material) {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        return this.http.put(constants_1.API.getMaterial(material._id), material)
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LibraryService.prototype.savePackage = function (p) {
        if (this.userService.can('package_edit')) {
            return this.http.put(constants_1.API.getPackage(p._id), p)
                .toPromise()
                .then(function (response) {
                return response.json();
            });
        }
    };
    LibraryService.prototype.postNewVersion = function (materialItemId, version, file) {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        var formData = new FormData();
        formData.append('ver', version.ver + '');
        formData.append('description', version.description);
        formData.append('file', file, file.name);
        return this.http.postFormData(constants_1.API.materialVersion(materialItemId), formData).toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LibraryService.prototype.deleteVersion = function (materialItemId, version) {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        return this.http.delete(constants_1.API.getMaterialVersion(materialItemId, version._id)).toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LibraryService.prototype.savePackagePackages = function (p) {
        if (this.userService.can('package_edit')) {
            return this.http.put(constants_1.API.savePackagePackages(p._id), p)
                .toPromise()
                .then(function (response) {
                return response.json();
            });
        }
    };
    LibraryService.prototype.savePackageMaterials = function (p) {
        if (this.userService.can('package_edit')) {
            return this.http.put(constants_1.API.savePackageMaterials(p._id), p)
                .toPromise()
                .then(function (response) {
                return response.json();
            });
        }
    };
    LibraryService.prototype.handleError = function (error) {
        console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    };
    LibraryService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp,
            user_service_1.UserService])
    ], LibraryService);
    return LibraryService;
}());
exports.LibraryService = LibraryService;

//# sourceMappingURL=library.service.js.map
