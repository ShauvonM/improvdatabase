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
var constants_1 = require("../constants");
var app_http_1 = require("../data/app-http");
var package_1 = require("../model/package");
var AppService = (function () {
    function AppService(http) {
        this.http = http;
    }
    AppService.prototype.handleError = function (error) {
        console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    };
    AppService.prototype.setRedirect = function (url) {
        this.redirect = url;
    };
    AppService.prototype.getRedirect = function () {
        return this.redirect;
    };
    AppService.prototype.validateUser = function (user) {
        return this.http.post(constants_1.API.validateUser, user)
            .toPromise()
            .then(function (response) {
            var data = response.json();
            if (data.conflict == 'email') {
                return 'That email address is already registered on ImprovPlus.';
            }
            else {
                return '';
            }
        });
    };
    AppService.prototype.validateTeam = function (team) {
        return this.http.post(constants_1.API.validateTeam, team)
            .toPromise()
            .then(function (response) {
            var data = response.json();
            if (data.conflict == 'name') {
                return 'A team with that name is already registered on ImprovPlus';
            }
            else {
                return '';
            }
        });
    };
    AppService.prototype._getPackages = function () {
        if (!this._packagePromise) {
            this._packagePromise = this.http.get(constants_1.API.package)
                .toPromise()
                .then(function (response) {
                var packages = response.json();
                return packages;
            })
                .catch(this.handleError);
        }
        return this._packagePromise;
    };
    AppService.prototype.getPackages = function (userType, team) {
        var _this = this;
        var options = [];
        // return this.getSubscriptionPackage(userType, team)
        //     .then(pkg => {
        //         options.push(pkg);
        //         return this._getPackages()
        //     })
        return this._getPackages()
            .then(function (packages) {
            if (userType == 'facilitator') {
                if (!team) {
                    packages.forEach(function (p) {
                        var copy = Object.assign({}, p);
                        options.push(copy);
                    });
                }
                else {
                    packages.forEach(function (p) {
                        var copy = Object.assign({}, p);
                        // the facilitator team packages are more expensive
                        copy.price += _this.config.fac_team_package_markup;
                        options.push(copy);
                    });
                }
            }
            return options.sort(function (a, b) {
                return a.price > b.price ? -1 : 1;
            });
        });
    };
    AppService.prototype.getSubscriptionPackage = function (userType, team) {
        return this.getPackageConfig()
            .then(function (config) {
            var subOption = new package_1.Package();
            subOption._id = 'sub';
            if (userType == 'facilitator') {
                if (!team) {
                    subOption.name = 'Individual Facilitator Subscription';
                    subOption.price = config.fac_sub_price;
                    subOption.description = [
                        "Gain access to the the app for one year.",
                        "Browse and purchase from our entire catalogue of facilitation materials.",
                        "Utilize the database of over 200 Improv Exercises."
                    ];
                }
                else {
                    subOption.name = 'Facilitator Team Subscription';
                    subOption.price = config.fac_team_sub_price;
                    subOption.description = [
                        "Your team can share and collaborate with the ImprovPlus app.",
                        "Browse and purchase from our entire catalogue of facilitation materials.",
                        "Utilize the database of over 200 Improv Exercises."
                    ];
                }
            }
            else {
                if (!team) {
                    subOption.name = 'Individual Improviser Subscription';
                    subOption.price = config.improv_sub_price;
                    subOption.description = [
                        "Gain access to the app for one year.",
                        "Browse the database of over 200 Improv Games.",
                        "Join the ever-growing ImprovPlus community."
                    ];
                }
                else {
                    subOption.name = 'Improviser Team Subscription';
                    subOption.price = config.improv_team_sub_price;
                    subOption.description = [
                        'Access powerful marketing and collaboration tools.',
                        'Browse the database of over 200 Improv Games.',
                        "Join the ever-growing ImprovPlus community."
                    ];
                }
            }
            return subOption;
        });
    };
    AppService.prototype.getPackageConfig = function () {
        var _this = this;
        if (this.config) {
            return new Promise(function (resolve, reject) {
                resolve(_this.config);
            });
        }
        else {
            return this.http.get(constants_1.API.packageConfig)
                .toPromise()
                .then(function (result) {
                _this.config = result.json();
                return _this.config;
            });
        }
    };
    AppService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp])
    ], AppService);
    return AppService;
}());
exports.AppService = AppService;

//# sourceMappingURL=app.service.js.map
