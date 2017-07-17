"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stripe;
var Util = (function () {
    function Util() {
    }
    /**
     * Returns the index of the object in the array, whether the array is an array of strings or an array of objects
     * @param array array of items to search in, either strings or objects with _id property
     * @param object item to search for, either a string or an object with _id property
     */
    Util.indexOfId = function (array, object) {
        var index = -1, term = object._id ? object._id : object;
        if (!array.length) {
            return index;
        }
        else if (array[0]._id) {
            array.some(function (o, i) {
                if (o._id == term) {
                    index = i;
                    return true;
                }
            });
        }
        else {
            array.some(function (o, i) {
                if (o == term) {
                    index = i;
                    return true;
                }
            });
        }
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
