function DisplayResults() { // Fonctions utilisé pour tester mon resultat
	var i = 0, k = 0;
	
	for (i = 1; i <= Components[0]; i++) {
		document.write(Components[i][0] + ':' + Components[i][1] + '<br /> *');
	}
	
	document.write('<hr>');
	
	for (i = 1, b = 0; b <= NetList[0]; i++) {
		if (typeof NetList[i] != 'undefined') {
			for (var l = 1; l <= NetList[i][0]; l++)
				document.write(Components[NetList[i][l][0]][0] + '.' + NetList[i][l][1] + ' === ');
			
			document.write('<br />');
			b++;
		}
	}
	
	document.write('<hr>');
	
	return 0;
} 

function ParseJson(json_yosysJS) { // voir algo.js
	// Définition et initialisation des variables
	var Circuit_Name; // circuits related variables
	
	var io_names, cells_name;
	
	var i = 0, n = 0, k = 0; // counters
	
	Components[0] = 0; // Init components to 0
	NetList[0] = 0; // Init links to 0
	// ---
	
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
		
		if (typeof NetList[meh2] === 'undefined') {
			NetList[meh2] = new Array();
			NetList[meh2][0] = 1;
			
			NetList[meh2][1] = new Array();
			NetList[meh2][1][0] = 1 + parseInt(i);
			NetList[meh2][1][1] = 0;
			
			NetList[meh2][1][2] = 0; // x
			NetList[meh2][1][3] = 0; // y
			NetList[0]++;
		}
		else {
			NetList[meh2][0]++;
			NetList[meh2][NetList[meh2][0]] = new Array();
			
			NetList[meh2][NetList[meh2][0]][0] = 1 + parseInt(i);
			NetList[meh2][NetList[meh2][0]][1] = 0;
			
			NetList[meh2][NetList[meh2][0]][2] = 0; // x
			NetList[meh2][NetList[meh2][0]][3] = 0; // y
		}
		
		document.write('<br />kk : ' + meh2 + '<br />');
		
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
		
		// Netlist related : todo
		cell_io_name = Object.keys(json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].connections);
		
		for (k in cell_io_name) {
			// 
			var meh = json_yosysJS.modules[Circuit_Name].cells[cells_name[n]].connections[cell_io_name[k]];
			if (typeof NetList[meh] === 'undefined') {
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
		// --
		
		//Components[0]++;
	}
	// ---
	
	CircuitInfo[2] = String(Circuit_Name);
	CircuitInfo[3] = json_yosysJS.creator;
	return 0;
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
	}
	
	return GateNumber;
}

function MoveGateXY(gate, x, y) {
	if (typeof gate == 'undefined' || typeof y == 'undefined' || typeof y == 'undefined') return -1;
	
	gate.center(x, y);
	
	return 1;
}

function GenerateAllGates(SVG_Element) {
	var i = 0;
	
	RemoveAllGates();
	
	for (i = 1; i <= Components[0]; i++) 
		Components[i][6] = GenerateGate(SVG_Element, Components[i][1], Components[i][0], 0);
	
	CircuitInfo[4] = SVG_Element.text('Circuit : ' + CircuitInfo[2]).draggable().fill('#000').stroke({ width: 0.1 });
}

