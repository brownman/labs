
// Define the bounding box for the scene: x,y,z
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SCREEN_DEPTH = 800;

// The containing div:
var container;

// Gameplay related:
var intros;
var backgroundColors=["#000000","#111111","#330000","#000033","#111111","#000000","#111111","#330000","#000033","#111111","#000000","#330000","#000033","#111111","#000000","#330000","#000033","#111111","#000000"];
var score, scoreDiv;

// Audio and Audio data:
var audio;
var curSeg=0,curBeat=0,curSect=0,changedSeg,changedBeat,changedSect;
var newSegmentStarts=[],newLoudness=[],newPitches=[];

// The planes on the floor
var timbres,timbreMesh,timbreMeshDepth;

// Floating Targets
var targets = [], target, targetMesh;
var explodingTargets = [];

var stars = [];

// Gun and Bullets
var gun,gunMesh;
var bullets = [];

var clicked;

// 3d Renderer related
var camera;
var scene;
var renderer;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


function init()
{
	// Only allow to run for browsers that can handle it (basically just not ie)
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    var is_safari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
    var is_gecko = navigator.userAgent.toLowerCase().indexOf('gecko') > -1;
    if(!is_chrome && !is_safari && !is_gecko){
        alert("Sorry, the Javascript engine in your Internet Browser can't handle this game. \n\nThis site works best with the latest version of Google Chrome or Safari.")
        return;
    }

	setupIntros();

	smoothSegmentData();

	container = document.createElement('div');
	document.body.appendChild(container);

	
    // Setup the initial camera position:
	camera = new Camera(0, 230, 400);
	camera.focus = 50;
	camera.updateMatrix();

    // Setup the scene and renderer
	scene = new Scene();
	renderer = new CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	
    // Create the floor mesh that will move based on pitches/loudness, and add to scene:
	timbres = new TimbrePlane(2000, 1000, 10);
	for (var ic = 0; ic < timbres.faces.length; ic++) {
		timbres.faces[ic].color.setRGBA( 39, 64, 140, 255 );
	}
	timbreMesh = new Mesh(timbres, new FaceColorMaterial());
	timbreMesh.rotation.x = 90 * (Math.PI / 180);
	scene.add(timbreMesh )
	
    // Save this for later since we reference it everywhere:
	timbreMeshDepth = timbreMesh.geometry.vRows.length;
	
    // Setup the gun mesh and add to scene

	addStars();
	addGun();

    // Set the initial score:
	scoreDiv = document.getElementById("score")
	score = 0;
	scoreDiv.innerHTML = score;
	
    // Append the viewport
	container.appendChild(renderer.viewport);
	
    // Add some event Listeners
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('touchstart', onDocumentTouchStart, false);
	document.addEventListener('touchmove', onDocumentTouchMove, false);	
	document.addEventListener('click', onDocumentMouseClick, false);
	document.addEventListener("contextmenu", function(event) {
	    event.preventDefault();
	}, false);
	if(window.webkit){this.lab.setStyle("KhtmlUserSelect","none");}
	
    // Start playing the song:
    audio = document.getElementById("audio");
    audio.play();
    
	// Start the Loop:
	var playLoop = setInterval(loop, 1000 / 60);
}

function smoothSegmentData(){
	// Ideally this would be done when extracting the song data from echonest.  But I had already extracted it
	// and done some massaging/cleaning up, so I'm just doing the smoothing here in javascript.

	// Data from echonest is in 3 arrays:  segmentStarts, segmentLoudnessBegin, segmentPitches
	// I'm creating 3 new arrays below: newSegmentStarts, newLoudness, newPitches

	var len = 260 * 10; //roughly 260 seconds in the song * 10 for smoothness, will be length of new arrays
	var seg = 1; // start at segment #1
	for(var s=0;s<len;s++){
		var sec = s/10; // timer equivalent
		if(!segmentStarts[seg]){
			break; // If we get to the point where there's no more segments, stop.
		}
		if (sec >= segmentStarts[seg]){
			// Time to copy the segment exactly..
			newSegmentStarts.push(segmentStarts[seg]);
			newLoudness.push(segmentLoudnessBegin[seg]);
			newPitches.push(segmentPitches[seg]);
			seg++;
			s--; //still want to insert the records on the 1/10 sec next time through, so leave the counter where it is
		}else{
			newSegmentStarts.push(sec);
			newLoudness.push((segmentLoudnessBegin[seg]+segmentLoudnessBegin[seg-1])/2); // smooth the loudness
			var pitchArray = [];
			for(var p=0;p<segmentPitches[seg].length;p++){
				pitchArray.push((segmentPitches[seg][p] + segmentPitches[seg-1][p])/2)
			}
			newPitches.push(pitchArray);
		}
	}
}

