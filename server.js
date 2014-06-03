var connect = require('connect'),
    quip = require('quip'),
    dispatch = require('dispatch'),
    exec = require('child_process').exec,
    config = require('./config.js'),
    gcal = require('./gcal.js');

var server = connect.createServer(
    connect.static(__dirname + '/public'),
    connect.query(),
    quip,
    dispatch({
        '/githash': function(req, res, next) {
          exec('git rev-parse HEAD', function(error, stdout, stderr) {
            res.json({ githash: stdout.trim() });
          });
        },
        '/oauth': function(req, res, next) {
          gcal.getAuthUrl(function(url) {
            res.redirect(url);
          });
        },
        '/oauth2callback': function(req, res, next) {
          gcal.getAccessToken(req.query.code, function(tokens) {
            gcal.setAccessToken(tokens, function() {
              res.redirect('/');
            });
          });
        },
        '/calendar': function(req, res, next) {
          gcal.getAgenda(function (err, agenda_items) {
            res.json(agenda_items);
          });
        }
    })
);

gcal.initialize(function() {
  if (config.google.tokens) {
    gcal.setAccessToken(config.google.tokens, function() {});
  }

  server.listen(64080, "127.0.0.1");
});

