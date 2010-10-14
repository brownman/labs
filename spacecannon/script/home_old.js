
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SCREEN_DEPTH = 800;

var SEPARATION = 3;
var AMOUNTX = 1;
var AMOUNTY = 200;

var count;

var container;

var trees, treeCube, treeMesh;
var planes,plane;
var audio;

var timbres,timbreMesh;

var houses, house, houseMesh;

var camera;
var scene;
var renderer;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

function init()
{
	container = document.createElement('div');
	document.body.appendChild(container);				

	camera = new Camera(0, 230, 450);
	camera.focus = 50;
	camera.updateMatrix();

	scene = new Scene();

	renderer = new CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	trees = [];

	var i = 0;
/*
	for (var ix = 0; ix < AMOUNTX; ix++)
	{
		for(var iy = 0; iy < AMOUNTY; iy++)
		{
			treeCube = new Cube(10, 10, 10);
			for (var ic = 0; ic < treeCube.faces.length; ic++) {
				treeCube.faces[ic].color.setRGBA( Math.floor( Math.random() * 128), Math.floor( Math.random() * 128 + 128), Math.floor( Math.random() * 128 + 128), 255 );
			}
			treeMesh = new Mesh(treeCube, new FaceColorMaterial());
			treeMesh.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
			treeMesh.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
			treeMesh.updateMatrix();
			trees.push(treeMesh);
			scene.add( treeMesh );
		}
	}
*/
/*
	var gc = new Cube(2000, 2400, 2);
	for (var ic = 0; ic < gc.faces.length; ic++) {
		gc.faces[ic].color.setRGBA( 64 + iy, 128 - iy, 128 - iy, 255 );
	}
	var ground = new Mesh(gc, new ColorMaterial(0x663300));
	ground.rotation.x = 90 * (Math.PI / 180);
	ground.position.y = -250;
	ground.position.z = -1000;
	ground.updateMatrix();
	scene.add(ground);
*/
	planes = [];
	
	for(var iy = 0; iy < AMOUNTY; iy++)
	{
		for (var ix = 0; ix < AMOUNTX; ix++)		
		{
			/*
			var pc = new Cube(300, 3, 30);
			for (var ic = 0; ic < pc.faces.length; ic++) {
				pc.faces[ic].color.setRGBA( 64 + iy, 128 - iy, 128 - iy, 255 );
			}
			plane = new Mesh(pc, new FaceColorMaterial());
			plane.position.x = 0;  //ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
			plane.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
			plane.position.y = 0;
			plane.rotation.x = 90 * (Math.PI / 180);
			plane.updateMatrix();
			scene.add(plane);
			planes.push(plane);
			*/
		}
	}
	
	timbres = new TimbrePlane(2000, 2000, 10);
	for (var ic = 0; ic < timbres.faces.length; ic++) {
		timbres.faces[ic].color.setRGBA( 39, 64, 140, 255 );
	}
	timbreMesh = new Mesh(timbres, new FaceColorMaterial());
	timbreMesh.rotation.x = 90 * (Math.PI / 180);
	//timbreMesh.position.z = -4000
	scene.add(timbreMesh )
	
	
	houses = [];
	/*
	for (var nh=0;nh<65;nh++){
		var height = 120 + Math.floor(Math.random() * 250);
		house = new Cube(10, height , 10);
		for (var h = 0; h < house.faces.length; h++) {
			house.faces[h].color.setRGBA( Math.floor( Math.random() * 128), Math.floor( Math.random() * 128 + 128), Math.floor( Math.random() * 128 + 128), 255 );
		}
		houseMesh = new Mesh(house, new FaceColorMaterial());
		houseMesh.position.x = 250 + Math.floor(Math.random() * 200);
		houseMesh.position.z = ((nh + 1) * -1 * (Math.floor(Math.random() * 25)));
		houseMesh.position.y = (0 + height/2)-120;
		houseMesh.updateMatrix();
		scene.add(houseMesh);
		houses.push(houseMesh)		
	}
	*/
	
	container.appendChild(renderer.viewport);
	
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('touchstart', onDocumentTouchStart, false);
	document.addEventListener('touchmove', onDocumentTouchMove, false);				
	
	count = 0;
	
	curBeat = 0;
	curSeg = 0;
	
}


function onDocumentMouseMove(event)
{
	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
	console.log(mouseX,mouseY);
}

function onDocumentTouchStart( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();

		mouseX = event.touches[0].pageX - windowHalfX;
		mouseY = event.touches[0].pageY - windowHalfY;
	}
}

function onDocumentTouchMove( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		mouseX = event.touches[0].pageX - windowHalfX;
		mouseY = event.touches[0].pageY - windowHalfY;
	}
}

function createHouse(loudness){
	var rand = Math.random();
	var xPos = (Math.floor(rand*2)==1) ? -250 - Math.floor(rand * 200) : 250 + Math.floor(rand * 200);
	//var height = 120 + Math.floor(rand * 250);
	//house = new Cube(10, height + 120 , 10);
	//for (var h = 0; h < house.faces.length; h++) {
	//	house.faces[h].color.setRGBA( Math.floor( Math.random() * 128), Math.floor( Math.random() * 128 + 128), Math.floor( Math.random() * 128 + 128), 255 );
	//}
	//houseMesh = new Mesh(house, new FaceColorMaterial());
	houseMesh = new Particle( new ColorMaterial(Math.random() * 0x808008 + 0x808080, 1) );
	houseMesh.size = 50+(loudness*2);
	houseMesh.position.x = xPos
	houseMesh.position.z = SCREEN_DEPTH * -1;
	houseMesh.position.y = Math.random() * 150 + 250;
	houseMesh.updateMatrix();
	scene.add(houseMesh);
	houses.push(houseMesh)
}

