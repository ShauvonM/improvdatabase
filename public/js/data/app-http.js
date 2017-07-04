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
var http_1 = require("@angular/http");
var router_1 = require("@angular/router");
var Observable_1 = require("rxjs/Observable");
var AppHttp = (function () {
    function AppHttp(http, router) {
        this.http = http;
        this.router = router;
        this.TOKEN_STORAGE_KEY = 'improvplus_token';
        this.EXPIRATION_STORAGE_KEY = 'improvplus_tokenExpires';
        this.loadValues();
    }
    AppHttp.prototype.loadValues = function () {
        this.token = localStorage.getItem(this.TOKEN_STORAGE_KEY);
        this.tokenExpires = parseInt(localStorage.getItem(this.EXPIRATION_STORAGE_KEY) || '0');
    };
    AppHttp.prototype.saveValues = function (token, exp) {
        this.token = token;
        this.tokenExpires = exp;
        localStorage.setItem(this.TOKEN_STORAGE_KEY, this.token);
        localStorage.setItem(this.EXPIRATION_STORAGE_KEY, '' + this.tokenExpires);
    };
    AppHttp.prototype.clearValues = function () {
        localStorage.removeItem(this.TOKEN_STORAGE_KEY);
        localStorage.removeItem(this.EXPIRATION_STORAGE_KEY);
        this.token = null;
        this.tokenExpires = null;
    };
    AppHttp.prototype.checkTokenExpiration = function () {
        if (!this.token || !this.tokenExpires || this.tokenExpires <= Date.now()) {
            this.token = '';
            this.tokenExpires = null;
            return false;
        }
        else {
            return true;
        }
    };
    AppHttp.prototype.setToken = function (token, expires) {
        this.saveValues(token, expires);
    };
    AppHttp.prototype.reset = function () {
        this.clearValues();
    };
    AppHttp.prototype.getToken = function () {
        return this.token;
    };
    AppHttp.prototype.request = function (url, options) {
        return this.intercept(this.http.request(url, this.getRequestOptionArgs(options)));
    };
    AppHttp.prototype.get = function (url, options) {
        return this.intercept(this.http.get(url, this.getRequestOptionArgs(options)));
    };
    AppHttp.prototype.post = function (url, body, options) {
        return this.intercept(this.http.post(url, body, this.getRequestOptionArgs(options)));
    };
    AppHttp.prototype.postFormData = function (url, body, options) {
        return this.intercept(this.http.post(url, body, this.getRequestOptionArgs(options, 'multipart/form-data')));
    };
    AppHttp.prototype.put = function (url, body, options) {
        return this.intercept(this.http.put(url, body, this.getRequestOptionArgs(options)));
    };
    AppHttp.prototype.delete = function (url, options) {
        return this.intercept(this.http.delete(url, this.getRequestOptionArgs(options)));
    };
    AppHttp.prototype.appendAuthorizationHeader = function (headers) {
        // TODO: somehow make this asynchronous so we can refresh the token if necessary?
        if (this.checkTokenExpiration()) {
            headers.append('x-access-token', this.token);
        }
        return headers;
    };
    AppHttp.prototype.getRequestOptionArgs = function (options, contentType) {
        if (options == null) {
            options = new http_1.RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new http_1.Headers();
            if (contentType !== 'multipart/form-data') {
                // angular will set up the multipart/form-data headers properly on its own
                options.headers.append('Content-Type', 'application/json');
            }
        }
        this.appendAuthorizationHeader(options.headers);
        return options;
    };
    AppHttp.prototype.intercept = function (observable) {
        var _this = this;
        return observable.catch(function (err, source) {
            if (err.status == 401 && err.url.indexOf('/login') == -1) {
                if (err.url.indexOf('/refreshToken') > -1) {
                    // if the token refresh doesn't work, the user account has become invalid
                    _this.reset();
                    _this.router.navigate(['/welcome']);
                }
                else {
                    // redirect the user to the unauthorized page?
                    _this.router.navigate(['/app/unauthorized']);
                }
                return Observable_1.Observable.empty();
            }
            else {
                return Observable_1.Observable.throw(err);
            }
        });
    };
    AppHttp = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            router_1.Router])
    ], AppHttp);
    return AppHttp;
}());
exports.AppHttp = AppHttp;

//# sourceMappingURL=app-http.js.map
