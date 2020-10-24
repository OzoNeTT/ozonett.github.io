"use strict";

var canvas;
var ctx;
var points = [];
var lines = [];
var diamond;
window.addEventListener("load",initial,false);

function initial(){					
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
}
function randomColorWithAlpha() {
    var maxi = [255, 255, 255, 0.8];
    var mini = [0, 0, 0, 0.1];
    var round = [true, true, true, false];
    var a = [];
    for (var i = 0; i < 4; i++) {
        var r = Math.random() * (maxi[i] - mini[i]) + mini[i];
        if (round[i]) {
            r = Math.round(r);
        }
        a.push(r);
    }
    return 'rgba(' + a.join(',') + ')';
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
function fillArea(color) {
	
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
			line(ob1, ob2, color, 1)
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
function pushPoints(scalex, scaley, startposx, startposy, x, y){
	for(var i = 0; i < diamond.e.length; i++){
		for(var j = 0; j < diamond.e[i].length; j++){
			var obj1 = {
				x: startposx + scalex * diamond.v[diamond.e[i][j] - 1][x],
				y: startposy + scaley * diamond.v[diamond.e[i][j] - 1][y]
			}
			points.push(obj1);
		}
		closePoly();
	}
}
function closePoly(){
	points.push(points[0])
	for (var i = 1; i < points.length; i++) {
    	lines.push(new Line(points[i - 1], points[i]));
	}

	for(var j = 0; j < points.length - 1; j++){
		var ob1 = {
			x: points[j].x,
			y: points[j].y
		};
		var ob2 = {
			x: points[j + 1].x,
			y: points[j + 1].y
		};
		line(ob1, ob2, 'rgba(0, 0, 0, 1)', 1)
	}
	var col = randomColorWithAlpha();
	fillArea(col);
	oof()
}

function oof(){

	while(points.length != 0 || lines.length != 0){
		points.pop();
		lines.pop();
	}
}

function modelCreator(modelname){
	if (modelname === 'spaceShuttle'){
		diamond = spaceShuttle;
		pushPoints(30, 30, 256, 256, 1, 0);
	}
	else if(modelname === 'airplane'){
		diamond = airplane;
		pushPoints(-10, -10, 256, 256, 0, 1);
	}
	else if(modelname === 'skyscraper'){
		diamond = skyscraper;
		pushPoints(8, -8, 256, 420, 0, 1);
	}
	else if(modelname === 'lamp'){
		diamond = lamp;
		pushPoints(40, -40, 256, 360, 1, 0);
	}
	else if(modelname === 'chelovechek'){
		diamond = chelovechek;
		pushPoints(65, -65, 256, 256, 0, 1);
	}
	else{
		clearScreen()
	}
	

}

function clearScreen(){
	oof();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}