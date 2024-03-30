const { HLTV } = require('hltv');

// let currentEvents = HLTV.getEvents({ eventType: ['MAJOR', 'INTLLAN']}).then((res) => {
//     var response = res.filter(eventInProgress);
//     console.log(response);
// });
//
// HLTV.getEvent({id : 7148 }).then((res) => {
//     console.log(res);
// });

// HLTV.getMatches({eventIds: [7148]}).then((res) => {
//     var currentMatches = res.filter(matchInProgress);
//     console.log(currentMatches);
// });

HLTV.connectToScorebot({
    id: 2370726,
    onScoreboardUpdate: (data, done) => {
        if (!data.live) {
            done();
        }
    },
    onLogUpdate: (data, done) => {

    }
});

function eventInProgress(event) {
    var now = Date.now();
    return now >= event.dateStart && now <= event.dateEnd;
}

function matchInProgress(match) {
    return match.live;
}