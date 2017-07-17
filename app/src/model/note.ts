import { GameMetadata } from './game-metadata';
import { Tag } from './tag';
import { User } from './user';
import { Team } from './team';

export class Note {
    _id: string;
    game?: string;
    tag?: Tag|string;
    metadata?: GameMetadata|string;
    description: string;
    public?: boolean;
    teams?: Team[];
    addedUser?: User;
    modifiedUser?: User;
    dateAdded?: string;
    dateModified?: string;
    dateDeleted?: string;
    deletedUser?: User;
}