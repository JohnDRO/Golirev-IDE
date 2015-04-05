function DisplayResults() { // Fonctions utilisé pour tester mon resultat
	var i = 0;
	
	for (i = 1; i <= Components[0]; i++) {
		document.write(Components[i][0] + ':' + Components[i][1] + '<br />');
	}
	/*	
	for (i = 1; i < nombre de connections; i++)
		// On affiche
	*/
	
	
	return 0;
} 

function ParseJson(json_yosysJS) { // voir algo.js
	// Définition et initialisation des variables
	var Circuit_Name; // circuits related variables
	
	var io_names, cells_name;
	
	var i = 0, n = 0; // counters
	
	Components[0] = 0; // Initialisation du nombre de composants à 0;
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
		// --
	
	
		//Components[0]++;
	}
	// ---
	
	CircuitInfo[2] = Circuit_Name;
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
	
	for (i = 1; i < Components[0]; i++)
		Components[i][6] = GenerateGate(SVG_Element, Components[i][1], Components[i][0], 0);
}

function GenerateGate(SVG_Element, Gate_Type, Label, Gate_Norm) { // Generate a gate and return the svgjs element created.
	var group = draw.group(), text, longeur = 0, rect;
	
	if (Gate_Type < 0 || Gate_Type > 5) // 0 == INPUT, 1 == OUTPUT, 2 == BUF, 3 == NOT, 4 == AND, 5 == OR
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
		break;
		case 1: // Output
			longeur = Label.length * 3 + 70;
			
			rect = draw.rect(60, 10)
			text = SVG_Element.plain(Label).center(longeur, 5).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m -16,5 16,0');
			
			group.add(rect);
			group.add(text)
			
			group.stroke({ width: 1 }).fill('#FFF').center(900, 150).draggable(function(x, y) { return { x: x < 1000, y: y < 300 } })
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
		
			/*
			group.dragmove = function() {
			  GenerateAllWires(draw, test1, test2);
			}
			*/
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
		
			/*
			group.dragmove = function() {
			  GenerateAllWires(draw, test1, test2);
			}
			*/
		break;
		default: // Error
			return -1;
		break;
	} 
	
	return group;
}

function GenerateAllWires(draw, test1, test2) { // Fonction à excuter à chaque drag
	var i = 0;
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
