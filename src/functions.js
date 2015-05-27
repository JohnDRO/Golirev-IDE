﻿/*
 * Golirev : function.js
 * Details : Contains functions used in this project.
 *
*/

// Initial configuration
function Init() {
	// Init CircuitInfo
	this.CircuitInfo[0] = 0;
	this.CircuitInfo[1] = 0;
	this.CircuitInfo[2] = "Default Name"
	this.CircuitInfo[3] = "Default Creator"
	if (typeof this.CircuitInfo[4] != 'undefined')
		this.CircuitInfo[4].remove();
	// --
	
	RemoveAllGates.call(this);
	RemoveAllWires.call(this);
	
	// Remove Netlist
	for (i = 1, n = 1; n <= this.NetList[0]; i++) {
		if (typeof this.NetList[i] != 'undefined') {
			delete this.NetList[i];
			n++;
		}
	} 
	// --
	
	// Remove Constants
	for (i = 1; i <= this.Constants[0]; i++) {
		this.Constants[i][1].remove();
	}
	// --
	
	// Reset vars
	this.Components[0] = 0; // Init components to 0
	this.NetList[0] = 0; // Init links to 0
	this.Constants[0] = 0;
	// --
	
	return 1;
}
// --

// Objects
function Golirev(svg_id, sizeX, sizeY) {
	// Check that sizeX and sizeY are not undefined
	if (typeof sizeX === 'undefined') sizeX = '100%';
	if (typeof sizeY === 'undefined') sizeY = '100%';
	
	// Set div size to sizeX and sizeY
	document.getElementById(svg_id).setAttribute('style', 'border: 2px solid #ccc; border-radius: 4px; width:' + sizeX + '; height:' + sizeY);
	
	// SVG Init
	this.svgjs = SVG(svg_id).attr({ 'font-size': 10 }).fill('#f06').size('100%', '100%');
	// --
	
	// Init variables
	this.gate_type = 0;
	
	this.CircuitInfo = new Array(); // Informations concerning the circuits
	/*
	Details about Circuit Info
	CircuitInfo[0] = rect x of the svg element
	CircuitInfo[1] = rect y of the svg element
	CircuitInfo[2] = name of the circuit
	CircuitInfo[3] = "Creator"
	CircuitInfo[4] = Text svg element.
	*/

	this.Components = new Array(); // variable globale
	/*
	Details about Components
	Components[0] = Number of components;
	Components[Components[0]][0] = Label of component number Components[0]
	Components[Components[0]][1] = Type of component number Components[0]
	Components[Components[0]][2] = Hide Label ?
	Components[Components[0]][3] = Parameters
	Components[Components[0]][4] = Attributes
	Components[Components[0]][5] = Connections
	Components[Components[0]][6] = Svg element
	*/

	this.NetList = new Array();
	/*
	Details about NetList
	NetList[0] = Number of connections;
	NetList[n][0] = Number of elements on that connection;
	NetList[n][1] = Array (First Object)
			[n][1][0] = ID on the component var;
			[n][1][1] = Name of the Output;
			[n][1][2] = OffsetX;
			[n][1][3] = OffsetY;
	NetList[n][2] = Array (Second Object)
	NetList[n][y] = Array (ynd Object)
	*/

	this.Constants = new Array();
	/*
	Details about Constants
	Constants[0] - Number of constants
	Constants[n][0] = valeur
	Constants[n][1] = elem svg
	Constants[n][2] = id du composant
	Constants[n][3] = nom de la porte (A/B/Y/S/..)
	*/

	this.Wires = new Array();
	this.Wires[0] = 0;

	this.WireLength = new Array();

	this.Grid = new Array();
	var a, b;
	for (a = -500; a < 500; a++) {
		this.Grid[a] = new Array();
			for (b = -500; b < 500; b++) {
				this.Grid[a][b] = 0;
		}
	}
	// --
	
	// Methods
	this.DisplayJson = ShowJSON;
	this.ParseJSON = ParseJson;
	this.UpdateGate = UpdateGate;
	// --
}

function ShowJSON(json_object, gate_type) {
	this.gate_type = gate_type;
	
	ParseJson.call(this, json_object);
	
	// Pan + zoom init
	this.nodes = this.svgjs.group();
	this.nodes.panZoom();
	// --
	
	GenerateAllGates.call(this);
	SimulatedAnnealing.call(this);
	CenterComponents.call(this);
	GenerateAllWires.call(this);
	PlaceCircuitName.call(this);
}

function UpdateGate(gate_type) {
	 this.gate_type = gate_type;
	 
	 UpdateGateType.call(this);
	 GenerateAllWires.call(this);
	 PlaceCircuitName.call(this);
}
// --