function loop()
{
	//camera.x += (mouseX - camera.x) * .05;
	//camera.y += (-mouseY - camera.y) * .05;
	//camera.updateMatrix();

	timer = audio.currentTime;
	amplitude = Math.floor(timer * 30 - 1);
	var curAmp = Math.abs(homeAmplitude[amplitude - 1]);

	if(timer>=segmentStarts[curSeg+1]){
		curSeg++;
	}

	if(timer>=beatStarts[curBeat+1]){
		curBeat++;
		createHouse(segmentLoudnessMax[curSeg]);
	}
		
	var p = 0;
	//console.log(curAmp)
	
	//camera.y += (curAmp) ? (homeAmplitude[amplitude - 1] * -.005) : 0;
	//camera.updateMatrix();	

	for(var r=0;r<timbreMesh.geometry.matrixMap.length;r++){
		//timbreMesh.geometry.tops[v].z = segmentTimbre[curSeg]
		var row = timbreMesh.geometry.matrixMap[r];
		var i = timbreMesh.geometry.matrixMap.length-r;
		for(var v=0;v<row.length;v++){
			if(segmentTimbre[curSeg+i] && segmentTimbre[curSeg +i+1]){
				var avg = (segmentTimbre[curSeg+i][v]) // + segmentTimbre[curSeg +i+1][v] + segmentTimbre[curSeg +i+2][v] + segmentTimbre[curSeg +i+3][v]) / 4;
				row[v].z = Math.sin(avg*2 + timer)*20+avg;
				row[v].x += Math.cos(timer)/2;
				row[v].y += Math.cos(timer)/2;
			}
		}
	}
	
	timbreMesh.updateMatrix();	

	/*
	for (var iy = 0; iy < AMOUNTY; iy++)
	{
		for(var ix = 0; ix < AMOUNTX; ix++)
		{
			//planes[p].rotation.x = Math.sin(homeAmplitude[amplitude + iy - 1]);	
			//planes[p].scale = (Math.sin((ix + count) * .3) + 1) * 2 + (Math.sin((iy + count) * .5) + 1) * 2;
			//planes[p].rotation.x = (p % 2==1) ? 45 : 25;
			var idx = AMOUNTY - iy;
			var next1 = (homeAmplitude[amplitude + idx + 1 ]) * .03
			var next = (homeAmplitude[amplitude + idx ]) * .04
			var cur = (homeAmplitude[amplitude + idx - 1 ]) * .05
			var prev = (homeAmplitude[amplitude + idx - 2 ]) * .04
			var prev1 = (homeAmplitude[amplitude + idx - 3 ]) * .03	
			var prev2 = (homeAmplitude[amplitude + idx - 4 ]) * .02
			
			var curY = (next1 + next + cur + prev + prev1) / 5;
			var prevY = (next + curY + prev + prev1 + prev2) / 5;
			//planes[p].position.y = yPos;
			//console.log(yPos);
			// vertices[0] && vertices[3] = current amp's y
			// vertices[4] &  7 = prev amp's y

			planes[p].position.x +=  Math.sin(timer)*2
			
			planes[p].geometry.vertices[1].z = -15 - Math.abs(curY);
			planes[p].geometry.vertices[2].z = -15 - Math.abs(curY);
			planes[p].geometry.vertices[0].z = -15 - Math.abs(prevY);
			planes[p].geometry.vertices[3].z = -15 - Math.abs(prevY);

						
			//if (curY>2){
				//planes[p].geometry.faces[0].color.setHex(0x663300)
			//} else {
			//	planes[p].geometry.faces[0].color.setHex(0xff0000)
			//}
			
			planes[p].updateMatrix();
			p++;

		}	
	}
	*/
	console.log("camera:",camera.x, camera.y, camera.z);
	
	for (var h=0;h<houses.length;h++){
		if (houses[h].position.z >= 500){
			//houses.remove();
			houses.slice(houses.indexOf(h),1);
		}
		houses[h].position.z += 10;
		houses[h].updateMatrix();

		//console.log("house:",houses[h].position.x,houses[h].position.y,houses[h].position.z)
		
		if(didCollideWithMouse(houses[h])){
			console.log("!!!!!!!!!!!!!!!!!!!!collision")
			houses[h].size = 0;
			houses.slice(houses.indexOf(h),1);
		}
	}
	
	//console.log(Math.sin(homeAmplitude[amplitude]))
	renderer.render(scene, camera);
	
	count += 1;

}


function didCollideWithMouse(obj){
	if (mouseX>(Math.abs(obj.position.x)+obj.size/2)){
		return false;
	}
	if (mouseX<(Math.abs(obj.position.x)-obj.size/2)){
		return false;
	}
	if(mouseY>(Math.abs(obj.position.y)+obj.size/2)){
		return false;
	}
	if(mouseY<(obj.position.y-obj.size/2)){
		return false;
	}
	return true;
}


function play(){
	init();
	
	var playLoop = setInterval(loop, 1000 / 60);
	audio = document.getElementById("audio");
	audio.play();
}