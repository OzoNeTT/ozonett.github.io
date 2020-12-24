"use strict";

var canvas;
var ctx;
var diamond_f;
var diamond_v;
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

function line(ctx, x0, y0, x1, y1) {
	let delta = 2*(y1 - y0);
	let eps = 0;
	let y = y0;
	let scale = 1;

	for (let x = x0; x<x1; x++) {
		if (eps >= (x1 - x0)) {
			y += 1;
			eps -= 2*(x1-x0);
		} 
		eps += delta;		
		ctx.fillRect(x*scale, y*scale, scale*1, scale*1);
	}
}

class Point{
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function fillTriangle(ctx, points, color) {
	ctx.fillStyle = color;
	let miny = points[0].y, maxy = points[0].y;	
	for (let i=1; i<points.length; i++) {
		if (points[i].y > maxy) maxy = points[i].y;
		if (points[i].y < miny) miny = points[i].y;
	}

	let yarray = [];	
	for (let i=0; i<points.length; i++) {
		let p = 0;
		if (i!=points.length - 1) p = i + 1;
		let hi, lo;
		if (points[i].y>points[p].y) {hi = i; lo = p;}
		else if (points[i].y<points[p].y) {hi = p; lo = i;}
		else continue;

		if (points[hi].x === points[lo].x) {
			for (let j=points[lo].y; j<points[hi].y; j++) {
				if (typeof yarray[j] === 'undefined') yarray[j] = [];
				yarray[j].push(points[lo].x);
			}
		} else {
			let k = (points[hi].y - points[lo].y)/
						(points[hi].x - points[lo].x);
			for (let j=points[lo].y; j<points[hi].y; j++) {
				if (typeof yarray[j] === 'undefined') yarray[j] = [];
				yarray[j].push((j - points[lo].y)/k + points[lo].x);
			}
		}

	}
	let image_data = ctx.createImageData(500, 500);
	for (let y=miny; y<maxy; y++) {
		if (typeof(yarray[y]) === "undefined") {yarray[y] = []; }
		let xarray = yarray[y].sort( function(a, b){ return a - b; } );
		for (let j = 0; j<xarray.length/2; j++) {
			for (let x = xarray[j*2]; x < xarray[j*2+1]; x++) {
				ctx.fillRect(Math.floor(x), y, 1, 1);

				image_data.data[(y*500+Math.floor(x))*4 + 0] = 56;
				image_data.data[(y*500+Math.floor(x))*4 + 1] = 78;
				image_data.data[(y*500+Math.floor(x))*4 + 2] = 23;
				image_data.data[(y*500+Math.floor(x))*4 + 3] = 255;

			}
		}	
	}
	//ctx.putImageData(image_data, 0, 0);
}

let light = {x: 45, y: 45, z: 78};
var alpha = 0.1;

function multiplyMatrix(A,B){
	var rowsA = A.length, colsA = A[0].length,
		rowsB = B.length, colsB = B[0].length,
		C = [];

	//if (colsA != rowsB) return false;

	for (var i = 0; i < rowsA; i++) C[i] = [];

	for (var k = 0; k < colsB; k++)
		{ for (var i = 0; i < rowsA; i++)
		{ var temp = 0;
			for (var j = 0; j < rowsB; j++) temp += A[i][j]*B[j][k];
			C[i][k] = temp;
		}
		}

	return C;
}
var myRec;
function drawimg(){
	ctx.clearRect(0, 0, 600, 600);
	alpha += 0.0001;
	if(alpha > 0.2) {
		alpha = 0.1;
	}
	for (let i = 0; i < diamond_v.length; i++){
		
		var arr2 = [[diamond_v[i].x],[diamond_v[i].y],[diamond_v[i].z]];
		
		var MM2 = [
			[Math.cos(alpha), 0, Math.sin(alpha)],
			[0,1,0],
			[-1 * Math.sin(alpha), 0, Math.cos(alpha)]
		];

		
		var lmao2 = multiplyMatrix(MM2, arr2);
		
		diamond_v[i].x = lmao2[0][0];
		diamond_v[i].y = lmao2[1][0];
		diamond_v[i].z = lmao2[2][0];
	}
	
	let fill_color_percent = 0.25;

	let x_offset = 240, y_offset = 240;
	let scale = 8;

	let color_r = 255;
	let color_g = 0;
	let color_b = 255;
	let color = "rgb(" + color_r + "," + color_g +
					"," + color_b + ")";
	for (let f = 0; f < diamond_f.length; f++) {		
		let points = [];
		let p0_idx = diamond_f[f][0] - 1;
		let p1_idx = diamond_f[f][1] - 1;
		let p2_idx = diamond_f[f][2] - 1;
	
		let vA = {x: diamond_v[p0_idx].x - diamond_v[p1_idx].x, 
			y: diamond_v[p0_idx].y - diamond_v[p1_idx].y,
			z: diamond_v[p0_idx].z - diamond_v[p1_idx].z};
		let vB = {x: diamond_v[p2_idx].x - diamond_v[p1_idx].x, 
			y: diamond_v[p2_idx].y - diamond_v[p1_idx].y,
			z: diamond_v[p2_idx].z - diamond_v[p1_idx].z};

		for (let i=0; i<diamond_f[f].length; i++) {
			let index = diamond_f[f][i] - 1;
			points.push(new Point(scale*diamond_v[index].y + x_offset, 
								  scale*diamond_v[index].z + y_offset));
		}


		let vN = {x:0, y:0, z:1};

		vN.y = (vB.x*vA.z - vB.z*vA.x)/(vB.y*vA.x - vB.x*vA.y);
		vN.x = -1*(vA.z + vN.y*vA.y)/vA.x;


		let vL = {x: light.x - diamond_v[p1_idx].x,
				  y: light.y - diamond_v[p1_idx].y,
				  z: light.z - diamond_v[p1_idx].z};


		let cosa = (vN.x*vL.x + vN.y*vL.y + vN.z*vL.z)/
					Math.sqrt(vN.x*vN.x + vN.y*vN.y + vN.z*vN.z)/
					Math.sqrt(vL.x*vL.x + vL.y*vL.y + vL.z*vL.z);

		if (cosa < 0) cosa = 0;

		
		var c_r = (1-fill_color_percent)*color_r*cosa+fill_color_percent*color_r;
		var c_g = (1-fill_color_percent)*color_g*cosa+fill_color_percent*color_g;
		var c_b = (1-fill_color_percent)*color_b*cosa+fill_color_percent*color_b;
		color = "rgb("
			+c_r+","
			+c_g+","
			+c_b+")";
		
		fillTriangle(ctx, points, color);		
	}
	myRec = requestAnimationFrame(drawimg)
}

function modelCreator(modelname){
	if (modelname === 'pyramid'){
		diamond_v = pyramid.v;
		diamond_f = pyramid.f;

		myRec = requestAnimationFrame(drawimg)

	}
	else{
		clearScreen()
		
	}
	
}

function clearScreen(){
	cancelAnimationFrame(myRec);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}