// Yosys and JSON related
function ParseJson(json_yosysJS) { // Read the JSON file produced by yosysJS and then parse it and set CircuitInfo, Components, Netlist and Constants
	// Définition et initialisation des variables
	var Circuit_Name; // circuits related variables
	
	var io_names, cells_name;
	
	var i = 0, n = 0, k = 0, l = 0; // loops counters
	var nbr_local_cste = 0, local_value = '';
	// ---

	Init.call(this);
	
	Circuit_Name = Object.keys(json_yosysJS.modules); // example : 'up3down5', 'DCF77_CIRCUIT', '4 BIT COUNTER', ..
	
	// read I/O (A, B, clk, reset, ..)
	io_names = Object.keys(json_yosysJS.modules[Circuit_Name].ports);
	
	for (i in io_names) {
		this.Components[0]++;
		this.Components[this.Components[0]] = new Array();
		
		// Component related : done
		this.Components[this.Components[0]][0] = io_names[i]; // label
		this.Components[this.Components[0]][1] = (json_yosysJS.modules[Circuit_Name].ports[io_names[i]].direction === 'input') ? 0 : 1;
		this.Components[this.Components[0]][2] = 1; // Show label of I/O by default
		// --
		
		// Netlist related : todo
		// json_yosysJS.modules[Circuit_Name].ports[io_names[i]].bits
		
		var meh2 = json_yosysJS.modules[Circuit_Name].ports[io_names[i]].bits;
		
		for (l = 0, nbr_local_cste = 0, local_value = '"'; l < meh2.length; l++) { // I count the number of constants and I add the value to local_value
			if (typeof meh2[l] == 'string') {
				nbr_local_cste++;
				local_value += meh2[l];
			}
			
			else 
				local_value += 'X'
		}
		
		local_value += '"';
		
		if (nbr_local_cste) { // Let's add constants
			this.Constants[0]++;
			this.Constants[this.Constants[0]] = new Array();
			this.Constants[this.Constants[0]][0] = local_value; // Value
			this.Constants[this.Constants[0]][2] = 1 + parseInt(i); // Component id
			this.Constants[this.Constants[0]][3] = 0; // Name of the gate
		}

		for (l = 0; l < meh2.length; l++) { // bus loop
			if (typeof meh2[l] !== 'string') { // If it is not a constant
				if (typeof this.NetList[meh2[l]] === 'undefined') {
					this.NetList[meh2[l]] = new Array();
					this.NetList[meh2[l]][0] = 1;
					
					this.NetList[meh2[l]][1] = new Array();
					this.NetList[meh2[l]][1][0] = 1 + parseInt(i);
					this.NetList[meh2[l]][1][1] = 0;
					
					this.NetList[meh2[l]][1][2] = 0; // x
					this.NetList[meh2[l]][1][3] = 0; // y
					this.NetList[0]++;
				}
				
				else {
					this.NetList[meh2[l]][0]++;
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]] = new Array();
					
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][0] = 1 + parseInt(i);
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][1] = 0;
					
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][2] = 0; // x
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][3] = 0; // y
				}
			}
		}
		// --
	}
	// ---

	// read cells (NOT, AND, OR, ..)
	cells_name = Object.keys(json_yosysJS.modules[Circuit_Name].cells);
	
	for (n in cells_name) {
		this.Components[0]++;
		this.Components[this.Components[0]] = new Array();
		
		// Component related : ok
		this.Components[this.Components[0]][0] = cells_name[n]; // label
		this.Components[this.Components[0]][1] = GateToEqNumber(json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].type);
		this.Components[this.Components[0]][2] = json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].hide_name;
		// --
		// Netlist related : ok
		cell_io_name = Object.keys(json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].connections);
		var meh = 0;
		for (k in cell_io_name) {
			meh = json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].connections[cell_io_name[k]];
			//document.write('<br /> -- ' + meh[0] + '<br />');
			//document.write('<hr>' + typeof meh[0] + '<hr>');
			if (typeof meh[0] === 'string') { // is it a constant ?
				this.Constants[0]++;
				this.Constants[this.Constants[0]] = new Array();
				this.Constants[this.Constants[0]][0] = meh[0]; // Value
				this.Constants[this.Constants[0]][2] = 2 + parseInt(i) + parseInt(n); // Component id
				this.Constants[this.Constants[0]][3] = cell_io_name[k]; // Name of the gate
			}
			
			else if (!isArray(this.NetList[meh])) {
				this.NetList[meh] = new Array();
				this.NetList[meh][0] = 1;
				this.NetList[meh][1] = new Array();
				this.NetList[meh][1][0] = parseInt(i) + parseInt(n) + 2;
				this.NetList[meh][1][1] = cell_io_name[k];
				
				this.NetList[meh][1][2] = 0; // x
				this.NetList[meh][1][3] = 0; // y
				this.NetList[0]++;
			}
		
			else  {
				this.NetList[meh][0]++;
				this.NetList[meh][this.NetList[meh][0]] = new Array();
				this.NetList[meh][this.NetList[meh][0]][0] = parseInt(n) + parseInt(i) + 2;
				this.NetList[meh][this.NetList[meh][0]][1] = cell_io_name[k];
				
				this.NetList[meh][this.NetList[meh][0]][2] = 0; // x
				this.NetList[meh][this.NetList[meh][0]][3] = 0; // y
			}							
		}
	}
	// ---
	
	this.CircuitInfo[2] = String(Circuit_Name);
	this.CircuitInfo[3] = json_yosysJS.creator;
	
	//document.write('Nbr ' + Constants[0]);
	
	return 1;
}
// --

