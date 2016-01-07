# Golirev-IDE
An online Verilog IDE based on [YosysJS](http://www.clifford.at/yosys/yosysjs.html) using [Svg.js](http://svgjs.com/) to create the svg element. YosysJS is an Emscripten-compiled version of the [YosysJS](http://www.clifford.at/yosys/) logic synthesis tool. The idea of this project is to display digital schematics and to be able to evaluate them.

Here is a demo of the project : http://johndro.github.io/

## Current state of the project

This project is not finished.

What is working / done :
* Parsings the data from the JSON file
* Generating gates on the SVG element


What is not working / not done :
* Component placement (currently the placement is too slow.)

## Features :
* Verilog Editor, interactive schematic viewer (zoom, drag and span) and automatic placement using simulated annealing :

![Automatic placement using Simulated Annealing](http://i.imgur.com/tBE2wLr.png)
* Digital gates : 

![Gates](http://i.imgur.com/mPVuerk.png)
* Display errors in your Verilog code :

![CodeMiror](http://i.imgur.com/vDswAv7.png)

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
* Improve placement performances, currently the placement is very slow and sometimes innacurate.
* Look at wire length placer (built-in yosys)
* Finish  to add components (chapter 5 on the yosys manual)
* Use AIG models and Wavedrom in order to evaluate circuits and display results


