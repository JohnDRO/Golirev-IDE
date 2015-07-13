/*
 * Golirev : webworker.js
 * Details : ...
 *
*/

// Global var
var Components; // Contains informations concerning components of the circuit
var Connections; // Contains the netlist
var Wires; // Contains wires (lines).
var Gate_Norm = 0; // Which norm are we using : distinctive shapes or rectangular shapes, default : distinctive
var Grid; // Contains the grid information	
var WireLength = 0;
// --

// Event Callback
this.addEventListener('message', messageHandler, false);

function messageHandler(event) {
    
    var messageSent = event.data;
	
	switch (messageSent.cmd) {
		case 'parse_json': // Penser à set Gate_Norm
			// I parse the JSON
			log('Parsing of the JSON Data...');
			
			Gate_Norm = messageSent.data2;
			ParseJson(messageSent.data);
			// --

			// I correctly place components
			log('Placement of components...');

			SimulatedAnnealing();
			OptimizePlacement();
			// --

			// I send back data
			log('Sending back the positions of components...');
		
			SendElementsPositions();
			// --
		break;
		
		case 'write_wires': 
			// If the user drag a component, we will have to compute the new wires
			// data contains the ID of the dragged component and his new X and Y
			// messageSent.data : [ID, new x, new y]
			Components[messageSent.data[0]][8] = messageSent.data[1] / 100; // set the new x
			Components[messageSent.data[0]][9] = messageSent.data[2] / 100; // set the new y
			
			SendWiresPositions(); // send back data
		break;
		
		case 'switch_gatetype': 
			Gate_Norm = messageSent.data;
			SendElementsPositions();
			SendWiresPositions();
		break;
	}
}
// --

