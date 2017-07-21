const util = require('./util');

const 
 // DUDE DON'T CHANGE THESE NUMBERS DUDE
    ROLE_NOBODY = 0,
    ROLE_LOCKED = 13,
    ROLE_USER = 1,
    ROLE_USER_PAID = 2,

    ROLE_SUPER_ADMIN = 19;

module.exports = {
    ROLE_NOBODY: ROLE_NOBODY,
    ROLE_USER: ROLE_USER,
    ROLE_SUPER_ADMIN: ROLE_SUPER_ADMIN,
    ROLE_LOCKED: ROLE_LOCKED,

    ROLE_USER_PAID: ROLE_USER_PAID,

    _actionCache: {},

    roles: [
        {
            id: ROLE_NOBODY,
            name: 'none',
            actions: [
                'user_validate',
                'team_validate',
                'user_create' // with a valid invite
            ]
        },
        {
            id: ROLE_USER,
            name: 'user',
            inherits: [ROLE_NOBODY],
            actions: [
                'contact_page_view',
                'featurerequest_send',
                'bugreport_send',
                
                'dashboard_page_view',
                'subscription_view',
                'account_edit', // editing oneself
                'subscription_renew',

                'invite_delete', // users can cancel invites that they sent, or reject ones sent to them

                'game_page_view',
                'game_view',
                'game_filter',

                'metadata_view',
                'tag_view',

                'note_view', // your notes
                'note_public_view', // public notes
                'note_create', // provided they're your own
                'note_edit', // provided they're your own
                'note_delete',

                'name_view',
                'name_vote',
                // 'name_create', let's not open this up just yet

                'community_page_view',
                'hire_page_view',
                'video_page_view',
                'glossary_page_view',

                'message_view',
                'message_create',

                'user_page_view', // viewing a user directory page (if that's ever a thing)
                'user_view', // viewing the list of users

                'team_page_view',
                'team_view', // get teams
                'team_create', // users can create teams!

                'calendar_page_view',
                'calendar_view',
                'calendar_create', // this is just posting to the calendar API, not specifically creating calendars

                'blog_page_view',
                'blog_view',

                'hire_apply_page_view', // view the page to apply to become a hireable
                'hire_apply', // apply to become a hireable

                'coach_page_view', // hire a coach
                'coach_contact_send', // send a request to hire a coach

                'note_team_create',
                'note_team_view',
                'note_team_edit', // you have to be admin to do this

                'team_leave',

                'team_invite', // user has to be admin of team
                'team_edit', // user has to be admin of team
                'team_user_promote', // user has to be admin of team
                'team_user_remove', // admins can remove users from a team
            ]
        },

        {
            id: ROLE_USER_PAID,
            name: "Patron User",
            inherits: [ROLE_USER],
            actions: [
                // TDB
            ]
        },

        {
            id: ROLE_SUPER_ADMIN,
            name: "Super Admin",
            inherits: [ROLE_USER_PAID],
            actions: [
                'blog_create',
                'note_public_create',
                'note_public_edit',

                'user_lock',
                'user_edit',
                'user_delete',

                'game_create',
                'game_edit',
                'game_delete',

                'game_tag_add',
                'game_tag_remove',

                'name_create',
                'name_edit',
                'name_delete',

                'metadata_create',
                'metadata_edit',
                'metadata_delete',

                'tag_create',
                'tag_edit',
                'tag_delete',

                'backup_view',
                'restore_edit',
                'history_view'
            ]
        }
    ],

    findRoleById: (id) => {
        let role;
        module.exports.roles.forEach(r => {
            if (r.id == id) {
                role = r;
                return true;
            }
        });
        return role;
    },

    canUserHave: (url, method, user) => {
        method = method.toLowerCase();
        let action = findActionForUrl(url, method),
            val;

        if (typeof(action) === 'function') {
            val = action(url, method, user);

            if (typeof val !== 'string') {
                console.log('Action for ' + method + ':' + url + ' is a function');
                return val;
            }
        }
        if (val) {
            action = val;
        }
        
        if (action) {
            console.log('Action for ' + method + ':' + url + ' is ' + action);
            return module.exports.doesUserHaveAction(user, action);
        }
    },

    getActionsForRole: (roleId, blockRecursion) => {
        let key = 'role_' + roleId + '_' + blockRecursion;
        if (!module.exports._actionCache[key]) {
            let actions = [];
            module.exports.roles.some(role => {
                if (role.id === parseInt(roleId, 10)) {
                    actions = util.unionArrays(actions, role.actions);
                    if (!blockRecursion && role.inherits && role.inherits.length) {
                        role.inherits.forEach(id => {
                            actions = util.unionArrays(actions, module.exports.getActionsForRole(id));
                        });
                    }
                    return true;
                }
            });

            module.exports._actionCache[key] = actions;
        }

        return module.exports._actionCache[key];
    },

    doesUserHaveAction: (user, action) => {
        if (!user) {
            return false;
        }
        let actions = user.actions;
        if (!actions) {
            actions = module.exports.getActionsForRole(user.RoleID);
        }
        if (!actions) {
            return false;
        }
        return actions.indexOf(action) > -1;
    }

}

