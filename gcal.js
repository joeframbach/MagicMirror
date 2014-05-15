var googleapis = require('googleapis'),
    readline = require('readline')
    config = require('./config');

var OAuth2Client = googleapis.OAuth2Client;

var CLIENT_ID = config.google.client_id;
var CLIENT_SECRET = config.google.client_secret;
var REDIRECT_URL = 'http://localhost:8080/oauth2callback';

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var gcal = {};

gcal.ready = function(callback) {
  // load google calendar v3 API resources and methods
  googleapis
    .discover('calendar', 'v3')
    .execute(function(err, client) {
      gcal.client = client;
      gcal.oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

      var url = gcal.oauth2Client.generateAuthUrl({
        access_type: 'offline', // will return a refresh token
        approval_prompt: 'force',
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
      });

      console.log('Visit the url: ', url);

    });
};

gcal.setAccessToken = function(code, callback) {
  gcal.oauth2Client.getToken(code, function(err, tokens) {
    gcal.oauth2Client.setCredentials(tokens);
    callback();
  });
};

gcal.getAgenda = function(callback) {
  gcal.client
    .calendar.events.list({
                 'calendarId': config.google.calendarId,
                 'maxResults': 10,
                 'orderBy': 'startTime',
                 'singleEvents': true,
                 'timeMin': new Date().toISOString()
               })
    .withAuthClient(gcal.oauth2Client)
    .execute(callback);
};

module.exports = gcal;