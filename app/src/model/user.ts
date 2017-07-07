import {Purchase} from './purchase';
import {Subscription} from './subscription';
import {Team} from './team';
import {Invite} from './invite';

export class Preference {
    _id?: string;
    key: string;
    value: string;
    date?: string;
    user?: string;
}

export class User {
    _id?: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    company?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    improvExp?: number;
    facilitationExp?: number;
    trainingInterest?: boolean;
    url?: string;
    dateAdded?: string;
    dateModified?: string;
    locked?: boolean;
    description?: string;
    permissions?: Object;
    actions?: string[];
    superAdmin?: boolean;
    birthday?: string;

    memberOfTeams?: Team[]|string[];
    adminOfTeams?: Team[]|string[];

    purchases?: Purchase[];
    subscription?: Subscription;
    preferences?: Preference[];

    invites?: Invite[];

    dateLoggedIn?: string;
}