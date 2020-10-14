"use strict";

var canvas;
var ctx;

var polygon_axis_x = [];
var polygon_axis_y = [];
var x_points = [];
var y_points = [];
var startPosition;
var curPosition;
var lastPosition;
var snapShot;
var dragging;
var tools;

window.addEventListener("load",initial,false);

function initial(){					
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	ctx.strokeRect(0, 0, 512, 512);
	draw('polygon')

}

function fillArea(x1, y1, p) {
	ctx.fillStyle = "Blue";
	var obj = {
		x: x1,
		y: y1
	};
	var stack = [];
	stack.push(obj);
	while(stack.length != 0){
		var objj = stack.pop();
		
		ctx.fillRect(objj.x, objj.y, p, p);
		if(objj.x - p > 0 && ctx.getImageData(objj.x-p, objj.y, p, p).data[3] != 255){
			var obbj = {
				x: objj.x - 3,
				y: objj.y
			};
			stack.push(obbj);
		} 
		if(objj.y - p > 0 && ctx.getImageData(objj.x, objj.y-p, p, p).data[3] != 255){
			var obbj = {
				x: objj.x,
				y: objj.y-p
			};
			stack.push(obbj);
		} 
		if(objj.x + p < 512 && ctx.getImageData(objj.x+p, objj.y, p, p).data[3] != 255){
			var obbj = {
				x: objj.x+p,
				y: objj.y
			};
			stack.push(obbj);
		} 
		if(objj.y + p < 512 && ctx.getImageData(objj.x, objj.y+p, p, p).data[3] != 255){
			var obbj = {
				x: objj.x,
				y: objj.y+p
			};
			stack.push(obbj);
		} 

	}

}
function line(start, curPosition, color, size) {
	var p = size;
	var x0 = start.x
	var y0 = start.y
	var x1 = curPosition.x
	var y1 = curPosition.y

	var dx =  Math.abs(x1-x0);
	var dy = -1* Math.abs(y1-y0);
	var sx = (x0 < x1 ? p : -p);
	var sy = (y0 < y1 ? p : -p); 
	var err = dx+dy;
	var e2; 
	ctx.fillStyle = color;
	for(;;){ 

		ctx.fillRect(x0,y0,p,p);
		if (x0 > x1 - p && x0 < x1 + p && y0 > y1 - p && y0 < y1 + p){
			break;
		}
		e2 = 2 * err;
		if (e2 >= dy) { 
			err += dy; 
			x0 += sx; 
		} 
		if (e2 <= dx) { 
			err += dx; 
			y0 += sy; 
		} 	
	}	
}

function getCoordinate(event){
	var x = event.clientX - ctx.canvas.offsetLeft;
	var y = event.clientY - ctx.canvas.offsetTop;

	return {x : x, y : y};
}

function takeSnapshot(){
	snapShot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot(){
	ctx.putImageData(snapShot, 0, 0);
}

function dragStart(event){
	dragging = true;

	startPosition = getCoordinate(event);
	takeSnapshot();
	x_points.push(startPosition.x);
	y_points.push(startPosition.y);
			

	if(x_points[x_points.length-2] != startPosition.x && y_points[y_points.length-2] != startPosition.y){
		polygon_axis_x.push(startPosition.x);
		polygon_axis_y.push(startPosition.y);
	}
	

	
}

function drag(event){
	if (dragging == true) {
		restoreSnapshot();
		curPosition = getCoordinate(event);
		line(startPosition, curPosition, "black", 3);
	}
}

function dragStop(event){
	restoreSnapshot();
	lastPosition = getCoordinate(event);
	line(startPosition, lastPosition, "black", 3);

	x_points.push(lastPosition.x);
	y_points.push(lastPosition.y);

	if(tools == "polygon"){
		
		if(x_points[x_points.length-1] != lastPosition.x && y_points[y_points.length-1] != lastPosition.y){
			polygon_axis_x.push(lastPosition.x);
			polygon_axis_y.push(lastPosition.y);
		}			
	}

	else if(tools == "polygon" && x_points[0] == lastPosition.x && y_points[0] == lastPosition.y){
		dragging = false;				
		while(x_points.length != 0 && y_points.length != 0){
			x_points.pop();
			y_points.pop();
		}
	}
}

function closePoly(){
	var obj = {
		x: 0.0,
		y: 0.0
	};
	obj.x = polygon_axis_x[0];
	obj.y = polygon_axis_y[0];
	restoreSnapshot();
	line(lastPosition, obj,"black", 3);
	canvas.addEventListener("mousedown",paint,false);
	dragging = false;
	oof();	
	stopdraw();
}

function paint(event){
	fillArea(event.x, event.y, 3);
}

function draw(x){
	tools = x;	

	canvas.addEventListener("mousedown",dragStart,false);
	canvas.addEventListener("mousemove",drag,false);
	canvas.addEventListener("mouseup",dragStop,false);
	
	if (tools == "polygon") {
		document.addEventListener("keypress",closePoly);
	}
}

function stopdraw(){
	canvas.removeEventListener("mousedown",dragStart,false);
	canvas.removeEventListener("mousemove",drag,false);
	canvas.removeEventListener("mouseup",dragStop,false);
	document.removeEventListener("keypress",closePoly,false);
}

function oof(){
	dragging = false;

	while(x_points.length != 0 || y_points.length != 0 || polygon_axis_y != 0 || polygon_axis_x != 0){
		polygon_axis_x.pop();
		polygon_axis_y.pop();
		x_points.pop();
		y_points.pop();
	}
}

function clearScreen(){

	oof();
    stopdraw();
	canvas.removeEventListener("mousedown",paint,false);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black"
	ctx.strokeRect(0, 0, canvas.width, canvas.height);
	draw('polygon')
}
