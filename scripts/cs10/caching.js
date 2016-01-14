// Description:
//   Perform caching of useful bCourses information in hubot's brain.
//
// Dependencies:
//   bcourses library see ./bcourses-config.js
//
// Configuration:
//   See bCourses
//
// TODO: Cleanup this section and reduce functions.
// Commands:
//   hubot show cached staff (ids)? — shows the ids of current cs10 staff members in hubot's brain
//   hubot refresh staff (ids)? (cache)? — updates the staff member ids from bcourses to brain
//   hubot show cached labs — list the labs and their due dates. Also the time at which the cache was last updated
//   hubot refresh lab cache — updates the list of lab assignments
//   hubot refresh groups — updates the mapping of group names to ids
//   hubot show (cached)? groups — show the list of groups, names and ids
//   hubot refresh (bcourses)? cache — refresh labs, staff ids, and student groups
//
// Author:
//  Andrew Schmitt

var cs10 = require('./bcourses-config.js');
var cs10Cache = {};

// CONSTANTS
cs10Cache.CACHE_HOURS = 12;

/**
 * Cache keys for various things that are stored in the redis brain
 * and that are cs10 related
 * robot.brain.get(KEY) --> gets the data associated with the key
 * robot.brain.set(KEY, data) --> sets data for that cache key
 *
 * Objects are function name 
 */
var STAFF_CACHE_KEY = 'STAFF_IDS',
    LAB_CACHE_KEY = 'LAB_ASSIGNMENTS',
    STUD_GROUP_CACHE_KEY = 'STUD_GROUPS',
    LA_DATA_KEY = 'LA_DATA',    
    LATE_ADD_DATA_KEY = 'LATE_ADD_DATA';

/**
 * Below are functions that return cached values.
 * There is a possibility that these values could be null initally, but, on loading,
 * Alonzo will referesh the cache.
 *
 * NOTE: All of these values return an object of {time: <cache-timestamp>, cacheVal: <actual-data>}
 *       except for la data currently.
 */
var cacheMap = {
    'staffIds': STAFF_CACHE_KEY,
    'studentGroups': STUD_GROUP_CACHE_KEY,
    'labAssignments': LAB_CACHE_KEY,
    'lateAddData': LATE_ADD_DATA_KEY
}
for (var funcName in cacheMap) {
    cs10Cache[funcName] = function() {
        return robot.brain.get(cacheMap[funcName]);
    }
}

/**
 * Expects two objects (error, resp) which will each have a msg attribute
 * Should only be called from a scope  where msg can be bound
 */
function genericErrorCB(msg, error, resp) {
    if (error) {
        msg.send(error.msg);
        return;
    }
    msg.send(resp.msg);
}

/**
 * Give this data and it will put a time stamp on it. Hooray.
 */
function createCacheObj(data) {
    return {
        time: (new Date()).toString(),
        cacheVal: data
    };
}

/**
 * A general caching function
 *
 * @param url {string} the url endpoint for cache data from bcourses
 * @param params {object} query parameters
 * @param key {string} a cache key
 * @param proccessFunc {func(body)} a one argument function that process the reponse body
 * @param errMsg {string} message passed to cb if the query fails
 * @param sucMsg {string} message passed to cb if the query succeeds
 * @param cb {func(err, resp)} the callback function. err and resp will have a msg attribute
 */
function cacheObject(url, params, key, processFunc, errMsg, sucMsg, cb) {
    cs10.get(url, params, function(err, resp, body) {

        if (err || !body) {
            if (cb) {
                cb({
                    msg: errMsg
                }, null);
            }
            return;
        }

        robot.brain.set(key, createCacheObj(processFunc(body)));

        if (cb) {
            cb(null, {
                msg: sucMsg
            });
        }
    });
}

/**
 * Caches the current list of staff IDs
 *
 * cb - a function of (error, resp) or null
 */
cs10Cache.cacheStaffIDs = function(cb) {
    var url = `${cs10.baseURL}/users`,
        params = {
            'per_page': '100',
            'enrollment_type': ['ta', 'teacher']
        },
        errMsg = 'There was a problem caching staff IDs :(',
        sucMsg = 'Successfully cached staff IDs! :)',
        key = cs10Cache.STAFF_CACHE_KEY;

    var staffIDProcessor = function(body) {
        // TODO: Ugh, this loop.
        var staffIDs = [];
        for (var i = 0; i < body.length; i++) {
            staffIDs.push(body[i].id);
        }
        return staffIDs;
    };

    cacheObject(url, params, key, staffIDProcessor, errMsg, sucMsg, cb);
};

/**
 * Caches the current list of assignment groups
 *
 * cb - a function of (error, resp) or null
 */
cs10Cache.cacheStudGroups = function(cb) {
    var url = `${cs10.baseURL}group_categories`,
        errMsg = 'There was a problem caching assignment groups :(',
        sucMsg = 'Successfully cached student groups! :)',
        key = STUD_GROUP_CACHE_KEY;

     function studGroupsProcessor(body) {
        var groups = {};
        // TODO: Verify this.
        if (body.constructor == Array) {
            body.forEach(function(cat) {
                groups[cat.name] = cat.id;
            });
        } else {
            console.warn('No Data received from bCourses - student groups');
            console.log('BODY: ', body);
        }
        
        return groups;
    };

    cacheObject(url, '', key, studGroupsProcessor, errMsg, sucMsg, cb);
};

/**
 * Caches lab assignments and the time at which they were cached
 *
 * cb - a function of (error, resp) or null
 */
