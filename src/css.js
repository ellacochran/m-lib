/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('css', function(exports, module) {
	var CSS = module.exports = {};

	CSS.delClass = function(node, classname) {
	  if (Array.isArray(classname)) {
	    classname.forEach(function(classname) {
	      CSS.delClass(node, classname);
	    });
	    return;
	  }
		var cn = node.className+"";
		var re = new RegExp("^"+classname+"\\s+|\\s+"+classname+"$|\\s+"+classname+"\\s+|^"+classname+"$");
		node.className=cn.replace(re,'').replace(/^\s+|\s+$/,'');
		return node;
	};
	CSS.addClass = function(node, classname) {
		CSS.delClass(node, classname);
		if (Array.isArray(classname)) {
	    classname.join(" ");
	  }
		node.className = (node.className+" "+classname).replace(/^\s+|\s+$/,'');
		return node;
	};
	CSS.hasClass = function(node, classname) {
		var cn = node.className+"";
		var re = new RegExp("^"+classname+"\\s+|\\s+"+classname+"$|\\s+"+classname+"\\s+|^"+classname+"$");
		return cn.match(re)?true:false;
	};
	CSS.toggleClass = function(node, classname) {
		if(CSS.hasClass(node, classname)) {
			CSS.delClass(node, classname);
		} else {
			CSS.addClass(node, classname);
		}
		return node;
	};
  CSS.replaceClass = function(node, delclass, addclass) {
    if (CSS.hasClass(node, delclass) {
      CSS.delClass(node, delclass);
      CSS.addClass(node, addclass);
    }
  };
});