// Components
function GenerateAllGates() {
	var i = 0;
	
	RemoveAllGates.call(this);
	
	for (i = 1; i <= this.Components[0]; i++) // IO + Cells
		this.Components[i][6] = GenerateGate.call(this, this.Components[i][1], this.Components[i][0], this.Components[i][2]);
	
	for (i = 1; i <= this.Constants[0]; i++) { // Constants
		this.Constants[i][1] = GenerateGate.call(this, 0, this.Constants[i][0], 0);
	}

	this.CircuitInfo[4] = this.svgjs.text('Circuit : ' + this.CircuitInfo[2]).draggable(function(x, y) { return { x: x < 1000, y: y < 500 } }).fill('#000').stroke({ width: 0.1 }).center(100, 100);
	this.nodes.add(this.CircuitInfo[4]); // Circuit name is in the spannable and zoomable
}

function GenerateGate(Gate_Type, Label, hide_label) { // Generate a gate and return the svgjs element created.
	var group = this.svgjs.group(), text, text1, text2, text3, text4, longeur = 0, rect;
	var MAXX = 5000, MAXY = 5000;
	
	if (Gate_Type < 0 || Gate_Type > 13) // 0 == INPUT, 1 == OUTPUT, 2 == BUF, 3 == NOT, 4 == AND, 5 == OR, 6 == XOR, 7 == DFF_P, 8 == MUX, 9 == DFF_N, 10 == DFF_NNX, 11 == DFF_NPX, 12 == DFF_PNX, 13 == DFF_PPX
		return -1;
	
	if (typeof Label == 'undefined')
		Label = 'Default gate name';
		
	if (typeof this.gate_type == 'undefined')
		this.gate_type = 0; // Distinctive shape by default 
	
	var obj = this;

	switch(Gate_Type) {
		case 0: // Input
			rect = this.svgjs.rect(60, 10).center(50, 50);
			text = this.svgjs.plain(Label).x(20).y(25).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m 80,50 10,0');
			
			group.add(rect);
			group.add(text);
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
		break;
		case 1: // Output
			rect = this.svgjs.rect(60, 10).center(50, 50);
			text = this.svgjs.plain(Label).x(20).y(25).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m 11,50 10,0');
			
			group.add(rect);	
			group.add(text);
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
		break;
		case 2: // YES
			if (this.gate_type == 0) {
			
				group.path('m 32,24 -31,-15 0,30 z').center(50, 50);
				group.path('m 18,50 16,0');
				group.path('m 65,50 16,0');
			
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 25).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (this.gate_type == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 80,50 10,0');
				group.path('m 11,50 10,0');
				
				text1 = this.svgjs.plain('1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
		break;
		case 3: // NOT
			if (this.gate_type == 0) {
				group.path('m 32,24 -31,-15 0,30 z').center(50, 50);
				
				group.path('m 24,50 10,0');
				group.path('m 68,50 10,0');
				group.circle(7).center(68, 50);
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 25).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (this.gate_type == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 80,50 10,0');
				group.path('m 11,50 10,0');
				group.path('m 80,40 10,10');
				
				text1 = this.svgjs.plain('1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
			
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
		break;			
		case 4: // AND
			if (this.gate_type == 0) {
				group.path('m 0,1 24,0 a 23,23 0 0 1 0,46 l -24,0 z').center(50, 50);
				group.path('m 17,35 10,0');
				group.path('m 73,50 10,0');
				group.path('m 17,65 10,0');
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 15).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (this.gate_type == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 11,34 10,0');
				group.path('m 80,50 10,0');
				group.path('m 11,66 10,0');
				
				text1 = this.svgjs.plain('&').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}		
		break;		
		case 5: // OR
			if (this.gate_type == 0) {
				group.path('m -3.5,1 19.5,0 a 40,46 0 0 1 32,23 a 40,46 0 0 1 -32,23 l -19.5,0 a 40,40 0 0 0 0,-46 z').center(50, 50);
				group.path('m 17,34 10,0');
				group.path('m 74,50 10,0');
				group.path('m 17,66 10,0');
			
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 15).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (this.gate_type == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 11,34 10,0');
				group.path('m 80,50 10,0');
				group.path('m 11,66 10,0');
				
				text1 = this.svgjs.plain('≥1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(150, 150).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 6: // XOR
			if (this.gate_type == 0) {
				group.path('m 2.5,1 13.5,0 a 40,46 0 0 1 32,23 a 40,46 0 0 1 -32,23 l -13.5,0 a 40,40 0 0 0 0,-46 z').center(50, 50);
				group.path('m -3.5,1 a 40,40 0 0 1 0,46').center(20, 50);
				group.path('m 10,34 10,0');
				group.path('m 72,50 10,0');
				group.path('m 10,66 10,0');
			
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 15).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			else if (this.gate_type == 1) {
				group.rect(60, 60).center(50, 50);
				group.path('m 11,34 10,0');
				group.path('m 80,50 10,0');
				group.path('m 11,66 10,0');
				
				text1 = this.svgjs.plain('=1').center(17, 17).stroke({ width: 0.1 }).fill('#000').scale(3); 
				group.add(text1);
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 10).stroke({ width: 0.1 }).fill('#000');
					group.add(text);
				}
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 7: // DFF_P
			if (this.gate_type == 0 || this.gate_type == 1) {
				text1 = this.svgjs.plain('D').center(30, 20).stroke({ width: 0.1 }).fill('#000'); 
				text2 = this.svgjs.plain('Q').center(70, 20).stroke({ width: 0.1 }).fill('#000'); 
				text3 = this.svgjs.plain('CLK').center(40, 65).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80).center(50, 50); // The main rect
				group.path('m 10,20 10,0'); // symboles de connections (D)
				group.path('m 10,65 10,0'); // (clk)
				group.path('m 80,20 10,0'); // (Q)
				group.path('M15,0 15,20 L22.5,10 Z').center(24, 65); // clk 
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 3).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
				
				group.add(text1);
				group.add(text2);
				group.add(text3);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 8: // MUX
			if (this.gate_type == 0 || this.gate_type == 1) {
				text1 = this.svgjs.plain('A').center(45, 35).stroke({ width: 0.1 }).fill('#000'); 
				text2 = this.svgjs.plain('Y').center(60, 47.5).stroke({ width: 0.1 }).fill('#000'); 
				text3 = this.svgjs.plain('B').center(45, 60).stroke({ width: 0.1 }).fill('#000'); 
				text4 = this.svgjs.plain('S').center(52, 70).stroke({ width: 0.1 }).fill('#000'); 
				
				group.path('M 0 0 L 30 20 L 30 60 L 0 80 L 0 0Z').center(50, 50);
				group.path('m 25,35 10,0'); // symboles de connections (A)
				group.path('m 25,60 10,0'); // (B)
				group.path('m 66,47.5 10,0'); // (Y)
				group.path('m 50,80 0,10'); // (S)
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 0).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
			
				group.add(text1);
				group.add(text2);
				group.add(text3);
				group.add(text4);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 9: // DFF_N
			if (this.gate_type == 0 || this.gate_type == 1) {
				text1 = this.svgjs.plain('D').center(30, 20).stroke({ width: 0.1 }).fill('#000'); 
				text2 = this.svgjs.plain('Q').center(70, 20).stroke({ width: 0.1 }).fill('#000'); 
				text3 = this.svgjs.plain('CLK').center(40, 65).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80).center(50, 50); // The main rect
				group.path('m 10,20 10,0'); // symboles de connections (D)
				group.path('m 10,65 10,0'); // (clk)
				group.path('m 80,20 10,0'); // (Q)
				group.circle(7).center(16, 65);
				group.path('M15,0 15,20 L22.5,10 Z').center(24, 65); // clk
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 3).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
				
				group.add(text1);
				group.add(text2);
				group.add(text3);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 10: // DFF_NNX
			if (this.gate_type == 0 || this.gate_type == 1) {
				text1 = this.svgjs.plain('D').center(30, 20).stroke({ width: 0.1 }).fill('#000'); 
				text2 = this.svgjs.plain('Q').center(70, 20).stroke({ width: 0.1 }).fill('#000'); 
				text3 = this.svgjs.plain('CLK').center(40, 65).stroke({ width: 0.1 }).fill('#000'); 
				text4 = this.svgjs.plain('RST').center(40, 80).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80).center(50, 50); // The main rect
				group.path('m 10,20 10,0'); // symboles de connections (D)
				group.path('m 10,65 10,0'); // (clk)
				group.path('m 10,80 10,0'); // (RST)
				group.path('m 80,20 10,0'); // (Q)
				group.circle(7).center(16, 65); // clk
				group.circle(7).center(16, 80); // RST
				group.path('M15,0 15,20 L22.5,10 Z').center(24, 65); // clk
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 3).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
				
				group.add(text1);
				group.add(text2);
				group.add(text3);
				group.add(text4);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 11: // DFF_NPX
			if (this.gate_type == 0 || this.gate_type == 1) {
				text1 = this.svgjs.plain('D').center(30, 20).stroke({ width: 0.1 }).fill('#000'); 
				text2 = this.svgjs.plain('Q').center(70, 20).stroke({ width: 0.1 }).fill('#000'); 
				text3 = this.svgjs.plain('CLK').center(40, 65).stroke({ width: 0.1 }).fill('#000'); 
				text4 = this.svgjs.plain('RST').center(40, 80).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80).center(50, 50); // The main rect
				group.path('m 10,20 10,0'); // symboles de connections (D)
				group.path('m 10,65 10,0'); // (clk)
				group.path('m 10,80 10,0'); // (RST)
				group.path('m 80,20 10,0'); // (Q)
				group.circle(7).center(16, 65); // clk
				group.path('M15,0 15,20 L22.5,10 Z').center(24, 65); // clk
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 3).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
				
				group.add(text1);
				group.add(text2);
				group.add(text3);
				group.add(text4);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 12: // DFF_PNX
			if (this.gate_type == 0 || this.gate_type == 1) {
				text1 = this.svgjs.plain('D').center(30, 20).stroke({ width: 0.1 }).fill('#000'); 
				text2 = this.svgjs.plain('Q').center(70, 20).stroke({ width: 0.1 }).fill('#000'); 
				text3 = this.svgjs.plain('CLK').center(40, 65).stroke({ width: 0.1 }).fill('#000'); 
				text4 = this.svgjs.plain('RST').center(40, 80).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80).center(50, 50); // The main rect
				group.path('m 10,20 10,0'); // symboles de connections (D)
				group.path('m 10,65 10,0'); // (clk)
				group.path('m 10,80 10,0'); // (RST)
				group.path('m 80,20 10,0'); // (Q)
				group.circle(7).center(16, 80); // RST
				group.path('M15,0 15,20 L22.5,10 Z').center(24, 65); // clk
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 3).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
				
				group.add(text1);
				group.add(text2);
				group.add(text3);
				group.add(text4);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		case 13: // DFF_PPX
			if (this.gate_type == 0 || this.gate_type == 1) {
				text1 = this.svgjs.plain('D').center(30, 20).stroke({ width: 0.1 }).fill('#000'); 
				text2 = this.svgjs.plain('Q').center(70, 20).stroke({ width: 0.1 }).fill('#000'); 
				text3 = this.svgjs.plain('CLK').center(40, 65).stroke({ width: 0.1 }).fill('#000'); 
				text4 = this.svgjs.plain('RST').center(40, 80).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80).center(50, 50); // The main rect
				group.path('m 10,20 10,0'); // symboles de connections (D)
				group.path('m 10,65 10,0'); // (clk)
				group.path('m 10,80 10,0'); // (RST)
				group.path('m 80,20 10,0'); // (Q)
				group.path('M15,0 15,20 L22.5,10 Z').center(24, 65); // clk
				
				if(!hide_label) {
					text = this.svgjs.plain(Label).center(50, 3).stroke({ width: 0.1 }).fill('#000'); 
					group.add(text);
				}
				
				group.add(text1);
				group.add(text2);
				group.add(text3);
				group.add(text4);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable(function(x, y) { return { x: x < MAXX, y: y < MAXY } })
		
			group.dragmove = function() {
				GenerateAllWires.call(obj);
			}
			
		break;
		default: // Error
			return -1;
		break;
	} 
	
	group.style('cursor', 'move'); // Change the cursor style
	
	this.nodes.add(group); // Span and zoom
	
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
		case '$_DFF_N_':
			GateNumber = 9;
		break;
		case '$_DFF_NN0_':
			GateNumber = 10;
		break;
		case '$_DFF_NN1_':
			GateNumber = 10;
		break;
		case '$_DFF_NP0_':
			GateNumber = 11;
		break;
		case '$_DFF_NP1_':
			GateNumber = 11;
		break;
		case '$_DFF_PN0_':
			GateNumber = 12;
		break;
		case '$_DFF_PN1_':
			GateNumber = 12;
		break;
		case '$_DFF_PP0_':
			GateNumber = 13;
		break;
		case '$_DFF_PP1_':
			GateNumber = 13;
		break;
		/*
		case '$_DLATCH_P_':
			GateNumber = 9;
		break;
		*/
	}
	
	return GateNumber;
}

