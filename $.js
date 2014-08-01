var $ = function (selector) 
{
	if(typeof selector == 'object') {
		if(selector instanceof NodeList)
			return $.$arrayFromNodeList(selector);
		else if(selector instanceof $Array)	
			return selector;
		else if(selector instanceof Array)	//common array
			return $.$arrayFromNodeList(selector);
		else {	//dom object
			var ret = new $Array();
			ret.push(selector);
			return ret;
		}
	} else
		return $.$arrayFromNodeList(pholder.querySelectorAll(selector));

};


win.$ = $;


var cur_view, pholder;

var $Array = function() {};	//plug


//set view object to apply functions like ajax and addEvent to specific module
$.use = function(view) {
	cur_view = view;
	pholder = view.module.ph;
}

$.ajax = function(query, callback) {
	cur_view.ajax(query, callback);
}


$.ieGetByClass = function(node, classname) {

	var result = [];

	var	list = node.getElementsByTagName('*'), 
	length = list.length;
	for(var i = 0; i < length; i++) {
		if((new RegExp('(\\s|^)' + className + '(\\s|$)')).test(list[i].className)){
			result.push(list[i])
			break
		}
	}
	return result	
}

$.frameDoc = function (iframe) {	//init on first call
		
	var fbody = 'return ';
	if(iframe.contentDocument)
		fbody += 'iframe.contentDocument';
	else if(iframe.contentWindow && iframe.contentWindow.document)
		fbody += 'iframe.contentWindow.document';
	else
		fbody += 'iframe.document';
	
	$.frameDoc = new Function('iframe', fbody);
	return $.frameDoc(iframe);
};

$.frameWin = function (iframe) {	//init on first call
		
	var fbody = 'return ';
	if(iframe.contentWindow)
		fbody += 'iframe.contentWindow';
	else
		fbody += 'iframe';
	
	$.frameWin = new Function('iframe', fbody);
	return $.frameWin(iframe);
};

$.jsonParse =  function(text) {	//init on first call
	if(window.JSON)
		$.jsonParse = JSON.parse;
	else
		$.jsonParse = function(json) {
			return (new Function('return ' + json))();
		};
	return $.jsonParse(text);
};

$.nextSibling = function(el) {	//init on first call
	if(win.document.documentElement.nextElementSibling !== undefined)
		$.nextSibling = function(el) {
			return el.nextElementSibling;
		}
	else
		$.nextSibling = function (el) {
			 var current = elem.nextSibling;

			while(current && current.nodeType != 1)
				current = current.nextSibling;
			return current;
		}
	return $.nextSibling(el);
}

$.prevSibling = function(el) {	//init on first call
	if(win.document.documentElement.previousElementSibling !== undefined)
		$.prevSibling = function(el) {
			return el.previousElementSibling;
		}
	else
		$.prevSibling = function (el) {
			 var current = elem.previousSibling;

			while(current && current.nodeType != 1)
				current = current.previousSibling;
			return current;
		}
	return $.prevSibling(el);
}

$.cAllocList = function (createFunc) {
	var list = [];

	this.pop = function () {
		if(list.length == 0)
			return createFunc();
		else
			return list.pop();
	}

	this.push = function (el) {
		list.push(el);
	}
};

var isIE = '\v'=='v';

$.$arrayFromNodeList = function (nl) {
	var arr = new $Array();
    for(var i=-1, l=nl.length; ++i!==l; arr[i]=nl[i]);
    return arr;
};

$.setCssStyle = function (el, name, value) {	//init on frist call
	if(isIE)
		$.setCssStyle = function (el, name, value) {
			name = name.replace(/\-(\w)/g, function (str, letter) {
				return letter.toUpperCase();
			});
			$.setStyle(el, name, value)
		}
	else
		$.setCssStyle = function (el, name, value) {
			name = name.replace(/\-(\w)/g, function (str, letter) {
				return letter.toUpperCase();
			});
			el.style[name] = value;
		}

	$.setCssStyle(el, name, value);
};


