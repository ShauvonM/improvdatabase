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
var StripeService = (function () {
    function StripeService() {
    }
    StripeService.prototype.init = function (config) {
        this.stripe = Stripe(config);
    };
    StripeService.prototype.setupStripe = function (changeCallback) {
        var elements = this.stripe.elements();
        var creditCard = elements.create('card', {
            // value: {postalCode: this.user.zip},
            style: {
                base: {
                    color: '#32325d',
                    lineHeight: '24px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: 'rgba(96,96,96,0.5)'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });
        if (changeCallback) {
            creditCard.addEventListener('change', changeCallback);
        }
        return creditCard;
    };
    StripeService.prototype.getStripeToken = function (creditCard) {
        return this.stripe.createToken(creditCard);
    };
    StripeService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], StripeService);
    return StripeService;
}());
exports.StripeService = StripeService;

//# sourceMappingURL=stripe.service.js.map
