/* 
 * Overlay Comp for Pixel-Perfect Layout (v1.3.1)
 *  <http://code.google.com/p/shepherd-interactive/wiki/OverlayComp>
 *  by Weston Ruter, Shepherd Interactive <http://www.shepherd-interactive.com/>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * $Id$
 * Copyright 2009, Shepherd Interactive.
 *
 * 
 * Usage:
 * Toggle the overlay by pressing Shift+Spacebar when a query string is provided
 * in the location.hash with the following parameters:
 *   "comp" - URL to the image to be overlaid
 *   "opacity" - how opaque the overlay is (values from 0.0 to 1.0; default is 0.8)
 *   "align" - either 'left', 'center', 'right', or a pixel value from the left (default left)
 *   "left" - number of pixels from the left (default 0) - use with align:left
 *   "right" - number of pixels from the right (default 0) - use with align:right
 *   "top" - pixels from the top (default 0)
 *   "interval" - millisecond-interval that the step opacity is applied (default 10)
 *   "step" - amount of opacity that is added or subtracted at each "interval" (default 0.1)
 *   "z-index" - where the comp is layered on the page (default 100)
 *   "when" - milliseconds after page-load that comp is displayed (defaults to -1, meaning disable)
 * For example: index.html#comp=/comps/home.jpg&align=center&opacity=0.5
 * 
 * Works well if the hash query strings are bookmarked so that they can be quickly
 * recalled for a page and activated. Also ideal for use with Firebug so that elements
 * can be repositioned and re-styled while the comp is overlaid.
 *
 * This script can either be included via a <script> element, or can be automatically
 * added to a page via a user script. See project home page.
 */

(function(){
var params = { //defaults
  comp:"",
	opacity:0.8,
	align:'left',
	top:0,
	left:0,
	right:0,
	interval:10,
	step:0.1,
	"z-index":100,
	when:-1,
	"pointer-events": 'none'
};



var intervalID = 0;
var useOpacityProperty = !(!document.addEventListener && document.attachEvent);
var div;
var img;
var hasShown = false;
var pollInterval = 100;

function toggleOverlay(){
	clearInterval(intervalID);
	var matches;
	
	//Fade the comp away if the requested comp is the same and if the comp is already overlaid
	if(div && (!params.comp || img.src.indexOf(params.comp) >= 0)){
		intervalID = window.setInterval(function(){
			var newOpacity = 0;
			if(useOpacityProperty)
				newOpacity = parseFloat(div.style.opacity);
			else if(matches = String(div.style.filter).match(/opacity=(\d+)/))
				newOpacity = parseInt(matches[1])/100;
				
			if(!newOpacity)
				newOpacity = params.opacity;
			newOpacity -= params.step;
			if(useOpacityProperty)
				div.style.opacity = newOpacity;
			else
				div.style.filter = "alpha(opacity=" + (newOpacity*100) + ");";
				
			if(newOpacity <= 0.0){
				clearInterval(intervalID);
				div.parentNode.removeChild(div);
				div = null;
			}
		}, params.interval);
	}
	//Create the comp and fade it in
	else {
		if(div && div.parentNode)
			div.parentNode.removeChild(div);
		
		div = document.createElement('div');
		div.style.textAlign = params.align;
		div.style.width = "100%";
		img = document.createElement('img');
		img.src = params.comp;
		div.appendChild(img);
		div.style.opacity = 0.0;
		div.style.filter = "alpha(opacity=0)";
		div.style.position = 'absolute';
		div.style.top = params.top + "px";
		div.style.left = "0px";
		img.style.position = 'relative';
		//img.style.marginLeft = params.left + 'px';
		img.style.left = params.left + 'px';
		//img.style.marginRight = params.right + 'px';
		img.style.right = params.right + 'px';
		div.style.zIndex = params['z-index'];
		div.id = "designCompOverlay";
		try {
			document.documentElement.appendChild(div);
		}
		catch(e){
			document.getElementsByTagName('body')[0].appendChild(div); //document.documentElement appears to fail in IE8
		}
		div.onclick = function(){
			toggleOverlay();
		};
		hasShown = true;
		
		intervalID = window.setInterval(function(){
			var newOpacity = 0;
			if(useOpacityProperty)
				newOpacity = parseFloat(div.style.opacity);
			else if(matches = String(div.style.filter).match(/opacity=(\d+)/))
				newOpacity = parseInt(matches[1])/100;
			
			if(!newOpacity)
				newOpacity = 0;
			newOpacity += params.step;
			if(newOpacity > params.opacity)
				newOpacity = params.opacity
			if(useOpacityProperty)
				div.style.opacity = newOpacity;
			else
				div.style.filter = "alpha(opacity=" + (newOpacity*100) + ");";
			if(newOpacity >= params.opacity)
				window.clearInterval(intervalID);
		}, params.interval);
	}
};
window.toggleCompOverlay = toggleOverlay;

//Listen for when the spacebar is pressed
function keypressHandler(e){
	e = e || window.event;
	var key = e.keyCode || e.which;
	if(key == 32 && e.shiftKey){
		if(params.comp){
			toggleOverlay();
			if(e.preventDefault)
				e.preventDefault();
			return false;
		}
	}
	return true;
}

if(document.addEventListener)
	document.addEventListener('keypress', keypressHandler, false);
else if(document.attachEvent)
	document.attachEvent('onkeypress', keypressHandler);
	
function getParams(){
	var hash = window.location.hash.substr(1);
	if(!hash){
		delete params.comp;
		return;
	}
	var pairs = hash.split(/&/);
	for(var i = 0; i < pairs.length; i++){
		var pair = pairs[i].split(/=/);
		var value = pair[1];
		if(!value)
			delete params[pair[0]];
		else if(/^-?\d+$/.test(value))
			params[pair[0]] = parseInt(value);
		else if(/^-?\d*\.\d+$/.test(value))
			params[pair[0]] = parseFloat(value);
		else
			params[pair[0]] = value;
	}
	if(params.comp)
		params.comp = params.comp.replace(/ /g, '%20');
}
getParams();

var previousHash = window.location.hash;
var timePassed = 0;
function poller(){
	if(previousHash != window.location.hash || (!hasShown && params.when != -1 && timePassed >= params.when)){
		getParams();
		toggleOverlay();
		previousHash = window.location.hash;
	}
	timePassed += pollInterval;
	window.setTimeout(poller, pollInterval);
}

if(document.body)
	poller();
else if(window.addEventListener)
	window.addEventListener('load', poller, false);
else if(window.attachEvent)
	window.attachEvent('onload', poller);

})();