cs10Cache.cacheLabAssignments = function(cb) {
    var url = `${cs10.baseURL}assignment_groups/${cs10.labsID}`,
        params = {
            'include[]': 'assignments'
        },
        errMsg = 'There was a problem caching lab assignments :(',
        sucMsg = 'Successfully cached lab assignments! :)',
        key = LAB_CACHE_KEY;

    function labAssignmentProcessor(body) {
        return body.assignments;
    };

    cacheObject(url, params, key, labAssignmentProcessor, errMsg, sucMsg, cb);
};

/**
 * Cache the given array of student data in the brain.
 * This is actually not asynchronous, 
 * but to keep in the spirit of all the others we'll treat it like it is
 *
 * cb - a function of (error, resp) or null
 */
cs10Cache.cacheLateAddData = function(data, cb) {
    robot.brain.set(LATE_ADD_DATA_KEY, createCacheObj(data))

    if (cb) {
        cb(null);
    }
}

/**
 * Checks if a cacheObj is valid
 * Expects a cache object to be of the form {time: NUM, data: SOME_DATA_THING}
 */
cs10Cache.cacheIsValid = function(cacheObj) {
    var exists = cacheObj && cacheObj.cacheVal,
        date = cacheObj.time,
        diff = (new Date()) - (new Date(date));
    return exists && diff / (1000 * 60 * 60) < cs10Cache.CACHE_HOURS;
};

/**
 * Refreshes course dependent cache objects.
 *
 * Things not refreshed:
 * - Lab Assistant Data
 *
 * Things refreshed:
 * - Staff IDs
 * - Stduent groups
 * - Lab assignments
 *
 * cb - a function of (error, resp) or null
 */
cs10Cache.refreshCache = function(cb) {
    cs10Cache.cacheStaffIDs(cb);
    cs10Cache.cacheStudGroups(cb);
    cs10Cache.cacheLabAssignments(cb);
};

// Caching is allowed everywhere except the LA room
function isValidRoom(msg) {
    return msg.message.room !== cs10.LA_ROOM;
}

/**
 * This exports the robot functionality for the caching module
 */
var initialBrainLoad = true;
module.exports = function(robot) {

    // Refresh the cache on brain loaded
    robot.brain.on('loaded', function() {
        if (!initialBrainLoad) {
            return;
        }

        initialBrainLoad = false;
        cs10Cache.refreshCache(function(err, resp) {
            if (err) {
                robot.logger.debug(err.msg);
                return;
            }
            robot.logger.info(resp.msg);
        });
    });

    // This is mostly for debugging as it currently does not show names mapped to ids.
    // TODO: Store names and ids in cache
    robot.respond(/show\s*(cached)?\s*staff\s*(ids)?/i, {
        id: 'cs10.caching.show-staff-ids'
    }, function(msg) {
        if (!isValidRoom(msg)) {
            return;
        }
        msg.send(`/code\n${cs10Cache.staffIDs().cacheVal}`);
    });

    robot.respond(/refresh\s*staff\s*(ids)?\s*(cache)?/i, {
        id: 'cs10.caching.refresh-staff-ids'
    }, function(msg) {
        if (!isValidRoom(msg)) {
            return;
        }
        msg.send('Refreshing staff ids...');
        cs10Cache.cacheStaffIDs(genericErrorCB.bind(null, msg));
    });

    robot.respond(/show\s*(cached)?\s*labs/i, {
        id: 'cs10.caching.show-labs'
    }, function(msg) {
        if (!isValidRoom(msg)) {
            return;
        }
        var labs = cs10Cache.labAssignments(),
            labStr = "";
        labs.cacheVal.forEach(function(lab) {
            labStr += `${lab.name} - Due: ${(new Date(lab.due_at)).toDateString()}\n`;
        });
        labStr += `Cache last updated on: ${(new Date(labs.time)).toDateString()}`;
        msg.send(labStr);
    });

    robot.respond(/refresh\s*lab(s)?\s*(cache)?/i, {
        id: 'cs10.caching.refresh-labs'
    }, function(msg) {
        if (!isValidRoom(msg)) {
            return;
        }
        msg.send('Refreshing labs...');
        cs10Cache.cacheLabAssignments(genericErrorCB.bind(null, msg));
    });

    robot.respond(/show\s*(cached)?\s*groups/i, {
        id: 'cs10.caching.show-groups'
    }, function(msg) {
        if (!isValidRoom(msg)) {
            return;
        }

        var groups = cs10Cache.studentGroups(),
            grpStr = 'Current Student Groups:\n';
        for (var g_name in groups.cacheVal) {
            grpStr += `${g_name} - bcourses_id: ${groups.cacheVal[g_name]}\n`;
        }
        grpStr += `Cache last updated on: ${(new Date(groups.time)).toDateString()}`;
        msg.send(grpStr);
    });

    robot.respond(/refresh\s*groups\s*(cache)?/i, {
        id: 'cs10.caching.refresh-groups'
    }, function(msg) {
        if (!isValidRoom(msg)) {
            return;
        }
        msg.send("Refreshing groups...");
        cs10Cache.cacheStudGroups(genericErrorCB.bind(null, msg));
    });

    robot.respond(/refresh\s*(bcourses)?\s*cache/i, {
        id: 'cs10.checkoff.refresh-lab-cache'
    }, function(msg) {
        if (!isValidRoom(msg)) {
            return;
        }
        msg.send('Waiting on bCourses...');
        cs10Cache.refreshCache(genericErrorCB.bind(null, msg));
    });
};

/**
 * This exposes functions to the outside.
 * But since we also want some robot listening being done we do this down here.
 */
for (var key in cs10Cache) {
    module.exports[key] = cs10Cache[key];
}