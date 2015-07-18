/*
 * Golirev : function.js
 * Details : Contains javascript code related to svgjs.
 *
*/

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
	this.zoomSpeed = 2;

	// Methods
	this.DisplayJson = ShowJSON;
	this.UpdateGate = UpdateGateType;
	this.focus = FocusOnSchematic;
	// --
	
	this.webworker;
	
	this.webworker = new Worker('webworker.js'); 
	
	this.GlobalComponentsGroup = this.svgjs.group();
	
	obj = this;
	
	this.testCompo = new Array();
	this.testCompo[0] = 0;
	
	this.ComponentsSVG = new Array();
	this.ComponentsSVG[0] = 0;
	
	this.Wires = new Array();
	this.Wires[0] = 0;
	
	this.Labels = new Array();
	this.Labels[0] = 0;

	this.webworker.onmessage = function (event) {
		var messageSent = event.data;
		var i = 0;

		switch (messageSent.cmd) {
			case 'log':  
				log('[GOLIREV] ' + messageSent.data);
			break;
			case 'place_components':  
				// I remove wires
				for (i = 1; i <= obj.Wires[0]; i++)
					if (typeof obj.Wires[i] != 'undefined')
						obj.Wires[i].remove();
				
				// I remove previous components
				obj.GlobalComponentsGroup.remove();
				obj.GlobalComponentsGroup = obj.svgjs.group();
				
				obj.testCompo[0] = 0;
				obj.ComponentsSVG[0] = 0;
				for (i = 1; i <= messageSent.data[0]; i++) {
					// Quick modification on the label (add : [N:0])
					if ((messageSent.data[i][2] == 0 || messageSent.data[i][2] == 1) && messageSent.data[i][5][1][1] > 1)
						messageSent.data[i][0] += ' [' + (messageSent.data[i][5][1][1] - 1) + ':0]';
						
					
					// Generating the component
					obj.ComponentsSVG[0]++;
					obj.ComponentsSVG[i] = GenerateGate.call(obj, i, messageSent.data[i][2], messageSent.data[i][0], messageSent.data[i][1]); // Gate kind, Gate Label, Hide name
					
					// Placing the component correctly
					MoveGateXY(obj.ComponentsSVG[i], messageSent.data[i][8] * 100, messageSent.data[i][9] * 100);
					
					// Adding the component to the global group
					obj.GlobalComponentsGroup.add(obj.ComponentsSVG[i]);
					// I will need to save some data here
					obj.testCompo[0]++;
					
					obj.testCompo[obj.testCompo[0]] = [messageSent.data[i][8], messageSent.data[i][9], messageSent.data[i][6]];
				}
				
				// I add the global group to the pan-zoom.
				obj.nodes.add(obj.GlobalComponentsGroup);
				FocusOnSchematic.call(obj);
			break;
			case 'place_wires':  			
				// Creating new wires
				obj.Wires[0] = 0;
				for (i = 1; i <= messageSent.data[0]; i++) {
					if (messageSent.data[i][4] == 1) {
						// Remove old wire
						if (typeof obj.Wires[i] != 'undefined')
							obj.Wires[i].remove();
						
						// Make a new wire
						obj.Wires[0]++;
						obj.Wires[i] = GenerateOneWire.call(obj, messageSent.data[i][0], messageSent.data[i][1], messageSent.data[i][2], messageSent.data[i][3]);
						obj.nodes.add(obj.Wires[i]);
					}
				}
				// --
			break;
			case 'place_netlabels':  
				// Removing old netlabels
				for (i = 1; i <= obj.Labels[0]; i++) {
					obj.Labels[i].remove();
				}
				
				obj.Labels[0] = 0;
				// --
				//console.log(messageSent.data);
				// Creating new labels
				for (i = 1; i <= messageSent.data[0]; i++) {
					obj.Labels[0]++;
					obj.Labels[i] = obj.svgjs.text(messageSent.data[i][0]).move(messageSent.data[i][1] * 100, messageSent.data[i][2] * 100)
					obj.nodes.add(obj.Labels[i]);
				}
				// --
			break;
		}
	}
	
	this.PreviousDate = new Date();
	this.CurrentDate = new Date();
	
}
 