const actionmap = {
    /**
     * if actions are mapped like this:
     *  get: 'op_view',
     *  post: 'op_create',
     *  put: 'op_edit',
     *  delete: 'op_delete'
     * 
     *  - where 'op' is the url fragment after api (i.e. for GET: /api/game, the op is 'game') -
     * 
     * You don't need to specify the mapping here, it will automatically map to those actions
     * 
     * So the /api/game route is automatically mapped to the following actions:
     * get: 'game_view',
     * post: 'game_create',
     * put: 'game_edit',
     * delete: 'game_delete'
     * 
     * Anything that doesn't fit this format (or that requires additional checking, can be mapped manually here)
     * 
     * Op can also be specified by using the 'base' property (/api/playerCount maps actions to "metadata_view" etc.)
     * 
     * The default property is used when the specific method is not specified. 
     * 
     * Any method (or default) can be mapped to a function (getting the URL, the method, and the user data)
     * which can manually check for access - it should return true if user has access to the requested route
     */

    // TODO: add name voting route here
    // tagGame: {
    //     get: 'tag_view',
    //     post: 'game_tag_add',
    //     put: 'game_tag_add',
    //     delete: 'game_tag_remove'
    // },
    game: {
        default: function(url, method, user) {
            switch(method) {
                case 'get':
                    if (url.indexOf('/notes') > -1) {
                        return 'note_view';
                    } else {
                        return 'game_view';
                    }
                case 'put':
                    return 'game_edit';
                case 'delete':
                    if (url.indexOf('removeTag') > -1) {
                        return 'game_tag_remove';
                    } else {
                        return 'game_delete';
                    }
                case 'post':
                    if (url.indexOf('addTag') > -1) {
                        return 'game_tag_add';
                    } else if (url.indexOf('removeTag') > -1) {
                        return 'game_tag_remove';
                    } else if (url.indexOf('createTag') > -1) {
                        return 'tag_create';
                    } else {
                        return 'game_create';
                    }
            }
        }
    },
    duration: {
        base: 'metadata'
    },
    playerCount: {
        base: 'metadata'
    },
    user: {
        default: function(url, method, user) {
            let admin;
            switch(method) {
                case "get":
                    admin = 'user_view';
                    break;
                case "put":
                    admin = 'users_edit';
                    break;
                case "delete":
                    admin = 'users_delete';
                    break;
                case "post":
                    if (url.indexOf('user/validate') > -1) {
                        admin = 'user_validate';
                    } else {
                        admin = 'user_create';
                    }
                    break;
                default:
                    admin = "nothing";
                    break;
            }

            // admins can view and edit anybody
            if (module.exports.doesUserHaveAction(user, admin)) {
                return true;
            } else {
                // users can view and edit themselves
                return url.indexOf('/user/' + user._id) > -1 &&
                        module.exports.doesUserHaveAction(user, 'account_edit');
            }
        }
    },
    team: {
        default: function(url, method, user) {
            let action;
            switch(method) {
                case "get":
                    action = 'team_view';
                    break;
                case "put":
                    if (url.indexOf('/removeUser') > -1) {
                        action = 'team_user_remove';
                    } else if (url.indexOf('/promote') > -1 || url.indexOf('/demote') > -1) {
                        action = 'team_user_promote';
                    } else {
                        action = 'team_edit';
                    }
                    break;
                case "delete":
                    action = 'team_delete';
                    break;
                case "post":
                    if (url.indexOf('team/validate') > -1) {
                        action = 'team_validate';
                    } else if (url.indexOf('/invite') > -1) {
                        action = 'team_invite';
                    } else {
                        action = 'team_create';
                    }
                    break;
                default:
                    action = "nothing";
                    break;
            }

            // admins can view and edit anybody
            if (module.exports.doesUserHaveAction(user, action)) {
                return true;
            }

            // TODO: validate team admin stuff here?
        }
    },
    contact: {
        // we should only be getting posts to this
        post: function(url, method, user) {
            let action = url.replace(/\/api\/contact\/([a-z]*)\/?.*/i, '$1');
            return action + '_send';
        }
    },
    // TODO: add lock user route here
    // TODO: add video route here
    // TODO: add glossary route here
    // TODO: add blog route here
    // TODO: add messaging routes here
    default: {
        get: '',
        default: function(url, method, user) {
            // by default only allow non GET requests for super admins
            return user.superAdmin;
        }
    }
}

/**
 * Returns the action mapped to the specified URL and method
 */
findActionForUrl = function(url, method) {
    let op = url.replace(/\/api\/([a-z]*)\/?.*/i, '$1'),
        group = actionmap[op],
        action,
        fallback = actionmap.default[method] || actionmap.default.default;

    // see if an action is specified for the given group and method
    if (group && (group[method] || group.default)) {
        return group[method] || group.default;
    } else {
        // we can try to assume the action from the operation and the method
        actionBase = (group && group.base) ? group.base : op;
        switch(method) {
            case 'get':
                action = 'view';
                break;
            case 'post':
                action = 'create';
                break;
            case 'put':
                action = 'edit';
                break;
            case 'delete':
                action = 'delete';
                break;
        }

        if (action) {
            return actionBase + '_' + action;
        }
    }

    return fallback;
}

// function union_arrays (x, y) {
//     var obj = {};
//     for (var i = x.length-1; i >= 0; -- i) {
//         obj[x[i]] = x[i];
//     }
//     y = y || []
//     for (var i = y.length-1; i >= 0; -- i) {
//         obj[y[i]] = y[i];
//     }
//     var res = []
//     for (var k in obj) {
//         if (obj.hasOwnProperty(k)) {
//             res.push(obj[k]);
//         }
//     }
//     return res;
// }