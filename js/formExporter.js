(function($){
	var foxContainer;
	var pickedList = [];
	var config = {
		FOX_ROOT : null,
		FOX_ROOT_ID : ''
	}
	
	var defaults = {
		foxComponent : {
			TOOLBAR 			: { tagType : '<div />', cid : 'options', cssClass : 'options'},
			OPT_FIND_FORMS 		: { tagType : '<span />', cid : 'findForms', cssClass : 'optLink', txt : 'Find forms', evt : 'click.fox', handler : function(){findFormsInPage();}},
			OPT_REFRESH 		: { tagType : '<span />', cid : 'refresh', cssClass : 'optLink hidden', txt : 'Refresh', evt : 'click.fox', handler : function(){refreshOutput();}},
			OPT_SHOW_INFO 		: { tagType : '<span />', cid : 'showInfo', cssClass : 'optLink', txt : 'Show info', evt : 'click.fox', handler : function(){showInfo();}},
			OPT_PICK_FIELDS 	: { tagType : '<span />', cid : 'pickFields', cssClass : 'optLink', txt : 'Pick fields', evt : 'click.fox', handler : function(){pickFields();}},
			OPT_GET_ACTIONSET	: { tagType : '<span />', cid : 'getActionSet', cssClass : 'optLink hidden', txt : 'Get actionset', evt : 'click.fox', handler : function(){getActionSet();}},
			PICK_TABLE			: { tagType : '<table />', cid : 'pickTable', cssClass : 'hidden', txt : ''},
			PICK_TABLE_TH1		: { tagType : '<th />', cid : '', cssClass : '', txt : 'tagName:locator'},
			PICK_TABLE_TH2		: { tagType : '<th />', cid : '', cssClass : 'removeOptColumn', txt : 'remove'},
			PICK_TABLE_TH3		: { tagType : '<th />', cid : '', cssClass : 'orderOptColumn', txt : ''}
		},
		foxConstants : {
			BUTTON_REFRESH 			: 'refresh',
			CSS_HIDDEN 				: 'hidden',
			CSS_FORMS_TABLE 		: 'frmsTbl',
			CSS_HIGHLIGHT	 		: 'highlight',
			CSS_XML_OUTPUT_WRAPPER 	: 'outputShow',
			EXPORTER_ROOT_ID 		: 'foxPanel',
			FORMS_TABLE_ID 			: 'foundFormsTable',
			XML_OUTPUT_WRAPPER_ID 	: 'outField',
			XML_OUTPUT_FIELD_ID 	: 'xmlOutput',
			PICK_TABLE_ID 			: '#pickTable',
			GET_ACTION_SET_ID		: '#getActionSet',
			NEW_LINE 				: '\n',
			TAB 					: '\t',
			D_TAB 					: '\t\t',
			NAME_PREFIX 			: 'name=',
			PREVIEW_CSS_CLASS 		: ' .preview'
		},
		tag : {
			SELECT_MANY	: 'select-many',
			CLICK 		: 'click',
			CHECK 		: 'check',
			SET 		: 'set',
			GET 		: 'get',
			ACTION_SET 	: 'action-set',
			XML_PROLOG 	: 'xml',
			DATA 		: 'data',
			ENTRY 		: 'entry'
		}		
	};
	
	var state = {
		isStarted_showInfo 		: false,
		isStarted_pickFields	: false,
		isVisible_output		: false
	};
	
	$.fn.foxRun = function(options) {
		config = $.extend(defaults, options || {});
		config.FOX_ROOT_ID = config.FOX_ROOT.attr('id');
		foxContainer = config.FOX_ROOT;
		createInterface();
		//$(document).bind('keyup.fox', stopPlugin);
		return this;
	};
	
	 // ----------------------------------------------
	 // 			Private functions.
	 // ----------------------------------------------
	 
	function showInfo() {
		if(state.isStarted_pickFields) {
			stopPlugin();
		}
		if (!state.isStarted_pickFields) {
			//var container = $('body');
			var container = $('.container');
			container.bind('mouseover.fox', highlightSource);
			container.bind('mouseout.fox', unHighlightSource);
			$(document).bind('keyup.fox', stopPlugin);
			state.isStarted_showInfo = true;
		}
	}
	
	function pickFields() {		
		if (!state.isStarted_pickFields) {
			var container = $('.container');
			container.bind('mouseover.fox', highlightSource);
			container.bind('mouseout.fox', unHighlightSource);
			$(document).bind('keyup.fox', stopPlugin);
			container.bind('click.fox', pickHandler);
			createPickTable();
			$(config.foxConstants.PICK_TABLE_ID).bind('click.fox', removeFromBucket);			
			state.isStarted_pickFields = true;
		}
	}
	
	function pickHandler(evt) {
		var source = $.getTarget(evt);
		var picked = '<tr><td>';
		picked += source.tagName + ':';
		picked += getLocator(source, null, false);
		picked += '</td>';
		picked += '<td><input type="checkbox"></td>';
		picked += '<td><div class="moveUp"></div><div class="moveDown"></div></td></tr>';
		$('#pickTable > tbody:last').append(picked);
		$('#pickTable .moveUp').bind('click.fox', moveUpHandler);
		$('#pickTable .moveDown').bind('click.fox', moveDownHandler);
		pickedList.push(source);
		if(pickedList.length > 0) {
			$(config.foxConstants.PICK_TABLE_ID).removeClass(config.foxConstants.CSS_HIDDEN);
			$(config.foxConstants.GET_ACTION_SET_ID).removeClass(config.foxConstants.CSS_HIDDEN);
			$('#'+config.foxConstants.XML_OUTPUT_WRAPPER_ID).removeClass(config.foxConstants.CSS_HIDDEN);
		}		
		return false;
	}	
	
	function moveUpHandler(evt) {
		var $currRow = $(evt.target).parent().parent();
		var ind = $currRow.get(0).sectionRowIndex - 1;
		if(ind > 0) {
			$currRow.prev().before($currRow);
			pickedList.move(ind, -1);
		}
	}
	
	function moveDownHandler(evt) {
		var $currRow = $(evt.target).parent().parent();
		var ind = $currRow.get(0).sectionRowIndex - 1;
		if(ind < $currRow.parent().children().length - 2) {
			$currRow.next().after($currRow);
			pickedList.move(ind, 1);
		}		
	}
	
	function getLocator(currentElement, shouldLog) {
		var locator;
		if (currentElement.id) {
			locator = currentElement.id;
		} else if (currentElement.name) {
			locator = currentElement.name;
		} else {
			locator = '';
			if (shouldLog && missingLocatorsList) {
				missingLocatorsList.push($(currentElement).text());
			}			
		}	
		return locator;
	}	
	
	function stopPlugin(evt) {
		var kc = evt.keyCode;
		if (kc == 27) {
			if (state.isStarted_showInfo || state.isStarted_pickFields) {
				//var container = $('body');	
				var container = $('.container');
				container.unbind('mouseover.fox', highlightSource);
				container.unbind('mouseout.fox', unHighlightSource);
				container.unbind('click.fox', pickHandler);
				$(document).unbind('keyup.fox', stopPlugin);
				$(config.foxConstants.PICK_TABLE_ID).unbind('click.fox', removeFromBucket);	
				$('#'+config.foxConstants.XML_OUTPUT_WRAPPER_ID).addClass(config.foxConstants.CSS_HIDDEN);
				$(config.foxConstants.GET_ACTION_SET_ID).addClass(config.foxConstants.CSS_HIDDEN);					
				pickedList.length = 0;
				cleanDOM();
				state.isStarted_pickFields = false;
				state.isStarted_showInfo = false;
				UnTip(config.currentElement);
				$(config.currentElement).removeClass(config.foxConstants.CSS_HIGHLIGHT);
			}
		}
	}
	
	function cleanDOM() {
		$(config.foxConstants.FORMS_TABLE_ID).remove();
		$('#'+config.foxConstants.XML_OUTPUT_WRAPPER_ID).remove();
		$(config.foxConstants.PICK_TABLE_ID).remove();
		state.isVisible_output = false;
	}
	
	function highlightSource(evt) {
		config.currentElement = $.getTarget(evt);
		$(config.currentElement).addClass(config.foxConstants.CSS_HIGHLIGHT);
		show_tip_text(createTooltipContent(config.currentElement, getLocators(config.currentElement), getCssClasses(config.currentElement)));
	}
	
	function unHighlightSource(evt) {
		config.currentElement = $.getTarget(evt);
		$(config.currentElement).removeClass(config.foxConstants.CSS_HIGHLIGHT);
		UnTip(config.currentElement);
		config.currentElement = null;
	}
	
	function removeFromBucket(evt) {
		var $source = $(evt.target);
		if ($source.is('input')) {
			var $currRow = $source.parent().parent();
			$currRow.remove();
			pickedList.remove($currRow.get(0).sectionRowIndex);
		}
		if(pickedList.length == 0) {
			$(config.foxConstants.PICK_TABLE_ID).addClass(config.foxConstants.CSS_HIDDEN);
			$(config.foxConstants.GET_ACTION_SET_ID).addClass(config.foxConstants.CSS_HIDDEN);
			$('#'+config.foxConstants.XML_OUTPUT_WRAPPER_ID).addClass(config.foxConstants.CSS_HIDDEN).text('');
		}
		writeXML(pickedList);
	}	
	
	function print(list) {
		var str;
		for(var i = 0; i < list.length; i++) {
			console.log(i + ' : ' + list[i].id);
		}
	}
	
	function createTooltipContent(el, locators, classes) {
		var content = '<span style="color:red">tag name:</span>';
		content += '<span style="color:green">' + el.tagName + '</span><br />';
		if (locators.length != 0) {
			content += '<span style="color:red">locators:</span><br />';
			content += (locators.locatorId) ? ('<span style="color:blue;">id=</span><span style="color:green;">' + locators.locatorId + '</span><br />') : ('');
			content += (locators.locatorName) ? ('<span style="color:blue;">name=</span><span style="color:green">' + locators.locatorName + '</span><br />') : ('');
			content += '<span style="color:blue;">xpath=</span><span style="color:green">' + locators.locatorXpath + '</span><br />';
		}
		if (classes.length != 0) {
			content += '<span style="color:blue;">css classes:</span><span style="color:green">' + classes + '</span><br />';
		}
		return content;
	}
	
	function getLocators(el) {
		var locators = {
			locatorId : el.id,
			locatorName : el.name,
			locatorXpath : 'xpath test'
		};
		return locators;
	}
	
	function getCssClasses(el) {
		var clName = el.className;
		return clName.replace(' ' + config.foxConstants.CSS_HIGHLIGHT, '');;
	}	

	function refreshOutput() {
		alert('refreshOutput');
	}	

	function getActionSet() {
		var container = $('.container');
		container.unbind('fox.mouseover', highlightSource);
		container.unbind('fox.mouseout', unHighlightSource);
		container.unbind('fox.mouseover', pickHandler);
		//$(config.foxConstants.PICK_TABLE_ID).addClass(config.foxConstants.CSS_HIDDEN);
		if(!state.isVisible_output) {
			createOutputArea();
		} else {
			$('#' + config.foxConstants.XML_OUTPUT_FIELD_ID).text('');
		}
		writeXML(pickedList);
		return false;
	}	
	
	function findFormsInPage() {
		alert('findFormsInPage');
	}	
	
	function createInterface() {
		var toolbar = elementProvider(config.foxComponent.TOOLBAR);
		$(toolbar).append(elementProvider(config.foxComponent.OPT_FIND_FORMS));
		$(toolbar).append(elementProvider(config.foxComponent.OPT_REFRESH));
		$(toolbar).append(elementProvider(config.foxComponent.OPT_SHOW_INFO));
		$(toolbar).append(elementProvider(config.foxComponent.OPT_PICK_FIELDS));
		$(toolbar).append(elementProvider(config.foxComponent.OPT_GET_ACTIONSET));
		foxContainer.append(toolbar);
	}
	
	function createPickTable() {
		var pickTable = elementProvider(config.foxComponent.PICK_TABLE);
		var pickTableHeader = $('<tr/>');
		$(pickTableHeader).append(elementProvider(config.foxComponent.PICK_TABLE_TH1));
		$(pickTableHeader).append(elementProvider(config.foxComponent.PICK_TABLE_TH2));
		$(pickTableHeader).append(elementProvider(config.foxComponent.PICK_TABLE_TH3));
		$(pickTable).append(pickTableHeader);
		foxContainer.append(pickTable);	
	}
	
	function createOutputArea() {
		var outputWrapper = $('<div/>').addClass(config.foxConstants.CSS_XML_OUTPUT_WRAPPER).attr('id', config.foxConstants.XML_OUTPUT_WRAPPER_ID).text('XML output:');
		var txtArea = $('<textarea/>').attr({
			id : config.foxConstants.XML_OUTPUT_FIELD_ID,
			readonly : 'true'});
		outputWrapper.append(txtArea);
		config.FOX_ROOT.append(outputWrapper);
		$('#' + config.foxConstants.BUTTON_REFRESH).removeClass(config.foxConstants.CSS_HIDDEN);
		state.isVisible_output = true;
	}
	
	function writeXML(elementsArray) {
		try {
			// array that will hold the values for the elements that have no
			// id or name attributes.
			this.missingLocatorsList = [ '\n' ];
			var XML = new XMLWriter();
			// write xml prolog
			XML.WriteXMLProlog();
			XML.WriteString(config.foxConstants.NEW_LINE);
			// write xml root tag
			XML.BeginNode(config.tag.ACTION_SET);
			XML.WriteString(config.foxConstants.NEW_LINE);
			var locator;
			$.each(elementsArray, function() {
				var tagAndValue = getTagValuePair(this);
				locator = getLocator(this, true);
				// If the element has id or name attribute we create a node
				// in the xml for it. It will be skipped and logged
				// otherwise.
				if (locator != '') {
					XML.WriteString(config.foxConstants.TAB);
					// write a new tag
					XML.BeginNode(tagAndValue[0]);
					writeAttributes(XML, tagAndValue, locator);
					writeValue(XML, tagAndValue);
					// close the tag
					XML.EndNode();
					XML.WriteString(config.foxConstants.NEW_LINE);
					locator = '';
				}				
			}); 
			// close the DATA_SET (the root) tag
			XML.EndNode();
			XML.Close();
			var xmlPlusLog = XML.ToString();
			// If we have found elements with no id or name attributes we
			// write log in the output area for that.
			if (missingLocatorsList.length > 1) {
				xmlPlusLog += config.foxConstants.NEW_LINE;
				xmlPlusLog += config.foxConstants.NEW_LINE;
				xmlPlusLog += 'Elements with missing id or name attributes';
				xmlPlusLog += '(elements with these values were skipped for xml):';
				xmlPlusLog += config.foxConstants.NEW_LINE;
				xmlPlusLog += missingLocatorsList.toString().substring(2);
			}
			document.getElementById('xmlOutput').value = xmlPlusLog;
		} catch (Err) {
			if (console) {
				console.log('Error: ' + Err.description);
			} else {
				alert('Error: ' + Err.description);
			}
		}	
	}
	
	function writeAttributes(XML, tagNvalue, locator) {
		if (tagNvalue[0] == 'get') {
			XML.Attrib('locator', locator);
			XML.Attrib('attribute', '');
		} else {
			XML.Attrib('locator', locator);
		}
	}
	
	function writeValue(XML, tagNvalue) {
		if (tagNvalue[0] == 'get') {
			XML.WriteString('');
		} else {
			XML.WriteString(tagNvalue[1]);
		}
	}
	
	function getTagValuePair(tag) {
		var $currentTag = $(tag);
		var tagNvalue = {};
		if ($currentTag.is('input')) {
			if (tag.type == 'checkbox' || tag.type == 'radio') {
				tagNvalue[0] = 'check';
				tagNvalue[1] = '' + tag.checked;
				return tagNvalue;
			} else if (tag.type == 'button' || tag.type == 'submit') {
				tagNvalue[0] = 'click';
				tagNvalue[1] = '';
			} else if (tag.type == 'text' || tag.type == 'password') {
				tagNvalue[0] = 'set';
				tagNvalue[1] = tag.value;
			}
		} else if ($currentTag.is('select')) {
			if (tag.multiple == true) {
				var valueString = '';
				var opts = tag.options;
				for ( var i = 0; i < opts.length; i++) {
					if (opts[i].selected) {
						valueString += '|' + opts[i].text;
					}
				}
				tagNvalue[0] = 'select-many';
				tagNvalue[1] = valueString == '|' ? '' : valueString.substring(1);
			} else if (tag.multiple == false) {
				tagNvalue[0] = 'set';
				tagNvalue[1] = tag.value;
			}
		} else if ($currentTag.is('textarea')) {
			tagNvalue[0] = 'set';
			tagNvalue[1] = tag.value;
		} else {
			tagNvalue[0] = 'get';
			tagNvalue[1] = $currentTag.text();
		}
		return tagNvalue;
	}	
	
	function elementProvider(comp) {
		var created = $(comp.tagType).append(comp.txt).addClass(comp.cssClass).attr('id', comp.cid);
		if (comp.evt != undefined && comp.handler != undefined) {
			$(created).bind(comp.evt, comp.handler);
		}
		return created;
	}
	
	function show_tip_text(string) {
		Tip(string, DELAY, 100, WIDTH, 300, BGCOLOR, '#fff');
	}
	
	$.getTarget = function(e) {
		return this.IE ? event.srcElement : e.target;
	};	
	
	// Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};	
	
	Array.prototype.move = function(fromIndex, delta) {
	  var toIndex, temp;
	  if (fromIndex < 0 || fromIndex >= this.length) {
		return false;
	  }
	  toIndex = fromIndex + delta;
	  if (toIndex < 0 || toIndex >= this.length || toIndex == fromIndex) {
		return false;
	  }
	  temp = this[toIndex];
	  this[toIndex] = this[fromIndex];
	  this[fromIndex] = temp;
	  return true;
	};		
	
})(jQuery);