$.setStyle = function (el, name, value) {	//init on frist call
	if(isIE)
		$.setStyle = (function () {

			var matrixMethods = {
				x : function (m2) {
					var ret = [
						[0 ,0, 0], 
						[0, 0, 0], 
						[0, 0, 0]
					];
					for(var i=0; i<3; i++)
						for(var j=0; j<3; j++)
							for(var k=0; k<3; k++)
								ret[i][j] += this.m[i][k]*m2.m[k][j];

					this.m = ret;
					return this;
				},
				tx : function (x, y) {
					return this.m[0][0] * x + this.m[0][1] * y;
				},
				ty : function (x, y) {
					return this.m[1][0] * x + this.m[1][1] * y;	
				},
				translate : function(x, y) {
					var m2 = new cMatrix([
						[1, 0, x],
						[0, 1, y],
						[0, 0, 1]
					]);
					return this.x(m2);
				},
				translatex : function (x) {
					return this.translate(x, 0);
				},
				translatey : function (y) {
					return this.translate(0, y);
				},
				rotate : function (t) {
					var c = Math.cos(t), s = Math.sin(t);
					var m2 = new cMatrix([
						[  c, -s,  0 ],
						[  s,  c,  0 ],
						[  0,  0,  1 ]
					]);
					return this.x(m2);
				},
				scale : function (x, y) {
					var m2 = new cMatrix([
						[x, 0, 0],
						[0, y, 0],
						[0, 0, 1]
					]);
					return this.x(m2);
				},
				scalex : function (x) {
					return this.scale(x, 1);
				},
				scaley : function (y) {
					return this.scale(1, y); 
				},
				skew : function (x, y) {
					var m2 = new cMatrix([
						[1, x, 0],
						[y, 1, 0],
						[0, 0, 1]
					]);
					return this.x(m2);
				},
				skewx : function (x) {
					return this.skew(x, 0);
				},
				skewy : function (y) {
					return this.skew(0, y);
				}
			};

			var cMatrix = function (m) {
				this.m = m || [
					[1, 0, 0], 
					[0, 1, 0], 
					[0, 0, 1]
				];
			}

			cMatrix.prototype = matrixMethods;

			return function (el, name, value) {
		 		if(name == 'opacity')
					return el.style.filter = value == 1 ? '' : 'alpha(opacity=' + value*100 + ')';
				else if(name == 'transform') {
					var matrix = new cMatrix();
					value.replace(/(translateX?Y?|rotate|scaleX?Y?|skewX?Y?)\(\s*([\d\.\-]+)([\w]*)\s*,?\s*([\d\.\-]*)([\w]*)/ig, function (str, method, v1, u1, v2, u2) {
						if(u1 == 'deg')
							v1 = Math.PI * v1 / 180;
						if(u2 == 'deg')
							v2 = Math.PI *v2 / 180;
						matrix[method](v1, v2);
					});
					
					if(el.oldLeft == undefined) {
						var pel = el.parentNode;
						while(pel.currentStyle.position != 'relative' && pel.tagName.toLowerCase() != 'body')
							pel = pel.parentNode;
						var pRect = pel.getBoundingClientRect();
						var eRect = el.getBoundingClientRect();
						el.oldLeft = eRect.left - pRect.left;
						el.oldTop = eRect.top - pRect.top;
						el.style.position = 'absolute';
						el.oldCenterL = (eRect.right - eRect.left) / 2;
						el.oldCenterT = (eRect.bottom - eRect.top) / 2;
 					}
					el.style.left = (el.oldLeft + el.oldCenterL - matrix.tx(el.oldCenterL, el.oldCenterT) + matrix.m[2][0]) + 'px';
					el.style.top = (el.oldTop + el.oldCenterT - matrix.ty(el.oldCenterL, el.oldCenterT) + matrix.m[2][1]) + 'px';
					el.matrixDx = matrix.m[2][0];
					el.matrixDy = matrix.m[2][1];
					
					if(el.style.filter.indexOf('DXImageTransform.Microsoft.Matrix') != -1)
						el.style.filter =  el.currentStyle.filter.replace(/DXImageTransform.Microsoft.Matrix\s*\(\s*M11\s*=\s*[\d\.\-e]+\s*,\s*M12\s*=\s*[\d\.\-e]+\s*,\s*M21\s*=\s*[\d\.\-e]+\s*,\s*M22\s*=\s*[\d\.\-e]+/ig, function () {
							return 'DXImageTransform.Microsoft.Matrix(M11=' + matrix.m[0][0] + ', M12=' + matrix.m[0][1] + ', M21=' + matrix.m[1][0] + ', M22=' + matrix.m[1][1];
						});
					else
						el.style.filter += ' ' + 'progid:DXImageTransform.Microsoft.Matrix(M11=' + matrix.m[0][0] + ', M12=' + matrix.m[0][1] + ', M21=' + matrix.m[1][0] + ', M22=' + matrix.m[1][1] + ', SizingMethod="auto expand")';
					return;
				}
		
				el.style[name] = value;
			};
		})();
	else
		$.setStyle = function (el, name, value) {
			el.style[name] = value;
		}
	$.setStyle(el, name, value);
};

$.listen = function(msg, callback) {
	if(!(msg in app.resources.listeners))
		app.resources.listeners[msg] = {};
	if(!(cur_view.module.m_name in app.resources.listeners[msg]))
		app.resources.listeners[msg][cur_view.module.m_name] = {};

	app.resources.listeners[msg][cur_view.module.m_name][callback] = callback;
};

$.stopListen = function(msg, callback) {
	if(!(msg in app.resources.listeners) || !(cur_view.module.m_name in app.resources.listeners[msg]))
		return;

	delete app.resources.listeners[msg][cur_view.module.m_name][callback];
}

$.message = function(msg, data) {
	//temporary save curent view
	var cv = cur_view;

	if(msg in app.resources.listeners) {
		for(var m_name in app.resources.listeners[msg]) {
			try {
				var view = app.resources.modulesByName[m_name].view;
				$.use(view.name);	//switch to another view
				for(var cbf in app.resources.listeners[msg][m_name]) 
					app.resources.listeners[msg][m_name][cbf].call(view, data);
			} catch (e) {};
		}
	}

	$.use(cv);
}


$.getStylePrefix = (function () {
	var prefixes = ['webkit', 'Moz', 'ms', 'O'];
	
	var len = prefixes.length;
	$.getCssStylePrefix = function (name) {
		var jsName = name.replace(/\-(\w)/g, function (str, letter) {
			return letter.toUpperCase();
		});
		if(jsName in win.document.documentElement.style) 
			return name;
		var tname = jsName.charAt(0).toUpperCase() + name.slice(1);
		for(var i=0; i<len; i++) {
			var tmp = prefixes[i] + tname;
			if(tmp in win.document.documentElement.style) 
				return '-' + prefixes[i].toLowerCase() + '-' + name;
			
		}
		return name;
	}

	return function(name) {
		var name = name.replace(/\-(\w)/g, function (str, letter) {
			return letter.toUpperCase();
		});
		if(name in win.document.documentElement.style) 
			return name;
		var tname = name.charAt(0).toUpperCase() + name.slice(1);
		for(var i=0; i<len; i++) {
			var tmp = prefixes[i] + tname;
			if(tmp in win.document.documentElement.style)
				return tmp;
		}
		return name;
	}
})();

$.getEId = function (el) {
	var eid;
	try {
		eid = el.getAttribute('data-eid');
		if(!eid) {
			eid = app.allocId();
			el.setAttribute('data-eid', eid);
		}
	} catch (e) {
		eid = el.eid;
		if(!eid) {
			eid = app.allocId();
			el.eid = eid;
		}
	}
	return eid;
}

var colorNames = {
    aqua: '#00ffff', black: '#000000', blue: '#0000ff', fuchsia: '#ff00ff',
    gray: '#808080', green: '#008000', lime: '#00ff00', maroon: '#800000',
    navy: '#000080', olive: '#808000', purple: '#800080', red: '#ff0000',
    silver: '#c0c0c0', teal: '#008080', white: '#ffffff', yellow: '#ffff00'
}, colorArr = [];
for(var color in colorNames)
	colorArr.push(color);

$.getStyle = function (el, cssRule) {	//init on first call
	
	if (win.document.defaultView && win.document.defaultView.getComputedStyle)
		$.getStyle = function(el, cssRule) {
			cssRule = $.getCssStylePrefix(cssRule);
			return win.document.defaultView.getComputedStyle(el, "").getPropertyValue(cssRule) || '';

		};
	else
		$.getStyle = (function () {
			var autoMarginFix = {
				marginLeft : ['left', -1], 
				marginRight : ['right', 1], 
				marginTop : ['top', -1], 
				marginBottom : ['bottom', 1]
			};
			return function(el, cssRule) {
				if(isIE) {
					if(cssRule == 'opacity') {
						var filter = el.currentStyle['filter'];
					    return filter && filter.indexOf('opacity=') >= 0 ? (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) : 1;
					} else if(cssRule == 'transform') {
						if(el.style.filter.indexOf('DXImageTransform.Microsoft.Matrix') == -1)
							return 'matrix(1, 0, 0, 1, 0, 0)';
						else {
							var matches = /DXImageTransform.Microsoft.Matrix\s*\(\s*M11\s*=\s*([\d\.\-e]+)\s*,\s*M12\s*=\s*([\d\.\-e]+)\s*,\s*M21\s*=\s*([\d\.\-e]+)\s*,\s*M22\s*=\s*([\d\.\-e]+)/i.exec(el.currentStyle.filter);
								return 'matrix('+ matches[1] + ', ' + matches[2] + ', ' + matches[3] + ', ' + matches[4] + ', ' + el.matrixDx + ', ' + el.matrixDy + ')';
						}
					}
				}
				var jsRule = cssRule.replace(/\-(\w)/g, function (str, letter) {
					return letter.toUpperCase();
				});

				var val = el.currentStyle[jsRule];
				if(!val) {
					if(jsRule.indexOf('color') != -1)
						val = 'rgb(255, 255, 255)';
					else
						val = '0';
				} else if(val == 'auto') {
					if(jsRule in autoMarginFix) {
						var pRect = el.parentNode.getBoundingClientRect();
						var eRect = el.getBoundingClientRect();
						val = (pRect[autoMarginFix[jsRule][0]] - eRect[autoMarginFix[jsRule][0]]) * autoMarginFix[jsRule][1];
					}
					else if(jsRule == 'width') {
						var eRect = el.getBoundingClientRect();
						val = eRect.right - eRect.left;
					}
					else if(jsRule == 'height') {
						var eRect = el.getBoundingClientRect();
						val = eRect.bottom - eRect.top;
					}
					else
						val = '0';
				}
				else if(jsRule.indexOf('color') != -1 && colorArr.indexOf(val) >=0 )
					val = colorNames[val];

				return val;
			};
		})();

	return $.getStyle(el, cssRule);
};



//document ready implementation
(function() {
	var readyArray = [], documentReady = false, blockReady = false;

	$.ready = function (callback) {
		if(documentReady)
			callback();
		else
			readyArray.push(callback);
	};

	function startReady()
	{
		documentReady = true;
		var callback;
		while(!blockReady && (callback = readyArray.shift()))
			callback();
	};

	// check if DOM loaded
	try {
		win.document.addEventListener("DOMContentLoaded", startReady, false);
	} catch (e) {
		
		if(win.document.documentElement.doScroll && win == win.top) {
			function tryScroll() {
				if (!win.document.body)return;
				try {
					win.document.documentElement.doScroll("left");
					startReady();
				} catch (e){
					setTimeout(tryScroll, 0);
				}
			};
			tryScroll();
		};

		win.document.attachEvent("onreadystatechange", function() {
			if (win.document.readyState === "complete")
				startReady();
		});
	};

	try {
		win.addEventListener('load', startReady, false);
	} catch (e) {
		
		win.attachEvent('onload', startReady);
	};

	$.ready(function() {
		//get Array from iframe and change its prototype
		
		var iframe = win.document.createElement('iframe');
		iframe.style.cssText = 'display:none;position:absolute;left:-10000px;';
		win.document.body.appendChild(iframe);
		$Array = $.frameWin(iframe).Array;
		
		if(!$Array) {
			blockReady = true;
			
			iframe.onload = function () {

				init$Array();
				blockReady = false;
				startReady();
			}
			$.frameDoc(iframe).write('<script>parent.$Array = Array;setTimeout(function(){document.close();}, 0);<\/script>');
		} else
			init$Array();
		
		function init$Array () {
			iframe.parentNode.removeChild(iframe);

			if(!$Array)
				$Array = win.$Array;

			//use prototype method to prevent function construction each time
			$Array.prototype.select = function(selector) {

				var ret = new $Array();
				for(var i=0, len = this.length; i<len; i++)
					ret.add($.$arrayFromNodeList(this[i].querySelectorAll(selector)));
				
				return ret;
			}

			var events = ('blur focus load resize scroll unload click dblclick ' +
			'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
			'change submit keydown keypress keyup error contextmenu').split(' ');
			for(var i=0, len=events.length; i<len; i++)
				(function() {
					var event = events[i];
					$Array.prototype[event] = function(callback) {
						
						for(var i=0, len = this.length; i<len; i++)
							cur_view.addEvent(this[i], event, callback);
					}
				})();

			$Array.prototype.bind = function(event, callback) {
				
				for(var i=0, len = this.length; i<len; i++)
					cur_view.addEvent(this[i], event, callback);

				return this;
			}

			$Array.prototype.unbind = function(event, callback) {
				
				for(var i=0, len = this.length; i<len; i++)
					cur_view.removeEvent(this[i], event, callback);
				return this;
			}

			$Array.prototype.css = function (cssRule, value) {
				if(value === undefined && typeof cssRule === 'string')	//then get style
					return this.length > 0 ? $.getStyle(this[0], cssRule) : '';
				if(typeof cssRule === 'string') {
					var tmp = {};
					tmp[cssRule] = value;
					cssRule = tmp;
				}
				
				for(var rule in cssRule) {
					var jsRule = $.getStylePrefix(rule);

					for(var i=0, len = this.length; i<len; i++)
						$.setStyle(this[i], jsRule, cssRule[rule]);
				}
				
				return this;
			}


			$Array.prototype.closest = function(selector) {
				
				if(this.length == 0) return this;
				var el = $.getEId(this[0]);
				
				var parent = typeof selector == 'object' ? (className in selector ? selector : selector[0]) : false; 
				if(parent && selector.querySelector('[data-eid="' + eid + '"]'))
					return [parent];
				
				parent = cur_view.module.ph.querySelector(selector);
				if(!parent || parent.querySelector('[data-eid="' + eid + '"]'))
					return new $Array();

				return new $Array().push(parent);
			}

			$Array.prototype.hasClass = function(className) {	//init on first call
				if(document.documentElement.classList)
					$Array.prototype.hasClass = function(className) {
						return this.length > 0 && this[0].classList.contains(className)
					};
				else
					$Array.prototype.hasClass = function(className) {
						return this.length > 0 && (new RegExp('(\\s|^)' + className + '(\\s|$)')).test(this[0].className)
					};
				return this.hasClass(className);
			}

			$Array.prototype.addClass = function(className) {	//init on first call
				if(document.documentElement.classList)
					$Array.prototype.addClass = function(className) {
						for(var i=0, len = this.length; i<len; i++)
							this[i].classList.add(className);
						return this;
					}
				else
					$Array.prototype.addClass = function(className) {
						for(var i=0, len = this.length; i<len; i++)
							if(!(new RegExp('(\\s|^)' + className + '(\\s|$)')).test(this[i].className))
								this[i].className += ' ' + className;
						return this;
					};
				return this.addClass(className);
			}
				 
			$Array.prototype.removeClass = function(className) {	//init on first call
				if(document.documentElement.classList)
					$Array.prototype.removeClass = function(className) {
						for(var i=0, len = this.length; i<len; i++)
							this[i].classList.remove(className);
						return this;
					}
				else
					$Array.prototype.removeClass = function(className) {
						for(var i=0, len = this.length; i<len; i++)
							this[i].className = this[i].className.replace((new RegExp('(\\s|^)' + className + '(\\s|$)')), ' ');
						return this;
					}
				return this.removeClass(className);
			}

			$Array.prototype.toggleClass = function(className) {	//init on first cal
																	//use inline(dublicate code) to prevent functions encapsulations
				if(document.documentElement.classList)
					$Array.prototype.toggleClass = function(className) {
						for(var i=0, len = this.length; i<len; i++) {
							if(this[i].classList.contains(className))
								this[i].classList.remove(className);
							else
								this[i].classList.add(className);
						}
						return this;
					}
				else
					$Array.prototype.toggleClass = function(className) {
						for(var i=0, len = this.length; i<len; i++) {
							if((new RegExp('(\\s|^)' + className + '(\\s|$)')).test(this[i]))
								this[i].className = this[i].className.replace((new RegExp('(\\s|^)' + className + '(\\s|$)')), ' ');
							else
								this[i].className += ' ' + className;
						}
						return this;
					}
				return this.toggleClass(className);
			}

			$Array.prototype.each = function(callback) {
				
				for(var i=0, len = this.length; i<len; i++)
					callback.call(this[i], i, len);
				return this;
			}

			$Array.prototype.append = function(content) {
				if(typeof content == 'string') {
					for(var i=0, len=this.length; i<len; i++)
						this[i].innerHTML += content;
				} else {
					for(var i=0, len=this.length; i<len; i++)
						this[i].appendChild(content);
				}
				return this;
			}

			$Array.prototype.trigger = function(event) {
				for(var i=0, len=this.length; i<len; i++) {
					var eid = $.getEId(this[i]);
					if(!(eid in cur_view.eventsByElId))
						continue;
					for(var strFunc in cur_view.eventsByElId[eid])
						if(event in cur_view.eventsByElId[eid][strFunc].events)
							cur_view.eventsByElId[eid][strFunc].func.call(this[i]);
				}
				return this;
			}

			$Array.prototype.children = function() {
				var ret =  new $Array(), k = 0;
				for(var i=0, len=this.length; i<len; i++) {
					var childNodes = this[i].childNodes;
					for(var j=0, len2=childNodes.length; j<len2; j++)
						if(childNodes[j].nodeType == 1)
							ret[k++] = childNodes[j];
				}
				return ret;
			}

			$Array.prototype.parent = function() {
				
				for(var i=0, len=this.length; i<len; i++)
					this[i] = this[i].parentNode;
					
				return this;
			}

			$Array.prototype.remove = function () {
				for(var i=0, len=this.length; i<len; i++)
					this[i].parentNode.removeChild(this[i]);
			}

			$Array.prototype.html = function (content) {
				if(content === undefined) {
					try {
						return this[0].innerHTML;
					} catch (e) {
						return '';
					}
				} else {
					for(var i=0, len=this.length; i<len; i++)
						this[i].innerHTML = content;
					return this;
				}
			}


			$Array.prototype.attr = function(name, val) {
				
				if(val == undefined) {
					try {
						return this[0].getAttribute(name);
					} catch (e) {
						try {
							return this[0][name];
						} catch (e) {};
					}
				} else {
					for(var i=0, len=this.length; i<len; i++) {
						try {
							this[i].setAttribute(name, val);
						} catch (e) {
							this[i][name] = val;
						}
					}
					return this;
				}
			}

			$Array.prototype.next = function () {
				var ret = new $Array(), k = 0;
				for(var i=0, len=this.length; i<len; i++) {
					var next = $.nextSibling(this[i]);
					if(next)
						ret[k++] = next;
				}
				return ret;
			}

			$Array.prototype.prev = function () {
				var ret = new $Array(), k = 0;
				for(var i=0, len=this.length; i<len; i++) {
					var next = $.prevSibling(this[i]);
					if(next)
						ret[k++] = next;
				}
				return ret;
			}

			$Array.prototype.hide = function () {
				for(var i=0, len=this.length; i<len; i++) {
					var d = $.getStyle(this[i], 'display');
					this[i].olddisplay = (d != 'none') ? d : '';
					this[i].style.display = 'none';
				}
				return this;
			}

			$Array.prototype.show = function () {
				for(var i=0, len=this.length; i<len; i++)					
					this[i].style.display = this[i].olddisplay || '';
				return this;
			}

			$Array.prototype.val = function (value) {
				if(value === undefined) {
					try {
						return this[0].value;
					} catch (e) {
						return '';
					}
				} else {
					for(var i=0, len=this.length; i<len; i++)
						this[i].value = value;
					return this;
				}
			}

			$Array.prototype.trim = function () {
				for(var i=0, len=this.length; i<len; i++)
					if(this[i].value)
						this[i].value = this[i].value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
					return this;
			}

			$Array.prototype.parseHTML = (function () {
				var div = win.document.createElement('div');
				return function (html) {
				
					div.innerHTML = html;
					var ret = $.$arrayFromNodeList(div).children();
					div.innerHTML = '';
					return ret;
				};
			})();

			$Array.prototype.add = function(arr2) {
				for(var i=this.length, j=0, len = arr2.length; j<len; this[i++] = arr2[j++]);
				return this;
			}

			$Array.prototype.animate = (function() {
				var anArr = {}, iId, 
					simpleArr = {}, 
					an_int = 1000 / app.config.animation_fps,
					anIdSeeder = 0,
					valRegExp = new RegExp('([\\d\\.\\-]+|[#\\da-f]{3,6}|' + colorArr.join('|') + ')([\\w]*)', 'ig'),
					hexRegExp = /#([\da-f]{1,2})([\da-f]{1,2})([\da-f]{1,2})/i;

				$Array.prototype.stop = function (anId) {
					delete 	anArr[anId];
					delete simpleArr[anId];		
				};

				
				function goAnimation () {
					var	cur_time = new Date().getTime(), anArrLength = 0, simpleAnArrLength = 0;

					for(var i in anArr) {
						var anOb = anArr[i],
							progress = Math.min((cur_time - anOb.started)/anOb.t, 1);

						//scale progress to make accelerate effect
						progress = (Math.cos(Math.PI*(progress + 1)) + 1) / 2;
						
						for(var j=0, len2 = anOb.els.length; j<len2; j++) {
							for(var rule in anOb.cssRules) {
								var k = 0;
								var val = anOb.cssRules[rule].str.replace(/[%]+/ig, function() {
									var ret = (anOb.startVals[j][rule][k] + (anOb.cssRules[rule].states[k].val - anOb.startVals[j][rule][k])*progress) + anOb.cssRules[rule].states[k++].unit;
									if(rule != 'transform')
										Math.floor(ret);
									return ret;
								});
								
								$.setStyle(anOb.els[j], rule, val);
							}
							if(progress == 1 && anOb.callback)
								anOb.callback.call(anOb.els[j]);
						}
						if(progress == 1)
							delete anArr[i];
						anArrLength++;
					}
					
					
					for(var i in simpleArr) {
						var anOb = simpleArr[i],
							progress = Math.min((cur_time - anOb.started)/anOb.t, 1);

						//scale progress to make accelerate effect
						progress = (Math.cos(Math.PI*(progress + 1)) + 1) / 2;
						
						for(var j=0, len2 = anOb.els.length; j<len2; j++) {
							for(var rule in anOb.cssRules) {
								var val = Math.floor(anOb.startVals[j][rule][0] + (anOb.cssRules[rule].states[0].val - anOb.startVals[j][rule][0])*progress) + anOb.cssRules[rule].states[0].unit;
								$.setStyle(anOb.els[j], rule, val);
							}
							if(progress == 1 && anOb.callback)
								anOb.callback.call(anOb.els[j]);
						}
						if(progress == 1)
							delete simpleArr[i];
						simpleAnArrLength++;
					}
					
					clearInterval(iId);
					iId = undefined;
					if(anArrLength > 0 || simpleAnArrLength > 0)
						iId = setInterval(goAnimation, an_int);
				}

				var getVarsByTranslateMethod = {
					
					rotate : function (m) {
						var c = Math.acos(m[0]);
						if(m[0] > 0 && m[1] < 0)
							c += Math.PI * 3 / 2;
						else if(m[0] < 0 && m[1] < 0)
							c = Math.PI * 2 - c;
						return [c];
					},

					translate : function (m) {
						
						return [m[4], m[5]];
					},

					translatex : function (m) {
						
						return [m[4]];
					},

					translatey : function (m) {
						return [m[5]];
					},

					scale : function (m) {
						return [m[0], m[3]];
					},

					scalex : function (m) {
						return [m[0]];
					},

					scaley : function (m) {
						return [m[3]]; 
					},

					skew : function (m) {
						
						return [m[2], m[1]];
					},

					skewx : function (m) {
						return [m[2]];
					},

					skewy : function (m) {
						return [m[1]];
					}
				};
				
				return function(cssRules, time, callback) {

					if(this.length == 0) return;
					var anId = anIdSeeder++;
					var anOb = {
						id : anId,
						started : new Date().getTime(),
						t : time,
						cssRules : {},
						els : this,
						callback : callback,
						startVals : []
					},
					simpAnOb = {
						id : anId,
						started : new Date().getTime(),
						t : time,
						cssRules : {},
						els : this,
						callback : callback,
						startVals : []
					}, ob;

					for(var i=0, len=this.length; i<len; i++) {
						anOb.startVals[i] = {};
						simpAnOb.startVals[i] = {};
					}

					for(var rule in cssRules) {
						var states = [];
						var jsRule = rule.replace(/\-(\w)/g, function (str, letter) {	//convert to camelCase rule
							return letter.toUpperCase();
						});
						jsRule = $.getStylePrefix(jsRule);
						if(jsRule != rule) {
							cssRules[jsRule] = cssRules[rule];
							delete cssRules[rule];
						}


						var str = cssRules[jsRule].replace(valRegExp, function(str, val, unit) {
							unit = unit || (/z-?index|font-?weight|opacity|zoom|line-?height|color|transform/i.test(rule) ? '' : 'px');
							
							if(colorArr.indexOf(val) != -1)
								val = colorNames[val];

							if(unit == 'deg') {
								unit = '';
								val *= Math.PI / 180;
							}
							else if(val.charAt(0) == '#') {	//check if color in hex, then convert to rgb
								var matches = hexRegExp.exec(val);
								for(var i=1, len=matches.length, shrt = matches[1].length == 1; i<len; i++)
									states.push({
										val : parseInt(shrt ? matches[i] + matches[i] : matches[i], 16),
										unit : unit
									});
								return 'rgb(%, %, %)';
							}
							//else
							states.push({
								val : parseFloat(val),
								unit : unit
							});
							return '%';
						});
						cssRules[jsRule] = {
							states : states,
							str : str
						};
						
						if(states.length > 1) {
							anOb.cssRules[jsRule] = cssRules[jsRule];
							ob = anOb;
						}
						else {
							simpAnOb.cssRules[jsRule] = cssRules[jsRule];
							ob = simpAnOb;
							ob.simple = true;
						}

						for(var i=0, len=this.length; i<len; i++) {	
							
							ob.startVals[i][jsRule] = [];
							var elStyle = $.getStyle(this[i], rule);
							if(rule == 'transform') {
								if(elStyle == 'none')
									elStyle = 'matrix(1, 0, 0, 1, 0, 0)';
								var matrix = elStyle.replace(/matrix|\(|\)|\s/ig, '').split(',');


								cssRules[jsRule].str.replace(/(translateX?Y?|rotate|scaleX?Y?|skewX?Y?)/ig, function(str, method) {
									var vals = getVarsByTranslateMethod[method.toLowerCase()](matrix);
									for(var j=0; j<vals.length; j++) {
										if(method.indexOf('translate') != -1)
											cssRules[jsRule].states[ob.startVals[i][jsRule].length].unit = 'px';
										else
											cssRules[jsRule].states[ob.startVals[i][jsRule].length].unit = 'rad';
										ob.startVals[i][jsRule].push(parseFloat(vals[j]));
									}
								})
							}
							else	
								elStyle.replace(valRegExp, function(str, val, unit) {
									if(colorArr.indexOf(val) != -1)
										val = colorNames[val];
								 	if(val.charAt(0) == '#') {	//check if color in hex, then convert to rgb
								 		var matches = hexRegExp.exec(val);
										for(var j=1, len=matches.length, shrt = matches[1].length == 1; j<len; j++)
											ob.startVals[i][jsRule].push(parseInt(shrt ? matches[j] + matches[j] : matches[j], 16));
									}
									else
										ob.startVals[i][jsRule].push(parseFloat(val));
							});
							for(var j=ob.startVals[i][jsRule].length; j<ob.cssRules[jsRule].states.length; j++)
								ob.startVals[i][jsRule].push(0);
						}
					}

					if(ob.simple)
						simpleArr[anId] = ob;
					else
						anArr[anId] = ob;
						
					if(!iId)
						iId = setInterval(goAnimation, an_int);

					return anId;
				};
			})();
		}
	});
})();