function GenerateGate(SVG_Element, Gate_Type, Label, Gate_Norm) { // Generate a gate and return the svgjs element created.
	var group = draw.group(), text, text1, text2, text3, longeur = 0, rect;
	
	if (Gate_Type < 0 || Gate_Type > 7) // 0 == INPUT, 1 == OUTPUT, 2 == BUF, 3 == NOT, 4 == AND, 5 == OR, 6 == XOR, 7 == DFF
		return -1;
	
	if (typeof Label == 'undefined')
		Label = 'Gate';
		
	if (typeof Gate_Norm == 'undefined')
		Gate_Norm = 0; // American Symbol by default

	switch(Gate_Type) {
		case 0: // Input
			longeur = (-Label.length) * 3 - 5;
			
			rect = draw.rect(60, 10)
			text = SVG_Element.plain(Label).center(longeur, 5).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m 60,5 16,0');
			
			group.add(rect);
			group.add(text)
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
			
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
		break;
		case 1: // Output
			longeur = Label.length * 3 + 70;
			
			rect = draw.rect(60, 10)
			text = SVG_Element.plain(Label).center(longeur, 5).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m -16,5 16,0');
			
			group.add(rect);
			group.add(text)
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
			
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
		break;
		case 2: // YES group.add(rect)
			if (Gate_Norm == 0) {
				text = SVG_Element.plain(Label).center(17, 0).stroke({ width: 0.1 }).fill('#000');
			
				group.path('m 32,24 -31,-15 0,30 z');
				group.path('m -15,23.9 16,0');
				group.path('m 31,23.9 16,0');
				group.add(text)
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
			
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
		break;
		case 3: // NOT
			if (Gate_Norm == 0) {
				text = SVG_Element.plain(Label).center(17, 0).stroke({ width: 0.1 }).fill('#000');
				
				group.circle(7).center(36, 23.9);
				group.path('m 32,24 -31,-15 0,30 z');
				group.path('m -15,23.9 16,0');
				group.path('m 40,23.9 12,0');
				group.add(text)
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
			
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
		break;			
		case 4: // AND
			if (Gate_Norm == 0) {
				text = SVG_Element.plain(Label).center(17, -10).stroke({ width: 0.1 }).fill('#000');
			
				group.path('m 0,1 24,0 a 23,23 0 0 1 0,46 l -24,0 z');
				group.path('m -16,9 16,0');
				group.path('m 47,25 16,0');
				group.path('m -16,41 16,0');
				group.add(text)
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
		
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
			
		break;		
		case 5: // OR
			if (Gate_Norm == 0) {
				text = SVG_Element.plain(Label).center(17, -10).stroke({ width: 0.1 }).fill('#000');
				
				group.path('m -3.5,1 19.5,0 a 40,46 0 0 1 32,23 a 40,46 0 0 1 -32,23 l -19.5,0 a 40,40 0 0 0 0,-46 z');
				group.path('m -16,9 16,0');
				group.path('m 47,25 16,0');
				group.path('m -16,41 16,0');
				group.add(text)
			}
			
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
		
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
			
		break;
		case 6: // XOR
			if (Gate_Norm == 0) {
				text = SVG_Element.plain(Label).center(17, -10).stroke({ width: 0.1 }).fill('#000');
				
				group.path('m -3.5,1 a 40,40 0 0 1 0,46');
				group.path('m 2.5,1 13.5,0 a 40,46 0 0 1 32,23 a 40,46 0 0 1 -32,23 l -13.5,0 a 40,40 0 0 0 0,-46 z');
				group.path('m -16,9 16,0');
				group.path('m 47,25 16,0');
				group.path('m -16,41 16,0');
				group.add(text)
			}
			
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
		
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
			
		break;
		case 7: // DFF
			if (Gate_Norm == 0) {
				text = SVG_Element.plain(Label).center(30, -10).stroke({ width: 0.1 }).fill('#000'); 
				text1 = SVG_Element.plain('D').center(10, 15).stroke({ width: 0.1 }).fill('#000'); 
				text2 = SVG_Element.plain('Q').center(50, 15).stroke({ width: 0.1 }).fill('#000'); 
				text3 = SVG_Element.plain('CLK').center(15, 60).stroke({ width: 0.1 }).fill('#000'); 
				
				group.rect(60, 80); // The main rect
				group.path('m -16,15 16,0'); // symboles de connections (D)
				group.path('m -16,60 16,0'); // (clk)
				group.path('m 60,15 16,0'); // (Q)
				group.add(text);
				group.add(text1);
				group.add(text2);
				group.add(text3);
			}
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
		
			group.dragmove = function() {
			  GenerateAllWires(draw);
			}
			
		break;
		default: // Error
			return -1;
		break;
	} 
	
	group.style('cursor', 'move');
	
	return group;
}

function GenerateAllWires(draw) { // Fonction à excuter à chaque drag
	var i = 0, n = 0, k = 0, v = 0;
	
	var Offset1 = 0;
	var Offset2 = 0;
	// --
	// 1. Je supprime les anciens
	for (i = 1; i <= Wires[0]; i++)
		Wires[i].remove();
	
	Wires[0] = 0;
	
	for (i = 1, n = 1; (n - v) <= NetList[0] && i < 300; i++) { 
		if (typeof NetList[i] != 'undefined') {
			if (NetList[i][0] == 2) {
				Offset1 = GetOffset(Components[NetList[i][1][0]][1], NetList[i][1][1]);
				Offset2 = GetOffset(Components[NetList[i][2][0]][1], NetList[i][2][1]);

				
				xa = Components[NetList[i][1][0]][6].x() + Offset1[0];
				ya = Components[NetList[i][1][0]][6].y() + Offset1[1];
				xb = Components[NetList[i][2][0]][6].x() + Offset2[0];
				yb = Components[NetList[i][2][0]][6].y() + Offset2[1];
				
				Wires[n] = GenerateOneWire(xa, xb, ya, yb);
				
				Wires[0]++;
				n++;
			}
				
			else {
				var input_circuit_number = 0;
				var output_circuit_number = 0;
				var output_cell_number = 0;
				
				var result = 0;
				
				var index1 = 0;
				var index2 = 0;
				var index3 = 0;
				
				var xa = 0;
				var ya = 0;
				var xb = 0;
				var yb = 0;
				
				var id1 = 0;
				var id2 = 0;
				//blabla je compte le nombre d'input, d'output circuit, output cell		
				for (k = 1; k <= NetList[i][0]; k++) {
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
				
				if (input_circuit_number >= 1) {
					for (var m = 1; m <= NetList[i][0]; m++) { // I connect the input to the other elements
						if (m != index1) {
							id1 = NetList[i][m][0];
							id2 = NetList[i][index1][0];
							
							Offset1 = GetOffset(Components[id1][1], NetList[i][m][1]);
							Offset2 = GetOffset(Components[id2][1], NetList[i][index1][1]);
							
							xa = Components[id1][6].x() + Offset1[0];
							ya = Components[id1][6].y() + Offset1[1];

							xb = Components[id2][6].x() + Offset2[0];
							yb = Components[id2][6].y() + Offset2[1];
							
							Wires[n] = GenerateOneWire(xa, xb, ya, yb);
							Wires[0]++;
							n++;
							v++;
						}
					}
				}
				
				else if (output_circuit_number >= 1) {
					for (var m = 1; m <= NetList[i][0]; m++) { // I connect the output to the other elements
						if (m != index2) {
							id1 = NetList[i][m][0];
							id2 = NetList[i][index2][0];
							
							Offset1 = GetOffset(Components[id1][1], NetList[i][m][1]);
							Offset2 = GetOffset(Components[id2][1], NetList[i][index2][1]);
							
							xa = Components[id1][6].x() + Offset1[0];
							ya = Components[id1][6].y() + Offset1[1];

							xb = Components[id2][6].x() + Offset2[0];
							yb = Components[id2][6].y() + Offset2[1];
							
							Wires[n] = GenerateOneWire(xa, xb, ya, yb);
							Wires[0]++;
							n++;
							v++;
						}
					}
				}
				
				else if (output_cell_number >= 1) {
					// blabla je connect output cell to le reste
				}
				
				else { // Cas normalement impossible
					;
				}
				
			}
			
			// else ;
			// else voir le nombre et etudier les cas
			
		}

	}
		
		
	
	// 2. Je calcul les nouveaux points
	// 3. Je refais les fils
	// --
	// 1. On supprime les anciens
	/*
	for (i = 1; i < blabla_write[0]; i++) // blabla_write global
		blabla_write[i].remove();
	// --
	
	// 2. Je calcul le nouveau de point à faire ( Normalement c'est le même ? A voir s'il n'y a pas besoin de tout refaire)
	// On suppose qu'on le connait, ne surtout pas relire le json. Il faut utiliser ma propre variable
	// --
	
	// 3. Je calcul les nouveaux xa, xb, ya, yb et je les met dans un tableau.
	//--
	
	// 4. Je fais les fils
	for (i = 1; i < NOMBRE_DE_FIL A FAIRE; i++) {
		// Il faut faire le calcul de xa, xb, .. Voir comment les liaisons seront sauvegardées.
		blabla_write[i] = GenerateOneWire(xa, xb, ya, yb);
	}
		/*
		x1 = test1.x();
		y1 = test1.y();
		
		x2 = test2.x();
		y2 = test2.y();
		
		*/
}

function GenerateOneWire(xa, xb, ya, yb) {
	var wire = 0;
	
	wire = draw.line(xa, ya, xb, yb).stroke({ width: 1 });
	
	return wire;
}	

function RemoveAllGates() {
	var i = 0;
	
	for (i = 1; i < Components[0]; i++) {
		if (typeof Components[i][6] != 'undefined')
			Components[i][6] = Components[i][6].remove();
	}
}

function GetOffset(Gate_Type, IO_Name) { // Decallage du départ du fil par rapport au centre de l'objet ..
	var Varx = 0, Vary = 0;
	
	switch (Gate_Type) {
		case 0: // Input
			Varx = 76;
			Vary = 5;
		break;
		case 1: // Output
			Varx = -16;
			Vary = 5;
		break;
		case 2: // Buf
			if (IO_Name === 'A') {
				Varx = -15;
				Vary = 24;
			}
			else {
				Varx = 52;
				Vary = 24;	
			}
		break;
		case 3: // Not
			if (IO_Name === 'A') {
				Varx = -15;
				Vary = 24;
			}
			else {
				Varx = 52;
				Vary = 24;	
			}
		break;
		case 4: // And
			if (IO_Name === 'A') {
				Varx = -16;
				Vary = 9;
			}
			else if (IO_Name === 'B') {
				Varx = -16;
				Vary = 41;	
			}
			else {
				Varx = 62;
				Vary = 25;	
			}
		break;
		case 5: // OR
			if (IO_Name === 'A') {
				Varx = -16;
				Vary = 9;
			}
			else if (IO_Name === 'B') {
				Varx = -16;
				Vary = 41;	
			}
			else {
				Varx = 62;
				Vary = 25;	
			}
		break;
		case 6: // XOR
			if (IO_Name === 'A') {
				Varx = -16;
				Vary = 9;
			}
			else if (IO_Name === 'B') {
				Varx = -16;
				Vary = 41;	
			}
			else {
				Varx = 62;
				Vary = 25;	
			}
		break;
		case 7: // DFF
			if (IO_Name === 'C') { // clock
				Varx = -16;
				Vary = 60;
			}
			else if (IO_Name === 'D') { // D
				Varx = -16;
				Vary = 15;	
			}
			else { // Q
				Varx = 76;
				Vary = 15;	
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
	var type = 0;
	var k = 0;
	
	if (Components[Component_ID][1] == 0 || Components[Component_ID][1] == 1) {
		type = (Components[Component_ID][1] == 0) ? 1 : 2;
	}
	
	else if (k == 0)
		type = 3;
	
	// 1. On check le type, input/output
	// 2. Si cell, on check si c'est une output
	// 3. Else c'est une input de cell, 
	return type;
	
	
}