function RemoveAllGates() {
	var i = 0;
	
	for (i = 1; i <= this.Components[0]; i++) { // Remove componants
		if (typeof this.Components[i][6] != 'undefined')
			this.Components[i][6] = this.Components[i][6].remove();
	}


}

function UpdateGateType() { // Update SVG components (i.e. : Distinctive shape to rectangular shape).
	var i = 0;
	
	var x = 0;
	var y = 0;
	
	for (i = 1; i <= this.Components[0]; i++) {
		// Save coords
		x = this.Components[i][6].x() / 100;
		y = this.Components[i][6].y() / 100;
		
		// Remove the SVG component and then remake it.
		this.Components[i][6].remove();
		this.Components[i][6] = GenerateGate.call(this, this.Components[i][1], this.Components[i][0], this.Components[i][2]);
	
		// Replace the component
		MoveToGrid(this.Components[i][6], x, y);
	}
	
	RemoveAllWires.call(this);
}
// --

// Placement
function SimulatedAnnealing() { // http://www.codeproject.com/Articles/13789/Simulated-Annealing-Example-in-C
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
	for (i = 1; i <= this.Components[0]; i++) {
		this.Grid[5][i] = 1;
		MoveToGrid(this.Components[i][6], 5, i);
	}
	
	for (i, n = 1; n <= this.Constants[0]; i++, n++) {
		this.Grid[5][i] = 1;
		MoveToGrid(this.Constants[n][1], 5, i);
	}
	
	GenerateAllWires.call(this);
	
    var distance = GetWiresLength.call(this);

    // While the temperature did not reach epsilon
    while (temperature > epsilon) {
        iteration++;
		// Make a random change
        Arr = RandomChange.call(this);
		GenerateAllWires.call(this);
		
		// Get the new delta
        delta = GetWiresLength.call(this) - distance;
		
        if(delta < 0)
            distance = delta + distance;
        
		else {
            proba = Math.random();

            if(proba < Math.exp(-delta/temperature))
                distance = delta + distance;
			
			else 
				ReverseChange.call(this, Arr[0], Arr[1], Arr[2], Arr[3]);
        }
        
		// Cooling process on every iteration
        temperature *= alpha;
    }
	
}

