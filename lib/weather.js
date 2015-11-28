var request = require('request');

var API_KEY = process.env.OWM_API_KEY;

var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather';
var forecastUrl = 'http://api.openweathermap.org/data/2.5/forecast';
var owmParams = {
  'lat': '37.7959360',
  'lon': '-122.4000030',
  'units': 'imperial',
  'lang': 'en',
  'APPID': API_KEY
}
function makeOwmHandler (url) {
  return function (callback) {
    request({
      url: url,
      qs: owmParams
    }, function(err, response, body) {
      if (err || response.statusCode !== 200) {
        return callback('Could no load weather');
      }
      callback(null, JSON.parse(body));
    });
  };
}
var weather = {};
weather.getWeather = makeOwmHandler(weatherUrl);
weather.getForecast = makeOwmHandler(forecastUrl);

module.exports = weather;
