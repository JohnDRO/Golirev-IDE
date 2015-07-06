var Gate_Norm = 0; // Le set dans parse_json

function messageHandler(event) {
    
    var messageSent = event.data;
	
	switch (messageSent.cmd) {
		case 'parse_json': // Penser à set Gate_Norm

			log('Parse of the JSON Data : starting');
			
			ParseJson(messageSent.data);

			log('Parse of the JSON Data : done');
			
			// Ici je fais le simulated annealing'
			log('Placement of components : starting');
			
			SimulatedAnnealing();
			
			log('Placement of components : done');
			// --
			
			// Ici j'envoie les elements
			log('Sending back the positions of components : starting');
			
			SendElementsPositions();
			
			log('Sending back the positions of components : done');
			// --
		break;
		
		case 'write_wires':
		break;
	}
}

// On définit la fonction à appeler lorsque la page principale nous sollicite
this.addEventListener('message', messageHandler, false);

var Components = new Array();
var Connections = new Array();
	
Grid = new Array();
var a, b;
for (a = -500; a < 500; a++) {
	Grid[a] = new Array();
	
	for (b = -500; b < 500; b++)
		Grid[a][b] = 0;
}
			
var WireLength = 0;
// --

function ParseJson(json) {
	

	var Connections_tmp = new Array();
	
	var Circuit_Name = '';
	var Nbr_Cste = 0;
	
	// Init des variables
	// 1. Boucle à travers les compo pour les retirer (soit faire une fct soit mettre dans le code, à voir)
	Components[0] = 0;
	Connections[0] = 0;
	Connections_tmp[0] = 0;
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
							
						Connections[index[a]][Connections[index[a]][0] + 1] = [Components[0], cell_io_name[j], a, GetPortType (Components[Components[0]][2], cell_io_name[j])]; // [Id of the element, Name of the port, Net position, Input/Output]
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
		
		Connections[Connections[0]] = new Array();
		Connections[Connections[0]][0] = 2;
		Connections[Connections[0]][1] = '';
		
		Connections[Connections[0]][2] = [Connections_tmp[Connections_tmp[0]][0][0], Connections_tmp[Connections_tmp[0]][0][1], Connections_tmp[Connections_tmp[0]][0][2]];
		Connections[Connections[0]][3] = [Connections_tmp[Connections_tmp[0]][1][0], Connections_tmp[Connections_tmp[0]][1][1], Connections_tmp[Connections_tmp[0]][1][2]];
	}
	// --

	return Components[1][0];
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
	/*
	var test = new Array();
	
	test[0] = 1;
	test[1] = [5, 0, 500, 0];

	postMessage({
		'cmd': 'place_wires',
		'data': test
	});
	
	*/
}

function SimulatedAnnealing() {
	// Init
	var alpha = 0.999;
    var temperature = 400.0;
    var epsilon = 0.001;
	
	var iteration = 0;
	
	for (i = 1; i <= Components[0]; i++) {
		//log(messageSent.data[i][8] + ' ' + messageSent.data[i][9]);
		Grid[5][i] = 1;
		MoveToGrid(i, 5, i);
	}
	
	var a, b;
	for (a = -500; a < 500; a++) {
		Grid[a] = new Array();
		
		for (b = -500; b < 500; b++)
			Grid[a][b] = 0;
	}
	
	log('WL Avant : ' + GetWiresLength());
	UpdateWireLength();
	distance = GetWiresLength();

	// --
	
	// Boucle principale
	var Arr;
	var delta;
	var proba;
	
		log('---');
		log('id : ' + Date());
		log('iteration : ' + iteration);
		log('---');
	
	// While the temperature did not reach epsilon
    while (temperature > epsilon) {
        iteration++;

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
		log('WL Apres : ' + GetWiresLength());
		log('---');
		log('id : ' + Date());
		log('iteration : ' + iteration);
		log('---');
	
	// --
	
}
// --	

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
	
	//log(x + ' ' + gain + ' ' + y + ' ' + RandomID);
	if (axis == 1) { // axis : x
		if (Grid[x + gain][y] == 0) {
			MoveToGrid(RandomID, x + gain, y);

			Grid[x][y] = 0;				
			Grid[x + gain][y] = 1; 				
		}
	}
	
	else { // axis : y
		if (Grid[x][y + gain] == 0) {
			MoveToGrid(RandomID, x, y + gain);

			Grid[x][y] = 0;				
			Grid[x][y + gain] = 1; 				
		}	
	}
	
	return [RandomID, x, y];
}

function ReverseChange(ID, x, y) {
	Grid[Components[ID][8]][Components[ID][9]] = 0;
	Grid[x][y] = 1;
	MoveToGrid(ID, x, y);
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

function UpdateWireLength() {
	WireLength = 0;

	// Wires
	
	var i = 0, n = 0, k = 0, v = 0; // loops index
	
	var xa = 0, ya = 0, xb = 0, yb = 0; // Lines points.
	var Offset1 = 0, Offset2 = 0; // Points offset (see function GetOffset)

	// 2. Making new wires
	for (i = 1, n = 1; (n - v) <= Connections[0] && i <= 300; i++) {
	//for (i = 1, n = 1; (n - v) <= 300 && i < 300; i++) {
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
					WireLength += 200 ;
				
				if (Connections[i][3][4] == 1 && xb > xa)
					WireLength +=200;
				
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
					}
				}
				
				else if (output_circuit_number >= 1) { // case 2
					for (var m = 1; m <= this.NetList[i][0]; m++) { // I connect the circuit output to the other elements
						if (m != index2) {
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
					}
				}
				
				else if (output_cell_number >= 1) { // case 3
					for (var m = 1; m <= this.NetList[i][0]; m++) { // I connect the cell output to the other elements
						if (m != index3) { // problème source/emetteur ici.
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
					}
				}
				
				else { // Impossible case
					;
				}
			}
		}
	}

	
}

function log(string) {
	postMessage({
		'cmd': 'log',
		'data': string
	});
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
