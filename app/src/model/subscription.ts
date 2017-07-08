import { Team } from './team';
import { Invite } from './invite';

export class Subscription {
    _id: string;
    start: string;
    role: number;
    roleName: string;
    expiration: string;

    pledge: number;

    user: string; // the _id of the user who has this subscription

    stripeCustomerId: string;
    stripeSubscriptionId: string;
}