// Json related
function ParseJson(json) {
	// Init
	Components = new Array();
	Connections = new Array();
	Wires = new Array();
	savewires = 0;
	
	var Connections_tmp = new Array(); // 
	
	var Circuit_Name = '';
	var Nbr_Cste = 0;

	Components[0] = 0; // Set the number of components to 0
	Connections[0] = 0; // Set the number of connections to 0
	Connections_tmp[0] = 0; // Set the number of connections to 0
	// --
	
	// boucle JSON Parsing
	Circuit_Name = Object.keys(json.modules);
	
	// read I/O (A, B, clk, reset, ..)
	io_names = Object.keys(json.modules[Circuit_Name].ports);
	
	// Inputs and Outputs
	for (i in io_names) {
		// I increase the number of components and create a new array.
		Components[0]++;
		Components[Components[0]] = new Array();
		
		Components[Components[0]][0] = io_names[i]; // label name of the input/output
		Components[Components[0]][1] = false; // hide name : you can't hide the name of an input/output (only cells can)
		
		Components[Components[0]][2] = (json.modules[Circuit_Name].ports[io_names[i]].direction === 'input') ? 0 : 1; // gate type : 0 means input and 1 means output
		
		// Parameters and attributes
		Components[Components[0]][3] = new Array();
		Components[Components[0]][4] = new Array();
		
		Components[Components[0]][3][0] = 0; // inputs/outputs have no no parameters (only cells have)
		Components[Components[0]][4][0] = 0; // inputs/outputs have no no attributes (only cells have)
		// --
		
		Components[Components[0]][6] = ''; // svg element
		Components[Components[0]][7] = false; // reverse
		
		Components[Components[0]][8] = 0; // default x
		Components[Components[0]][9] = 0; // default y
		
		// Connections related
		index = json.modules[Circuit_Name].ports[io_names[i]].bits;
		
		if (index.length > 1) // We check if this port is a single wire or a bus.
			Components[Components[0]][0] += ' [' + (index.length - 1) + ':0]'; // If this is a bus, we add the size in the label.
		
		// I fill port informations
		Components[Components[0]][5] = new Array();
		Components[Components[0]][5][0] = 1; // Since this is an input or an output, it has only one port.
		
		Components[Components[0]][5][1] = new Array();
		
		Components[Components[0]][5][1][0] = Components[Components[0]][0];
		Components[Components[0]][5][1][1] = index.length;
		Components[Components[0]][5][1][2] = Components[Components[0]][2];
		// --
		
		var constant = 0;
		var const_value = '';
		//  = '';
		//
		
		
		for (a = 0; a < index.length; a++) {
			if (typeof index[a] == 'string') {
				constant = 1;
				const_value += index[a];
			}
			
			else {
				const_value += 'X';	
				
				// Code related to the connections var	
				if (typeof Connections[index[a]] == 'undefined') { // First element : the array doesn't exist
					Connections[index[a]] = new Array();
					
					Connections[0]++;
					
					Connections[index[a]][0] = 1; // One element.
					Connections[index[a]][1] = ''; // svg element
					Connections[index[a]][2] = [Components[0], Components[Components[0]][0], a, Components[Components[0]][2]]; // [Id of the element, Name of the port, Net position, Input/Output]
				}
				
				else { // Not the first element : the array already exist
					Connections[index[a]][0]++;
						
					Connections[index[a]][Connections[index[a]][0] + 1] = [Components[0], Components[Components[0]][0], a, Components[Components[0]][2]]; // [Id of the element, Name of the port, Net position, Input/Output]
				}
			}
		}
		
		if (constant) {
			Components[0]++;
			Components[Components[0]] = new Array();
			
			Components[Components[0]][0] = const_value; // usually it is the label of the component, here it is the value of the constant
			Components[Components[0]][1] = false; // hide name : you can't hide the name of an constant (only cells can)
			
			Components[Components[0]][2] = 0; // Constants are like input
			
			// Parameters and attributes
			Components[Components[0]][3] = new Array();
			Components[Components[0]][4] = new Array();
			
			Components[Components[0]][3][0] = 0; // inputs/outputs have no no parameters (only cells have)
			Components[Components[0]][4][0] = 0; // inputs/outputs have no no attributes (only cells have)
			// --
			
			Components[Components[0]][6] = ''; // svg element
			Components[Components[0]][7] = false; // reverse
			
			Components[Components[0]][5] = new Array();
			Components[Components[0]][5][0] = 1; // Since this is an input or an output, it has only one port.
			
			Components[Components[0]][5][1] = new Array();
			
			Components[Components[0]][5][1][0] = Components[Components[0]][0];
			Components[Components[0]][5][1][1] = const_value.length;
			Components[Components[0]][5][1][2] = Components[Components[0]][2];
			
			Nbr_Cste++;
			
			// Connections_tmp
			Connections_tmp[0]++;
			Connections_tmp[Connections_tmp[0]] = new Array();
			
			Connections_tmp[Connections_tmp[0]][0] = [Components[0] - 1, Components[Components[0] - 1][0], 0, Components[Components[0] - 1][2]]; // The Input/Output
			Connections_tmp[Connections_tmp[0]][1] = [Components[0], const_value, 0, 1]; // The constant
			// --
		}
	}
	// --
	
	// Cells
	// read cells (NOT, AND, OR, ..)
	cells_name = Object.keys(json.modules[Circuit_Name].cells);
	
	var CompoValue = 0;
	
	for (n in cells_name) {
		// I increase the number of components and create a new array.
		Components[0]++;
		Components[Components[0]] = new Array();
		
		CompoValue = Components[0]
		
		Components[Components[0]][0] = cells_name[n]; // label
		Components[Components[0]][1] = json.modules[Circuit_Name].cells[cells_name[n]].hide_name; // hide name
		Components[Components[0]][2] = GateToEqNumber(json.modules[Circuit_Name].cells[cells_name[n]].type); // gate type

		// Parameters and attributes
		Components[Components[0]][3] = new Array();
		Components[Components[0]][4] = new Array();
		
		Components[Components[0]][3][0] = 0; // init the number of parameters to 0.
		Components[Components[0]][4][0] = 0; // init the number of attributes to 0.
		
		// I check parameters
		param_names = Object.keys(json.modules[Circuit_Name].cells[cells_name[n]].parameters);
		
		for (k in param_names) {
			Components[Components[0]][3][0]++;
			
			index = Components[Components[0]][3][0];
			
			Components[Components[0]][3][index] = new Array();

			Components[Components[0]][3][index][0] = param_names[k]; // name of the parameter
			Components[Components[0]][3][index][1] = json.modules[Circuit_Name].cells[cells_name[n]].parameters[param_names[k]]; // value of the parameter
		}
		// --
		
		// I check attributes
		attrib_names = Object.keys(json.modules[Circuit_Name].cells[cells_name[n]].attributes);
		
		for (l in attrib_names) {
			Components[Components[0]][4][0]++;
			
			index = Components[Components[0]][4][0];
			
			Components[Components[0]][4][index] = new Array();

			Components[Components[0]][4][index][0] = attrib_names[l]; // name of the parameter
			Components[Components[0]][4][index][1] = json.modules[Circuit_Name].cells[cells_name[n]].attributes[attrib_names[l]]; // value of the parameter
		}
		// --
		
		Components[Components[0]][6] = ''; // svg element
		Components[Components[0]][7] = false; // reverse
		
		Components[Components[0]][8] = 0; // default x
		Components[Components[0]][9] = 0; // default y
		
		// Connections related
		cell_io_name = Object.keys(json.modules[Circuit_Name].cells[cells_name[n]].connections);
		Components[Components[0]][5] = new Array();
		Components[Components[0]][5][0] = 0;
		
		for (j in cell_io_name) {
			Components[CompoValue][5][0]++;
			index = Components[CompoValue][5][0];
			
			Components[CompoValue][5][index] = new Array();
			
			Components[CompoValue][5][index][0] = cell_io_name[j];
			Components[CompoValue][5][index][1] = json.modules[Circuit_Name].cells[cells_name[n]].connections[cell_io_name[j]].length;
			Components[CompoValue][5][index][2] = GetPortType(Components[CompoValue][2], cell_io_name[j]);
		
			index = json.modules[Circuit_Name].cells[cells_name[n]].connections[cell_io_name[j]];
			
			constant = 0;
			const_value = '';
			
			for (a = 0; a < index.length; a++) {
				if (typeof index[a] == 'string') {
					constant = 1;
					const_value += index[a];	
					
					// .. ici j'ajoute le code pour le code avec les cst 
				}
				
				else {
					const_value += 'X';
					
					// Code related to the connections var	
					if (typeof Connections[index[a]] == 'undefined') { // First element : the array doesn't exist
						Connections[index[a]] = new Array();
						
						Connections[0]++;
						
						Connections[index[a]][0] = 1; // One element.
						Connections[index[a]][1] = ''; // svg element
						Connections[index[a]][2] = [Components[0], cell_io_name[j], a, GetPortType (Components[Components[0]][2], cell_io_name[j])]; // [Id of the element, Name of the port, Net position, Input/Output]
					}
					
					else { // Not the first element : the array already exist
						Connections[index[a]][0]++;
							
						Connections[index[a]][Connections[index[a]][0] + 1] = [CompoValue, cell_io_name[j], a, GetPortType (Components[Components[0]][2], cell_io_name[j])]; // [Id of the element, Name of the port, Net position, Input/Output]
					}
				}
			}
			
			if (constant) {
				Components[0]++;
				Components[Components[0]] = new Array();
				
				Components[Components[0]][0] = const_value; // usually it is the label of the component, here it is the value of the constant
				Components[Components[0]][1] = false; // hide name : you can't hide the name of an constant (only cells can)
				
				Components[Components[0]][2] = 0; // Constants are like input
				
				// Parameters and attributes
				Components[Components[0]][3] = new Array();
				Components[Components[0]][4] = new Array();
				
				Components[Components[0]][3][0] = 0; // inputs/outputs have no no parameters (only cells have)
				Components[Components[0]][4][0] = 0; // inputs/outputs have no no attributes (only cells have)
				// --
				
				Components[Components[0]][6] = ''; // svg element
				Components[Components[0]][7] = false; // reverse
				
				Components[Components[0]][5] = new Array();
				Components[Components[0]][5][0] = 1; // Since this is an input or an output, it has only one port.
				Components[Components[0]][5][1] = new Array();
			
				Components[Components[0]][5][1][0] = Components[Components[0]][0];
				Components[Components[0]][5][1][1] = const_value.length;
				Components[Components[0]][5][1][2] = Components[Components[0]][2];
				
				Nbr_Cste++;
				
				// Connections_tmp
				Connections_tmp[0]++;
				Connections_tmp[Connections_tmp[0]] = new Array();
				
				Connections_tmp[Connections_tmp[0]][0] = [CompoValue, cell_io_name[j], 0, GetPortType (Components[CompoValue][2], cell_io_name[j])]; // The Input/Output
				Connections_tmp[Connections_tmp[0]][1] = [Components[0], const_value, 0, 1]; // The constant
				// --
			}

		}
	}
	
	// I move Connections_tmp into Connections
	for (a = 1; a <= Connections_tmp[0]; a++) {
		Connections[0]++;
		
		Connections[Connections[0] + 1] = new Array();
		Connections[Connections[0] + 1][0] = 2;
		Connections[Connections[0] + 1][1] = '';
		
		Connections[Connections[0] + 1][2] = [Connections_tmp[a][0][0], Connections_tmp[a][0][1], Connections_tmp[a][0][2]];
		Connections[Connections[0] + 1][3] = [Connections_tmp[a][1][0], Connections_tmp[a][1][1], Connections_tmp[a][1][2]];
	}
	// --
	
	return Components[1][0];
}
// --	