// Add some stars to the background
function addStars(){
	for(var t=0;t<100;t++){
		star = new Particle( new ColorMaterial(0xffffff) );
	    star.size = Math.random()*5;
		var leftRight = (Math.floor(Math.random()*2)==1) ? -1 : 1;
	    star.position.x = Math.random()*(SCREEN_WIDTH*3*leftRight); // Center
	    star.position.z = Math.random()*SCREEN_DEPTH * -1 - SCREEN_DEPTH/2;
	    star.position.y = Math.random()*SCREEN_HEIGHT + camera.y;
	    star.updateMatrix();
		scene.add(star);
		stars.push(star);
	}
}

function addGun(){
	gun = new Cube(15,75,10);
	for (var ic = 0; ic < gun.faces.length; ic++) {
		gun.faces[ic].color.setRGBA( 148, 148, 148, 255 );
	}
	gunMesh = new Mesh(gun,new FaceColorMaterial());
	gunMesh.position.y = 150;
	gunMesh.position.x = camera.x;
	gunMesh.position.z = camera.z + 45;
	gunMesh.rotation.x = 90 * (Math.PI / 180);
	gunMesh.updateMatrix();
	
	scene.add(gunMesh);
}

// Common Mouse Methods from Mr. Doob:
function onDocumentMouseMove(event)
{
	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
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

function onDocumentMouseClick(event){
	clicked = { x: event.clientX, y: event.clientY};
}

// This creates the actual balls that fly by, their size is relative to the current loudness of the song
function createTarget(loudness){
	var rand = Math.random();
	var xPos = (Math.floor(rand*2)==1) ? -250 - Math.floor(rand * 200) : 250 + Math.floor(rand * 200);
    targetMesh = new Particle( new ColorMaterial(Math.random() * 0x808008 + 0x808080, 1) );
    targetMesh.size = 90+(loudness*2); // loudness is always negative (-1 to -30)
    targetMesh.position.x = xPos + camera.x;
    targetMesh.position.z = SCREEN_DEPTH * -1;
    targetMesh.position.y = Math.random() * 150 + camera.y + 50;
    targetMesh.updateMatrix();
	scene.add(targetMesh);
	targets.push(targetMesh);
}


// This is run every time through the loop to capture movements of the gun
function positionGun(){
	if (Math.abs(mouseX * .005) < 1.45){
		gunMesh.rotation.z = (mouseX * .005);
	}
	
	if(Math.abs(-mouseY * .005) + 1.2 < 2.2){
		gunMesh.rotation.x = (-mouseY * .005) + 1.2;
	}
	gunMesh.updateMatrix();
}

// If the user clicked, here we're going to fire the gun and launch the bullet particle
function fireGun(x,y){
	var bullet = new Particle( new ColorMaterial(0xffffff, 1) );
	bullet.size = 5;
	bullet.position.x = gunMesh.position.x;
	bullet.position.y = gunMesh.position.y;
	bullet.position.z = gunMesh.position.z;
	bullet.trajectoryX = mouseX/15;
	bullet.trajectoryY = -mouseY/20;
	bullet.updateMatrix();
	scene.add(bullet);
	bullets.push(bullet);
}

function didCollide(obj){
    for (var b=0;b<bullets.length;b++){
		var bPos = bullets[b].position;
		var objPos = obj.position;
		if(objPos.z>0){
			return false;
		}
		if(Math.abs(bPos.x)<200){
			continue;
		}
		if(bPos.y<camera.y){
			continue;
		}
		if(bPos.y>SCREEN_HEIGHT){
			continue;
		}
        var relPos = {
            x: objPos.x - bPos.x,
            y: objPos.y - bPos.y,
            z: objPos.z - bPos.z
        }
        var dist = relPos.x * relPos.x + relPos.y * relPos.y + relPos.z * relPos.z;
        var minDist = obj.size + bullets[b].size;
        if(dist <= minDist * minDist){
            bullets[b].size = 0;
            bullets.splice(b,1);
            return true;
        };
    }
    return false;
}

function setupIntros(){
    intros = [  document.getElementById("intro1"),
                document.getElementById("intro2"),
                document.getElementById("intro3"),
                document.getElementById("intro4")
             ];
    // First intro is a little different...
    intros[0].style.top = SCREEN_HEIGHT/2-50 + "px";
    intros[0].style.left = SCREEN_WIDTH/2-150 + "px";
    
    // Other 3 are pretty much the same:
    for(var i=1;i<intros.length;i++){
        intros[i].style.top = SCREEN_HEIGHT/2-80 + "px";
        intros[i].style.left = SCREEN_WIDTH/2-250 + "px";
    }
}

// The Main Loop.....
function loop()
{
	// First let's get the gun straight, fire it if a click was detected, and reposition based on mouse position
	if (clicked){
		fireGun();
		clicked=null;
	}
	positionGun();

	// get the timer from the song
	timer = audio.currentTime;

	// Figure out what Segment, Beat and Section we're in:
	if(timer>=newSegmentStarts[curSeg+1]){
		curSeg++;
	}
	
	if(timer>=beatStarts[curBeat+1]){
		curBeat++;
		createTarget(newLoudness[curSeg]);
	}

	if(timer>=sectionStarts[curSect]){
		//document.body.style.background = (backgroundColors[curSect]);
		curSect++;
	}

	// Loop through the rows of vertices in the main mesh and adjust based on pitch/loudness:
	for(var r=0;r<timbreMeshDepth;r++){
		var row = timbreMesh.geometry.vRows[r];
		var i = timbreMeshDepth-r;
		for(var v=0;v<row.length;v++){
			if(newPitches[curSeg-r] && newPitches[curSeg-r][v] && newLoudness[curSeg-r]){
                var pitchStrength = newPitches[curSeg-r][v]/6;
				var segmentLoudness = newLoudness[curSeg-r]+.025;
                row[v].z = Math.sin((segmentLoudness*pitchStrength)+timer/300)*85
            }
		}
	}
    timbreMesh.updateMatrix();
    
	// Make some shooting stars
	stars[10].position.x+=6;
	stars[20].position.y-=4;
	stars[12].position.x-=2;
	stars[40].size +=Math.sin(timer)/5;

	// Move the Targets and check for collisions:
    for (var h=0;h<targets.length;h++){
        if (targets[h].position.z >= 500){
            targets.splice(h,1);
		}
        targets[h].position.z += 10;
        targets[h].updateMatrix();

		// Check if we had a collision:
		if(didCollide(targets[h])){
			score += Math.floor((300 - targets[h].size*2) + Math.abs(targets[h].position.z));
			targets[h].opacity = .75;
			explodingTargets.push(targets[h]);
			targets.splice(h,1);
			scoreDiv.innerHTML = score;
		}
	}
	
	// Move the Bullets:
	for (var b=0;b<bullets.length;b++){
		var bul = bullets[b]

		// If the bullet moved beyond screen depth, let's get rid of it:
		if (bul.position.z<(SCREEN_DEPTH*-1)){
			bul.size=0;
			bullets.splice(b,1);
		}
		
		bul.position.x += bul.trajectoryX;
		bul.position.y += bul.trajectoryY;
		bul.position.z -= 15;
		bul.updateMatrix();
	}
	
	// Animate the Exploding Targets
    for(var eb=0;eb<explodingTargets.length;eb++){
        if(explodingTargets[eb].size>150){
            explodingTargets[eb].size=0;
            explodingTargets.splice(eb,1);
		}else{
            explodingTargets[eb].size += 15;
            explodingTargets[eb].opacity -= .15;
            explodingTargets[eb].material = new ColorMaterial(Math.random() * 0x808008 + 0x808080, explodingTargets[eb].opacity);
		}
	}
	
	// Intro Popups:
	if(intros){
		if(intros.length==4 && timer > 1){
			document.body.removeChild(document.getElementById("intro1"));
            intros.pop();
            intros[intros.length-1].style.display = "block";
		}
		if(intros.length==3 && timer > 3){
			document.body.removeChild(document.getElementById("intro2"));
            intros.pop();
            intros[intros.length-1].style.display = "block";
		}
		if(intros.length==2 && timer > 4.5){
			document.body.removeChild(document.getElementById("intro3"));
            intros.pop();
            intros[intros.length-1].style.display = "block";
		}
		if(intros.length==1 && timer >6){
			document.body.removeChild(document.getElementById("intro4"));
			intros = null;
		}
	}
	
	renderer.render(scene, camera);
	
}
