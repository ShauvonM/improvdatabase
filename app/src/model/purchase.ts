import { User } from './user';
import { Team } from './team';
import { Subscription } from './subscription';

export class PurchaseOther {
    _id: string;
    key: string;
    description: string;
    params: object;
    price: number;
}

export class Purchase {
    _id?: string;
    user?: string|User;
    team?: string|Team;
    date?: Date;
    
    total: number = 0;
    refunded?: boolean;
}