// Components and wires
function UpdateWireLength(SaveWires) {
	if (typeof SaveWires == 'undefined')
		SaveWires = 0;
	
	WireLength = 0;
	Wires[0] = 0;

	// Wires
	var i = 0, n = 0, k = 0, v = 0; // loops index
	
	var xa = 0, ya = 0, xb = 0, yb = 0; // Lines points.
	var Offset1 = 0, Offset2 = 0; // Points offset (see function GetOffset)

	// 2. Making new wires
	for (i = 2, n = 1; i <= (Connections[0] + 1); i++) {
		if (typeof Connections[i] != 'undefined') {
			if (Connections[i][0] == 2) { // Only two this.Components on the same line.
				ID1 = Connections[i][2][0];
				ID2 = Connections[i][3][0];
				
				Offset1 = GetOffset(Components[ID1][2], Connections[i][2][1], Components[ID1][7]); // GetOffset(Gate_Type, IO_Name, Reverse) 
				Offset2 = GetOffset(Components[ID2][2], Connections[i][3][1], Components[ID2][7]);

				xa = Components[ID1][8]*100 + Offset1[0];
				ya = Components[ID1][9]*100 + Offset1[1];

				xb = Components[ID2][8]*100 + Offset2[0];
				yb = Components[ID2][9]*100 + Offset2[1];

				// I have to add xa, xb, ya, yb in order to send data
				//WireLength += 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
				WireLength += Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya));

				if (Connections[i][2][4] == 1 && xa > xb)
					WireLength += 300 ;
					
				if (Connections[i][3][4] == 1 && xb > xa)
					WireLength += 300;
				
				if (SaveWires) {				
					Wires[0]++;
					Wires[Wires[0]] = [xa, xb, ya, yb]; // function GenerateOneWire(xa, xb, ya, yb)
				}
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

				for (k = 2; k <= (Connections[i][0] + 1); k++) { // I count the number of circuit input, circuit output and cell output
					ID = Connections[i][k][0];
					
					if (Connections[i][k][2] == 0) { // input
						if (Components[ID][2] == 0) {
							input_circuit_number++;
							index1 = k;
						}
					}
					else { // output
						if (Components[ID][2] == 1) {
							output_circuit_number++;
							index2 = k;
						}
						else {
							output_cell_number++;
							index3 = k;
						}
					}
				}
				
				if (input_circuit_number >= 1) { // case 1
					for (var m = 2; m <= (Connections[i][0] + 1); m++) { // I connect the circuit input to the other elements
						if (m != index1) {
							ID1 = Connections[i][m][0];
							ID2 = Connections[i][index1][0];

							Offset1 = GetOffset(Components[ID1][2], Connections[i][m][1], Components[ID1][7]); // GetOffset(Gate_Type, IO_Name, Reverse) 
							Offset2 = GetOffset(Components[ID2][2], Connections[i][index1][1], Components[ID2][7])

							xa = Components[ID1][8]*100 + Offset1[0];
							ya = Components[ID1][9]*100 + Offset1[1];

							xb = Components[ID2][8]*100 + Offset2[0];
							yb = Components[ID2][9]*100 + Offset2[1];
							
							// I have to add xa, xb, ya, yb in order to send data
							//WireLength += 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
							WireLength += Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya));
							
							if (Connections[i][m][4] == 1 && xa > xb)
								WireLength += 300 ;
								
							if (Connections[i][index1][4] == 1 && xb > xa)
								WireLength += 300;
							
							if (SaveWires) {				
								Wires[0]++;
								Wires[Wires[0]] = [xa, xb, ya, yb]; // function GenerateOneWire(xa, xb, ya, yb)
							}
						}
					}
				}
				
				else if (output_circuit_number >= 1) { // case 2
					for (var m = 2; m <= (Connections[i][0] + 1); m++) { // I connect the circuit output to the other elements
						if (m != index2) {
							ID1 = Connections[i][m][0];
							ID2 = Connections[i][index2][0];
							
							Offset1 = GetOffset(Components[ID1][2], Connections[i][m][1], Components[ID1][7]); // GetOffset(Gate_Type, IO_Name, Reverse) 
							Offset2 = GetOffset(Components[ID2][2], Connections[i][index2][1], Components[ID2][7])
							
							xa = Components[ID1][8]*100 + Offset1[0];
							ya = Components[ID1][9]*100 + Offset1[1];

							xb = Components[ID2][8]*100 + Offset2[0];
							yb = Components[ID2][9]*100 + Offset2[1];
							
							// I have to add xa, xb, ya, yb in order to send data
							//WireLength += 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
							WireLength += Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya));
							
							if (Connections[i][m][4] == 1 && xa > xb)
								WireLength += 300 ;
								
							if (Connections[i][index2][4] == 1 && xb > xa)
								WireLength += 300;
							
							if (SaveWires) {				
								Wires[0]++;
								Wires[Wires[0]] = [xa, xb, ya, yb]; // function GenerateOneWire(xa, xb, ya, yb)
							}
						}
					}
				}
				
				else if (output_cell_number >= 1) { // case 3
					for (var m = 2; m <= (Connections[i][0] + 1); m++) { // I connect the cell output to the other elements
						if (m != index3) {
							ID1 = Connections[i][m][0];
							ID2 = Connections[i][index3][0];
							
							Offset1 = GetOffset(Components[ID1][2], Connections[i][m][1], Components[ID1][7]); // GetOffset(Gate_Type, IO_Name, Reverse) 
							Offset2 = GetOffset(Components[ID2][2], Connections[i][index3][1], Components[ID2][7])
							
							xa = Components[ID1][8]*100 + Offset1[0];
							ya = Components[ID1][9]*100 + Offset1[1];

							xb = Components[ID2][8]*100 + Offset2[0];
							yb = Components[ID2][9]*100 + Offset2[1];
							
							// I have to add xa, xb, ya, yb in order to send data
							//WireLength += 2 * Math.abs(xb - xa) + Math.abs(yb - ya);
							WireLength += Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya));
							
							if (Connections[i][m][4] == 1 && xa > xb)
								WireLength += 300 ;
								
							if (Connections[i][index3][4] == 1 && xb > xa)
								WireLength += 300;
							
							if (SaveWires) {				
								Wires[0]++;
								Wires[Wires[0]] = [xa, xb, ya, yb]; // function GenerateOneWire(xa, xb, ya, yb)
							}				
						}
					}
				}
				
				else { // Impossible case
					;
				}
			}
		}
	}
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

