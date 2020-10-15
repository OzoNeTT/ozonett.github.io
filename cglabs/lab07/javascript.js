"use strict";

var canvas;
var ctx;
var points = [];
var lines = [];
var startPosition;
var curPosition;
var lastPosition;
var snapShot;
var dragging;
window.addEventListener("load",initial,false);

function initial(){					
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	ctx.strokeRect(0, 0, 512, 512);
	draw()

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
function fillArea() {
	
	var minY = points[0].y;
	var maxY = points[0].y;
	for (var i = 0; i < points.length; i++) {
		var temp = points[i].y;
		if (temp < minY)
			minY = temp;
		else if (temp > maxY)
			maxY = temp;
	}
	for (var y = minY; y < maxY; y++) {
		var meetPoint = getMeetPoint(y);
		for (var i = 1; i < meetPoint.length; i += 2) {
			var ob1 = {
				x: meetPoint[i - 1],
				y: y
			};
			var ob2 = {
				x: meetPoint[i],
				y: y
			};
			line(ob1, ob2, 'rgba(15, 199, 255, 0.5)', 1)
		}
	}
}

function getMeetPoint(y) {
    var meet = [];
    for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        if (l.isValidY(y)) {
            meet.push(l.getX(y));
        }
    }
    for (var i = 0; i < meet.length; i++)
        for (var j = i; j < meet.length; j++) {
            if (meet[i]>meet[j]) {
                var temp =meet[i];
                meet[i]=meet[j];
                meet[j]=temp;
            }
        }

    return  meet;
}
function Line(start, end) {
    this.x0 = start.x;
    this.x1 = end.x;
    this.y0 = start.y;
    this.y1 = end.y;
    this.m = (this.y1 - this.y0) / (this.x1 - this.x0);

    this.getX = function (y) {
        if (!this.isValidY(y))
            throw new RangeError();

        return 1 / this.m * (y - this.y0) + this.x0;
    }

    this.isValidY = function (y) {
        if (y >= this.y0 && y < this.y1) {
            return true;
        }
        if (y >= this.y1 && y < this.y0) {
            return true;
        }

        return false;
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
	for (var i = 1; i < points.length; i++) {
    	lines.push(new Line(points[i - 1], points[i]));
	}
	
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
		line(ob1, ob2, 'rgba(0, 0, 0, 1)', 3)
	}
	dragging = false;
	fillArea();
	oof()
	document.getElementsByName('butss')[0].disabled=1;
}

function draw(){
	canvas.addEventListener("mousedown",dragStart,false);
	canvas.addEventListener("mousemove",drag,false);
	canvas.addEventListener("mouseup",dragStop,false);
	document.addEventListener("keypress",closePoly);
}

function stopdraw(){
	document.removeEventListener("keypress",closePoly,false);
	canvas.removeEventListener("mousedown",dragStart,false);
	canvas.removeEventListener("mousemove",drag,false);
	canvas.removeEventListener("mouseup",dragStop,false);
	document.getElementsByName('butss')[0].disabled=1;
}

function oof(){

	while(points.length != 0 || lines.length != 0){
		points.pop();
		lines.pop();
	}
}

function clearScreen(){
    
	oof();
    stopdraw();
	dragging=false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black"
	ctx.strokeRect(0, 0, canvas.width, canvas.height);
	takeSnapshot();
	draw()
}