function RandomChange() { // Make a random change, must return ID_Compo, x and y.
	// Random component ID
	var RandomID = Math.floor((Math.random() * (this.Components[0] + this.Constants[0]) + 1)); 

	var type = 0;
	
	if (RandomID > this.Components[0]) { // Constant
		type = 1;
		RandomID = RandomID - this.Components[0];
		
		// Get x and y of this component
		var x = this.Constants[RandomID][1].x() / 100;
		var y = this.Constants[RandomID][1].y() / 100;
		// --
		
		// Random axis (x or y) and gain (-1 or 1)
		var axis = Math.floor((Math.random() * 2) + 1);
		var gain = Math.floor((Math.random() * 2)) ? -1 : 1;
		
		if (axis == 1) { // axis : x
			if (this.Grid[x + gain][y] == 0) {
				MoveToGrid(this.Constants[RandomID][1], x + gain, y);

				this.Grid[x][y] = 0;				
				this.Grid[x + gain][y] = 1; 				
			}
		}
		
		else { // axis : y
			if (this.Grid[x][y + gain] == 0) {
				MoveToGrid(this.Constants[RandomID][1], x, y + gain);

				this.Grid[x][y] = 0;				
				this.Grid[x][y + gain] = 1; 				
			}	
		}
	}
	
	else { // "Real" component
		// Get x and y of this component
		var x = this.Components[RandomID][6].x() / 100;
		var y = this.Components[RandomID][6].y() / 100;
		// --
		
		// Random axis (x or y) and gain (-1 or 1)
		var axis = Math.floor((Math.random() * 2) + 1);
		var gain = Math.floor((Math.random() * 2)) ? -1 : 1;
		
		if (axis == 1) { // axis : x
			if (this.Grid[x + gain][y] == 0) {
				MoveToGrid(this.Components[RandomID][6], x + gain, y);

				this.Grid[x][y] = 0;				
				this.Grid[x + gain][y] = 1; 				
			}
		}
		
		else { // axis : y
			if (this.Grid[x][y + gain] == 0) {
				MoveToGrid(this.Components[RandomID][6], x, y + gain);

				this.Grid[x][y] = 0;				
				this.Grid[x][y + gain] = 1; 				
			}	
		}
	}
	
	return [RandomID, x, y, type];
}