function GetPortType (Gate_Type, Connection_Name) {
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

function MoveToGrid(ID, x, y) {
	if (typeof ID == 'undefined' || typeof x == 'undefined' || typeof y == 'undefined') return -1;

	Components[ID][8] = x;
	Components[ID][9] = y;
	
	return 1;
}

function GetWiresLength() {
	return WireLength;
}

function GetOffset(Gate_Type, IO_Name, Reverse) { // Get the offset for the connection point
	var Varx = 0, Vary = 0;
	
	if (typeof Reverse === 'undefined')
		Reverse = 0;

	if (typeof gate_type == 'undefined')
		gate_type = 0;
	
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
			if (Gate_Norm == 0) {
				if (IO_Name === 'A') {
					Varx = 24;
					Vary = 50;
				}
				else {
					Varx = 74;
					Vary = 50;	
				}
			}
			else if (Gate_Norm == 1) {
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
			if (Gate_Norm == 0) {
				if (IO_Name === 'A') {
					Varx = 24;
					Vary = 50;
				}
				else {
					Varx = 79;
					Vary = 50;	
				}
			}
			else if (Gate_Norm == 1) {
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
				if (Gate_Norm == 0) {
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
				else if (Gate_Norm == 1) {
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
				if (Gate_Norm == 0) {
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
				else if (Gate_Norm == 1) {
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
				if (Gate_Norm == 0) {
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
				else if (Gate_Norm == 1) {
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
				if (Gate_Norm == 0) {
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
				else if (Gate_Norm == 1) {
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
				if (Gate_Norm == 0) {
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
				else if (Gate_Norm == 1) {
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
				if (Gate_Norm == 0) {
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
				else if (gate_type == 1) {
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
// --


// Simulated Annealing && optimizing
function SimulatedAnnealing() {
	// Init
	var alpha = 0.999;
    var temperature = 400.0;
    var epsilon = 0.001;
	
	var iteration = 0;
	
	// Grid Init
	var a, b;
	Grid = new Array();
	for (a = -500; a < 500; a++) {
		Grid[a] = new Array();
		
		for (b = -500; b < 500; b++)
			Grid[a][b] = 0;
	}
	// --
	
	// Inital Placement
	var Ceil = Math.ceil(Math.sqrt(Components[0]));
	
	for (i = 1, a = 0, b = 0; i <= Components[0]; i++, a++) { // a == lines, b = columns
		if (a >= Ceil) {
			b++;
			a = 0;
		}
		
		Grid[a][b] = i;
		MoveToGrid(i, a, b);
	}
	// --
	
	UpdateWireLength();
	distance = GetWiresLength();
	log('Initial WireLength : ' + distance);
	// --
	
	// Boucle principale
	var Arr;
	var delta;
	var proba;
	
	// While the temperature did not reach epsilon
    while (temperature > epsilon) {
        iteration++;
		if (iteration === 320) // Currently hard-coded, I will have to modify it.
			log('Placement : 25%')
		else if (iteration === 640)
			log('Placement : 50%')
		else if (iteration === 960)
			log('Placement : 75%')

		// Make a random change
        Arr = RandomChange();
		UpdateWireLength();
		
		// Get the new delta
        delta = GetWiresLength() - distance;
       
	   if (delta < 0)
            distance = delta + distance;
        
		else {
            proba = Math.random();
			
            if (proba < Math.exp(-delta/temperature))
                distance = delta + distance;
			
			else 
				ReverseChange(Arr[0], Arr[1], Arr[2]);
        }
        
		// Cooling process on every iteration
        temperature *= alpha;
    }
	// --
	
	log('Final WireLength : ' + Math.round(GetWiresLength()));
	log('Number of iterations : ' + iteration);
}

function RandomChange() { // Make a random change, must return ID_Compo, x and y.
	// Random component ID
	var RandomID = Math.floor(Math.random() * (Components[0])) + 1;
	//alert(RandomID + ' : ' + this.Components[0] + ' : ' + this.Constants[0]);
	
	// Get x and y of this component
	var x = Components[RandomID][8];
	var y = Components[RandomID][9];
	// --
	
	// Random axis (x or y) and gain (-1 or 1)
	var axis = Math.floor((Math.random() * 2) + 1);
	var gain = Math.floor((Math.random() * 2)) ? -1 : 1;
	
	var SwitchID = 0;
	
	//log(x + ' ' + gain + ' ' + y + ' ' + RandomID);
	if (axis == 1) { // axis : x
		if (Grid[x + gain][y] == 0) {
			MoveToGrid(RandomID, x + gain, y);

			Grid[x][y] = 0;				
			Grid[x + gain][y] = RandomID; 				
		}
		
		else { // switch
			SwitchID = Grid[x + gain][y];
			
			MoveToGrid(RandomID, x + gain, y);
			MoveToGrid(SwitchID, x, y);

			Grid[x][y] = SwitchID;				
			Grid[x + gain][y] = RandomID; 	
		}
	}
	
	else { // axis : y
		if (Grid[x][y + gain] == 0) {
			MoveToGrid(RandomID, x, y + gain);

			Grid[x][y] = 0;				
			Grid[x][y + gain] = RandomID; 				
		}	
		
		else { // switch
			SwitchID = Grid[x][y + gain];
			
			MoveToGrid(RandomID, x, y + gain);
			MoveToGrid(SwitchID, x, y);

			Grid[x][y] = SwitchID;				
			Grid[x][y + gain] = RandomID; 	
		}
	}
	
	return [RandomID, x, y];
}

function ReverseChange(ID, x, y) {
	var SwitchID = 0;

	if (Grid[x][y] == 0) {
		Grid[Components[ID][8]][Components[ID][9]] = 0;
		Grid[x][y] = ID;
		
		MoveToGrid(ID, x, y);
	}
	
	else {
		SwitchID = Grid[x][y];
		
		Grid[Components[ID][8]][Components[ID][9]] = SwitchID;
		Grid[x][y] = ID;
		
		MoveToGrid(SwitchID, Components[ID][8], Components[ID][9]);
		MoveToGrid(ID, x, y);
	}
}

function OptimizePlacement() {
	var LocalWireLength = 0;
	var gain = 1 / 100;
	
	// 1. Port connection Switching
	// The main idea is to switch ports of a gate (AND/OR/XOR) and to check if this improves the WireLength
	UpdateWireLength(0);
	for (i = 1; i <= Components[0]; i++) {
		if (Components[i][2] == 4 || Components[i][2] == 5 || Components[i][2] == 6) {
			UpdateWireLength(0);
			
			LocalWireLength = GetWiresLength(); // Get the current state
			
			Components[i][7] = 1; // Reverse this component
			
			UpdateWireLength(0); // Update the circuit
			
			if (LocalWireLength > GetWiresLength()) { // We are decreasing the wirelength (good)
				; // I have to modify Connections[]
				

			}
			
			else { // We are increasing the wirelength (bad)	
				Components[i][7] = 0;
			}
		}
	}
	
	UpdateWireLength(0);
	// --
	/*
	// 2. Placement Switching
	// The main idea is to switch two components and to check if this improves the WireLength
	
	var MaxDif = 10;
	
	for (i = 1; i <= Components[0]; i++) {
		for (n = 1; n <= Components[0]; n++) {
			if (n != i) {
				// Save the current configuration
				xa = Components[i][8];
				ya = Components[i][9];
				
				xb = Components[n][8];
				yb = Components[n][9];
				
				WireLength = GetWiresLength();
				// --
				
				// I switch and check the results
				MoveToGrid(i, xb, yb);
				MoveToGrid(n, xa, ya);

				UpdateWireLength(0);
				
				if ((WireLength - GetWiresLength()) > 0) { // Are we improving the system ?
					; // Nothing to do.
				}
				
				else { // We have to put it back, it is not improving the system
					MoveToGrid(i, xa, ya);
					MoveToGrid(n, xb, yb);
					
					UpdateWireLength(0);
				}
			}
		}
	}
	// --
	
	// 3. Placement Delta
	for (i = 1; i <= Components[0]; i++) { // Cells
		if (Components[i][2] != 0 || Components[i][2] != 1) {
			LocalWireLength = GetWiresLength(); // Get the current WireLength
			
			Components[i][9] += gain;
			
			UpdateWireLength(0);
			
			if ((GetWiresLength() - LocalWireLength) < 0) { // Are we improving the situation ?
				for (n = 0; n < MaxDif && (GetWiresLength() - LocalWireLength) < 0; n++) {
					LocalWireLength = GetWiresLength();
					Components[i][9] += gain;
					UpdateWireLength(0);
				}

				if (n < MaxDif) {
					Components[i][9] -= gain;
					UpdateWireLength(0);
				}
			}
			
			else { // We have to go reverse
				LocalWireLength = GetWiresLength();
				Components[i][9] -= 2*gain;
				
				UpdateWireLength(0);
				
				if ((GetWiresLength() - LocalWireLength) > 0) {
					Components[i][9] += gain;
				}
				
				else {
					for (n = 0; n < MaxDif && (GetWiresLength() - LocalWireLength) < 0; n++) {
						LocalWireLength = GetWiresLength();
						Components[i][9] -= gain;
						UpdateWireLength(0);
					}

					if (n < MaxDif) {
						Components[i][9] += gain;
						UpdateWireLength(0);
					}
				}
			}
		}
	}
	
	UpdateWireLength(0);
	
	MaxDif = 70;
	
	for (i = 1; i <= Components[0]; i++) { // I/O
		if (Components[i][1] == 0 || Components[i][1] == 1) {
			LocalWireLength = GetWiresLength(); // Get the current WireLength
			
			Components[i][9] += gain;
			
			UpdateWireLength(0);
			
			if ((GetWiresLength() - LocalWireLength) < 0) { // Are we improving the situation ?
				for (n = 0; n < MaxDif && (GetWiresLength() - LocalWireLength) < 0; n++) {
					LocalWireLength = GetWiresLength();
					Components[i][9] += gain;
					UpdateWireLength(0);
				}

				if (n < MaxDif) {
					Components[i][9] -= gain;
					UpdateWireLength(0);
				}
			}
			
			else { // We have to go reverse
				LocalWireLength = GetWiresLength();
				Components[i][9] -= 2*gain;
				
				UpdateWireLength(0);
				
				if ((GetWiresLength() - LocalWireLength) > 0) {
					Components[i][9] += gain;
				}
				
				else {
					for (n = 0; n < MaxDif && (GetWiresLength() - LocalWireLength) < 0; n++) {
						LocalWireLength = GetWiresLength();
						Components[i][9] -= gain;
						UpdateWireLength(0);
					}

					if (n < MaxDif) {
						Components[i][9] += gain;
						UpdateWireLength(0);
					}
				}
			}
		}
	}
	
	
	// --
	
	// 4. Overlapping Wires : to implement
	/*
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
	*/

	// --
	log('Placement : 100%')
}
// --

// Send Data
function SendElementsPositions() {
	SendComponentsPositions();
	SendWiresPositions();
}

function SendComponentsPositions() {
	postMessage({
		'cmd': 'place_components',
		'data': Components
	});
}

function SendWiresPositions() { // GenerateOneWire(xa, xb, ya, yb);
	UpdateWireLength(1);

	postMessage({
		'cmd': 'place_wires',
		'data': Wires
	});
}

function log(string) {
	postMessage({
		'cmd': 'log',
		'data': string
	});
}
// --