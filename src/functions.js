/*
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
	this.CircuitInfo[5] = 0;
	this.CircuitInfo[6] = 0;
	this.CircuitInfo[7] = 0;
	// --
	
	this.PlacementDone = 0; // Is Placement done ?
	this.LabelsDone = 0; // Are Labels done ?
	
	RemoveAllGates.call(this);

	
	// Remove Netlist
	for (i = 1, n = 1; n <= this.NetList[0]; i++) {
		if (typeof this.NetList[i] != 'undefined') {
			delete this.NetList[i];
			n++;
		}
	} 
	
	// Reset Wires data
	for (i = 1, n = 1; n <= this.Wires[0]; i++) {
		if (typeof this.Wires[i] != 'undefined') {
			if (typeof this.Wires[i][0] != 'undefined')
				this.Wires[i][0].remove();
			
			if (typeof this.Wires[i][1] != 'undefined')
				this.Wires[i][1].remove();
			n++;
		}
	} 
	
	this.Wires = new Array();
	this.Wires[0] = 0;
	
	for (i = 1; i <= 300; i++)
		this.Wires[i] = new Array();


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
	
	// Set connections to 0. I currently use 300 as a MAX limit, but we should use this.Components[0] since this is the number of components in the circuit.
	for (l = 0; l <= 300; l++) {
		for (m = 0; m <= 300; m++) {
			this.Connections[l][m] = 0;
		}
	}
	
	this.Grid = new Array();
	var a, b;
	for (a = -500; a < 500; a++) {
		this.Grid[a] = new Array();
			for (b = -500; b < 500; b++) {
				this.Grid[a][b] = 0;
		}
	}
	// --
	
	return 1;
}
// --

// Golirev object
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
	
	this.zoomSpeed = 5;
	this.Stayfocus = 0;
	
	this.PlacementDone = 0; // Is Placement done ?
	this.LabelsDone = 0; // Are Labels done ?
	
	this.CircuitInfo = new Array(); // Informations concerning the circuits
	/*
	Details about Circuit Info
	CircuitInfo[0] = rect x of the svg element
	CircuitInfo[1] = rect y of the svg element
	CircuitInfo[2] = name of the circuit
	CircuitInfo[3] = "Creator"
	CircuitInfo[4] = Text svg element.
	CircuitInfo[5] = Number of Inputs
	CircuitInfo[6] = Number of Outputs
	CircuitInfo[7] = Number of Cells.
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
	Components[Components[0]][6] = Svg element of the component (the gate)
	Components[Components[0]][7] = Is this component in reverse mode ? (0 == nupe, 1 == yup)
	*/

	this.NetList = new Array();
	/*
	Details about NetList
	NetList[0] = Number of connections;
	NetList[n][0] = Number of elements on that connection;
	NetList[n][1] = Array (First Object)
			[n][1][0] = ID on the component var;
			[n][1][1] = Name of the port;
			[n][1][2] = OffsetX;
			[n][1][3] = OffsetY;
			[n][1][4] = Size of the port;
			[n][1][5] = index of element;
			[n][1][6] = Input/Output; // 0 = input, 1 = output;
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
	/*
	Details about Wires
	Wires[0] = Number of wires;
	Wires[n][0] = svg element of the wire
	Wires[n][1] = svg element of the text label
	Wires[n][2] = size of element 1
	Wires[n][3] = size of element 2
	Wires[n][4] = label of input
	Wires[n][5] = label of output
	Wires[n][6] = PosX element 1
	Wires[n][7] = PosY element 1
	Wires[n][8] = PosX element 2
	Wires[n][9] = PosY element 2
	*/
	this.Wires[0] = 0;
	
	for (i = 1; i <= 300; i++)
		this.Wires[i] = new Array();

	this.WireLength = new Array();
	
	// Set connections to 0. I currently use 300 as a MAX limit, but we should use this.Components[0] since this is the number of components in the circuit.
	this.Connections = new Array();
	for (l = 0; l <= 300; l++) {
		this.Connections[l] = new Array();
		for (m = 0; m <= 300; m++) {
			this.Connections[l][m] = 0;
		}
	}
	
	// Simulated Annealing parameters
	this.Async = 1; // 0 means that we will use the blocking function, 1 means that we will use the window.setTimeout method.
	this.distance;
	this.alpha;
	this.temperature;
	this.epsilon;
	this.iteration;
	// --
	
	// Methods
	this.DisplayJson = ShowJSON;
	this.ParseJSON = ParseJson;
	this.UpdateGate = UpdateGate;
	// --
}
 
function ShowJSON(json_object, gate_type, Async, Stayfocus) {
	this.gate_type = gate_type;
	
	if(typeof Async === 'undefined')
		this.Async = 1;
	else
		this.Async = Async;
	
	if(typeof Stayfocus === 'undefined')
		this.Stayfocus = 1;
	else
		this.Stayfocus = Stayfocus;
	
	ParseJson.call(this, json_object);
	
	// Pan + zoom init
	if (typeof this.nodes == 'undefined') {
		this.nodes = this.svgjs.group();
		this.nodes.panZoom({zoomSpeed : this.zoomSpeed});	
	}
	// --
	
	GenerateAllGates.call(this);
	
	if (!this.Async) { // blocking method
		InitSimulatedAnnealing.call(this);
		SimulatedAnnealing.call(this); 
		
		GenerateAllWires.call(this); 
		PlaceCircuitName.call(this);
		
		OptimizePlacement.call(this);
		CenterComponents.call(this); 
	}
	
	else { // async with setTimeout
		InitSimulatedAnnealing.call(this);
		
		var obj = this;
		
		setTimeout(function(){RunSimulatedAnnealing.call(obj)}, 10);
	}	
	
	return this.CircuitInfo;
}

