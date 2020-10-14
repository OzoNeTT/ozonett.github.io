"use strict";

var canvas;
var ctx;

var polygon_axis_x = [];
var polygon_axis_y = [];
var line_axis_x = [];
var line_axis_y = [];
var x_points = [];
var y_points = [];
var crossProduct;
var checkConvex;
var upZero ;
var lowZero ;
var Nx;
var Ny;
var D;
var Wx;
var Wy;
var vectorLinex;
var vectorLiney;
var T;
var TEmax = [];
var TLmin = [];
var startPosition;
var curPosition;
var lastPosition;
var snapShot;
var dragging;
var tools;
var checkInside = [];

for (var i = 0; i < 100; i++) {
	TEmax[i] = 0;
	TLmin[i] = 1;
	checkInside[i] = "inside";
}

window.addEventListener("load",initial,false);

function initial(){					
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	ctx.strokeRect(0, 0, 512, 512);
	draw('polygon')

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
	if (tools == "polygon" ) {
		ctx.fillStyle = 'rgba(255, 0, 0, 1)'
		ctx.fillRect(startPosition.x-4, startPosition.y-4, 8,8)
	}
	else if(tools == "line"){
		ctx.fillStyle = 'rgba(0, 255, 0, 1)'
		ctx.fillRect(startPosition.x-4, startPosition.y-4, 8,8)
	}
	takeSnapshot();
	x_points.push(startPosition.x);
	y_points.push(startPosition.y);
			
	if (tools == "polygon" ) {
		if(x_points[x_points.length-2] != startPosition.x && y_points[y_points.length-2] != startPosition.y){
			polygon_axis_x.push(startPosition.x);
			polygon_axis_y.push(startPosition.y);
		}
	}
	else if(tools == "line"){
		line_axis_x.push(startPosition.x);
		line_axis_y.push(startPosition.y);
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
    if (tools == "polygon" ) {
		ctx.fillStyle = 'rgba(255, 0, 0, 1)'
		ctx.fillRect(lastPosition.x-4, lastPosition.y-4, 8,8)
	}
	else if(tools == "line"){
		ctx.fillStyle = 'rgba(0, 255, 0, 1)'
		ctx.fillRect(lastPosition.x-4, lastPosition.y-4, 8,8)
	}
	x_points.push(lastPosition.x);
	y_points.push(lastPosition.y);
	if (tools == "line") {
		dragging = false;
		line_axis_x.push(lastPosition.x);
		line_axis_y.push(lastPosition.y);

		while(x_points.length != 0 && y_points.length != 0){
			x_points.pop();
			y_points.pop();
		}
	}

	else if(tools == "polygon"){
		
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
	obj.x = polygon_axis_x[0]
	obj.y = polygon_axis_y[0]
	restoreSnapshot();
	line(lastPosition, obj,"black", 3)
	if (polygon_axis_x.length > 2) {
		clipping();	
	}
	else{
		alert("NOT POLYGON");
		dragging = false;
	}
	
}
function clipping(){
	lowZero = false;
	upZero = false;
	for(var i=0;i < polygon_axis_x.length;i++){
		var firstLinex;
		var firstLiney;
		var secondLinex;
		var secondLiney;

		if(i == polygon_axis_x.length-2){
			firstLinex = polygon_axis_x[i+1] - polygon_axis_x[i];
			firstLiney = polygon_axis_y[i+1] - polygon_axis_y[i];

			secondLinex = polygon_axis_x[0] - polygon_axis_x[i+1];
			secondLiney = polygon_axis_y[0] - polygon_axis_y[i+1];
		}
		else if(i == polygon_axis_x.length - 1){
			firstLinex = polygon_axis_x[0] - polygon_axis_x[i];
			firstLiney = polygon_axis_y[0] - polygon_axis_y[i];

			secondLinex = polygon_axis_x[1] - polygon_axis_x[0];
			secondLiney = polygon_axis_y[1] - polygon_axis_y[0];
		}
		else{
			firstLinex = polygon_axis_x[i+1] - polygon_axis_x[i];
			firstLiney = polygon_axis_y[i+1] - polygon_axis_y[i];

			secondLinex = polygon_axis_x[i+2] - polygon_axis_x[i+1];
			secondLiney = polygon_axis_y[i+2] - polygon_axis_y[i+1];
		}

		crossProduct = (firstLinex *  secondLiney) - (firstLiney * secondLinex);
				
		if (crossProduct > 0){
			upZero = true;					
		}
		else if(crossProduct < 0){
			lowZero = true;				
		}
	}

	if ((upZero == true && lowZero == false) || (upZero == false && lowZero == true) ){
		checkConvex = true;
	}
	else if (upZero == true && lowZero == true){
		checkConvex = false;
	}
	
	if (checkConvex == true) {
		if (upZero ==  true) {
			for (var i = 0; i < polygon_axis_x.length; i++) {
				if (i == polygon_axis_x.length - 1) {
					Nx =  polygon_axis_y[i] - polygon_axis_y[0];
					Ny = polygon_axis_x[0] - polygon_axis_x[i];
				}
				else{
					Nx = polygon_axis_y[i] - polygon_axis_y[i+1];
					Ny = polygon_axis_x[i+1] - polygon_axis_x[i];
				}

				var k = 0;	

				for (var j = 0; j < line_axis_x.length; j+=2) {							
					vectorLinex = line_axis_x[j+1] - line_axis_x[j];
					vectorLiney =  line_axis_y[j+1] - line_axis_y[j];

					D = (Nx * vectorLinex) + (Ny * vectorLiney);
						
					Wx = (line_axis_x[j] - polygon_axis_x[i]);
					Wy = (line_axis_y[j] - polygon_axis_y[i]);

					T = -(((Nx * Wx) + (Ny * Wy)) / D);

					if(D > 0){
						if(T > TEmax[k]){
							TEmax[k] = T;
						}
					}
					else if(D < 0){
						if (T < TLmin[k]) {
							TLmin[k] = T;
						}
					}
					
					k++;
				}

			}
		}
		else if (lowZero ==  true) {
			for (var i = 0; i < polygon_axis_x.length; i++) {
				if (i == polygon_axis_x.length - 1) {
					Nx =  polygon_axis_y[0] - polygon_axis_y[i];
					Ny = polygon_axis_x[i] - polygon_axis_x[0];
				}
				else{
					Nx = polygon_axis_y[i+1] - polygon_axis_y[i];
					Ny = polygon_axis_x[i] - polygon_axis_x[i+1];
				}

				var k = 0;	

				for (var j = 0; j < line_axis_x.length; j+=2) {
					vectorLinex = line_axis_x[j+1] - line_axis_x[j];
					vectorLiney =  line_axis_y[j+1] - line_axis_y[j];

					D = (Nx * vectorLinex) + (Ny * vectorLiney);
					
					Wx = (line_axis_x[j] - polygon_axis_x[i]);
					Wy = (line_axis_y[j] - polygon_axis_y[i]);

					T = -(((Nx * Wx) + (Ny * Wy)) / D);
			
					if(D > 0){
						if(T > TEmax[k]){
							TEmax[k] = T;
						}
					}
					else if(D < 0){
						if (T < TLmin[k]) {
							TLmin[k] = T;
						}
					}
			
					k++;
				}
			}
		}
 				
 		for (var j = 0;j < line_axis_x.length/2;j++) {
 			if(TEmax[j] < TLmin[j]){
	 			var clippingStartPointx;
	 			var clippingStartPointy;
	 			var clippingEndPointx;
	 			var clippingEndPointy;
	 			var a = j*2;
	 			var b = 1;


	 				vectorLinex = line_axis_x[a+b] - line_axis_x[a];
					vectorLiney =  line_axis_y[a+b] - line_axis_y[a];
	 					
					clippingStartPointx = line_axis_x[a] + (vectorLinex * TEmax[j]);
					clippingStartPointy = line_axis_y[a] + (vectorLiney * TEmax[j]);

					clippingEndPointx = line_axis_x[a] + (vectorLinex * TLmin[j]);
					clippingEndPointy = line_axis_y[a] + (vectorLiney * TLmin[j]);
	 					

				var obj = {
					x: 0.0,
					y: 0.0
				};
				var obj2 = {
					x: 0.0,
					y: 0.0
				};
				obj.x = clippingStartPointx
				obj.y = clippingStartPointy
				obj2.x = clippingEndPointx
				obj2.y = clippingEndPointy
				line(obj, obj2, "blue", 5)

			}
 		}

		
 		dragging = false;
	}
	else if(checkConvex == false){
		alert('Polygon Not Convex');
		checkConvex = false;
		dragging = false;
		clearScreen()
		return
	}
	draw('line')
}

function draw(x){
	tools = x;	

	canvas.addEventListener("mousedown",dragStart,false);
	canvas.addEventListener("mousemove",drag,false);
	canvas.addEventListener("mouseup",dragStop,false);
	
	if (tools == "polygon") {
		document.addEventListener("keypress",closePoly);
	}
	if (tools == "line"){
		canvas.addEventListener("click",clipping);
	}

}

function clearScreen(){

	tools = "pointer";
	dragging = false;

	while(x_points.length != 0 || y_points.length != 0 || polygon_axis_y != 0 || polygon_axis_x != 0 || line_axis_y != 0 || line_axis_x != 0){
		polygon_axis_x.pop();
		polygon_axis_y.pop();
		x_points.pop();
		y_points.pop();
		line_axis_x.pop();
		line_axis_y.pop();
	}
	for (var i = 0; i < 100; i++) {
		TEmax[i] = 0;
		TLmin[i] = 1;
		checkInside[i] = "inside";
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black"
	ctx.strokeRect(0, 0, canvas.width, canvas.height);
	document.removeEventListener("keypress",closePoly,false);
	canvas.removeEventListener("click",clipping);
	draw('polygon')
}
