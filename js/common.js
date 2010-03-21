CommonFunctions = {
	
	initScript : function() {

	},

	/**
	 * Shows a tooltip (wiz_tooltip.js) with predefined parameters. The tooltip
	 * is shown only if there is info in it.
	 * 
	 * @param element
	 *            the element that triggers this function and on which to apply
	 *            the tooltip.
	 * @return
	 */
	show_tip : function(element) {
		var el = document.getElementById(element.id + ':tooltip');
		if (el.childNodes.length) {
			TagToTip(element.id + ':tooltip', DELAY, 1000, WIDTH, 300, BGCOLOR,
					'#fff');
		}
	},

	/**
	 * Shows a tooltip (wiz_tooltip.js) with predefined parameters. The tooltip
	 * is shown only if there is info in it.
	 * 
	 * @param element
	 *            the element that triggers this function and on which to apply
	 *            the tooltip.
	 * @param customSize
	 *            width of the tooltip field.
	 * @return
	 */
	show_tip : function(element, customSize) {
		var el = document.getElementById(element.id + ':tooltip');
		if (el.childNodes.length) {
			TagToTip(element.id + ':tooltip', DELAY, 1000, WIDTH, customSize,
					BGCOLOR, '#fff');
		}
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

}

// call initScript() on page load.
CommonFunctions.initScript();
