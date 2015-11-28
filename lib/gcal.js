var google = require('googleapis'),
    async = require('async');

var CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var REDIRECT_URL = process.env.URL + '/oauth2callback';

var calApi = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  approval_prompt: 'force',
  scope: 'https://www.googleapis.com/auth/calendar.readonly'
});
google.options({ auth: oauth2Client });

var gcal = {};

gcal.authUrl = authUrl;

gcal.getAccessToken = function(code, callback) {
  oauth2Client.getToken(code, function(err, tokens) {
    callback(tokens);
  });
};

gcal.setCredentials = function (tokens) {
  oauth2Client.setCredentials(tokens);
}

gcal.getAgenda = function(callback) {
  async.concat(
    process.env.GOOGLE_CALENDAR_IDS.split(' '),
    function(calendar_id, concat_cb) {
      calApi.events.list({
         'calendarId': calendar_id,
         'maxResults': 10,
         'orderBy': 'startTime',
         'singleEvents': true,
         'timeMin': new Date().toISOString()
      }, function(err, agenda) {
        agenda && agenda.items && concat_cb(err, agenda.items);
      });
    },
    function(err, agenda_items) {
      callback(err, agenda_items);
    }
  );
};

module.exports = gcal;
