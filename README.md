# Golirev-IDE
An online Verilog IDE based on [YosysJS](http://www.clifford.at/yosys/yosysjs.html) using [Svg.js](http://svgjs.com/) to create the svg element.

Here is a demo of the project : http://johndro.github.io/

## Current state of the project

This project is not finished at all.

What is working / done :
* Parsings components from the JSON file
* Generating gates on the SVG element


What is not working / not done :
* Parsing the Netlist from the JSON file
* Generating the Netlist on the SVG element
* ..

## Features :
* Verilog Editor, interactive schematic viewer (zoom, drag and span) and automatic placement using simulated annealing :
![Automatic placement using Simulated Annealing](http://i.imgur.com/EszUZct.png)
* Digital gates : 
![Gates](http://i.imgur.com/mPVuerk.png)
* Display errors in your Verilog code :
![CodeMiror](http://imgur.com/vDswAv7)

## Dependencies :
* [YosysJS](http://www.clifford.at/yosys/yosysjs.html)
    - Synthesises the Verilog code
    - Provides the netlist of the equivalent schematic as an JSON file
* [Svg.js](http://svgjs.com/)
    - A lightweight library for manipulating and animating SVG
* [Svg.js](http://svgjs.com/) plugins
    - [svg.draggable.js](https://github.com/wout/svg.draggable.js)
      - An extension for the svg.js library to make elements draggable
    - [svg.pan-zoom.js/](https://github.com/jillix/svg.pan-zoom.js/)
      - An extension for the svg.js for panning and zooming SVG elements
* [CodeMirror](http://codemirror.net)
    - A text editor implemented in JavaScript

## TODO
* Finish Netlist (buses)
* Finish components (chapter 5 on the yosys manual)
* Finish Simulated Annealing
* Show Netnames
* Configure CodeMirror (i.e. Display Verilog errors, ..)
