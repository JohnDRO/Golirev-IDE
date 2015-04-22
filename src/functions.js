﻿/*
 * Golirev : function.js
 * Details : Contains functions used in this project.
 *
*/

// Initial configuration
function Init() {
	// Init CircuitInfo
	CircuitInfo[0] = 0;
	CircuitInfo[1] = 0;
	CircuitInfo[2] = "Default Name"
	CircuitInfo[3] = "Default Creator"
	if (typeof CircuitInfo[4] != 'undefined')
		CircuitInfo[4].remove();
	// --
	
	RemoveAllGates();
	RemoveAllWires();
	
	// Remove Netlist
	for (i = 1, n = 1; n <= NetList[0]; i++) {
		if (typeof NetList[i] != 'undefined') {
			delete NetList[i];
			n++;
		}
	} 
	// --
	
	// Remove Constants
	for (i = 1; i <= Constants[0]; i++) {
		Constants[i][1].remove();
	}
	// --
	
	// Reset vars
	Components[0] = 0; // Init components to 0
	NetList[0] = 0; // Init links to 0
	Constants[0] = 0;
	// --
	
	return 1;
}
// --

// Yosys and JSON related
function ParseJson(json_yosysJS) { // Read the JSON file produced by yosysJS and then parse it and set CircuitInfo, Components, Netlist and Constants
	// Définition et initialisation des variables
	var Circuit_Name; // circuits related variables
	
	var io_names, cells_name;
	
	var i = 0, n = 0, k = 0, l = 0; // loops counters
	// ---
	
	Init();
	
	Circuit_Name = Object.keys(json_yosysJS.modules); // example : 'up3down5', 'DCF77_CIRCUIT', '4 BIT COUNTER', ..
	
	// read I/O (A, B, clk, reset, ..)
	io_names = Object.keys(json_yosysJS.modules[Circuit_Name].ports);
	
	for (i in io_names) {
		Components[0]++;
		Components[Components[0]] = new Array();
		
		// Component related : done
		Components[Components[0]][0] = io_names[i]; // label
		Components[Components[0]][1] = (json_yosysJS.modules[Circuit_Name].ports[io_names[i]].direction === 'input') ? 0 : 1;
		Components[Components[0]][2] = 1; // Show label of I/O by default
		// --
		
		// Netlist related : todo
		// json_yosysJS.modules[Circuit_Name].ports[io_names[i]].bits
		
		var meh2 = json_yosysJS.modules[Circuit_Name].ports[io_names[i]].bits;
		
		for (l = 0; l <= meh2.length - 1; l++) { // bus loop
			if (typeof meh2[l] == 'string') { // is it a constant ?
				// On l'ajoute dans le tableau.
				Constants[0]++;
				Constants[Constants[0]] = new Array();
				Constants[Constants[0]][0] = meh2[l]; // Value
				Constants[Constants[0]][2] = 1 + parseInt(i); // Component id
				Constants[Constants[0]][3] = 0; // Name of the gate
			}
			
			else {
				if (typeof NetList[meh2[l]] === 'undefined') {
					NetList[meh2[l]] = new Array();
					NetList[meh2[l]][0] = 1;
					
					NetList[meh2[l]][1] = new Array();
					NetList[meh2[l]][1][0] = 1 + parseInt(i);
					NetList[meh2[l]][1][1] = 0;
					
					NetList[meh2[l]][1][2] = 0; // x
					NetList[meh2[l]][1][3] = 0; // y
					NetList[0]++;
				}
				
				else {
					NetList[meh2[l]][0]++;
					NetList[meh2[l]][NetList[meh2[l]][0]] = new Array();
					
					NetList[meh2[l]][NetList[meh2[l]][0]][0] = 1 + parseInt(i);
					NetList[meh2[l]][NetList[meh2[l]][0]][1] = 0;
					
					NetList[meh2[l]][NetList[meh2[l]][0]][2] = 0; // x
					NetList[meh2[l]][NetList[meh2[l]][0]][3] = 0; // y
				}
			}
		}
		// --
	}
	// ---

	// read cells (NOT, AND, OR, ..)
	cells_name = Object.keys(json_yosysJS.modules[Circuit_Name].cells);
	
	for (n in cells_name) {
		Components[0]++;
		Components[Components[0]] = new Array();
		
		// Component related : ok
		Components[Components[0]][0] = cells_name[n]; // label
		Components[Components[0]][1] = GateToEqNumber(json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].type);
		Components[Components[0]][2] = json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].hide_name;
		// --
		// Netlist related : ok
		cell_io_name = Object.keys(json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].connections);
		var meh = 0;
		for (k in cell_io_name) {
			meh = json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].connections[cell_io_name[k]];
			//document.write('<br /> -- ' + meh[0] + '<br />');
			//document.write('<hr>' + typeof meh[0] + '<hr>');
			if (typeof meh[0] === 'string') { // is it a constant ?
				Constants[0]++;
				Constants[Constants[0]] = new Array();
				Constants[Constants[0]][0] = meh[0]; // Value
				Constants[Constants[0]][2] = 2 + parseInt(i) + parseInt(n); // Component id
				Constants[Constants[0]][3] = cell_io_name[k]; // Name of the gate
			}
			
			else if (!isArray(NetList[meh])) {
				NetList[meh] = new Array();
				NetList[meh][0] = 1;
				NetList[meh][1] = new Array();
				NetList[meh][1][0] = parseInt(i) + parseInt(n) + 2;
				NetList[meh][1][1] = cell_io_name[k];
				
				NetList[meh][1][2] = 0; // x
				NetList[meh][1][3] = 0; // y
				NetList[0]++;
			}
		
			else  {
				NetList[meh][0]++;
				NetList[meh][NetList[meh][0]] = new Array();
				NetList[meh][NetList[meh][0]][0] = parseInt(n) + parseInt(i) + 2;
				NetList[meh][NetList[meh][0]][1] = cell_io_name[k];
				
				NetList[meh][NetList[meh][0]][2] = 0; // x
				NetList[meh][NetList[meh][0]][3] = 0; // y
			}							
		

		}
	}
	// ---
	
	CircuitInfo[2] = String(Circuit_Name);
	CircuitInfo[3] = json_yosysJS.creator;
	
	//document.write('Nbr ' + Constants[0]);
	
	return 1;
}