function ReverseChange(ID, x, y, type) {
	if (type == 0) {
		this.Grid[this.Components[ID][6].x() / 100][this.Components[ID][6].y() / 100] = 0;
		this.Grid[x][y] = 1;
		MoveToGrid(this.Components[ID][6], x, y);
	}
	
	else {
		this.Grid[this.Constants[ID][1].x() / 100][this.Constants[ID][1].y() / 100] = 0;
		this.Grid[x][y] = 1;
		MoveToGrid(this.Constants[ID][1], x, y);	
	}
}

function CenterComponents() {
	var MaxLeft = 0;
	var MaxHeight = 0;
	
	var i = 0;
	
	var x = 0;
	var y = 0;
	
	for (i = 1; i <= this.Components[0]; i++) {
		if (i == 1) {
			MaxLeft = this.Components[i][6].x();
			MaxHeight = this.Components[i][6].y();
		}
		
		x = this.Components[i][6].x();
		y = this.Components[i][6].y();
		
		if (MaxLeft > x) {
			MaxLeft = x;
		}
		if (MaxHeight < y) {
			MaxHeight = y;
		}
	}
	
	for (i = 1; i <= this.Constants[0]; i++) {
		x = this.Constants[i][1].x();
		y = this.Constants[i][1].y();
		
		if (MaxLeft > x) {
			MaxLeft = x;
		}
		if (MaxHeight < y) {
			MaxHeight = y;
		}
	}
	
	x = x / 100;
	y = y / 100;

	for (i = 1; i <= this.Components[0]; i++) {
		MoveToGrid(this.Components[i][6], this.Components[i][6].x()/100 - x + 1, this.Components[i][6].y()/100 - y + 1);
	}
	
	for (i = 1; i <= this.Constants[0]; i++) {
		MoveToGrid(this.Constants[i][1], this.Constants[i][1].x()/100 - x + 2, this.Constants[i][1].y()/100 - y + 2);
	}
}

