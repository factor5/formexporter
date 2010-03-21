/**
 * Global variable that holds the selected html form object that may be used
 * when refresh function is called.
 */
var selectedForm = new Object();

/**
 * A javascript function that provides methods for parsing of html forms and
 * creating a xml with node for every input or textarea element in there. The
 * xml's format is as follows:
 *
 * <code>
 * <?xml version="1.0" encoding="UTF-8"?>
 * <action-set>
 *	<set locator="bodyContainer:groupName">svilen</set>
 *	<set locator="bodyContainer:description">administration</set>
 *	<set locator="bodyContainer:visibility">true</set>
 *	<get locator="bodyContainer:name" attribute=""></get>
 * </action-set>
 * </code>
 */
var FormToXMLExporter = {
	
	init : function() {
		fox.createFoxToolbar();
	},
	
	createFoxToolbar : function() {
		var foxRoot = jQuery('#' + fox.foxConstants.EXPORTER_ROOT_ID);
		var toolbar = fox.elementProvider(fox.foxComponent.TOOLBAR);
		jQuery(toolbar).append(fox.elementProvider(fox.foxComponent.OPT_FIND_FORMS));
		jQuery(toolbar).append(fox.elementProvider(fox.foxComponent.OPT_HIDE_PANEL));
		jQuery(toolbar).append(fox.elementProvider(fox.foxComponent.OPT_REFRESH));
		jQuery(toolbar).append(fox.elementProvider(fox.foxComponent.OPT_SHOW_INFO));
		jQuery(toolbar).append(fox.elementProvider(fox.foxComponent.OPT_PICK_FIELDS));
		jQuery(toolbar).append(fox.elementProvider(fox.foxComponent.OPT_GET_ACTIONSET));
		jQuery(foxRoot).append(toolbar);
		var pickTable = fox.elementProvider(fox.foxComponent.PICK_TABLE);
		var pickTableHeader = jQuery('<tr/>');
		jQuery(pickTableHeader).append(fox.elementProvider(fox.foxComponent.PICK_TABLE_TH1));
		jQuery(pickTableHeader).append(fox.elementProvider(fox.foxComponent.PICK_TABLE_TH2));
		jQuery(pickTable).append(pickTableHeader);
		jQuery(foxRoot).append(pickTable);
	},
	
	elementProvider : function(comp) {
		var created = jQuery(comp.tagType).append(comp.txt).addClass(comp.cssClass).attr('id', comp.cid);
		if (comp.evt != undefined && comp.handler != undefined) {
			jQuery(created).bind(comp.evt, comp.handler);
		}
		return created;
	},

	pickFields : function() {		
		var container = document.getElementById('container');
		JSCommons.AddEventHandler(container, fox.jsEvent.MOUSE_OVER, fox.highlightSource);
		JSCommons.AddEventHandler(container, fox.jsEvent.MOUSE_OUT, fox.unHighlightSource);
		JSCommons.AddEventHandler(container, fox.jsEvent.CLICK, fox.pickHandler);
		var pickTable = document.getElementById(fox.foxConstants.PICK_TABLE_ID);
		JSCommons.RemoveStyleClass(pickTable, 'hidden');	
		JSCommons.RemoveStyleClass( document.getElementById('getActionSet'), 'hidden');	
		JSCommons.AddEventHandler(pickTable, fox.jsEvent.CLICK, fox.removeFromBucket);		
		fox.pickedList = new Array();
	},
	
	removeFromBucket : function(evt) {
		var source = JSCommons.SrcElement(evt);	
		var pickTable = document.getElementById(fox.foxConstants.PICK_TABLE_ID);
		if (source.tagName.toLowerCase() == fox.tag.INPUT) {
			var pickTblRow = JSCommons.Parent(JSCommons.Parent(source));
			pickTable.deleteRow(pickTblRow.rowIndex);
		}
	},
	
	highlightSource : function(evt) {
		var source = JSCommons.SrcElement(evt);	
		JSCommons.AddStyleClass(source, 'highlight');
		fox.show_tip_text(fox.createTooltipContent(source, fox.getLocators(source)));
	},
	
	unHighlightSource : function(evt) {
		var source = JSCommons.SrcElement(evt);
		JSCommons.RemoveStyleClass(source, 'highlight');
		UnTip(source);
	},
	
	getLocators : function(el) {
		var locators = {
			locatorId : el.id,
			locatorName : el.name,
			locatorXpath : fox.getXpath(el)
		};
		return locators;
	},
	
	getXpath : function(el) {
		return 'test xpath';
	},
	
	createTooltipContent : function(el, locators) {
		var content = '<span style="color:red">tag name:</span>';
		content += '<span style="color:green">' + el.tagName + '</span><br />';
		if (locators.length != 0) {
			content += '<span style="color:red">locators:</span><br />';
			content += (locators.locatorId) ? ('<span style="color:blue;">id=</span><span style="color:green;">' + locators.locatorId + '</span><br />') : ('');
			content += (locators.locatorName) ? ('<span style="color:blue;">name=</span><span style="color:green">' + locators.locatorName + '</span><br />') : ('');
			content += '<span style="color:blue;">xpath=</span><span style="color:green">' + locators.locatorXpath + '</span><br />';
		}
		return content;
	},

	pickHandler : function(evt) {
		var source = JSCommons.SrcElement(evt);
		var picked = '<tr><td>';
		picked += source.tagName + ':';
		picked += fox.getLocator(source, false);
		picked += '</td><td><input type="checkbox"></td></tr>';
		document.getElementById(fox.foxConstants.PICK_TABLE_ID).innerHTML += picked;		
		fox.pickedList.push(source);
		return false;
	},	
	
	getActionSet : function() {
		var container = document.getElementById('container');
		JSCommons.RemoveEventHandler(container, fox.jsEvent.MOUSE_OVER, fox.highlightSource);
		JSCommons.RemoveEventHandler(container, fox.jsEvent.MOUSE_OUT, fox.unHighlightSource);
		JSCommons.RemoveEventHandler(container, fox.jsEvent.CLICK, fox.pickHandler);
		JSCommons.AddStyleClass(document.getElementById(fox.foxConstants.PICK_TABLE_ID), fox.foxConstants.CSS_HIDDEN);
		fox.EXPORTER_ROOT_TAG = document
					.getElementById(this.foxConstants.EXPORTER_ROOT_ID);
		fox.showOutputArea();
		fox.writeXML(fox.pickedList);
		return false;
	},
	
	pickedList : null,
	
	/**
	 * Finds all the forms in the current page and shows their ids as links in a
	 * table. If a link is clicked then the exporter is started for that form.
	 *
	 * @return
	 */
	findFormsInPage : function() {
		// get all forms on the page
		var frms = document.getElementsByTagName(this.tag.FORM);
		// hide refresh button
		document.getElementById(this.foxConstants.BUTTON_REFRESH).className = this.foxConstants.HIDDEN;

		// create table with forms id's
		if (frms) {
			// on the page should be a div tag with id='exporter' which
			// is container for the output data
			var par = document
					.getElementById(this.foxConstants.EXPORTER_ROOT_ID);
			this.EXPORTER_ROOT_TAG = document
					.getElementById(this.foxConstants.EXPORTER_ROOT_ID);

			// remove previous table and textarea if have been used
			this.removeFieldsIfPressent(this.EXPORTER_ROOT_TAG);

			// create table with found forms ids tag
			var frmsTable = document.createElement(this.tag.TABLE);
			frmsTable.className = this.foxConstants.CSS_FORMS_TABLE;
			frmsTable.id = this.foxConstants.FORMS_TABLE_ID;
			frmsTable.appendChild(this.createCellWithText(this.tag.CAPTION,
					'Forms found in page:'));
			var tblHead = document.createElement(this.tag.THEAD);
			tblHead.appendChild(document.createElement(this.tag.TR)
					.appendChild(
							this.createCellWithText(this.tag.TH, 'form id')));
			frmsTable.appendChild(tblHead);
			// create and append table rows with links for every form id that
			// was found
			var tblBody = document.createElement(this.tag.TBODY);
			for ( var i = 0; i < frms.length; i++) {
				var tblRow = document.createElement(this.tag.TR);
				var cell = document.createElement(this.tag.TD);

				var link = document.createElement(this.tag.A);
				link.onclick = fox.invokeParser;
				link.setAttribute(this.attribute.HREF, '#');
				link.appendChild(document.createTextNode(frms[i].id));
				cell.appendChild(link);

				tblRow.appendChild(cell);
				tblBody.appendChild(tblRow);
			}
			frmsTable.appendChild(tblBody);

			// append prepared table to the wrapper
			this.EXPORTER_ROOT_TAG.appendChild(frmsTable);
		}
	},

	/**
	 * Removes forms table and output textarea if they are present.
	 *
	 * @param root
	 *            the wrapper tag
	 * @return
	 */
	removeFieldsIfPressent : function(root) {
		var frmsTable = document
				.getElementById(this.foxConstants.FORMS_TABLE_ID);
		if (frmsTable) {
			root.removeChild(frmsTable);
		}

		var outField = document
				.getElementById(this.foxConstants.XML_OUTPUT_WRAPPER_ID);
		if (outField) {
			root.removeChild(outField);
		}
	},

	/**
	 * Refreshes the XML output textarea so to catch the last changes in the
	 * form. No need to reload form.
	 *
	 * @return
	 */
	refreshOutput : function() {
		this.formToXML(selectedForm);
	},

	/**
	 * Creates and shows the XML output textarea.
	 *
	 * @return
	 */
	showOutputArea : function() {
		this.removeFieldsIfPressent(this.EXPORTER_ROOT_TAG);

		var txtAreaWrapper = document.createElement(this.tag.DIV);
		txtAreaWrapper.className = this.foxConstants.CSS_XML_OUTPUT_WRAPPER;
		txtAreaWrapper.id = this.foxConstants.XML_OUTPUT_WRAPPER_ID;

		txtAreaWrapper.appendChild(this.createCellWithText(this.tag.DIV,
				'XML output:'));
		var xmlOutputArea = document.createElement(this.tag.TEXTAREA);
		xmlOutputArea.id = this.foxConstants.XML_OUTPUT_FIELD_ID;
		xmlOutputArea.setAttribute(this.attribute.READONLY, 'true');
		txtAreaWrapper.appendChild(xmlOutputArea);

		this.EXPORTER_ROOT_TAG.appendChild(txtAreaWrapper);

		// show refresh button by removing css class hidden
		document.getElementById(this.foxConstants.BUTTON_REFRESH).className = '';
	},

	/**
	 * Invokes the xmlToForm with html form object to be parsed.
	 *
	 * @param e
	 *            selected from the user form to be parsed
	 * @return
	 */
	invokeParser : function(e) {
		var e = JSCommons.SrcElement(e);
		if (e) {
			var choosenForm = document.getElementById(e.innerHTML);
			// store chosen form object to global variable in order for refresh
			// to be possible
			selectedForm = choosenForm;
		}
		fox.formToXML(choosenForm);
	},

	/**
	 * Merges two arrays.
	 *
	 * @param array1
	 *            In this array the elements from the array2 will be added.
	 * @param array2
	 *            Element from this array will be added in the array1.
	 * @return An array that contains all elements from the both provided
	 *         arrays.
	 */
	mergeArrays : function(array1, array2) {
		for ( var i = 0; i < array2.length; i++) {
			array1.push(array2[i]);
		}
		return array1;
	},
	
	/**
	 * Check if there is no id set we use the
	 * name attribute instead or the current element will be
	 * skipped and logged after the end of the result xml.
	
	 * @param currentElement The element which locator should be found.
	 * @param shouldLog Shows whether to log this elemet if it does not have id or name attribute.
	 * @return The id of the element, name or empty string in this order.
	 */
	getLocator : function(currentElement, shouldLog) {
		var locator;
		if (currentElement.id) {
			locator = currentElement.id;
		} else if (currentElement.name) {
			locator = currentElement.name;
		} else {
			locator = '';
			if (shouldLog) {
				missingLocatorsList.push(currentElement.value);
			}			
		}	
		return locator;
	},

	/**
	 * Creates the XML for all found input fields and textareas. Some type of
	 * fields are skipped: hidden, button, submit
	 *
	 * @param e
	 *            selected from the user form to be parsed
	 * @return
	 */
	formToXML : function(choosenForm) {
		fox.showOutputArea();
		var formElements = choosenForm.elements;
		var elements = fox.mergeArrays(jQuery('#'
				+ choosenForm.id + fox.foxConstants.PREVIEW_CSS_CLASS), fox
				.findInputTags(formElements));
		fox.writeXML(elements);
		return false;
	},
	
	writeXML : function(elementsArray) {
		try {
			// array that will hold the values for the elements that have no
			// id or name attributes.
			var missingLocatorsList = [ '\n' ];
			var XML = new XMLWriter();
			// write xml prolog
			XML.WriteXMLProlog();
			XML.WriteString(fox.foxConstants.NEW_LINE);
			// write xml root tag
			XML.BeginNode(fox.tag.DATA_SET);
			XML.WriteString(fox.foxConstants.NEW_LINE);
			var locator;
			for ( var i = 0; i < elementsArray.length; i++) {
				var tagAndValue = fox
						.getTagValuePair(elementsArray[i]);
				locator = fox.getLocator(elementsArray[i], true);
				// If the element has id or name attribute we create a node
				// in the xml for it. It will be skipped and logged
				// otherwise.
				if (locator != '') {
					XML.WriteString(fox.foxConstants.TAB);
					// write a new tag
					XML.BeginNode(tagAndValue[0]);
					fox.writeAttributes(XML, tagAndValue,
							locator);
					fox.writeValue(XML, tagAndValue);
					// close the tag
					XML.EndNode();
					XML
							.WriteString(fox.foxConstants.NEW_LINE);
					locator = '';
				}
			}
			// close the DATA_SET (the root) tag
			XML.EndNode();
			XML.Close();
			var xmlPlusLog = XML.ToString();
			// If we have found elements with no id or name attributes we
			// write log in the output area for that.
			if (missingLocatorsList.length > 1) {
				xmlPlusLog += fox.foxConstants.NEW_LINE;
				xmlPlusLog += fox.foxConstants.NEW_LINE;
				xmlPlusLog += 'Elements with missing id or name attributes';
				xmlPlusLog += '(elements with these values were skipped for xml):';
				xmlPlusLog += fox.foxConstants.NEW_LINE;
				xmlPlusLog += missingLocatorsList.toString().substring(2);
			}
			document.getElementById('xmlOutput').value = xmlPlusLog;
		} catch (Err) {
			alert("Error: " + Err.description);
		}	
	},

	/**
	 * Writes attributes to action set xml for the current tag.
	 *
	 * @param XML
	 *            XML writer object.
	 * @param tagNvalue
	 *            An array that contains tag name/value pair.
	 * @param locator
	 *            The locator to be set.
	 */
	writeAttributes : function(XML, tagNvalue, locator) {
		if (tagNvalue[0] == fox.tag.GET) {
			XML.Attrib(fox.attribute.LOCATOR, locator);
			XML.Attrib(fox.attribute.ATTRIBUTE, '');
		} else {
			XML.Attrib(fox.attribute.LOCATOR, locator);
		}
	},

	/**
	 * Writes value to action set xml for the current tag.
	 *
	 * @param XML
	 *            XML writer object.
	 * @param tagNvalue
	 *            An array that contains tag name/value pair.
	 */
	writeValue : function(XML, tagNvalue) {
		if (tagNvalue[0] == fox.tag.GET) {
			XML.WriteString('');
		} else {
			XML.WriteString(tagNvalue[1]);
		}
	},

	/**
	 * According the provided tag name and type creates an array with two
	 * elements: a tag name as string that will be used for xml creation and the
	 * tag value which is get in different ways.
	 *
	 * @param tag
	 *            The tag for which to create a tag name:value pair
	 * @return An array
	 */
	getTagValuePair : function(tag) {
		var tagNvalue = {};
		if (tag.tagName.toLowerCase() == fox.tag.INPUT) {
			if (tag.type == fox.type.CHECKBOX
					|| tag.type == fox.type.RADIO) {
				tagNvalue[0] = fox.tag.CHECK;
				tagNvalue[1] = '' + tag.checked;
				return tagNvalue;
			} else if (tag.type == fox.type.BUTTON
					|| tag.type == fox.type.SUBMIT) {
				tagNvalue[0] = tagNvalue[0] = fox.tag.CLICK;
				tagNvalue[1] = '';
			} else if (tag.type == fox.type.TEXT
					|| tag.type == fox.type.PASSWORD) {
				tagNvalue[0] = tagNvalue[0] = fox.tag.SET;
				tagNvalue[1] = tag.value;
			}
		} else if (tag.tagName.toLowerCase() == fox.tag.SELECT) {
			if (tag.multiple == true) {
				var valueString = '';
				var opts = tag.options;
				for ( var int = 0; int < opts.length; int++) {
					if (opts[int].selected) {
						valueString += '|' + opts[int].text;
					}
				}
				tagNvalue[0] = tagNvalue[0] = fox.tag.SELECT_MANY;
				tagNvalue[1] = valueString == '|' ? '' : valueString
						.substring(1);
			} else if (tag.multiple == false) {
				tagNvalue[0] = tagNvalue[0] = fox.tag.SET;
				tagNvalue[1] = tag.value;
			}
		} else if (tag.tagName.toLowerCase() == fox.tag.TEXTAREA) {
			tagNvalue[0] = tagNvalue[0] = fox.tag.SET;
			tagNvalue[1] = tag.value;
		} else {
			tagNvalue[0] = fox.tag.GET;
			if (JSCommons.NavigatorType() == 0) { // if IE
				tagNvalue[1] = tag.innerText;
			} else { // if not IE
				tagNvalue[1] = tag.textContent;
			}
		}
		return tagNvalue;
	},

	/**
	 * Hides the exporter's panel.
	 *
	 * @return
	 */
	hidePanel : function() {
		document.getElementById(this.foxConstants.FORMS_TABLE_ID) ? document
				.getElementById(this.foxConstants.FORMS_TABLE_ID).className = this.foxConstants.CSS_HIDDEN
				: null;
		document.getElementById(this.foxConstants.XML_OUTPUT_WRAPPER_ID) ? document
				.getElementById(this.foxConstants.XML_OUTPUT_WRAPPER_ID).className = this.foxConstants.CSS_HIDDEN
				: null;
		document.getElementById(this.foxConstants.BUTTON_REFRESH).className = this.foxConstants.CSS_HIDDEN;
	},

	/**
	 * Finds out all type of input (text, button, submit, checkbox, radio),
	 * textarea, select tags and creates an array with them.
	 *
	 * @param nodesArray
	 *            An array that contains all found form elements.
	 * @return An array that contains the found tags.
	 */
	findInputTags : function(nodesArray) {
		var inputs = [];
		for ( var i = 0; i < nodesArray.length; i++) {
			if (nodesArray[i].tagName.toLowerCase() == this.tag.INPUT) {
				if (this.skipNode(nodesArray[i])) {
					continue;
				}
				inputs.push(nodesArray[i]);
			}
			if (nodesArray[i].tagName.toLowerCase() == this.tag.TEXTAREA) {
				inputs.push(nodesArray[i]);
			}
			if (nodesArray[i].tagName.toLowerCase() == this.tag.SELECT) {
				inputs.push(nodesArray[i]);
			}
		}
		return inputs;
	},

	/**
	 * Checks out the type of the input field for the once that should be
	 * skipped.
	 *
	 * @param theNode
	 *            the node which type should be checked
	 * @return true if the node should be skipped and false otherwise
	 */
	skipNode : function(theNode) {
		if (theNode.getAttribute(this.attribute.TYPE) == this.type.HIDDEN
				|| theNode.getAttribute(this.attribute.TYPE) == this.type.BUTTON) {
			return true;
		}
		return false;
	},

	/**
	 * Creates a cell (tag) with some text in it.
	 *
	 * @param tagName
	 *            the tag that should be created
	 * @param txt
	 *            the text to be set in this cell
	 * @return the created cell
	 */
	createCellWithText : function(tagName, txt) {
		var cell = document.createElement(tagName);
		cell.appendChild(document.createTextNode(txt));
		return cell;
	},
	
	/**
	 * Shows a tooltip (wiz_tooltip.js) with predefined parameters and custom
	 * text.
	 * 
	 * @param element
	 *            the element that triggers this function and on which to apply
	 *            the tooltip
	 * @return
	 */
	show_tip_text : function(string) {
		Tip(string, DELAY, 100, WIDTH, 300, BGCOLOR, '#fff');
	},

	tag : {
		SELECT_MANY	: 'select-many',
		CLICK 		: 'click',
		CHECK 		: 'check',
		SET 		: 'set',
		GET 		: 'get',
		DATA_SET 	: 'action-set',
		XML_PROLOG 	: 'xml',
		DATA 		: 'data',
		ENTRY 		: 'entry',
		VALUE 		: 'value',
		INPUT 		: 'input',
		TEXTAREA 	: 'textarea',
		SELECT 		: 'select',
		DIV 		: 'div',
		A 			: 'a',
		FORM 		: 'form',
		TABLE 		: 'table',
		THEAD 		: 'thead',
		TBODY 		: 'tbody',
		CAPTION 	: 'caption',
		TR 			: 'tr',
		TD 			: 'td',
		TH 			: 'th'
	},

	attribute : {
		ATTRIBUTE 	: 'attribute',
		LOCATOR 	: 'locator',
		ID 			: 'id',
		READONLY 	: 'readonly',
		TYPE 		: 'type',
		HREF 		: 'href',
		MULTIPLE 	: 'multiple'
	},

	type : {
		HIDDEN 		: 'hidden',
		BUTTON 		: 'button',
		SUBMIT 		: 'submit',
		CHECKBOX 	: 'checkbox',
		RADIO 		: 'radio',
		TEXT 		: 'text',
		PASSWORD 	: 'password'
	},	

	/**
	 * The root tag for the exporter component in the page.
	 */
	EXPORTER_ROOT_TAG : null,

	/**
	 * Common constants.
	 */
	foxConstants : {
		BUTTON_REFRESH 			: 'refresh',
		CSS_HIDDEN 				: 'hidden',
		CSS_FORMS_TABLE 		: 'frmsTbl',
		CSS_XML_OUTPUT_WRAPPER 	: 'outputShow',
		EXPORTER_ROOT_ID 		: 'exporter',
		FORMS_TABLE_ID 			: 'foundFormsTable',
		XML_OUTPUT_WRAPPER_ID 	: 'outField',
		XML_OUTPUT_FIELD_ID 	: 'xmlOutput',
		PICK_TABLE_ID 			: 'pickTable',
		TAB 					: '\t',
		NEW_LINE 				: '\n',
		D_TAB 					: '\t\t',
		NAME_PREFIX 			: 'name=',
		PREVIEW_CSS_CLASS 		: ' .preview'
	},	
	
	jsEvent : {
		CLICK 		: 'click',
		MOUSE_OVER 	: 'mouseover',
		MOUSE_OUT 	: 'mouseout'
	},
	
	foxComponent : {
		TOOLBAR 			: { tagType : '<div />', cid : 'options', cssClass : 'options'},
		OPT_FIND_FORMS 		: { tagType : '<span />', cid : 'findForms', cssClass : 'optLink', txt : 'Find forms', evt : 'click', handler : function(){fox.findFormsInPage();}},
		OPT_HIDE_PANEL 		: { tagType : '<span />', cid : 'hidePanel', cssClass : 'optLink', txt : 'Hide panel', evt : 'click', handler : function(){fox.hidePanel();}},
		OPT_REFRESH 		: { tagType : '<span />', cid : 'refresh', cssClass : 'optLink hidden', txt : 'Refresh', evt : 'click', handler : function(){fox.refreshOutput();}},
		OPT_SHOW_INFO 		: { tagType : '<span />', cid : 'showInfo', cssClass : 'optLink', txt : 'Show info', evt : 'click', handler : function(){fox.getActionSet();}},
		OPT_PICK_FIELDS 	: { tagType : '<span />', cid : 'pickFields', cssClass : 'optLink', txt : 'Pick fields', evt : 'click', handler : function(){fox.pickFields();}},
		OPT_GET_ACTIONSET	: { tagType : '<span />', cid : 'getActionSet', cssClass : 'optLink hidden', txt : 'Get actionset', evt : 'click', handler : function(){fox.getActionSet();}},
		PICK_TABLE			: { tagType : '<table />', cid : 'pickTable', cssClass : 'hidden', txt : ''},
		PICK_TABLE_TH1		: { tagType : '<th />', cid : '', cssClass : '', txt : 'tagName:locator'},
		PICK_TABLE_TH2		: { tagType : '<th />', cid : '', cssClass : '', txt : 'remove'}
	}
}

fox = FormToXMLExporter;
