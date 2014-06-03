var googleapis = require('googleapis'),
    readline = require('readline')
    async = require('async'),
    config = require('./config');

var OAuth2Client = googleapis.OAuth2Client;

var CLIENT_ID = config.google.client_id;
var CLIENT_SECRET = config.google.client_secret;
var REDIRECT_URL = config.url + '/oauth2callback';

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var gcal = {};
gcal.initialize = function(callback) {
  gcal.oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  googleapis
    .discover('calendar', 'v3')
    .execute(function(err, client) {
      gcal.client = client;
      callback();
    });
};

gcal.getAuthUrl = function(callback) {
  var url = gcal.oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    approval_prompt: 'force',
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
  });

  callback(url);
};

gcal.getAccessToken = function(code, callback) {
  gcal.oauth2Client.getToken(code, function(err, tokens) {
    callback(tokens);
  });
};

gcal.setAccessToken = function(tokens, callback) {
  gcal.oauth2Client.setCredentials(tokens);
  callback();
}

gcal.getAgenda = function(callback) {
  async.concat(
    config.google.calendar_ids,
    function(calendar_id, concat_cb) {
      gcal.client
        .calendar.events.list({
           'calendarId': calendar_id,
           'maxResults': 10,
           'orderBy': 'startTime',
           'singleEvents': true,
           'timeMin': new Date().toISOString()
         })
        .withAuthClient(gcal.oauth2Client)
        .execute(function(err, agenda) {
          agenda && agenda.items && concat_cb(err, agenda.items);
        });
    },
    function(err, agenda_items) {
      callback(err, agenda_items);
    }
  );
};

module.exports = gcal;
