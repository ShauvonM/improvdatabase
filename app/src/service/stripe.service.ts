import { Injectable } from '@angular/core';
import { Headers, Response } from '@angular/http';

declare var Stripe: any;

@Injectable()
export class StripeService {

    stripe: any;

    constructor(
    ) {
        
    }

    init(config: string): void {
        this.stripe = Stripe(config);
    }

    setupStripe(changeCallback?: (e?:any)=>void ): any {
        let elements = this.stripe.elements();
        let creditCard = elements.create('card', {
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
    }

    getStripeToken(creditCard: any): Promise<any> {
        return this.stripe.createToken(creditCard);
    }
}