function UpdateGate(gate_type) {
	 this.gate_type = gate_type;
	 
	 UpdateGateType.call(this);
	 GenerateAllWires.call(this);
	 PlaceCircuitName.call(this);
}

function PlaceLabelsName() { // Place labels on wires
	var i = 0;
	var moyenneX = 0;
	var moyenneY = 0;
	
	for (i = 1; i <= this.Wires[0]; i++) { // loop on each connection in order to display informations concerning the label
		if (this.Wires[i][2] == 1 && this.Wires[i][3] == 1) {
			
			moyenneX = (this.Wires[i][6] + this.Wires[i][8]) / 2;
			moyenneY = (this.Wires[i][7] + this.Wires[i][9]) / 2 - 10;
			if (typeof this.Wires[i][1] == 'undefined')
				this.Wires[i][1] = this.svgjs.text("1").center(moyenneX, moyenneY);
			else
				this.Wires[i][1].center(moyenneX, moyenneY);
		}
			
		else { // display label
			if (typeof this.Wires[i][4] !== 'undefined' || typeof this.Wires[i][5] !== 'undefined') {
				moyenneX = (this.Wires[i][6] + this.Wires[i][8]) / 2;
				moyenneY = (this.Wires[i][7] + this.Wires[i][9]) / 2 - 10;
				
				if (typeof this.Wires[i][1] == 'undefined')
					this.Wires[i][1] = this.svgjs.text(this.Wires[i][4] + ' -> ' +this.Wires[i][5]).center(moyenneX, moyenneY)
				else
					this.Wires[i][1].center(moyenneX, moyenneY);
			}
			
		}
		
		if (this.Wires[i][1])
			this.nodes.add(this.Wires[i][1]);
	}
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
		
		if (!this.Components[this.Components[0]][1])
			this.CircuitInfo[5]++;
		else
			this.CircuitInfo[6]++;
		
		this.Components[this.Components[0]][2] = 1; // Show label of I/O by default
		// --
		
		// Netlist related : todo
		// json_yosysJS.modules[Circuit_Name].ports[io_names[i]].bits
		
		var meh2 = json_yosysJS.modules[Circuit_Name].ports[io_names[i]].bits;
		
		if (meh2.length > 1)
			this.Components[this.Components[0]][0] += ' [' + (meh2.length - 1) + ':0]'; // Add the length to the label 
		
		for (l = 0, nbr_local_cste = 0, local_value = '"'; l < meh2.length; l++) { // I count the number of constants and I add the value to local_value
			if (typeof meh2[l] == 'string') {
				nbr_local_cste++;
				local_value += meh2[l];
			}
			
			else 
				local_value += 'x'
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
					this.NetList[meh2[l]][1][1] = io_names[i];
					
					this.NetList[meh2[l]][1][2] = 0; // x
					this.NetList[meh2[l]][1][3] = 0; // y
					
					this.NetList[meh2[l]][1][4] = meh2.length; 
					this.NetList[meh2[l]][1][5] = l; 
					
					this.NetList[meh2[l]][1][6] = !this.Components[this.Components[0]][1]; 
					
					this.NetList[0]++;
				}
				
				else {
					this.NetList[meh2[l]][0]++;
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]] = new Array();
					
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][0] = 1 + parseInt(i);
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][1] = io_names[i];;
					
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][2] = 0; // x
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][3] = 0; // y
					
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][4] = meh2.length; 
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][5] = l; 
					
					this.NetList[meh2[l]][this.NetList[meh2[l]][0]][6] = !this.Components[this.Components[0]][1]; 
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
				this.Constants[this.Constants[0]][0] = '"' + meh[0] + '"'; // Value
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
				this.NetList[meh][1][4] = 1;
				this.NetList[meh][1][5] = -1; 
				
				this.NetList[meh][1][6] = GetConnection.call(this, this.Components[this.Components[0]][1], cell_io_name[k]); 
				
				this.NetList[0]++;
			}
		
			else  {
				this.NetList[meh][0]++;
				this.NetList[meh][this.NetList[meh][0]] = new Array();
				this.NetList[meh][this.NetList[meh][0]][0] = parseInt(n) + parseInt(i) + 2;
				this.NetList[meh][this.NetList[meh][0]][1] = cell_io_name[k];
				
				this.NetList[meh][this.NetList[meh][0]][2] = 0; // x
				this.NetList[meh][this.NetList[meh][0]][3] = 0; // y
				
								
				this.NetList[meh][this.NetList[meh][0]][4] = 1; 
				this.NetList[meh][this.NetList[meh][0]][5] = -1; 
				
				this.NetList[meh][this.NetList[meh][0]][6] = GetConnection.call(this, this.Components[this.Components[0]][1], cell_io_name[k]); ; 
			}							
		}
	}
	// ---
	
	this.CircuitInfo[2] = String(Circuit_Name);
	this.CircuitInfo[3] = json_yosysJS.creator;
	this.CircuitInfo[7] = this.Components[0] - this.CircuitInfo[5] - this.CircuitInfo[6];
	
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
// Tests Simulated Annealing
function InitSimulatedAnnealing() { // Initialisation of Simulated annealing
	var i = 0;
	var n = 0;
	
	// Initial parameters settings
	this.alpha = 0.999;
    this.temperature = 400.0;
    this.epsilon = 0.001;
	
	this.iteration = 0;
	
	console.log(this.iteration + ' : ' + this.temperature + ' : ' + Date());
	//
	
	// Initial components placement : currently we are just placing components in a column
	for (i = 1; i <= this.Components[0]; i++) {
		this.Grid[5][i] = 1;
		MoveToGrid(this.Components[i][6], 5, i);
	}
	
	for (i, n = 1; n <= this.Constants[0]; i++, n++) {
		this.Grid[5][i] = 1;
		MoveToGrid(this.Constants[n][1], 5, i);
	}
	// --
	
	GenerateAllWires.call(this);
	this.distance = GetWiresLength.call(this);
}