function PlaceCircuitName() { // Place the circuit name (i.e. 'counter_2bit') correctly (under the schematic).
	var i = 0;
	
	var max_left = 0;
	var max_right = 0;
	var max_height = 0;
	
	var resultx = 0;
	var resulty = 0;
	
	var Offset = +100;
	
	for (i = 1; i <= this.Components[0]; i++) { // this.Components (IO + Cells)
		if (i == 1) {
			max_left = this.Components[1][6].x();
			max_right = max_left;
			max_height = this.Components[1][6].y();
		}
		
		else {
			if (max_left > this.Components[i][6].x()) {
				max_left = this.Components[i][6].x();
			}
			
			if (max_right < this.Components[i][6].x()) {
				max_right = this.Components[i][6].x();
			}
			
			if (max_height < this.Components[i][6].y()) {
				max_height = this.Components[i][6].y();
			}
		}
	}
	
	for (i = 1; i <= this.Constants[0]; i++) { // Constants
		if (max_left > this.Constants[i][1].x()) {
			max_left = this.Constants[i][1].x();
		}
		
		if (max_right < this.Constants[i][1].x()) {
			max_right = this.Constants[i][1].x();
		}
		
		if (max_height < this.Constants[i][1].y()) {
			max_height = this.Constants[i][1].y();
		}
	}
	
	resultx = (max_right + max_left) / 2;
	resulty = max_height + Offset;
	
	MoveGateXY(this.CircuitInfo[4], resultx, resulty);
	
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
function GenerateAllWires() { // This function generates wires between elements with the Netlist var. This function runs when a drag is one by the user.
	var i = 0, n = 0, k = 0, v = 0; // loops index
	
	var xa = 0, ya = 0, xb = 0, yb = 0; // Lines points.
	var Offset1 = 0, Offset2 = 0; // Points offset (see function GetOffset)

	// 1. Removing "old" wires
	for (i = 1; i <= this.Wires[0]; i++) {
		this.Wires[i].remove();
		this.WireLength[i] = 0;
	}
	
	this.Wires[0] = 0;

	// 2. Making new wires
	for (i = 1, n = 1; (n - v) <= this.NetList[0] && i <= 300; i++) {
	//for (i = 1, n = 1; (n - v) <= 300 && i < 300; i++) {
		if (typeof this.NetList[i] != 'undefined') {
			if (this.NetList[i][0] == 2) { // Only two this.Components on the same line.
				Offset1 = GetOffset.call(this, this.Components[this.NetList[i][1][0]][1], this.NetList[i][1][1]);
				Offset2 = GetOffset.call(this, this.Components[this.NetList[i][2][0]][1], this.NetList[i][2][1]);

				xa = this.Components[this.NetList[i][1][0]][6].x() + Offset1[0];
				ya = this.Components[this.NetList[i][1][0]][6].y() + Offset1[1];
				xb = this.Components[this.NetList[i][2][0]][6].x() + Offset2[0];
				yb = this.Components[this.NetList[i][2][0]][6].y() + Offset2[1];
				
				this.Wires[n] = GenerateOneWire.call(this, xa, xb, ya, yb); // There is only two this.Components so I only have to make a wire between the componant A and the componant B.
				this.WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
				
				this.Wires[0]++;
				n++;
			}
				
			else { // More than 2 this.Components on the same line.
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

				for (k = 1; k <= this.NetList[i][0]; k++) { // I count the number of circuit input, circuit output and cell output
					result = GetConnectionType.call(this, this.NetList[i][k][0]);
					if (result == 1) { // input circuit
						input_circuit_number++;
						index1 = k;
					}
					else if (result == 2) { // output circuit 
						output_circuit_number++;
						index2 = k;
					}
					else if (result == 3) { // input/output cell
						if (this.NetList[i][k][1] === 'Y' || this.NetList[i][k][1] === 'Q')
							index3 = k;
						
						output_cell_number++;
					}
				}
				
				if (input_circuit_number >= 1) { // case 1
					for (var m = 1; m <= this.NetList[i][0]; m++) { // I connect the circuit input to the other elements
						if (m != index1) {
							id1 = this.NetList[i][m][0];
							id2 = this.NetList[i][index1][0];
							
							Offset1 = GetOffset.call(this, this.Components[id1][1], this.NetList[i][m][1]);
							Offset2 = GetOffset.call(this, this.Components[id2][1], this.NetList[i][index1][1]);
							
							xa = this.Components[id1][6].x() + Offset1[0];
							ya = this.Components[id1][6].y() + Offset1[1];

							xb = this.Components[id2][6].x() + Offset2[0];
							yb = this.Components[id2][6].y() + Offset2[1];
							
							this.Wires[n] = GenerateOneWire.call(this, xa, xb, ya, yb);
							this.WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
							
							this.Wires[0]++;
							n++;
							v++;
						}
					}
				}
				
				else if (output_circuit_number >= 1) { // case 2
					for (var m = 1; m <= this.NetList[i][0]; m++) { // I connect the circuit output to the other elements
						if (m != index2) {
							id1 = this.NetList[i][m][0];
							id2 = this.NetList[i][index2][0];
							
							Offset1 = GetOffset.call(this, this.Components[id1][1], this.NetList[i][m][1]);
							Offset2 = GetOffset.call(this, this.Components[id2][1], this.NetList[i][index2][1]);
							
							xa = this.Components[id1][6].x() + Offset1[0];
							ya = this.Components[id1][6].y() + Offset1[1];

							xb = this.Components[id2][6].x() + Offset2[0];
							yb = this.Components[id2][6].y() + Offset2[1];
							
							this.Wires[n] = GenerateOneWire.call(this, xa, xb, ya, yb);
							this.WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
							
							this.Wires[0]++;
							n++;
							v++;
						}
					}
				}
				
				else if (output_cell_number >= 1) { // case 3
					for (var m = 1; m <= this.NetList[i][0]; m++) { // I connect the cell output to the other elements
						if (m != index3) { // problème source/emetteur ici.
							id1 = this.NetList[i][m][0];
							id2 = this.NetList[i][index3][0];
							
							Offset1 = GetOffset.call(this, this.Components[id1][1], this.NetList[i][m][1]);
							Offset2 = GetOffset.call(this, this.Components[id2][1], this.NetList[i][index3][1]);
							
							xa = this.Components[id1][6].x() + Offset1[0];
							ya = this.Components[id1][6].y() + Offset1[1];

							xb = this.Components[id2][6].x() + Offset2[0];
							yb = this.Components[id2][6].y() + Offset2[1];
							
							this.Wires[n] = GenerateOneWire.call(this, xa, xb, ya, yb);
							this.WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
							
							this.Wires[0]++;
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
	for (i = 1; i <= this.Constants[0]; i++) {
		Offset1 = GetOffset.call(this, 0, 0);
		Offset2 = GetOffset.call(this, this.Components[this.Constants[i][2]][1], this.Constants[i][3]);

		xa = this.Constants[i][1].x() + Offset1[0];
		ya = this.Constants[i][1].y() + Offset1[1];
		
		xb = this.Components[this.Constants[i][2]][6].x() + Offset2[0];
		yb = this.Components[this.Constants[i][2]][6].y() + Offset2[1];
		
		this.Wires[n] = GenerateOneWire.call(this, xa, xb, ya, yb); // There is only two components so I only have to make a wire between the componant A and the componant B.
		this.WireLength[n] = Math.floor(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
		
		n++;
		this.Wires[0]++;
	}
	
	// 4. Add wires to the pannable and zoomable group
	for (i = 1; i <= this.Wires[0]; i++) {
		this.nodes.add(this.Wires[i]);
	}
}

function GenerateOneWire(xa, xb, ya, yb) {
	var wire = 0;
	
	wire = this.svgjs.line(xa, ya, xb, yb).stroke({ width: 1 });
	
	return wire;
}	

function RemoveAllWires() {
	var i = 0;
	
	for (i = 1; i <= this.Wires[0]; i++)
		this.Wires[i].remove();
	
	this.Wires[0] = 0;
}

function GetWiresLength() {
	var i = 0;
	var TotalLength = 0;
	
		
	for (i = 1; i <= this.Wires[0]; i++)
		TotalLength += this.WireLength[i];
	
	return TotalLength;
}

function GetOffset(Gate_Type, IO_Name) { // Get the offset for the connection point
	var Varx = 0, Vary = 0;

	if (typeof this.gate_type == 'undefined')
		this.gate_type = 0;
	
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
			if (this.gate_type == 0) {
				if (IO_Name === 'A') {
					Varx = 24;
					Vary = 50;
				}
				else {
					Varx = 74;
					Vary = 50;	
				}
			}
			else if (this.gate_type == 1) {
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
			if (this.gate_type == 0) {
				if (IO_Name === 'A') {
					Varx = 24;
					Vary = 50;
				}
				else {
					Varx = 79;
					Vary = 50;	
				}
			}
			else if (this.gate_type == 1) {
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
			if (this.gate_type == 0) {
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
			else if (this.gate_type == 1) {
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
			if (this.gate_type == 0) {
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
			else if (this.gate_type == 1) {
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
			if (this.gate_type == 0) {
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
			else if (this.gate_type == 1) {
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
		case 9: // DFF_N
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
		case 10: // DFF_NNX
			if (IO_Name === 'C') { // clock
				Varx = 10;
				Vary = 65;
			}
			else if (IO_Name === 'D') { // D
				Varx = 10;
				Vary = 20;	
			}
			else if (IO_Name === 'Q') { // Q
				Varx = 90;
				Vary = 20;	
			}
			else { // R
				Varx = 10;
				Vary = 80;
			}
		break;
		case 11: // DFF_NPX
			if (IO_Name === 'C') { // clock
				Varx = 10;
				Vary = 65;
			}
			else if (IO_Name === 'D') { // D
				Varx = 10;
				Vary = 20;	
			}
			else if (IO_Name === 'Q') { // Q
				Varx = 90;
				Vary = 20;	
			}
			else { // R
				Varx = 10;
				Vary = 80;
			}
		break;
		case 12: // DFF_PNX
			if (IO_Name === 'C') { // clock
				Varx = 10;
				Vary = 65;
			}
			else if (IO_Name === 'D') { // D
				Varx = 10;
				Vary = 20;	
			}
			else if (IO_Name === 'Q') { // Q
				Varx = 90;
				Vary = 20;	
			}
			else { // R
				Varx = 10;
				Vary = 80;
			}
		break;
		case 13: // DFF_PPX
			if (IO_Name === 'C') { // clock
				Varx = 10;
				Vary = 65;
			}
			else if (IO_Name === 'D') { // D
				Varx = 10;
				Vary = 20;	
			}
			else if (IO_Name === 'Q') { // Q
				Varx = 90;
				Vary = 20;	
			}
			else { // R
				Varx = 10;
				Vary = 80;
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
	
	if (this.Components[Component_ID][1] == 0 || this.Components[Component_ID][1] == 1) { // Is it an input / output ?
		type = (this.Components[Component_ID][1] == 0) ? 1 : 2;
	}
	
	else { // Else it's a cell.
		type = 3;
	} 
		
	return type;
}
// --

// Other
function isArray(obj) { // 1000 thanks to http://blog.caplin.com/2012/01/13/javascript-is-hard-part-1-you-cant-trust-arrays/
	return Object.prototype.toString.apply(obj) === "[object Array]";
}
// --