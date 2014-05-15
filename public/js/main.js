jQuery.fn.updateWithText = function(text, speed) {
	var dummy = $('<div/>').html(text);

	if ($(this).html() != dummy.html())
	{
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
				//done
			});		
		});
	}
}

jQuery(document).ready(function($) {

	var weatherParams = {
		'q': 'San Francisco, CA',
		'units': 'imperial',
		'lang': 'en'
	};
	
	(function checkVersion() {
    var githash;
		$.getJSON('/githash', {}, function(json, textStatus) {
      if (!githash) {
        githash = json.githash;
      }
			else if (json.githash != githash) {
				window.location.reload();
			}
		});
		setTimeout(function() {
			checkVersion();
		}, 3000);
	})();

	(function updateTime() {
		$('.date').html(moment().format('llll'));
		
		setTimeout(function() {
			updateTime();
		}, 1000*15); // 15 seconds
	})();

	(function updateCalendarData() {
    $.getJSON('/calendar', function(agenda) {
      for (var i in agenda.items) {
        agenda.items[i].dt = moment(agenda.items[i].start.date || agenda.items[i].start.dateTime);
      };
    	agenda.items.sort(function(a,b){return a.dt.unix()-b.dt.unix()});

      var table = $('<table/>').addClass('xsmall').addClass('calendar-table');

      for (var i in agenda.items) {
        var e = agenda.items[i];
        
        var row = $('<tr/>');
        row.append($('<td/>').html(e.summary).addClass('description'));
        row.append($('<td/>').html(e.dt.fromNow()).addClass('days dimmed'));
        table.append(row);
      }

      $('.calendar').updateWithText(table,1000);

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

		$.getJSON('http://api.openweathermap.org/data/2.5/weather', weatherParams, function(owm, textStatus) {

			var temp = owm.main.temp|0;
			var temp_min = owm.main.temp_min|0;
			var temp_max = owm.main.temp_max|0;

			var wind = owm.wind.speed|0;

			var iconClass = iconTable[owm.weather[0].icon];
			var icon = '<span class="icon dimmed wi ' + iconClass + '"></span>' + temp + '&deg;';
			$('.temp').updateWithText(icon, 1000);

			var sunrise = moment.unix(owm.sys.sunrise).format('h:mm');
			var sunset = moment.unix(owm.sys.sunset).format('h:mm');

			var windString = '<span class="wi wi-strong-wind xdimmed"></span> ' + wind + 'mph' ;
			var sunString = '<span class="wi wi-sunrise xdimmed"></span> ' + sunrise;
			sunString += '<span class="wi wi-sunset xdimmed"></span> ' + sunset;

      $('.wind').updateWithText(windString, 1000);
      $('.sun').updateWithText(sunString, 1000);
		});

		setTimeout(function() {
			updateCurrentWeather();
		}, 1000*60*30); // 30 minutes
	})();

	(function updateWeatherForecast() {
		$.getJSON('http://api.openweathermap.org/data/2.5/forecast', weatherParams, function(owm, textStatus) {

  		var forecastData = {};

  		for (var i in owm.list) {
  			var forecast = owm.list[i];
  			var dt  = moment.unix(forecast.dt);
        var key = dt.dayOfYear() == moment().dayOfYear() ? dt.format('hA') : dt.format('dddd');

  			if (forecastData[key] == undefined) {
  				forecastData[key] = {
  					'timestamp':forecast.dt,
  					'temp_min':forecast.main.temp,
  					'temp_max':forecast.main.temp
  				};
  			} else {
  				forecastData[key]['temp_min'] = Math.min(forecast.main.temp, forecastData[key]['temp_min']);
  				forecastData[key]['temp_max'] = Math.max(forecast.main.temp, forecastData[key]['temp_max']); 
  			}

  		}

  		var forecastTable = $('<table />').addClass('forecast-table');
  		for (var i in forecastData) {
  			var forecast = forecastData[i];
  			var dt = moment.unix(forecast.timestamp);
  			var row = $('<tr />');

  			row.append($('<td/>').addClass('day').html(i))//dayAbbr[dt.getDay()]));
        row.append($('<td/>').addClass('temp-min').html(forecast.temp_min|0));
  			row.append($('<td/>').addClass('temp-max').html(forecast.temp_max|0));

  			forecastTable.append(row);
  		}

  		$('.forecast').updateWithText(forecastTable, 1000);
  	});

  	setTimeout(function() {
  		updateWeatherForecast();
  	}, 1000*60*30); // half hour
	})();
	
});