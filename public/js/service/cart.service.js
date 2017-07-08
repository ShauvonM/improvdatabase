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
var app_http_1 = require("../data/app-http");
var constants_1 = require("../constants");
var purchase_1 = require("../model/purchase");
var user_service_1 = require("./user.service");
var CartService = (function () {
    function CartService(http, userService) {
        this.http = http;
        this.userService = userService;
        // private chargeUrl = "/charge";
        // private signupUrl = "/signup";
        // private configUrl = "/packageconfig";
        this.purchase = new purchase_1.Purchase();
    }
    CartService.prototype.reset = function () {
        this.purchase = new purchase_1.Purchase();
        this.purchase.packages = [];
        this.purchase.materials = [];
        this.purchase.other = [];
    };
    CartService.prototype.addPackage = function (pack) {
        this.purchase.packages.push({
            package: pack,
            price: pack.price
        });
        this.purchase.total += pack.price;
        return this.purchase;
    };
    CartService.prototype.addSubscription = function (role) {
        var sub = new purchase_1.PurchaseOther();
        sub.key = "subscription";
        sub.params = {
            role: role
        };
        // don't duplicate the subscription item
        var index = -1;
        this.purchase.other.forEach(function (o, i) {
            if (o.key == 'subscription') {
                index = i;
            }
        });
        this.purchase.other.splice(index, 1, sub);
    };
    CartService.prototype.setUser = function (user) {
        this.user = user;
    };
    CartService.prototype.charge = function (token) {
        return this.http.post(constants_1.API.charge, {
            stripeToken: token,
            purchase: this.purchase,
            user: this.user
        }).toPromise()
            .then(function (result) {
            return result.json();
        });
    };
    CartService.prototype.signup = function (token, email, password, userName, teamName) {
        // if (pack && pack._id !== 'sub') {
        //     this.addPackage(pack);
        // }
        // if (role) {
        //     this.addSubscription(role);
        // }
        return this.http.post(constants_1.API.signup, {
            stripeToken: token,
            purchase: this.purchase,
            email: email,
            password: password,
            userName: userName,
            teamName: teamName
        }).toPromise()
            .then(function (result) {
            return result.json();
        });
    };
    CartService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp,
            user_service_1.UserService])
    ], CartService);
    return CartService;
}());
exports.CartService = CartService;

//# sourceMappingURL=cart.service.js.map
