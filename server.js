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
        '/oauth2callback': function(req, res, next) {
          gcal.setAccessToken(req.query.code, function() {
            res.redirect('/');
          });
        },
        '/calendar': function(req, res, next) {
          gcal.getAgenda(function (err, agenda) {
            res.json(agenda);
          });
        }
    })
);

gcal.ready();
server.listen(8080);
