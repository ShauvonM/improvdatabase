"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stripe;
var Util = (function () {
    function Util() {
    }
    Util.indexOfId = function (array, object) {
        var index = -1, term = typeof (object) == 'string' ? object : object._id;
        array.some(function (o, i) {
            if ((o._id && o._id == term) || o == term) {
                index = i;
                return true;
            }
        });
        return index;
    };
    Util.setupStripe = function (stripeConfig, changeCallback) {
        stripe = stripe || Stripe(stripeConfig);
        var elements = stripe.elements();
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
    Util.getStripeToken = function (stripeConfig, creditCard) {
        stripe = stripe || Stripe(stripeConfig);
        return stripe.createToken(creditCard); //.then(callback);
    };
    return Util;
}());
exports.Util = Util;

//# sourceMappingURL=util.js.map
