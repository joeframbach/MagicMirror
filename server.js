require('dotenv').load();

var http = require('http'),
    connect = require('connect'),
    dispatch = require('dispatch'),
    gcal = require('./lib/gcal.js'),
    fotd = require('./lib/fotd.js'),
    weather = require('./lib/weather.js');

var app = connect();
app.use(require('serve-static')(__dirname + '/public'));
app.use(require('body-parser').urlencoded({extended: true}));
app.use(function (req, res, next) {
  res.json = function(obj) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj, null, 2))
  }
  res.redirect = function (url) {
    res.writeHead(302, {Location: url});
    res.end();
  }
  next()
});
app.use(dispatch({
  '/oauth': function(req, res, next) {
    res.redirect(gcal.authUrl);
  },
  '/oauth2callback': function(req, res, next) {
    var query = require('url').parse(req.url, true).query
    gcal.getAccessToken(query.code, function(tokens) {
      console.log('New tokens!', tokens);
      gcal.setCredentials(tokens);
      res.redirect('/');
    });
  },
  '/facts': function(req, res, next) {
    fotd.getFacts(function (err, facts) {
      res.json(facts);
    });
  },
  '/calendar': function(req, res, next) {
    gcal.getAgenda(function (err, agenda_items) {
      res.json(agenda_items);
    });
  },
  '/weather': function (req, res, next) {
    weather.getWeather(function (err, forecast) {
      res.json(forecast);
    });
  },
  '/forecast': function (req, res, next) {
    weather.getForecast(function (err, forecast) {
      res.json(forecast);
    });
  }
}));

if (process.env.GOOGLE_ACCESS_TOKEN) {
  gcal.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    token_type: process.env.GOOGLE_TOKEN_TYPE,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    expiry_date: process.env.GOOGLE_EXPIRY_DATE
  });
}

http.createServer(app).listen(64080, "127.0.0.1");

