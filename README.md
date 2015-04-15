# Golirev-IDE
An online Verilog IDE based on [YosysJS](http://www.clifford.at/yosys/yosysjs.html) using [Svg.js](http://svgjs.com/) to create the svg element.

## Current state of the project

This project is not finished at all.

What is working / done :
* Parsings components from the JSON file
* Generating gates on the SVG element


What is not working / not done :
* Parsing the Netlist from the JSON file
* Generating the Netlist on the SVG element
* ..

## TODO

I plan to work on these things : 
* Finishing parsejson() (registers are not ok atm.)
* Generating the Netlist correctly
* A good component placement
* Read name of nets
* Add Dlatch, DFF_PN0, .. (Chapter 5 yosys manual)

--
