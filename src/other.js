// Other : We will use it for last steps (web application)
function log(str) {
	document.getElementById('console').value = document.getElementById('console').value + (str + '\n');

	var textarea = document.getElementById('console');
	textarea.scrollTop = textarea.scrollHeight;
}
// --

// Panels, Gutter-note
function makePanel(where, str) {
	var node = document.createElement("div");
	var id = ++numPanels;
	var widget, close, label;

	node.id = "panel-" + id;
	node.className = "panel " + where;
	close = node.appendChild(document.createElement("a"));
	close.setAttribute("title", "Remove me!");
	close.setAttribute("class", "remove-panel");
	close.textContent = "X";
	CodeMirror.on(close, "click", function() {
	panels[node.id].clear();
	});
	label = node.appendChild(document.createElement("span"));
	label.textContent = str;
	return node;
}

function addPanel(where, str) {
	var node = makePanel(where, str);
	panels[node.id] = myCodeMirror.addPanel(node, {position: where});
	return node.id;
}

function replacePanel(PanelID) {
  var id = PanelID
  var panel = panels["panel-" + id];
  var node = makePanel("");

  panels[node.id] = myCodeMirror.addPanel(node, {replace: panel, position: "after-top"});
  return false;
}

function CreateErrorSign() {
	var image = document.createElement("img");
	image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAHlBMVEW7AAC7AACxAAC7AAC7AAAAAAC4AAC5AAD///+7AAAUdclpAAAABnRSTlMXnORSiwCK0ZKSAAAATUlEQVR42mWPOQ7AQAgDuQLx/z8csYRmPRIFIwRGnosRrpamvkKi0FTIiMASR3hhKW+hAN6/tIWhu9PDWiTGNEkTtIOucA5Oyr9ckPgAWm0GPBog6v4AAAAASUVORK5CYII="

	return image;
}

function CheckVerilogError(str) {
	if (str.indexOf("ERROR") == 0) // Error in the Verilog code
		return str.match(/\d+/)[0];
	
	else // No errors
		return 0;
}
// --