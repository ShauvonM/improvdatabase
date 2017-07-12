import {Invite} from './invite';
import {User} from './user';

export class Team {
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

    dateAdded: Date;
    addedUser: User;

    dateModified: Date;
    modifiedUser: User;

    lookingForMembers: Boolean;

    admins: string[];
    members: string[];

    invites: Invite[];
}