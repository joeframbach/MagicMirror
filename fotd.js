var request = require('request'),
    cheerio = require('cheerio');

var fotd = {};
fotd.getFacts = function(callback) {
  request(
    'http://uselessfacts.net/category/facts-of-the-day/',
    function(err, response, html) {
      if (err || response.statusCode !== 200) {
        return callback('Could no load facts');
      }
      var $ = cheerio.load(html);
      callback(null, $('.facttext').map(function(){return $(this).text()}).get());
    }
  );
};

module.exports = fotd;
