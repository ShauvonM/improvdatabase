module.exports = {

    smartUpdate: function (model, data, whitelist) {
        whitelist.forEach(name => {
            if (data[name] != undefined && data[name] != null) {
                model[name] = data[name];
            }
        });
        if (model.dateModified) {
            model.dateModified = Date.now();
        }
        return model;
    },

    unauthorized: (req, res) => {
        res.status(401).json({
            "message": "Unauthorized"
        });
    },

    handleError: function (req, res, err) {
        if (err.name && err.name == 'CastError') {
            // trying to look up an _id using a string that isn't an _id
            module.exports.notfound(req, res);
        } else {
            console.error("Unknown error:", err);
            res.status(500).json(err);
        }
    },

    notfound: (req, res) => {
        res.status(404).send('not found');
    },

    getObjectIdAsString: function (item) {
        if (!item) {
            return item;
        }
        if (typeof item == 'string') {
            return item;
        } else if (item._id && item._id.toString) {
            return item._id.toString();
        } else if (typeof item._id == 'string') {
            return item._id;
        } else if (item.toString) {
            return item.toString();
        } else {
            return item; // ??
        }
    },

    /**
     * Inserts item into mongoose array of ObjectId items without causing duplicates
     * There might be a better way to do this with mongoose?
     */
    addToObjectIdArray: (array, itemToAdd) => {
        let existsAlready = false,
            itemToAddId = module.exports.getObjectIdAsString(itemToAdd);

        if (!array || !array.length) {
            array = [];
        }

        array.forEach(item => {
            let itemId = module.exports.getObjectIdAsString(item);
            if (itemId == itemToAddId) {
                existsAlready = true;
                return false;
            }
        });
        if (!existsAlready) {
            array.push(itemToAdd);
        }
        return array;
    },

    indexOfObjectId: (array, id) => {
        let indexInArray = -1,
            idToUse = module.exports.getObjectIdAsString(id);

        array.forEach((item, i) => {
            let itemId = module.exports.getObjectIdAsString(item);
            if (itemId == idToUse) {
                indexInArray = i;
                return false;
            }
        });

        return indexInArray;
    },

    /**
     * Removes an item from an array of object ids
     * There might be an easier way to do this with mongoose?
     */
    removeFromObjectIdArray: (array, itemToRemove) => {
        let itemToRemoveId = module.exports.getObjectIdAsString(itemToRemove);

        if (!array || !array.length) {
            // it isn't even array, so it sure doesn't contain the thing
            return [];
        }

        let indexInArray = module.exports.indexOfObjectId(array, itemToRemoveId);
        
        if (indexInArray > -1) {
            array.splice(indexInArray, 1);
        }
        return array;
    },

    unionArrays: function() {
        let arrayKeys = Object.keys(arguments),
            union = [],
            obj = {};

        arrayKeys.forEach(key => {
            arguments[key].forEach(item => {
                if (typeof item == 'object') {
                    let itemKey;
                    if (item._id) {
                        itemKey = item._id.toString() || item._id;
                    } else {
                        itemKey = JSON.stringify(item);
                    }
                    obj[itemKey] = item;
                } else {
                    obj[item] = item;
                }
            });
        });

        Object.keys(obj).forEach(itemKey => {
            union.push(obj[itemKey]);
        })

        return union;
    },

    intersectArrays: function(array1, array2) {
        let intersection = [];
        array1.forEach(item => {
            if (this.indexOfObjectId(array2, item) > -1) {
                intersection.push(item);
            }
        });
        return intersection;
    },

    breakStringIntoParagraphs: (strings) => {
        let body = '';
        strings = [].concat(strings);
        strings.forEach(string => {
            string.split(/\r?\n/).forEach(p => {
                if (p.trim()) {
                    body += '<p>' + p + '</p>';
                }
            });
        });
        return body;
    },

    simpleDate: (dateString) => {
        let date;
        if (typeof(dateString) == 'string') {
            date = new Date(dateString);
        } else {
            date = dateString;
        }

        let month = this.getMonthName(date.getMonth()),
            day = date.getDate(),
            year = date.getFullYear();

        return month + ' ' + day + ', ' + year;
    },

    getMonthName: (month) => {
        switch(month) {
            case 0:
                return "January";
            case 1:
                return "February";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
        }
    },

    simpleTime: (dateString) => {
        let date = new Date(dateString),
            rawHours = date.getHours(),
            mins = date.getMinutes(),
            ampm = rawHours > 11 ? 'pm' : 'am',
            hours = rawHours > 12 ? rawHours - 12 : rawHours;

        return hours + ':' + mins + ' ' + ampm;
    },

    isExpired: (subscription) => {
        return !subscription || !subscription.expiration || (new Date(subscription.expiration)).getTime() <= Date.now()
    },

    checkDirectory: (directory, callback) => {
        let fs = require('fs');

        fs.stat(directory, (err, stats) => {
            if (err && err.code == 'ENOENT') {
                fs.mkdir(directory, callback);
            } else {
                callback(err);
            }
        });
    },

    findChanges: (oldObject, newObject) => {

        let oldKeys = Object.keys(oldObject),
            newKeys = Object.keys(newObject),
            allKeys = module.exports.unionArrays(oldKeys, newKeys)
            ignore = ['isNew', '$__', '$init', 'date', 'dateModified', 'password', 'user', 
                        'team', 'modifiedUser', 'subscription', 'purchases', '_id', 
                        'adminOfTeams', 'memberOfTeams', 'dateAdded', 'preferences', 
                        'members', 'admins', 'tags'],
            changes = [];

        allKeys = allKeys.filter(item => {
            return ignore.indexOf(item) == -1;
        });

        allKeys.forEach(key => {
            let newval = module.exports.getObjectIdAsString(newObject[key]);
            
            // ignore anything that is in our blacklist, an object, or that starts with '_'
            if (ignore.indexOf(key) == -1 &&
                typeof(newval) != 'object' &&
                key.indexOf('_') != 0) {

                let oldval = module.exports.getObjectIdAsString(oldObject[key]);

                if (oldval != newval) {
                    changes.push({
                        property: key,
                        old: oldval,
                        new: newval
                    });
                }
            }
        });

        return changes;

    },

    iterate: (objectArray, action) => {
        if (objectArray && objectArray.length) {
            let iterateMethod = (index) => {
                let item = objectArray[index];
                return action(item).then(() => {
                    index++;
                    if (objectArray[index]) {
                        return iterateMethod(index);
                    } else {
                        return Promise.resolve();
                    }
                })
            }
            return iterateMethod(0);
        } else {
            return Promise.resolve();
        }
    }

}