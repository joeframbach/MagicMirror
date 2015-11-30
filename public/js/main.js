$(document).ready(function() {
  Handlebars.registerHelper('moment', function(context, block) {
    if (typeof context === 'object' && typeof block === 'undefined') {
      block = context;
      context = void 0;
    }
    if (!window.moment) return context;
    block = block || { hash: {}};
    var m = block.hash.unix ? moment.unix(context) : moment(context);
    var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
    return m.format(f);
  });

  var source = $('#template').html();
  var template = Handlebars.compile(source);
  var container = $('#container');
  var data = {};

  var updateDisplayTimeout;
  (function updateDisplay() {
    container.html(template(data));
    clearTimeout(updateDisplayTimeout);
    updateDisplayTimeout = setTimeout(updateDisplay, 15000);
  })();

  (function updateFact() {
    $.getJSON('/facts', function(facts) {
      if (facts && facts.length) {
        data.fact = facts[Math.floor(Math.random()*facts.length)];
        updateDisplay();
      }
    });
    setTimeout(updateFact, 1000*60*60); // 1 hour
  })();

  (function updateCalendarData() {
    $.getJSON('/calendar', function(agendaItems) {
      agendaItems.forEach(function (item) {
        item.dt = moment(item.start.date || item.start.dateTime);
        item.fromNow = item.dt.fromNow();
      });
      agendaItems.sort(function(a,b){return a.dt.unix()-b.dt.unix()});
      data.calendar = agendaItems;
      updateDisplay();

      setTimeout(function() {
        updateCalendarData();
      }, 1000*60*30); // 30 minutes
    });
  })();

  (function updateCurrentWeather() {
    var iconTable = {
      '01d':'wi-day-sunny',
      '02d':'wi-day-cloudy',
      '03d':'wi-cloudy',
      '04d':'wi-cloudy-windy',
      '09d':'wi-showers',
      '10d':'wi-rain',
      '11d':'wi-thunderstorm',
      '13d':'wi-snow',
      '50d':'wi-fog',
      '01n':'wi-night-clear',
      '02n':'wi-night-cloudy',
      '03n':'wi-night-cloudy',
      '04n':'wi-night-cloudy',
      '09n':'wi-night-showers',
      '10n':'wi-night-rain',
      '11n':'wi-night-thunderstorm',
      '13n':'wi-night-snow',
      '50n':'wi-night-alt-cloudy-windy'    
    }

    $.getJSON('/weather', function(owm, textStatus) {
      data.temp = owm.main.temp|0;
      data.tempIcon = iconTable[owm.weather[0].icon];
      data.windSpeed = owm.wind.speed|0;
      data.sunrise = owm.sys.sunrise;
      data.sunset = owm.sys.sunset;
      updateDisplay();
    });

    setTimeout(function() {
      updateCurrentWeather();
    }, 1000*60*30); // 30 minutes
  })();

  (function updateWeatherForecast() {
    $.getJSON('/forecast', function(owm, textStatus) {

      data.hourlyForecast = {};
      data.dailyForecast = {};

      for (var i in owm.list) {
        var forecast = owm.list[i];
        var dt  = moment.unix(forecast.dt);
        if (dt.dayOfYear() == moment().dayOfYear()) {
          var forecastData = data.hourlyForecast;
          var key = dt.format('hA');
        } else {
          var forecastData = data.dailyForecast;
          var key = dt.format('dddd');
        }

        if (forecastData[key] == undefined) {
          forecastData[key] = {
            'timestamp': forecast.dt,
            'key': key,
            'tempMin': forecast.main.temp|0,
            'tempMax': forecast.main.temp|0
          };
        } else {
          forecastData[key]['tempMin'] = Math.min(forecast.main.temp|0, forecastData[key]['tempMin']);
          forecastData[key]['tempMax'] = Math.max(forecast.main.temp|0, forecastData[key]['tempMax']); 
        }

      }

    });

    setTimeout(function() {
      updateWeatherForecast();
    }, 1000*60*30); // half hour
  })();
  
});
