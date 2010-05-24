function JSCommons() {
	this.IE = document.all ? true : false;
	this.MouseX = _JSCommons_MouseX;
	this.MouseY = _JSCommons_MouseY;
	this.SrcElement = _JSCommons_SrcElement;
	this.Parent = _JSCommons_Parent;
	this.RunOnLoad = _JSCommons_RunOnLoad;
	this.FindParent = _JSCommons_FindParent;
	this.FindChild = _JSCommons_FindChild;
	this.FindSibling = _JSCommons_FindSibling;
	this.FindParentTag = _JSCommons_FindParentTag;
	this.AddEventHandler = _JSCommons_AddEventHandler;
	this.RemoveEventHandler = _JSCommons_RemoveEventHandler;
	this.CreateCookie = _JSCommons_CreateCookie;
	this.ReadCookie = _JSCommons_ReadCookie;
	this.EraseCookie = _JSCommons_EraseCookie;
    this.NavigatorType = _JSCommons_NavigatorType;
	this.AddStyleClass = _JSCommons_AddStyleClass;
	this.RemoveStyleClass = _JSCommons_RemoveStyleClass;
	this.CheckClassName = _JSCommons_CheckClassName;
    this.MSIE=0;
    this.FF=1;
    this.OPERA=2;
    this.NETSCAPE=3;
    this.SAFARI=4;
    this.KONQ=5;    
}

function _JSCommons_MouseX(e) {
	return this.IE ? event.clientX : e.clientX;
}

function _JSCommons_MouseY(e) {
	return this.IE ? event.clientY : e.clientY;
}

/**
 * @return the source element where the event was risen
 */
function _JSCommons_SrcElement(e) {
	return this.IE ? event.srcElement : e.target;
}

/**
 * @return the parent node of the provided one
 */
function _JSCommons_Parent(node) {
	return this.IE ? node.parentElement : node.parentNode;
}

function _JSCommons_RunOnLoad(func) {
	var prev = (window.onload) ? window.onload : function() {
	};
	window.onload = function() {
		prev();
		func();
	};
}

function _JSCommons_FindParent(node, attrib, value) {
	var Root = document.getElementsByTagName('BODY')[0];
	node = node.parentNode;
	while (node != Root && node.getAttribute(attrib) != value) {
		node = node.parentNode;
	}
	if (node.getAttribute(attrib) == value) {
		return node;
	} else {
		return null;
	}
}

function _JSCommons_FindParentTag(node, tName) {
	var root = document.getElementsByTagName('BODY')[0];
	tName = tName.toLowerCase();
	node = node.parentNode;
	while (node != root && node.tagName.toLowerCase() != tName) {
		node = node.parentNode;
	}
	if (node.tagName.toLowerCase() == tName) {
		return node;
	} else {
		return null;
	}
}

function _JSCommons_FindChild(node, attrib, value) {
	if (node.getAttribute) {
		if (node.getAttribute(attrib) == value) {
			return node;
		}
	}

	var i = 0;
	var ret = null;
	for (i = 0; i < node.childNodes.length; i++) {
		// missing function ?!
		ret = FindChildByAttrib(node.childNodes[i]);
		if (ret) {
			return ret;
		}
	}
	return null;
}

function _JSCommons_FindSibling(node, attrib, value) {
	var nodes = node.parentNode.childNodes;
	var i = 0;
	for (i = 0; i < nodes.length; i++) {
		if (nodes[i].getAttribute) {
			if (nodes[i].getAttribute(attrib) == value) {
				return nodes[i];
			}
		}
	}
	return null;
}

function _JSCommons_AddEventHandler(obj, evt, fn) {
	if (obj.addEventListener) {
		obj.addEventListener(evt, fn, false);
	} else if (obj.attachEvent) {
		obj.attachEvent('on' + evt,fn);
	}
	return null;
}

function _JSCommons_RemoveEventHandler(obj, evt, fn) {
	if (obj.removeEventListener) {
		obj.removeEventListener(evt, fn, false);
	} else if (obj.detachEvent) {
		obj.detachEvent('on' + evt,fn);
	}
	return null;
}

function _JSCommons_AddStyleClass(el, stClass) {
	el.className = el.className + ' ' + stClass;
}

function _JSCommons_RemoveStyleClass(el, stClass) {
    var rep = el.className.match(' ' + stClass) ? ' ' + stClass : stClass;
    el.className = el.className.replace(rep, '');
}

function _JSCommons_CheckClassName(el, stClass) {
	return new RegExp('\\b' + stClass + '\\b').test(el.className)
}

/**
 * Creates a cookie on clients machine.
 * 
 * @param name
 *            The name for the cookie.
 * @param value
 *            Value that should be set in the cookie.
 * @param days
 *            Number of days for the cookie to be kept by the navigator.
 */
function _JSCommons_CreateCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = '; expires=' + date.toGMTString();
	}
	else var expires = '';
	document.cookie = name + '=' + value+expires + '; path=/';
}

/**
 * Reads the content of a cookie with given name.
 * 
 * @return The text content of the cookie.
 */
function _JSCommons_ReadCookie(name) {
	var nameEQ = name + '=';
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) == 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}

/**
 * Removes a cookie with given name setting its remaining time to live -1.
 */
function _JSCommons_EraseCookie(name) {
	createCookie(name, '', -1);
}

/**
 * Checks the navigator type.
 * 
 * @return The type of the navigator (MSIE=0, FF=1, OPERA=2, NETSCAPE=3,
 *         SAFARI=4, KONQ=5 or 'OTHER')
 */
function _JSCommons_NavigatorType() {
    var userAgent=navigator.userAgent.toLowerCase();
    if(userAgent.indexOf("msie")>=0||userAgent.indexOf("explorer")>=0)
        return this.MSIE;
    if(userAgent.indexOf("firefox")>=0||userAgent.indexOf("iceweasel")>=0)
        return this.FF;
    if(userAgent.indexOf("opera")>=0)
        return this.OPERA;
    if(userAgent.indexOf("netscape")>=0)
        return this.NETSCAPE;
    if(userAgent.indexOf("safari")>=0)
        return this.SAFARI;
    if(userAgent.indexOf("konqueror")>=0)
        return this.KONQ;
    return"OTHER";
}

var JSCommons = new JSCommons();