function SimulatedAnnealing() { // Simulated Annealing, blocking function (http://www.codeproject.com/Articles/13789/Simulated-Annealing-Example-in-C)
	var Arr;
	var delta;
	var proba;

    // While the temperature did not reach epsilon
    while (this.temperature > this.epsilon) {
        this.iteration++;
		// Make a random change
        Arr = RandomChange.call(this);
		GenerateAllWires.call(this);
		
		// Get the new delta
        delta = GetWiresLength.call(this) - this.distance;
		
        if(delta < 0)
            this.distance = delta + this.distance;
        
		else {
            proba = Math.random();
			
            if(proba < Math.exp(-delta/this.temperature))
                this.distance = delta + this.distance;
			
			else 
				ReverseChange.call(this, Arr[0], Arr[1], Arr[2], Arr[3]);
        }
        
		// Cooling process on every iteration
        this.temperature *= this.alpha;
    }
	
	this.PlacementDone = 1;
	
	console.log(this.iteration + ' : ' + this.temperature + ' : ' + Date());
}

function RunSimulatedAnnealing() { //  Simulated Annealing (window.setTimeout)
	var Arr;
	var delta;
	var proba;
	var Out = 0;
	
	for (var i = 0; i <= 100 && !Out; i++) {
		this.iteration++;
		
		// Make a random change
		Arr = RandomChange.call(this);
		GenerateAllWires.call(this);
		
		// Get the new delta
		delta = GetWiresLength.call(this) - this.distance;
		
		if(delta < 0)
			this.distance = delta + this.distance;
		
		else {
			proba = Math.random();
			
			if(proba < Math.exp(-delta/this.temperature))
				this.distance = delta + this.distance;
			
			else 
				ReverseChange.call(this, Arr[0], Arr[1], Arr[2], Arr[3]);
		}
		
		// Cooling process on every iteration
		this.temperature *= this.alpha;
		// --
		
		if (this.temperature <= this.epsilon) { // Did we reach the end of the placement
			Out = 1;
			console.log(this.iteration + ' : ' + this.temperature + ' : ' + Date());
			this.PlacementDone = 1;
			
			GenerateAllWires.call(this); 
			PlaceCircuitName.call(this);
			
			OptimizePlacement.call(this);
			CenterComponents.call(this); 
		}
	}
	
	if (this.Stayfocus)
		CenterComponents.call(this); // Focus the SVG element while doing Simulated Annealing.
	
	if (!Out) { // Do we still have iterations to do (i == 100 but this.temperature >= this.epsilon).
		var obj = this;
		setTimeout(function(){RunSimulatedAnnealing.call(obj)}, 10); // We are calling again this function in order to do more iterations.
	}
}