function CheckVerilogError(str) {
	if (str.indexOf("ERROR") == 0) // Error in the Verilog code
		return str.match(/\d+/)[0];
	
	else // No errors
		return 0;
}
// --

// Components
function GenerateAllGates(SVG_Element, Gate_Type) {
	var i = 0;
	
	RemoveAllGates();
	
	for (i = 1; i <= Components[0]; i++) // IO + Cells
		Components[i][6] = GenerateGate(SVG_Element, Components[i][1], Components[i][0], Gate_Type, Components[i][2]);
	
	for (i = 1; i <= Constants[0]; i++) { // Constants
		Constants[i][1] = GenerateGate(SVG_Element, 0, Constants[i][0], 0, 0);
	}

	CircuitInfo[4] = SVG_Element.text('Circuit : ' + CircuitInfo[2]).draggable(function(x, y) { return { x: x < 1000, y: y < 500 } }).fill('#000').stroke({ width: 0.1 }).center(100, 100);
	nodes.add(CircuitInfo[4]); // Circuit name is in the spannable and zoomable
}

function GenerateGate(SVG_Element, Gate_Type, Label, Gate_Norm, hide_label) { // Generate a gate and return the svgjs element created.
	var group = draw.group(), text, text1, text2, text3, text4, longeur = 0, rect;
	var MAXX = 5000, MAXY = 5000;
	
	if (Gate_Type < 0 || Gate_Type > 8) // 0 == INPUT, 1 == OUTPUT, 2 == BUF, 3 == NOT, 4 == AND, 5 == OR, 6 == XOR, 7 == DFF_P, 8 == MUX
		return -1;
	
	if (typeof Label == 'undefined')
		Label = 'Default gate name';
		
	if (typeof Gate_Norm == 'undefined')
		Gate_Norm = 0; // Distinctive shape by default

	switch(Gate_Type) {
		case 0: // Input
			rect = draw.rect(60, 10).center(50, 50);
			text = SVG_Element.plain(Label).x(20).y(30).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m 80,50 10,0');
			
			group.add(rect);
			group.add(text);
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
		break;
		case 1: // Output
			rect = draw.rect(60, 10).center(50, 50);
			text = SVG_Element.plain(Label).x(20).y(30).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m 11,50 10,0');
			
			group.add(rect);	
			group.add(text);
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
		break;
		case 2: // YES
			if (Gate_Norm == 0) {
			
				group.path('m 32,24 -31,-15 0,30 z').center(50, 50);
				group.path('m 18,50 16,0');
				group.path('m 65,50 16,0');
			
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 25).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (Gate_Norm == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 80,50 10,0');
				group.path('m 11,50 10,0');
				
				text1 = SVG_Element.plain('1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
		break;
		case 3: // NOT
			if (Gate_Norm == 0) {
				group.path('m 32,24 -31,-15 0,30 z').center(50, 50);
				
				group.path('m 24,50 10,0');
				group.path('m 68,50 10,0');
				group.circle(7).center(68, 50);
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 25).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (Gate_Norm == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 80,50 10,0');
				group.path('m 11,50 10,0');
				group.path('m 80,40 10,10');
				
				text1 = SVG_Element.plain('1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
		break;			
		case 4: // AND
			if (Gate_Norm == 0) {
				group.path('m 0,1 24,0 a 23,23 0 0 1 0,46 l -24,0 z').center(50, 50);
				group.path('m 17,35 10,0');
				group.path('m 73,50 10,0');
				group.path('m 17,65 10,0');
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 15).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (Gate_Norm == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 11,34 10,0');
				group.path('m 80,50 10,0');
				group.path('m 11,66 10,0');
				
				text1 = SVG_Element.plain('&').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}		
		break;		
		case 5: // OR
			if (Gate_Norm == 0) {
				group.path('m -3.5,1 19.5,0 a 40,46 0 0 1 32,23 a 40,46 0 0 1 -32,23 l -19.5,0 a 40,40 0 0 0 0,-46 z').center(50, 50);
				group.path('m 17,34 10,0');
				group.path('m 74,50 10,0');
				group.path('m 17,66 10,0');
			
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 15).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (Gate_Norm == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 11,34 10,0');
				group.path('m 80,50 10,0');
				group.path('m 11,66 10,0');
				
				text1 = SVG_Element.plain('≥1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(150, 150).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
			
		break;
		case 6: // XOR
			if (Gate_Norm == 0) {
				group.path('m 2.5,1 13.5,0 a 40,46 0 0 1 32,23 a 40,46 0 0 1 -32,23 l -13.5,0 a 40,40 0 0 0 0,-46 z').center(50, 50);
				group.path('m -3.5,1 a 40,40 0 0 1 0,46').center(20, 50);
				group.path('m 10,34 10,0');
				group.path('m 72,50 10,0');
				group.path('m 10,66 10,0');
			
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 15).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (Gate_Norm == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 11,34 10,0');
				group.path('m 80,50 10,0');
				group.path('m 11,66 10,0');
				
				text1 = SVG_Element.plain('=1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
			
		break;
		case 7: // DFF_P
			if (Gate_Norm == 0 || Gate_Norm == 1) {
				text1 = SVG_Element.plain('D').center(30, 20).stroke({ width: 0.1 }).fill('#000'); 
				text2 = SVG_Element.plain('Q').center(70, 20).stroke({ width: 0.1 }).fill('#000'); 
				text3 = SVG_Element.plain('CLK').center(35, 65).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80).center(50, 50); // The main rect
				group.path('m 10,20 10,0'); // symboles de connections (D)
				group.path('m 10,65 10,0'); // (clk)
				group.path('m 80,20 10,0'); // (Q)
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 3).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
				
				group.add(text1);
				group.add(text2);
				group.add(text3);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
			
		break;
		case 8: // MUX
			if (Gate_Norm == 0 || Gate_Norm == 1) {
				text1 = SVG_Element.plain('A').center(45, 35).stroke({ width: 0.1 }).fill('#000'); 
				text2 = SVG_Element.plain('Y').center(60, 47.5).stroke({ width: 0.1 }).fill('#000'); 
				text3 = SVG_Element.plain('B').center(45, 60).stroke({ width: 0.1 }).fill('#000'); 
				text4 = SVG_Element.plain('S').center(52, 70).stroke({ width: 0.1 }).fill('#000'); 
				
				group.path('M 0 0 L 30 20 L 30 60 L 0 80 L 0 0Z').center(50, 50);
				group.path('m 25,35 10,0'); // symboles de connections (A)
				group.path('m 25,60 10,0'); // (B)
				group.path('m 66,47.5 10,0'); // (Y)
				group.path('m 50,80 0,10'); // (S)
				
				if(!hide_label) {
					text = SVG_Element.plain(Label).center(50, 0).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
			
				group.add(text1);
				group.add(text2);
				group.add(text3);
				group.add(text4);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires(draw, Gate_Norm);
			}
			
		break;
		default: // Error
			return -1;
		break;
	} 
	
	group.style('cursor', 'move'); // Change the cursor style
	
	nodes.add(group); // Span and zoom
	
	return group;
}

function GateToEqNumber(GateString) { // Gate to equivalent number. ex : input : '$_NOT_', output : 3
	var GateNumber = -1; // -1 is undefined here
	
	switch (GateString) {
		case '$_NOT_':
			GateNumber = 3;
		break;
		case '$_AND_':
			GateNumber = 4;
		break;
		case '$_OR_':
			GateNumber = 5;
		break;
		case '$_XOR_':
			GateNumber = 6;
		break;
		case '$_DFF_P_':
			GateNumber = 7;
		break;
		case '$_MUX_':
			GateNumber = 8;
		break;
		case '$_DLATCH_P_':
			GateNumber = 9;
		break;
	}
	
	return GateNumber;
}

function RemoveAllGates() {
	var i = 0;
	
	for (i = 1; i <= Components[0]; i++) { // Remove componants
		if (typeof Components[i][6] != 'undefined')
			Components[i][6] = Components[i][6].remove();
	}


}

function UpdateGateType(SVG_Element, Gate_Type) { // Update SVG components (i.e. : Distinctive shape to rectangular shape).
	var i = 0;
	
	var x = 0;
	var y = 0;
	
	for (i = 1; i <= Components[0]; i++) {
		// Save coords
		x = Components[i][6].x() / 100;
		y = Components[i][6].y() / 100;
		
		// Remove the SVG component and then remake it.
		Components[i][6].remove();
		Components[i][6] = GenerateGate(SVG_Element, Components[i][1], Components[i][0], Gate_Type, Components[i][2]);
	
		// Replace the component
		MoveToGrid(Components[i][6], x, y);
	}
	
	RemoveAllWires();
}
// --

// Placement
function SimulatedAnnealing(Gate_Norm) { // http://www.codeproject.com/Articles/13789/Simulated-Annealing-Example-in-C
    var iteration = 0;
    var proba;
    var alpha =0.999;
    var temperature = 400.0;
    var epsilon = 0.001;
    var delta;
	var i = 0;
	var j = 0;
	var Arr;

	// Init components positions
	for (i = 1; i <= Components[0]; i++) {
		Grid[5][i] = 1;
		MoveToGrid(Components[i][6], 5, i);
	}
	
	for (i, n = 1; n <= Constants[0]; i++, n++) {
		Grid[5][i] = 1;
		MoveToGrid(Constants[n][1], 5, i);
	}
	
	GenerateAllWires(draw, Gate_Norm);
	
    var distance = GetWiresLength();

    // While the temperature did not reach epsilon
    while (temperature > epsilon) {
        iteration++;
    
		// Make a random change
        Arr = RandomChange();
		GenerateAllWires(draw, 0);
		
		// Get the new delta
        delta = GetWiresLength() - distance;
		
        if(delta < 0)
            distance = delta + distance;
        
		else {
            proba = Math.random();

            if(proba < Math.exp(-delta/temperature))
                distance = delta+distance;
			
			else 
				ReverseChange(Arr[0], Arr[1], Arr[2], Arr[3]);
        }
        
		// Cooling process on every iteration
        temperature *= alpha;
    }
	
}

function RandomChange() { // Make a random change, must return ID_Compo, x and y.
	// Random component ID
	var RandomID = Math.floor((Math.random() * (Components[0] + Constants[0]) + 1)); 

	var type = 0;
	
	if (RandomID > Components[0]) { // Constant
		type = 1;
		RandomID = RandomID - Components[0];
		
		// Get x and y of this component
		var x = Constants[RandomID][1].x() / 100;
		var y = Constants[RandomID][1].y() / 100;
		// --
		
		// Random axis (x or y) and gain (-1 or 1)
		var axis = Math.floor((Math.random() * 2) + 1);
		var gain = Math.floor((Math.random() * 2)) ? -1 : 1;
		
		if (axis == 1) { // axis : x
			if (Grid[x + gain][y] == 0) {
				MoveToGrid(Constants[RandomID][1], x + gain, y);

				Grid[x][y] = 0;				
				Grid[x + gain][y] = 1; 				
			}
		}
		
		else { // axis : y
			if (Grid[x][y + gain] == 0) {
				MoveToGrid(Constants[RandomID][1], x, y + gain);

				Grid[x][y] = 0;				
				Grid[x][y + gain] = 1; 				
			}	
		}
	}
	
	else { // "Real" component
		// Get x and y of this component
		var x = Components[RandomID][6].x() / 100;
		var y = Components[RandomID][6].y() / 100;
		// --
		
		// Random axis (x or y) and gain (-1 or 1)
		var axis = Math.floor((Math.random() * 2) + 1);
		var gain = Math.floor((Math.random() * 2)) ? -1 : 1;
		
		if (axis == 1) { // axis : x
			if (Grid[x + gain][y] == 0) {
				MoveToGrid(Components[RandomID][6], x + gain, y);

				Grid[x][y] = 0;				
				Grid[x + gain][y] = 1; 				
			}
		}
		
		else { // axis : y
			if (Grid[x][y + gain] == 0) {
				MoveToGrid(Components[RandomID][6], x, y + gain);

				Grid[x][y] = 0;				
				Grid[x][y + gain] = 1; 				
			}	
		}
	}
	
	return [RandomID, x, y, type];
}

function ReverseChange(ID, x, y, type) {
	if (type == 0) {
		Grid[Components[ID][6].x() / 100][Components[ID][6].y() / 100] = 0;
		Grid[x][y] = 1;
		MoveToGrid(Components[ID][6], x, y);
	}
	
	else {
		Grid[Constants[ID][1].x() / 100][Constants[ID][1].y() / 100] = 0;
		Grid[x][y] = 1;
		MoveToGrid(Constants[ID][1], x, y);	
	}
}

function CenterComponents() {
	var MaxLeft = 0;
	var MaxHeight = 0;
	
	var i = 0;
	
	var x = 0;
	var y = 0;
	
	for (i = 1; i <= Components[0]; i++) {
		if (i == 1) {
			MaxLeft = Components[i][6].x();
			MaxHeight = Components[i][6].y();
		}
		
		x = Components[i][6].x();
		y = Components[i][6].y();
		
		if (MaxLeft > x) {
			MaxLeft = x;
		}
		if (MaxHeight < y) {
			MaxHeight = y;
		}
	}
	
	for (i = 1; i <= Constants[0]; i++) {
		x = Constants[i][1].x();
		y = Constants[i][1].y();
		
		if (MaxLeft > x) {
			MaxLeft = x;
		}
		if (MaxHeight < y) {
			MaxHeight = y;
		}
	}
	
	x = x / 100;
	y = y / 100;

	for (i = 1; i <= Components[0]; i++) {
		MoveToGrid(Components[i][6], Components[i][6].x()/100 - x + 2, Components[i][6].y()/100 - y + 2);
	}
	
	for (i = 1; i <= Constants[0]; i++) {
		MoveToGrid(Constants[i][1], Constants[i][1].x()/100 - x + 2, Constants[i][1].y()/100 - y + 2);
	}
}

function PlaceCircuitName() { // Place the circuit name (i.e. 'counter_2bit') correctly (under the schematic).
	var i = 0;
	
	var max_left = 0;
	var max_right = 0;
	var max_height = 0;
	
	var resultx = 0;
	var resulty = 0;
	
	var Offset = +150;
	
	for (i = 1; i <= Components[0]; i++) { // Components (IO + Cells)
		if (i == 1) {
			max_left = Components[1][6].x();
			max_right = max_left;
			max_height = Components[1][6].y();
		}
		
		else {
			if (max_left > Components[i][6].x()) {
				max_left = Components[i][6].x();
			}
			
			if (max_right < Components[i][6].x()) {
				max_right = Components[i][6].x();
			}
			
			if (max_height < Components[i][6].y()) {
				max_height = Components[i][6].y();
			}
		}
	}
	
	for (i = 1; i <= Constants[0]; i++) { // Constants
		if (max_left > Constants[i][1].x()) {
			max_left = Constants[i][1].x();
		}
		
		if (max_right < Constants[i][1].x()) {
			max_right = Constants[i][1].x();
		}
		
		if (max_height < Constants[i][1].y()) {
			max_height = Constants[i][1].y();
		}
	}
	
	resultx = (max_right + max_left) / 2;
	resulty = max_height  + Offset;
	
	MoveGateXY(CircuitInfo[4], resultx, resulty);
	
	return 1;
}

function MoveGateXY(gate, x, y) {
	if (typeof gate == 'undefined' || typeof y == 'undefined' || typeof y == 'undefined') return -1;
	
	gate.x(x);
	gate.y(y);
	
	return 1;
}

function MoveToGrid(gate, x, y) {
	if (typeof gate == 'undefined' || typeof y == 'undefined' || typeof y == 'undefined') return -1;
	
	MoveGateXY(gate, x * 100, y * 100);
	
	return 1;
}
// --

// Wires
function GenerateAllWires(draw, Gate_Norme) { // This function generates wires between elements with the Netlist var. This function runs when a drag is one by the user.
	var i = 0, n = 0, k = 0, v = 0; // loops index
	
	var xa = 0, ya = 0, xb = 0, yb = 0; // Lines points.
	var Offset1 = 0, Offset2 = 0; // Points offset (see function GetOffset)

	// 1. Removing "old" wires
	for (i = 1; i <= Wires[0]; i++) {
		Wires[i].remove();
		WireLength[i] = 0;
	}
	
	Wires[0] = 0;

	// 2. Making new wires
	for (i = 1, n = 1; (n - v) <= NetList[0] && i <= 300; i++) {
	//for (i = 1, n = 1; (n - v) <= 300 && i < 300; i++) {
		if (typeof NetList[i] != 'undefined') {
			if (NetList[i][0] == 2) { // Only two components on the same line.
				Offset1 = GetOffset(Components[NetList[i][1][0]][1], NetList[i][1][1], Gate_Norme);
				Offset2 = GetOffset(Components[NetList[i][2][0]][1], NetList[i][2][1], Gate_Norme);

				xa = Components[NetList[i][1][0]][6].x() + Offset1[0];
				ya = Components[NetList[i][1][0]][6].y() + Offset1[1];
				xb = Components[NetList[i][2][0]][6].x() + Offset2[0];
				yb = Components[NetList[i][2][0]][6].y() + Offset2[1];
				
				Wires[n] = GenerateOneWire(xa, xb, ya, yb); // There is only two components so I only have to make a wire between the componant A and the componant B.
				WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
				
				Wires[0]++;
				n++;
			}
				
			else { // More than 2 components on the same line.
				// There is 3 mains cases :
				// Case 1 : One circuit input and the rest is circuit output / cell input
				// Case 2 : One circuit output and the rest is circuit output / cell input
				// Case 3 : One cell output and the rest is cell input
				
				// The first step is to count the number of each elements and then connect them.
				
				var input_circuit_number = 0;
				var output_circuit_number = 0;
				var output_cell_number = 0;
				
				var result = 0;
				
				var index1 = 0, index2 = 0, index3 = 0;
				
				var id1 = 0, id2 = 0;

				for (k = 1; k <= NetList[i][0]; k++) { // I count the number of circuit input, circuit output and cell output
					result = GetConnectionType(NetList[i][k][0]);
					if (result == 1) { // input circuit
						input_circuit_number++;
						index1 = k;
					}
					else if (result == 2) { // output circuit 
						output_circuit_number++;
						index2 = k;
					}
					else if (result == 3) { // output cell
						output_cell_number++;
						index3 = k;
					}
				}
				
				if (input_circuit_number >= 1) { // case 1
					for (var m = 1; m <= NetList[i][0]; m++) { // I connect the circuit input to the other elements
						if (m != index1) {
							id1 = NetList[i][m][0];
							id2 = NetList[i][index1][0];
							
							Offset1 = GetOffset(Components[id1][1], NetList[i][m][1], Gate_Norme);
							Offset2 = GetOffset(Components[id2][1], NetList[i][index1][1], Gate_Norme);
							
							xa = Components[id1][6].x() + Offset1[0];
							ya = Components[id1][6].y() + Offset1[1];

							xb = Components[id2][6].x() + Offset2[0];
							yb = Components[id2][6].y() + Offset2[1];
							
							Wires[n] = GenerateOneWire(xa, xb, ya, yb);
							WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
							
							Wires[0]++;
							n++;
							v++;
						}
					}
				}
				
				else if (output_circuit_number >= 1) { // case 2
					for (var m = 1; m <= NetList[i][0]; m++) { // I connect the circuit output to the other elements
						if (m != index2) {
							id1 = NetList[i][m][0];
							id2 = NetList[i][index2][0];
							
							Offset1 = GetOffset(Components[id1][1], NetList[i][m][1], Gate_Norme);
							Offset2 = GetOffset(Components[id2][1], NetList[i][index2][1], Gate_Norme);
							
							xa = Components[id1][6].x() + Offset1[0];
							ya = Components[id1][6].y() + Offset1[1];

							xb = Components[id2][6].x() + Offset2[0];
							yb = Components[id2][6].y() + Offset2[1];
							
							Wires[n] = GenerateOneWire(xa, xb, ya, yb);
							WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
							
							Wires[0]++;
							n++;
							v++;
						}
					}
				}
				
				else if (output_cell_number >= 1) { // case 3
					for (var m = 1; m <= NetList[i][0]; m++) { // I connect the cell output to the other elements
						if (m != index3) {
							id1 = NetList[i][m][0];
							id2 = NetList[i][index3][0];
							
							Offset1 = GetOffset(Components[id1][1], NetList[i][m][1], Gate_Norme);
							Offset2 = GetOffset(Components[id2][1], NetList[i][index3][1], Gate_Norme);
							
							xa = Components[id1][6].x() + Offset1[0];
							ya = Components[id1][6].y() + Offset1[1];

							xb = Components[id2][6].x() + Offset2[0];
							yb = Components[id2][6].y() + Offset2[1];
							
							Wires[n] = GenerateOneWire(xa, xb, ya, yb);
							WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
							
							Wires[0]++;
							n++;
							v++;
						}
					}
				}
				
				else { // Impossible case
					;
				}
			}
		}
	}

	// 3. Constants
	for (i = 1; i <= Constants[0]; i++) {
		Offset1 = GetOffset(0, 0);
		Offset2 = GetOffset(Components[Constants[i][2]][1], Constants[i][3]);

		xa = Constants[i][1].x() + Offset1[0];
		ya = Constants[i][1].y() + Offset1[1];
		
		xb = Components[Constants[i][2]][6].x() + Offset2[0];
		yb = Components[Constants[i][2]][6].y() + Offset2[1];
		
		Wires[n] = GenerateOneWire(xa, xb, ya, yb); // There is only two components so I only have to make a wire between the componant A and the componant B.
		WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
		
		n++;
		Wires[0]++;
	}
	
	// 4. Add wires to the pannable and zoomable group
	for (i = 1; i <= Wires[0]; i++) {
		nodes.add(Wires[i]);
	}
}

function GenerateOneWire(xa, xb, ya, yb) {
	var wire = 0;
	
	wire = draw.line(xa, ya, xb, yb).stroke({ width: 1 });
	
	return wire;
}	

function RemoveAllWires() {
	var i = 0;
	
	for (i = 1; i <= Wires[0]; i++)
		Wires[i].remove();
	
	Wires[0] = 0;
}

function GetWiresLength() {
	var i = 0;
	var TotalLength = 0;
	
		
	for (i = 1; i <= Wires[0]; i++)
		TotalLength += WireLength[i];
	
	return TotalLength;
}

function GetOffset(Gate_Type, IO_Name, Gate_Norme) { // Get the offset for the connection point
	var Varx = 0, Vary = 0;

	if (typeof Gate_Norme == 'undefined')
		Gate_Norme = 0;
	
	switch (Gate_Type) {
		case 0: // Input
			Varx = 90;
			Vary = 50;
		break;
		case 1: // Output
			Varx = 11;
			Vary = 50;
		break;
		case 2: // Buf
			if (Gate_Norme == 0) {
				if (IO_Name === 'A') {
					Varx = 24;
					Vary = 50;
				}
				else {
					Varx = 74;
					Vary = 50;	
				}
			}
			else if (Gate_Norme == 1) {
				if (IO_Name === 'A') {
					Varx = 11;
					Vary = 50;
				}
				else {
					Varx = 90;
					Vary = 50;	
				}
			}
		break;
		case 3: // Not
			if (Gate_Norme == 0) {
				if (IO_Name === 'A') {
					Varx = 24;
					Vary = 50;
				}
				else {
					Varx = 79;
					Vary = 50;	
				}
			}
			else if (Gate_Norme == 1) {
				if (IO_Name === 'A') {
					Varx = 11;
					Vary = 50;
				}
				else {
					Varx = 90;
					Vary = 50;	
				}
			}
		break;
		case 4: // And
			if (Gate_Norme == 0) {
				if (IO_Name === 'A') {
					Varx = 17;
					Vary = 35;
				}
				else if (IO_Name === 'B') {
					Varx = 17;
					Vary = 65;	
				}
				else {
					Varx = 83;
					Vary = 50;	
				}
			}
			else if (Gate_Norme == 1) {
				if (IO_Name === 'A') {
					Varx = 11;
					Vary = 34;
				}
				else if (IO_Name === 'B') {
					Varx = 11;
					Vary = 66;	
				}
				else {
					Varx = 90;
					Vary = 50;	
				}
			}
		break;
		case 5: // OR
			if (Gate_Norme == 0) {
				if (IO_Name === 'A') {
					Varx = 17;
					Vary = 34;
				}
				else if (IO_Name === 'B') {
					Varx = 17;
					Vary = 66;	
				}
				else {
					Varx = 84;
					Vary = 50;	
				}
			}
			else if (Gate_Norme == 1) {
				if (IO_Name === 'A') {
					Varx = 11;
					Vary = 34;
				}
				else if (IO_Name === 'B') {
					Varx = 11;
					Vary = 66;	
				}
				else {
					Varx = 90;
					Vary = 50;	
				}
			}
		break;
		case 6: // XOR
			if (Gate_Norme == 0) {
				if (IO_Name === 'A') {
					Varx = 10;
					Vary = 34;
				}
				else if (IO_Name === 'B') {
					Varx = 10;
					Vary = 66;	
				}
				else {
					Varx = 82;
					Vary = 50;	
				}
			}
			else if (Gate_Norme == 1) {
				if (IO_Name === 'A') {
					Varx = 11;
					Vary = 34;
				}
				else if (IO_Name === 'B') {
					Varx = 11;
					Vary = 66;	
				}
				else {
					Varx = 90;
					Vary = 50;	
				}
			}
		break;
		case 7: // DFF_P
			if (IO_Name === 'C') { // clock
				Varx = 10;
				Vary = 65;
			}
			else if (IO_Name === 'D') { // D
				Varx = 10;
				Vary = 20;	
			}
			else { // Q
				Varx = 90;
				Vary = 20;	
			}
		break;
		case 8: // MUX
			if (IO_Name === 'A') { // A
				Varx = 25;
				Vary = 35;
			}
			else if (IO_Name === 'B') { // B
				Varx = 25;
				Vary = 60;	
			}
			else if (IO_Name === 'Y') { // Y
				Varx = 76;
				Vary = 47.5;	
			}
			else { // S
				Varx = 50;
				Vary = 90;	
			}
		break;
		default:
			Varx = 0;
			Vary = 0;
		break;
	}

	return [Varx, Vary];
}

function GetConnectionType(Component_ID) {
	var type = 0, k = 0;
	
	if (Components[Component_ID][1] == 0 || Components[Component_ID][1] == 1) { // Is it an input / output ?
		type = (Components[Component_ID][1] == 0) ? 1 : 2;
	}
	
	else // Else it's a cell.
		type = 3;
		
	return type;
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
	close.textContent = "✖";
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
// --

// Other
function isArray(obj) { // 1000 thanks to http://blog.caplin.com/2012/01/13/javascript-is-hard-part-1-you-cant-trust-arrays/
	return Object.prototype.toString.apply(obj) === "[object Array]";
}

function log(str) {
	document.getElementById('console').value = document.getElementById('console').value + (str + '\n');

	var textarea = document.getElementById('console');
	textarea.scrollTop = textarea.scrollHeight;
}
// --
