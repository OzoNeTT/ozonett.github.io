"use strict";

var canvas;
var ctx;
var points = [];
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

function fillArea(cords, p) {

	ctx.fillStyle = 'rgba(15, 199, 255, 1)';
	var stack = [];
	stack.push(cords);
	
	while(stack.length != 0){
		var objj = stack.pop();
		ctx.fillRect(objj.x, objj.y, p, p);

		if(objj.x - p > 0 && ctx.getImageData(objj.x-p, objj.y, p, p).data[3] != 255){
			var obbj = {
				x: objj.x - p,
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
	let rect = canvas.getBoundingClientRect(); 
	let x = Math.floor(event.clientX - rect.left); 
	let y = Math.floor(event.clientY - rect.top); 

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
	startPosition= getCoordinate(event)
	points.push(startPosition);

	ctx.fillStyle = 'rgba(255, 0, 0, 1)'
	ctx.fillRect(startPosition.x-4, startPosition.y-4, 8,8)

	takeSnapshot();
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
	document.getElementsByName('butss')[0].disabled=0;

}
function closePoly(){
	points.push(points[0])

	restoreSnapshot();

	for(var j = 0; j < points.length - 1; j++){
		var ob1 = {
			x: points[j].x,
			y: points[j].y
		};
		var ob2 = {
			x: points[j + 1].x,
			y: points[j + 1].y
		};
		line(ob1, ob2, "black", 3)
	}
	canvas.addEventListener("mousedown",paint,false);
	dragging = false;
	oof();	
	stopdraw();
	document.getElementsByName('butss')[0].disabled=1;
}

function paint(event){

	var cords = getCoordinate(event)
	fillArea(cords, 1);

}

function draw(){
	canvas.addEventListener("mousedown",dragStart,false);
	canvas.addEventListener("mousemove",drag,false);
	canvas.addEventListener("mouseup",dragStop,false);
	document.addEventListener("keypress",closePoly);
}

function stopdraw(){
	canvas.removeEventListener("mousedown",dragStart,false);
	canvas.removeEventListener("mousemove",drag,false);
	canvas.removeEventListener("mouseup",dragStop,false);
	document.removeEventListener("keypress",closePoly,false);
	document.getElementsByName('butss')[0].disabled=1;
}

function oof(){
	dragging = false;

	while(points.length != 0 ){
		points.pop();
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