xbmcPlayer = (function ($) { //create the xbmcPlayer global object

	//constants
	var REFRESH = 10000;

	//html helper functions
	var html = {
		'controls': function (appendTo) {
			return $('<div class="controls"></div>').appendTo(appendTo);
		},
		'controlButton': function (name, text, appendTo) {
			return $('<div class="controlButton '+name+'" tabindex="0" title="'+text+'"></div>').appendTo(appendTo);
		},
		'controlButtonLink': function (name, text, href, appendTo) {
			return $('<a class="controlButton '+name+'" href="'+href+'" title="'+text+'"></a>').appendTo(appendTo);
		},
		'controlSlider': function (appendTo) {
			return $('<div id="progress"></div>').appendTo(appendTo);
		},
		'volume': function (appendTo) {
			return $('<div id="volume"></div>').appendTo(appendTo);
		}
	};
	
	var controlButtons = {
		/*'GoPrevious': {
			'text': 'Previous',
			'click': function () { xbmc.GoPrevious(); }
		},*/
		'PlayPause': {
			'text': 'Play / Pause',
			'click': function () { xbmc.PlayPause(); }
		},
		/*'Stop': {
			'text': 'Stop',
			'click': function () { xbmc.Stop(); }
		},
		'GoNext': {
			'text': 'Next',
			'click': function () { xbmc.GoNext(); }
		},*/
		'Remote': {
			'text': 'Remote',
			'link': '/#page=Remote'
		},
		'Playlist': {
			'text': 'Playlist',
			'link': '/#page=Playlist'
		}
	};
	
	var renderPlayer = function (player) {
		$.each(controlButtons, function (index, button) {
			if (button.click) html.controlButton(index, button.text, player).click(button.click);
			else if (button.link) html.controlButtonLink(index, button.text, button.link, player);
		});
		var slider = html.controlSlider(player);
		$(slider).slider({
			'stop': function (event, ui) {
				xbmc.Seek({'value':ui.value});
			},
			'step': 0.001
		});
		var volume = html.volume(player);
		$(volume).slider({
			//set the xbmc volume when the slider is changed
			'stop': function (event, ui) {
				xbmc.Volume({'volume':ui.value});
			},
			//set the xbmc volume continuously while the slider is changing
			//this creates a metric fuckton of connections... probably needs websockets to work properly
			/*'slide': function (event, ui) {
				xbmc.Volume({'volume':ui.value});
			},*/
			'orientation': 'horizontal'
		});
	};
	
	var refreshPlayer = (function () {
		var body = $('body');
		var GetActivePlayerProperties = function (callback) {
			xbmc.GetActivePlayerProperties(function (player) {
				if (!player) {
					body.attr('data-status','stopped');
				} else {
					if (player.speed) body.attr('data-status','playing');
					else body.attr('data-status','paused');
					$('#progress').slider('value',player.percentage);
				}
				callback();
			});
		};
		var GetApplicationProperties = function (callback) {
			xbmc.GetApplicationProperties(function (app) {
				$('#volume').slider('value',app.volume);
				document.title = app.name;
				callback();
			});
		};
		var timeout  = function (func) {
			window.setTimeout(func, REFRESH);
		};
		var timer = function () {
			GetApplicationProperties(function () {
				timeout(function () {
					GetActivePlayerProperties(function () {
						timeout(function () {
							timer();
						});
					});
				});
			});
		};
		return timer;
	})();
	
	var init = function () {		
		//render the player
		renderPlayer($('#player'));
		
		//start polling
		refreshPlayer();
	};
	
	return {
		'init': init
	};
	
})(jQuery);

jQuery(function () { //on document load
	xbmcPlayer.init(); //initialize the player
});
