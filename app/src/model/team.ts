import {Invite} from './invite';
import {User} from './user';

export class Team {
    [index: string]: any;

    _id: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    url: string;

    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;

    dateAdded: Date;
    addedUser: User;

    dateModified: Date;
    modifiedUser: User;

    lookingForMembers: Boolean;

    admins: string[];
    members: string[];

    invites: Invite[];
}