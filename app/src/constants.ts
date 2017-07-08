import { OpaqueToken } from '@angular/core';

export const CONFIG_TOKEN = new OpaqueToken('config');
export const MOBILE_WIDTH = 500;
export const API = {
    login: '/login',
    passwordRecovery: '/recoverPassword',
    passwordRecoveryTokenCheck: '/checkPasswordToken',
    passwordChange: '/changePassword',
    logout: '/logout',
    refresh: '/refreshToken',
    user: '/api/user',
    validateUser: '/api/user/validate',
    invite: '/api/invite',

    signup: '/signup',
    validateTeam: '/api/team/validate',

    updateUser: function(id:string) {
        return this.user + '/' + id;
    },
    userPreference: function(id:string) {
        return this.updateUser(id) + '/preference'
    },

    teamInvite: function(teamId: string): string {
        return `${this.getTeam(teamId)}/invite`;
    },
    removeUser: function(teamId: string, userId: string): string {
        return `${this.getTeam(teamId)}/removeUser/${userId}`;
    },
    promoteUser: function(teamId: string, userId: string): string {
        return `${this.getTeam(teamId)}/promote/${userId}`;
    },
    demoteUser: function(teamId: string, userId: string): string {
        return `${this.getTeam(teamId)}/demote/${userId}`;
    },

    cancelInvite: function(inviteId: string) {
        return this.invite + '/' + inviteId;
    },
    acceptInvite: function(userId: string, inviteId: string) {
        return `${this.user}/${userId}/acceptInvite/${inviteId}`;
    },
    leaveTeam: function(userId: string, teamId: string): string {
        return `${this.user}/${userId}/leaveTeam/${teamId}`;
    },
    userPurchases: function(userId: string) {
        return `${this.user}/${userId}/purchases`;
    },
    userSubscription: function(userId: string) {
        return `${this.user}/${userId}/subscription`;
    },
    userPledge: function(userId: string) {
        return `${this.user}/${userId}/pledge`;
    },

    games: '/api/game',
    names: '/api/name',
    metadata: '/api/metadata',
    playerCount: '/api/metadata/playerCount',
    duration: '/api/metadata/duration',
    tags: '/api/tag',
    notes: '/api/note',

    getGame: function(gameId: string): string {
        return `${this.games}/${gameId}`;
    },
    getName: function(nameId: string): string {
        return `${this.names}/${nameId}`;
    },
    gameAddTag: function(gameId: string, tagId: string): string {
        return `${this.getGame(gameId)}/addTag/${tagId}`
    },
    gameRemoveTag: function(gameId: string, tagId: string): string {
        return `${this.getGame(gameId)}/removeTag/${tagId}`
    },
    gameCreateTag: function(gameId: string, tag: string): string {
        return `${this.getGame(gameId)}/createTag/${tag}`;
    },
    gameNotes: function(gameId: string): string {
        return `${this.getGame(gameId)}/notes`;
    },

    getTag: function(tagId: string): string {
        return `${this.tags}/${tagId}`;
    },

    getNote: function(noteId: string): string {
        return `${this.notes}/${noteId}`;
    },

    history: '/api/history',

    team: '/api/team',
    getTeam: function(teamId: string): string {
        return `${this.team}/${teamId}`;
    }

}

export const PREFERENCE_KEYS = {
    showPublicNotes: 'show-public-notes',
    showPrivateNotes: 'show-private-notes',
    showTeamNotes: 'show-team-notes',
    shareNotesWithTeam: 'share-notes'
}