function RandomChange() { // Make a random change, must return ID_Compo, x and y.
	// Random component ID
	var RandomID = Math.floor((Math.random() * (this.Components[0] + this.Constants[0]) + 1)); 

	var type = 0;
	
	//alert(RandomID + ' : ' + this.Components[0] + ' : ' + this.Constants[0]);
	
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
	
	// First : I compute the MaxLeft and MaxHeight point.
	for (i = 1, MaxLeft = this.Components[i][6].x(), MaxHeight = this.Components[i][6].y(); i <= this.Components[0]; i++) {
		x = this.Components[i][6].x();
		y = this.Components[i][6].y();
		
		if (MaxLeft > x)
			MaxLeft = x;
		
		if (MaxHeight > y)
			MaxHeight = y;
	}

	for (i = 1; i <= this.Constants[0]; i++) {
		x = this.Constants[i][1].x();
		y = this.Constants[i][1].y();
		
		if (MaxLeft > x)
			MaxLeft = x;

		if (MaxHeight > y)
			MaxHeight = y;
	}
	// --
	
	// Then I focus the SVG element from this point. 
	// I have to be careful using .setPosition() since the .setPosition() axis and the SVG element axis are different : this is why I have to use some minus signs.
	if (MaxLeft > 0 && MaxHeight > 0) // Cadran 1
		this.nodes.panZoom({zoomSpeed : this.zoomSpeed}).setPosition(-MaxLeft, -MaxHeight);
	
	else if (MaxLeft > 0 && MaxHeight < 0) // Cadran 2
		this.nodes.panZoom({zoomSpeed : this.zoomSpeed}).setPosition(-MaxLeft, MaxHeight);
	
	else if (MaxLeft < 0 && MaxHeight > 0) // Cadran 3
		this.nodes.panZoom({zoomSpeed : this.zoomSpeed}).setPosition(MaxLeft, -MaxHeight);
	
	else // Cadran 4
		this.nodes.panZoom({zoomSpeed : this.zoomSpeed}).setPosition(MaxLeft, MaxHeight);
	// --
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

// Simulated Annealing : Optimisations functions
function OptimizePlacement () { // Run the 3 functions to optimize the placement
	OptimizeConnectionSwitching.call(this);
	
	var obj = this;	
	setTimeout(function(){OptimizePlacementSwitching.call(obj)}, 10);
}

function OptimizeConnectionSwitching () {
	var i = 0;
	var WireLength = 0;
	
	for (i = 1; i <= this.Components[0]; i++) {
		if (this.Components[i][1] == 4 || this.Components[i][1] == 5 || this.Components[i][1] == 6) {
			WireLength = GetWiresLength.call(this); // Get the current state
			
			this.Components[i][7] = 1; // Reverse this component
			
			GenerateAllWires.call(this); // Update the circuit
			
			if (WireLength > GetWiresLength.call(this)) { // We are decreasing the wirelength (good)
				; // I have to modify Netlist[..] and Wires[]. Or I will have incorrect netlabels
			}
			
			else { // We are increasing the wirelength (bad)
				this.Components[i][7] = 0;
			}
		}
	}
	
	GenerateAllWires.call(this);
}

function OptimizePlacementSwitching () { // First function : Try to switch components in order to get a lower WireLength
	var i = 0;
	var n = 0;
	var WireLength = 0;
	
	var xa = 0;
	var ya = 0;
	var xb = 0;
	var yb = 0;

	/* Options  :
	 * 1. Try to modify component position and check if it improves the situation
	 * 2. Modify the position of components in their grids
	 *
	*/
	
	// Option 1, todo: Add constants
	for (i = 1; i <= this.Components[0]; i++) {
		for (n = 1; n <= this.Components[0]; n++) {
			if (n != i) {
				// Save the current configuration
				xa = this.Components[i][6].x();
				ya = this.Components[i][6].y();
				
				xb = this.Components[n][6].x();
				yb = this.Components[n][6].y();
				
				WireLength = GetWiresLength.call(this);
				// --
				
				// I switch and check the results
				MoveGateXY(this.Components[i][6], xb, yb);
				MoveGateXY(this.Components[n][6], xa, ya);

				GenerateAllWires.call(this);
				
				if ((WireLength - GetWiresLength.call(this)) > 0) { // Are we improving the system ?
					; // Nothing to do.
				}
				
				else { // We have to put it back, it is not improving the system
					MoveGateXY(this.Components[i][6], xa, ya);
					MoveGateXY(this.Components[n][6], xb, yb);
					
					GenerateAllWires.call(this);
				}
			}
		}
	}
	// --	
	
	var obj = this;
		
	setTimeout(function(){OptimizePlacementDelta.call(obj)}, 10);
}

function OptimizePlacementDelta () { // Modify components position on the Y axis in order to get a lower WireLength
	var i = 0;
	var n = 0;
	var WireLength = 0;
	
	var MaxDif = 10;
	
	for (i = 1; i <= this.Components[0]; i++) { // Cells
		if (this.Components[i][1] != 0 || this.Components[i][1] != 1) {
			WireLength = GetWiresLength.call(this); // Get the current WireLength
			
			this.Components[i][6].dy(1);
			
			GenerateAllWires.call(this);
			if ((GetWiresLength.call(this) - WireLength) < 0) { // Are we improving the situation ?
				for (n = 0; n < MaxDif && (GetWiresLength.call(this) - WireLength) < 0; n++) {
					WireLength = GetWiresLength.call(this);
					this.Components[i][6].dy(1);
					GenerateAllWires.call(this); 
				}

				if (n < MaxDif) {
					this.Components[i][6].dy(-1);
					GenerateAllWires.call(this); 
				}
			}
			
			else { // We have to go reverse
				WireLength = GetWiresLength.call(this);
				this.Components[i][6].dy(-2);
				
				GenerateAllWires.call(this); 
				
				if ((GetWiresLength.call(this) - WireLength) > 0) {
					this.Components[i][6].dy(1);
				}
				
				else {
					for (n = 0; n < MaxDif && (GetWiresLength.call(this) - WireLength) < 0; n++) {
						WireLength = GetWiresLength.call(this);
						this.Components[i][6].dy(-1);
						GenerateAllWires.call(this); 
					}

					if (n < MaxDif) {
						this.Components[i][6].dy(1);
						GenerateAllWires.call(this); 
					}
				}
			}
		}
	}

	GenerateAllWires.call(this); 
	
	MaxDif= 50;
	
	for (i = 1; i <= this.Components[0]; i++) { // I/O
		if (this.Components[i][1] == 0 || this.Components[i][1] == 1) {
			WireLength = GetWiresLength.call(this); // Get the current WireLength
			
			this.Components[i][6].dy(1);
			
			GenerateAllWires.call(this);
			if ((GetWiresLength.call(this) - WireLength) < 0) { // Are we improving the situation ?
				for (n = 0; n < MaxDif && (GetWiresLength.call(this) - WireLength) < 0; n++) {
					WireLength = GetWiresLength.call(this);
					this.Components[i][6].dy(1);
					GenerateAllWires.call(this); 
				}

				if (n < MaxDif) {
					this.Components[i][6].dy(-1);
					GenerateAllWires.call(this); 
				}
			}
			
			else { // We have to go reverse
				WireLength = GetWiresLength.call(this);
				this.Components[i][6].dy(-2);
				
				GenerateAllWires.call(this); 
				
				if ((GetWiresLength.call(this) - WireLength) > 0) {
					this.Components[i][6].dy(1);
				}
				
				else {
					for (n = 0; n < MaxDif && (GetWiresLength.call(this) - WireLength) < 0; n++) {
						WireLength = GetWiresLength.call(this);
						this.Components[i][6].dy(-1);
						GenerateAllWires.call(this); 
					}

					if (n < MaxDif) {
						this.Components[i][6].dy(1);
						GenerateAllWires.call(this); 
					}
				}
			}
		}
	}
	
	for (i = 1; i <= this.Constants[0]; i++) { // Constants
		WireLength = GetWiresLength.call(this); // Get the current WireLength
		
		this.Constants[i][1].dy(1);
		
		GenerateAllWires.call(this);
		if ((GetWiresLength.call(this) - WireLength) < 0) { // Are we improving the situation ?
			for (n = 0; n < MaxDif && (GetWiresLength.call(this) - WireLength) < 0; n++) {
				WireLength = GetWiresLength.call(this);
				this.Constants[i][1].dy(1);
				GenerateAllWires.call(this); 
			}
			
			if (n < MaxDif) {
				this.Constants[i][1].dy(-1);
				GenerateAllWires.call(this); 
			}
		}
		
		else { // We have to go reverse
			WireLength = GetWiresLength.call(this);
			this.Constants[i][1].dy(-2);
			
			GenerateAllWires.call(this); 
			
			if ((GetWiresLength.call(this) - WireLength) > 0) {
				this.Constants[i][1].dy(1);
			}
			
			else {
				for (n = 0, Out = 0; n < MaxDif && !Out; n++) {
					WireLength = GetWiresLength.call(this);
					this.Constants[i][1].dy(-1);
					GenerateAllWires.call(this); 
					if ((GetWiresLength.call(this) - WireLength) >= 0)
						Out = 1;
				}
				
				if (Out) {
					this.Constants[i][1].dy(1);
					GenerateAllWires.call(this); 
				}
			}
		}
	
	}
	// --	
	
	var obj = this;
		
	setTimeout(function(){OptimizePlacementOverlappingWires.call(obj)}, 10);
}

function OptimizePlacementOverlappingWires () { // Modify components position on the X axis in order to remove some overlapping Wires
	var Arr = Array();
	var i = 0;
	var x = 0;
	
	for (i = 1; i <= this.Components[0]; i++) {
		x = this.Components[i][6].x();
		
		if (typeof Arr[x] == 'undefined') 
			Arr[x] = 1;
		else
			Arr[x]++;
		
		this.Components[i][6].dx((Arr[x] * 10) % 50);	
	}
	
	GenerateAllWires.call(this); 	
}
// --

// Wires
function GenerateAllWires() { // This function generates wires between elements with the Netlist var. This function runs when a drag is one by the user.
	var i = 0, n = 0, k = 0, v = 0; // loops index
	
	var xa = 0, ya = 0, xb = 0, yb = 0; // Lines points.
	var Offset1 = 0, Offset2 = 0; // Points offset (see function GetOffset)

	// 1. Removing "old" wires
	RemoveAllWires.call(this);

	// 2. Making new wires
	for (i = 1, n = 1; (n - v) <= this.NetList[0] && i <= 300; i++) {
	//for (i = 1, n = 1; (n - v) <= 300 && i < 300; i++) {
		if (typeof this.NetList[i] != 'undefined') {
			if (this.NetList[i][0] == 2) { // Only two this.Components on the same line.
				if (this.Connections[this.NetList[i][1][0]][this.NetList[i][2][0]] == 1 && this.Connections[this.NetList[i][2][0]][this.NetList[i][1][0]] == 1 && (this.Components[this.NetList[i][1][0]][1] + this.Components[this.NetList[i][2][0]][1]) <= 2) {
					;
				}
				
				else {
					Offset1 = GetOffset.call(this, this.Components[this.NetList[i][1][0]][1], this.NetList[i][1][1], this.Components[this.NetList[i][1][0]][7]);
					Offset2 = GetOffset.call(this, this.Components[this.NetList[i][2][0]][1], this.NetList[i][2][1], this.Components[this.NetList[i][2][0]][7]);

					xa = this.Components[this.NetList[i][1][0]][6].x() + Offset1[0];
					this.Wires[n][6] = xa;
					ya = this.Components[this.NetList[i][1][0]][6].y() + Offset1[1];
					this.Wires[n][7] = ya;
					xb = this.Components[this.NetList[i][2][0]][6].x() + Offset2[0];
					this.Wires[n][8] = xb;
					yb = this.Components[this.NetList[i][2][0]][6].y() + Offset2[1];
					this.Wires[n][9] = yb;
					
					this.Wires[n][2] = this.NetList[i][1][4];
					this.Wires[n][3] = this.NetList[i][2][4];
					
					this.Wires[n][0] = GenerateOneWire.call(this, xa, xb, ya, yb); // There is only two this.Components so I only have to make a wire between the componant A and the componant B.
					this.WireLength[n] = 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
					
						
					
					if (this.NetList[i][1][6] == 1 && xa > xb)
						this.WireLength[n] += 200 ;
					
					if (this.NetList[i][2][6] == 1 && xb > xa)
						this.WireLength[n] +=200;
					
									
					this.Wires[0]++;
					n++;
					
					this.Connections[this.NetList[i][1][0]][this.NetList[i][2][0]] = 1;
					this.Connections[this.NetList[i][2][0]][this.NetList[i][1][0]] = 1;
				}
				
				// Labels
				if (this.PlacementDone && !this.LabelsDone) {
					if ((this.NetList[i][2][1] == 'Y' && this.Components[this.NetList[i][2][0]][1] > 1) || this.Components[this.NetList[i][2][0]][1] == 0) { // If the second component is an output

						if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
							this.Wires[n - 1][4] = this.NetList[i][2][1];
						else
							this.Wires[n - 1][4] += ', ' + this.NetList[i][2][1];
						
						if (this.Wires[n - 1][3] != 1)
							this.Wires[n - 1][4] += '[' + this.NetList[i][2][5] + ']'; 
						
						if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
							this.Wires[n - 1][5] = this.NetList[i][1][1]
						else
							this.Wires[n - 1][5] += ', ' + this.NetList[i][1][1];
						
						if (this.Wires[n - 1][2] != 1)
							this.Wires[n - 1][5] += '[' + this.NetList[i][1][5] + ']'; 
					}
					
					else {
						if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
							this.Wires[n - 1][5] = this.NetList[i][2][1];
						else
							this.Wires[n - 1][5] += ', ' + this.NetList[i][2][1];
						
						if (this.Wires[n - 1][3] != 1)
							this.Wires[n - 1][5] += '[' + this.NetList[i][2][5] + ']'; 
						
						if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
							this.Wires[n - 1][4] = this.NetList[i][1][1]
						else
							this.Wires[n - 1][4] += ', ' + this.NetList[i][1][1]
						if (this.Wires[n - 1][2] != 1)
							this.Wires[n - 1][4] += '[' + this.NetList[i][1][5] + ']'; 	
					}
				}
				// --

					
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
							if (this.Connections[this.NetList[i][m][0]][this.NetList[i][index1][0]] == 1 && this.Connections[this.NetList[i][index1][0]][this.NetList[i][m][0]] == 1 && (this.Components[this.NetList[i][m][0]][1] + this.Components[this.NetList[i][index1][0]][1]) <= 2) {
							;
						}
						
						else {
							id1 = this.NetList[i][m][0];
							id2 = this.NetList[i][index1][0];
							
							Offset1 = GetOffset.call(this, this.Components[id1][1], this.NetList[i][m][1], this.Components[id1][7]);
							Offset2 = GetOffset.call(this, this.Components[id2][1], this.NetList[i][index1][1], this.Components[id2][7]);
							
							xa = this.Components[id1][6].x() + Offset1[0];
							this.Wires[n][6] = xa;
							ya = this.Components[id1][6].y() + Offset1[1];
							this.Wires[n][7] = ya;

							xb = this.Components[id2][6].x() + Offset2[0];
							this.Wires[n][8] = xb;
							yb = this.Components[id2][6].y() + Offset2[1];
							this.Wires[n][9] = yb;
							
							this.Wires[n][2] = this.NetList[i][m][4];
							this.Wires[n][3] = this.NetList[i][index1][4];
							
							this.Wires[n][0] = GenerateOneWire.call(this, xa, xb, ya, yb);
							this.WireLength[n] = 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
							
							this.Wires[0]++;
							n++;
							v++;
						}
							
						// Labels
						if (this.PlacementDone && !this.LabelsDone) {
							if ((this.NetList[i][m][1] == 'Y' && this.Components[this.NetList[i][m][0]][1] > 1) || this.Components[this.NetList[i][m][0]][1] == 1) { // If the second component is an output
								if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
									this.Wires[n - 1][4] = this.NetList[i][m][1];
								else
									this.Wires[n - 1][4] += ', ' + this.NetList[i][m][1];
								
								if (this.NetList[i][m][5] != -1)
									this.Wires[n - 1][4] += '[' + this.NetList[i][m][5] + ']'; 
								
								if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
									this.Wires[n - 1][5] = this.NetList[i][index1][1]
								else
									this.Wires[n - 1][5] += ', ' + this.NetList[i][index1][1];
								
								if (this.NetList[i][index1][5] != -1)
									this.Wires[n - 1][5] += '[' + this.NetList[i][index1][5] + ']'; 
							}
							
							else {
								if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
									this.Wires[n - 1][5] = this.NetList[i][m][1];
								else
									this.Wires[n - 1][5] += ', ' + this.NetList[i][m][1];
								
								if (this.NetList[i][m][5] != -1)
									this.Wires[n - 1][5] += '[' + this.NetList[i][m][5] + ']'; 
								
								if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
									this.Wires[n - 1][4] = this.NetList[i][index1][1]
								else
									this.Wires[n - 1][4] += ', ' + this.NetList[i][index1][1]
								if (this.NetList[i][index1][5] != -1)
									this.Wires[n - 1][4] += '[' + this.NetList[i][index1][5] + ']'; 	
							}
						}
						// --
						}
					}
				}
				
				else if (output_circuit_number >= 1) { // case 2
					for (var m = 1; m <= this.NetList[i][0]; m++) { // I connect the circuit output to the other elements
						if (m != index2) {
							if (this.Connections[this.NetList[i][m][0]][this.NetList[i][index2][0]] == 1 && this.Connections[this.NetList[i][index2][0]][this.NetList[i][m][0]] == 1 && (this.Components[this.NetList[i][m][0]][1] + this.Components[this.NetList[i][index2][0]][1]) <= 2) {
								;
							}
							
							else {
							
								id1 = this.NetList[i][m][0];
								id2 = this.NetList[i][index2][0];
								
								Offset1 = GetOffset.call(this, this.Components[id1][1], this.NetList[i][m][1], this.Components[id1][7]);
								Offset2 = GetOffset.call(this, this.Components[id2][1], this.NetList[i][index2][1], this.Components[id2][7]);
								
								xa = this.Components[id1][6].x() + Offset1[0];
								this.Wires[n][6] = xa;
								ya = this.Components[id1][6].y() + Offset1[1];
								this.Wires[n][7] = ya;

								xb = this.Components[id2][6].x() + Offset2[0];
								this.Wires[n][8] = xb;
								yb = this.Components[id2][6].y() + Offset2[1];
								this.Wires[n][9] = yb;
								
								this.Wires[n][2] = this.NetList[i][m][4];
								this.Wires[n][3] = this.NetList[i][index2][4];
								
								this.Wires[n][0] = GenerateOneWire.call(this, xa, xb, ya, yb);
								this.WireLength[n] = 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
								
								this.Wires[0]++;
								n++;
								v++;
							}
							
							// Labels
							if (this.PlacementDone && !this.LabelsDone) {
								if ((this.NetList[i][m][1] == 'Y' && this.Components[this.NetList[i][m][0]][1] > 1) || this.Components[this.NetList[i][m][0]][1] == 1) { // If the second component is an output
									if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
										this.Wires[n - 1][4] = this.NetList[i][m][1];
									else
										this.Wires[n - 1][4] += ', ' + this.NetList[i][m][1];
									
									if (this.NetList[i][m][5] != -1)
										this.Wires[n - 1][4] += '[' + this.NetList[i][m][5] + ']'; 
									
									if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
										this.Wires[n - 1][5] = this.NetList[i][index2][1]
									else
										this.Wires[n - 1][5] += ', ' + this.NetList[i][index2][1];
									
									if (this.NetList[i][index2][5] != -1)
										this.Wires[n - 1][5] += '[' + this.NetList[i][index2][5] + ']'; 
								}
								
								else {
									if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
										this.Wires[n - 1][5] = this.NetList[i][m][1];
									else
										this.Wires[n - 1][5] += ', ' + this.NetList[i][m][1];
									
									if (this.NetList[i][m][5] != -1)
										this.Wires[n - 1][5] += '[' + this.NetList[i][m][5] + ']'; 
									
									if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
										this.Wires[n - 1][4] = this.NetList[i][index2][1]
									else
										this.Wires[n - 1][4] += ', ' + this.NetList[i][index2][1]
									if (this.NetList[i][index2][5] != -1)
										this.Wires[n - 1][4] += '[' + this.NetList[i][index2][5] + ']'; 	
								}
							}
							// --
							

						}
					}
				}
				
				else if (output_cell_number >= 1) { // case 3
					for (var m = 1; m <= this.NetList[i][0]; m++) { // I connect the cell output to the other elements
						if (m != index3) { // problème source/emetteur ici.
							if (this.Connections[this.NetList[i][m][0]][this.NetList[i][index3][0]] == 1 && this.Connections[this.NetList[i][index3][0]][this.NetList[i][m][0]] == 1 && (this.Components[this.NetList[i][m][0]][1] + this.Components[this.NetList[i][index3][0]][1]) <= 2) {
								;
							}
							
							else {
								id1 = this.NetList[i][m][0];
								id2 = this.NetList[i][index3][0];
								
								Offset1 = GetOffset.call(this, this.Components[id1][1], this.NetList[i][m][1], this.Components[id1][7]);
								Offset2 = GetOffset.call(this, this.Components[id2][1], this.NetList[i][index3][1], this.Components[id2][7]);
								
								xa = this.Components[id1][6].x() + Offset1[0];
								this.Wires[n][6] = xa;
								ya = this.Components[id1][6].y() + Offset1[1];
								this.Wires[n][7] = ya;

								xb = this.Components[id2][6].x() + Offset2[0];
								this.Wires[n][8] = xb;
								yb = this.Components[id2][6].y() + Offset2[1];
								this.Wires[n][9] = yb;
								
								this.Wires[n][2] = this.NetList[i][m][4];
								this.Wires[n][3] = this.NetList[i][index3][4];
								
								this.Wires[n][0] = GenerateOneWire.call(this, xa, xb, ya, yb);
								this.WireLength[n] = 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
								
								this.Wires[0]++;
								n++;
								v++;
															
							}
							
							// Labels
							if (this.PlacementDone && !this.LabelsDone) {
								if ((this.NetList[i][m][1] == 'Y' && this.Components[this.NetList[i][m][0]][1] > 1) || this.Components[this.NetList[i][m][0]][1] == 1) { // If the second component is an output
									if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
										this.Wires[n - 1][4] = this.NetList[i][m][1];
									else
										this.Wires[n - 1][4] += ', ' + this.NetList[i][m][1];
									
									if (this.NetList[i][m][5] != -1)
										this.Wires[n - 1][4] += '[' + this.NetList[i][m][5] + ']'; 
									
									if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
										this.Wires[n - 1][5] = this.NetList[i][index3][1]
									else
										this.Wires[n - 1][5] += ', ' + this.NetList[i][index3][1];
									
									if (this.NetList[i][index3][5] != -1)
										this.Wires[n - 1][5] += '[' + this.NetList[i][index3][5] + ']'; 
								}
								
								else {
									if (typeof this.Wires[n - 1][5] == 'undefined' || this.Wires[n - 1][5] == '')
										this.Wires[n - 1][5] = this.NetList[i][m][1];
									else
										this.Wires[n - 1][5] += ', ' + this.NetList[i][m][1];
									
									if (this.NetList[i][m][5] != -1)
										this.Wires[n - 1][5] += '[' + this.NetList[i][m][5] + ']'; 
									
									if (typeof this.Wires[n - 1][4] == 'undefined' || this.Wires[n - 1][4] == '')
										this.Wires[n - 1][4] = this.NetList[i][index3][1]
									else
										this.Wires[n - 1][4] += ', ' + this.NetList[i][index3][1]
									if (this.NetList[i][index3][5] != -1)
										this.Wires[n - 1][4] += '[' + this.NetList[i][index3][5] + ']';
								}
							}
							// --
							

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
		Offset2 = GetOffset.call(this, this.Components[this.Constants[i][2]][1], this.Constants[i][3], this.Components[this.Constants[i][2]][7]);

		xa = this.Constants[i][1].x() + Offset1[0];
		ya = this.Constants[i][1].y() + Offset1[1];
		
		xb = this.Components[this.Constants[i][2]][6].x() + Offset2[0];
		yb = this.Components[this.Constants[i][2]][6].y() + Offset2[1];
		
		this.Wires[n][0] = GenerateOneWire.call(this, xa, xb, ya, yb); // There is only two components so I only have to make a wire between the componant A and the componant B.
		this.WireLength[n] = 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
		
		n++;
		this.Wires[0]++;
	}
	
	
	// 4. Add wires to the pannable and zoomable group
	for (i = 1; i <= this.Wires[0]; i++) {
		this.nodes.add(this.Wires[i][0]);
	}
	
	if (this.PlacementDone) {
		if (!this.LabelsDone)
			this.LabelsDone = 1;
		
		PlaceLabelsName.call(this);	
	}
}

function GenerateOneWire(xa, xb, ya, yb) {
	var wire = 0;
	var average = 0;
	
	average = (xa + xb) / 2;
	
	//wire = this.svgjs.line(xa, ya, xb, yb).stroke({ width: 1 }); // Straight lines (point to point)
	wire = this.svgjs.polyline(''+xa+','+ya+' ' +average+','+ya+' '+average+','+yb+' '+xb+','+yb).stroke({ width: 1 }).attr({'fill-opacity': 0}); // Trivial orthogonal wire (bend at mid point)
	
	return wire;
}	

function RemoveAllWires() {
	var i = 0;
	var l = 0;
	var m = 0;
	
	for (i = 1; i <= this.Wires[0]; i++)
		this.Wires[i][0].remove();
	
	for (l = 0; l <= 300; l++) {
		for (m = 0; m <= 300; m++) {
			this.Connections[l][m] = 0;
		}
	}
	
	this.Wires[0] = 0;
}

function GetWiresLength() {
	var i = 0;
	var TotalLength = 0;
	
		
	for (i = 1; i <= this.Wires[0]; i++)
		TotalLength += this.WireLength[i];
	
	return TotalLength;
}

function GetOffset(Gate_Type, IO_Name, Reverse) { // Get the offset for the connection point
	var Varx = 0, Vary = 0;
	
	if (typeof Reverse === 'undefined')
		Reverse = 0;

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
			if (Reverse == 0) {
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
			}
			
			else {
				if (this.gate_type == 0) {
					if (IO_Name === 'B') {
						Varx = 17;
						Vary = 35;
					}
					else if (IO_Name === 'A') {
						Varx = 17;
						Vary = 65;	
					}
					else {
						Varx = 83;
						Vary = 50;	
					}
				}
				else if (this.gate_type == 1) {
					if (IO_Name === 'B') {
						Varx = 11;
						Vary = 34;
					}
					else if (IO_Name === 'A') {
						Varx = 11;
						Vary = 66;	
					}
					else {
						Varx = 90;
						Vary = 50;	
					}
				}
			}
		break;
		case 5: // OR
			if (Reverse == 0) {
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
			}
			
			else {
				if (this.gate_type == 0) {
					if (IO_Name === 'B') {
						Varx = 17;
						Vary = 34;
					}
					else if (IO_Name === 'A') {
						Varx = 17;
						Vary = 66;	
					}
					else {
						Varx = 84;
						Vary = 50;	
					}
				}
				else if (this.gate_type == 1) {
					if (IO_Name === 'B') {
						Varx = 11;
						Vary = 34;
					}
					else if (IO_Name === 'A') {
						Varx = 11;
						Vary = 66;	
					}
					else {
						Varx = 90;
						Vary = 50;	
					}
				}
			
			}
		break;
		case 6: // XOR
			if (Reverse == 0) {
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
			}
			
			else {
				if (this.gate_type == 0) {
					if (IO_Name === 'B') {
						Varx = 10;
						Vary = 34;
					}
					else if (IO_Name === 'A') {
						Varx = 10;
						Vary = 66;	
					}
					else {
						Varx = 82;
						Vary = 50;	
					}
				}
				else if (this.gate_type == 1) {
					if (IO_Name === 'B') {
						Varx = 11;
						Vary = 34;
					}
					else if (IO_Name === 'A') {
						Varx = 11;
						Vary = 66;	
					}
					else {
						Varx = 90;
						Vary = 50;	
					}
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

function GetConnection (Gate_Type, Connection_Name) {
	switch(Gate_Type) { // return 0 for an recepter and 1 for an emetter
		case 0:
			return 1;
		break;
		case 1:
			return 0;
		break;
		case 2:
			if(Connection_Name == 'A')
				return 0;
			else
				return 1;
		break;
		case 3:
			if(Connection_Name == 'A')
				return 0;
			else
				return 1;
		break;
		case 4:
			if(Connection_Name == 'A' || Connection_Name == 'B')
				return 0;
			else
				return 1;
		break;
		case 5:
			if(Connection_Name == 'A' || Connection_Name == 'B')
				return 0;
			else
				return 1;
		break;
		case 6:
			if(Connection_Name == 'A' || Connection_Name == 'B')
				return 0;
			else
				return 1;
		break;
		/* todo: finish other components
		case 7:
			return 1;
		break;
		case 8:
			return 1;
		break;
		case 9:
			return 1;
		break;
		case 10:
			return 1;
		break;
		case 11:
			return 1;
		break;
		case 12:
			return 1;
		break;
		case 13:
			return 1;
		break;
		*/
		default: // Error
			return 0;
		break;
	}
}
// --

// Other
function isArray(obj) { // 1000 thanks to http://blog.caplin.com/2012/01/13/javascript-is-hard-part-1-you-cant-trust-arrays/
	return Object.prototype.toString.apply(obj) === "[object Array]";
}
// --