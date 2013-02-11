(function() {

	var OverlayComp = {
		prev_hash: '',
		params: {},
		defaults: {
			opacity: 0.8,
			align: 'center',
		},
		initialize: function() {
			if (document.addEventListener) {
				document.addEventListener('keypress', OverlayComp.spacebar, false);
			}
			else if (document.attachEvent) {
				document.attachEvent('onkeypress', OverlayComp.spacebar);
			}

			this.prev_hash = window.location.hash;
			this.get_params();

			//this.toggle();

			setInterval(function() {

				if (OverlayComp.prev_hash != window.location.hash) {
					OverlayComp.get_params();
					OverlayComp.toggle();
					OverlayComp.prev_hash = window.location.hash;
				}				
			}, 500);

		},
		spacebar: function(e) {
			e = e || window.event;
			var key = e.keyCode || e.which;
			if (key == 32 && e.shiftKey){
				if (OverlayComp.params.comp){
					OverlayComp.toggle();
					if(e.preventDefault)
						e.preventDefault();
					return false;
				}
			}
			return true;
		},
		toggle: function() {
			var overlay = $('#overlay-comp');
			if (overlay.length) {
				if (overlay.is(':visible')) {
					overlay.hide();
				}
				else {
					overlay.show();
				}
				return;
			}
			else {

	
				var img = $('<img />').appendTo('body').attr({
					id: 'overlay-comp',
					src: this.params.comp
				}).css({
					opacity: 0.5,
					position: 'absolute',
					top: 0,
					left: 0,
					pointerEvents: 'none',
					zIndex: 99999
				});	


				setTimeout(function() {
					var ww = $(window).width();
					img.css({
						left: (ww - OverlayComp.params.width) / 2
					});
				}, 300);

			}

		},
		get_params: function() {
			var hash = window.location.hash.substr(1);
			if(!hash) {
				delete this.params.comp;
				return;
			}
			var pairs = hash.split(/&/);
			for(var i = 0; i < pairs.length; i++){
				var pair = pairs[i].split(/=/);
				var value = pair[1];
				if(!value) {
					delete this.params[pair[0]];
				}
				else if (/^-?\d+$/.test(value)) {
					this.params[pair[0]] = parseInt(value, 10);
				}
				else if(/^-?\d*\.\d+$/.test(value)) {
					this.params[pair[0]] = parseFloat(value);
				}
				else {
					this.params[pair[0]] = value;
				}
			}
			if (this.params.comp) {
				this.params.comp = this.params.comp.replace(/ /g, '%20');			
			}
		}
	};

	OverlayComp.initialize();
})();