function ShowJSON(json_object, gate_type) {
	// We send the JSON Object to the worker
	this.webworker.postMessage({
		'cmd': 'parse_json',
		'data': json_object,
		'data2': gate_type
	});
	
	this.gate_type = gate_type;
	
	if (typeof this.nodes == 'undefined') {
		this.nodes = this.svgjs.group();
		this.nodes.panZoom({zoom : [0.5, 1.5], zoomSpeed : this.zoomSpeed});	
	}
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

// Components
function GenerateGate(ID, Gate_Type, Label, hide_label) { // Generate a gate and return the svgjs element created.
	var group = this.svgjs.group(), text, text1, text2, text3, text4, longeur = 0, rect;
	var MAXX = 5000, MAXY = 5000;
	
	if (Gate_Type < 0 || Gate_Type > 13) // 0 == INPUT, 1 == OUTPUT, 2 == BUF, 3 == NOT, 4 == AND, 5 == OR, 6 == XOR, 7 == DFF_P, 8 == MUX, 9 == DFF_N, 10 == DFF_NNX, 11 == DFF_NPX, 12 == DFF_PNX, 13 == DFF_PPX
		return -1;
	
	if (typeof Label == 'undefined')
		Label = 'Default gate name';
		
	if (typeof this.gate_type == 'undefined')
		this.gate_type = 0; // Distinctive shape by default 
	
	switch(Gate_Type) {
		case 0: // Input
			rect = this.svgjs.rect(60, 10).center(50, 50);
			text = this.svgjs.plain(Label).x(20).y(25).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m 80,50 10,0');
			
			group.add(rect);
			group.add(text);
			
		break;
		case 1: // Output
			rect = this.svgjs.rect(60, 10).center(50, 50);
			text = this.svgjs.plain(Label).x(20).y(25).stroke({ width: 0.1 }).fill('#000');
			
			group.path('m 11,50 10,0');
			
			group.add(rect);	
			group.add(text);
			
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
			
		break;
		default: // Error
			return -1;
		break;
	} 
	
	group.stroke({ width: 1 }).fill('#FFF').center(0, 0).draggable();

	var obj = this;
	
	group.dragmove = function(event, z) {
		obj.CurrentDate = new Date();
		var dif = obj.CurrentDate - obj.PreviousDate;
		obj.PreviousDate = obj.CurrentDate;
		
		if (dif < 5)
			return 0;
		
		obj.webworker.postMessage({
			'cmd': 'write_wires',
			'data': [ID, obj.ComponentsSVG[ID].x(), obj.ComponentsSVG[ID].y()],
			'data2': obj.gate_type
		});
	}
	
	group.style('cursor', 'move'); // Change the cursor style
	
	this.nodes.add(group); // Span and zoom
	
	return group;
}

function UpdateGateType() { // Update SVG components (i.e. : Distinctive shape to rectangular shape).
	this.gate_type = !this.gate_type;
	
	obj.webworker.postMessage({
		'cmd': 'switch_gatetype',
		'data': this.gate_type
	});
}
// --

// Placement
function FocusOnSchematic() {
	if (typeof this.nodes == 'undefined') {
		log('[GOLIREV] Unable to focus.')
		return 0;
	}
	
	var MaxLeft = 0;
	var MaxHeight = 0;
	
	var i = 0;
	
	var x = 0;
	var y = 0;
	
	this.nodes.panZoom({zoom : [0.5, 1.5], zoomSpeed : this.zoomSpeed}).zoom(1);
	
	// First : I compute the MaxLeft and MaxHeight point.
	for (i = 1, MaxLeft = this.testCompo[i][0], MaxHeight = this.testCompo[i][1]; i <= this.testCompo[0]; i++) {
		x = this.testCompo[i][0]
		y = this.testCompo[i][1]
		
		if (MaxLeft > x)
			MaxLeft = x;
		
		if (MaxHeight > y)
			MaxHeight = y;
	}

	// Then I focus the SVG element from this point. 
	// I have to be careful using .setPosition() since the .setPosition() axis and the SVG element axis are different : this is why I have to use some minus signs.
	this.nodes.panZoom({zoom : [0.5, 1.5], zoomSpeed : this.zoomSpeed}).setPosition(-MaxLeft*100, -MaxHeight*100);
	// --
}

function MoveGateXY(gate, x, y) {
	if (typeof gate == 'undefined' || typeof y == 'undefined' || typeof y == 'undefined') return -1;
	
	gate.x(x);
	gate.y(y);
	
	return 1;
}
// --

// Wires
function GenerateOneWire(xa, xb, ya, yb) {
	var wire;
	var average = 0;
	
	average = (xa + xb) / 2;
	
	wire = this.svgjs.group()
	//wire = this.svgjs.line(xa, ya, xb, yb).stroke({ width: 1 }); // Straight lines (point to point)
	//wire = this.svgjs.polyline(''+xa+','+ya+' ' +average+','+ya+' '+average+','+yb+' '+xb+','+yb).stroke({ width: 1 }) // .attr({'fill-opacity': 0}); // Trivial orthogonal wire (bend at mid point)
	
	// it is better to use a group of multiple lines instead of a polyline.
	wire.add(this.svgjs.line(xa, ya, average, ya));
	wire.add(this.svgjs.line(average, ya, average, yb));
	wire.add(this.svgjs.line(average, yb, xb, yb));
	
	wire.stroke({ width: 1 });
	
	return wire;
}	
// --

// Other
function log(string) {
	if (typeof window.log == 'undefined') {
		console.log(string);
	}
	
	else {
		window.log(string);
	}
}
// --