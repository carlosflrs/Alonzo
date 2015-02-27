// Description:
//  Simple stuff for TAs
//
// Dependencies:
//   bcourses/index.js
//
// Configuration:
//   See bcourses/index.js
//
// Commands:
//   hubot links | forms - CS10: show useful TA notes.
//   hubot locker (combo)? - CS10: show the locker comber for lab
//
// Author:
//  Michael Ball

cs10 = require('./bcourses/');

module.exports = function(robot) {
    robot.respond(/.*(links|forms).*/i, function(msg) {
        var txt = '';
        txt += 'Late Assignments Form: http://bjc.link/sp15lateassignment\n';
        txt += 'LA Attendance: https://bcourses.berkeley.edu/courses/1301477/external_tools/36957\n';
        txt += 'Grade book:' + cs10.gradebookURL + '\n';
        txt += 'Checkoff Answers: http://bjc.link/cs10checkoffquestions\n';
        txt += 'Contacts Sheet: http://bjc.link/cs10contacts\n';
        msg.send(txt);
    });

    robot.respond(/\s*locker( combo)?/i, function(msg) {
        msg.send('11-29-15');
    });
}