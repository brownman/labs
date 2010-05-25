// Define the bounding box for the scene: x,y,z
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SCREEN_DEPTH = 800;
var NEG_SCREEN_DEPTH = SCREEN_DEPTH *-1;

// Hard coding camera coordinates for performance, since we don't move it:
var CAMERA_X = 0;
var CAMERA_Y = 230;
var CAMERA_Z = 400;

// Gun Coordinates, again for performance, relative to the camera:
var GUN_X = CAMERA_X;
var GUN_Y = CAMERA_Y - 80;
var GUN_Z = CAMERA_Z + 45;

var SONG_LENGTH = 250;

// Timbre Floor Mesh
var TIMBRE_MESH_WIDTH = 2000;
var TIMBRE_MESH_HEIGHT = 1000;
var TIMBRE_MESH_DEPTH = 10;

var TIMBRE_MESH_NUM_X = 12; // Number of Pitches in the Pitch Array Data
var TIMBRE_MESH_NUM_Y = 24; // Number of rows of pitches to show on the mesh at once

// bullet constant
var BULLET_Z_DIST = SCREEN_DEPTH + GUN_Z;
var BULLET_SIZE = 5;

// 3d Renderer Related Globals
var container = null;
var camera = null;
var scene = null;
var renderer = null;
var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth/2;
var windowHalfY = window.innerHeight/2;

// Track mouse clicks for firing bullets:
var clicked = false;

// Main Game Object:
var jsGame = Class.extend({
	messages: [],
	backgroundColors: ["#000000","#111111","#330000","#000033","#111111","#000000","#111111","#330000","#000033","#111111","#000000","#330000","#000033","#111111","#000000","#330000","#000033","#111111","#000000"],
	
	// Score and Scoreboard div
	scoreNum: 0,
	scoreDenom: 0,
	scoreDiv: null,
	timerDiv: null,
	curLevel: 1,
	
	// HTML5 audio object:
	audio: null,
	
	// Music related
	curSeg:0,
	curBeat:0,
	curNormBeat:1,
	curSect:0,
	changedSeg:false,
	changedBeat:false,
	changedSect:false,
	
	// The timbre mesh on the floor
	timbres: null,

	// Flying Targets
	targets: [],
	
	// Canon / Bullets
	gun: null,
	collisionController: null,
	
	playLoopInterval: null,
	
	init: function(){
		container = document.createElement('div');
		document.body.appendChild(container);

	    // Setup the initial camera position:
		camera = new Camera(CAMERA_X, CAMERA_Y, CAMERA_Z);
		camera.focus = 50;
		camera.updateMatrix();

		// Setup the scene and renderer
		scene = new Scene();
		renderer = new CanvasRenderer();
		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

		this.addMessages();
		this.addStars();
		this.addScoreboard();
		
		this.timerDiv = document.getElementById("timer");
		
		this.timbres = new jsTimbreMesh();
		this.gun = new jsGun();
		this.collisionController = new jsCollisionController();
		
		// Append the viewport
		container.appendChild(renderer.viewport);
		
		this.addEventListeners();
		
	    // Start playing the song:
	    this.audio = document.getElementById("audio");
	    this.audio.play();

		// Start the Loop:
		this.playLoopInterval = setInterval(this.loop, 1000 / 80);
	},
	
	addStars: function(){
		for(var t=0;t<70;t++){
			var star = new Particle( new ColorMaterial(0xffffff) );
		    star.size = Math.random()*5;
			var leftRight = (Math.floor(Math.random()*2)==1) ? -1 : 1;
		    star.position.x = Math.random()*(SCREEN_WIDTH*2*leftRight);
		    star.position.z = Math.random()*SCREEN_DEPTH * -1 - SCREEN_DEPTH/2;
		    star.position.y = Math.random()*SCREEN_HEIGHT + CAMERA_Y;
		    star.updateMatrix();
			scene.add(star);
		}
	},

	addScoreboard: function(){
		// Set the initial score:
		this.scoreDiv = document.getElementById("score");
		this.updateScore();
	},
	
	addEventListeners: function(){
		// Add some event Listeners for gameplay:
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('touchstart', onDocumentTouchStart, false);
		document.addEventListener('touchmove', onDocumentTouchMove, false);	
		document.addEventListener('click', onDocumentMouseClick, false);

		// prevent right click, accidental right clicks were annoying when playing:
		document.addEventListener("contextmenu", function(event) {
		    event.preventDefault();
		}, false);
		
		// Prevent Text Selection, gets annoying when you're playing:
		document.onmousedown = function() {return false;}
    },

	addMessages: function(){
	    this.messages = [  document.getElementById("intro1"),
	                document.getElementById("intro2"),
	                document.getElementById("intro3"),
	                document.getElementById("intro4"),
					document.getElementById("level2"),
					document.getElementById("level3"),
					document.getElementById("bonus"),
					document.getElementById("gameOver"),
	             ];
	    // First intro is a little different...
	    this.messages[0].style.top = SCREEN_HEIGHT/2-50 + "px";
	    this.messages[0].style.left = SCREEN_WIDTH/2-150 + "px";

	    // Other will all be the same:
	    for(var i=1;i<this.messages.length;i++){
	        this.messages[i].style.top = SCREEN_HEIGHT/2-80 + "px";
	        this.messages[i].style.left = SCREEN_WIDTH/2-250 + "px";
	    }
	},
	
	updateScore: function(){
		this.scoreDiv.innerHTML = this.scoreNum + " / " + this.scoreDenom;
	},

	launchTarget: function(){
		if(this.curLevel>=3){
			return true
		} else if (this.curLevel==2 && this.curNormBeat==3){
			return true;
		} else if (this.curNormBeat==1){
			return true;
		} else {
			return false;
		}		
	},
	
	showNextMessage: function(){
        this.messages[0].style.display = "block";
		var context = this;
		setTimeout(function(){
			document.body.removeChild(document.getElementById(context.messages[0].id));
	        context.messages.remove(0);
		},2000)
	},

	handleSongPartChanges: function(timer){
		// Figure out what Segment, Beat and Section we're in:
		if(timer>=segmentStarts[this.curSeg+1]){
			this.curSeg++;
		}

		if(timer>=beatStarts[this.curBeat+1]){
			this.curBeat++;
			this.curNormBeat = (this.curNormBeat==4) ? 1 : this.curNormBeat + 1;
			if(this.launchTarget()){
				this.targets.push(new jsTarget(segmentLoudness[this.curSeg]));				
				this.scoreDenom++;
				this.updateScore();
			}
		}

		if(timer>=sectionStarts[this.curSect+1]){
			this.curSect++;
			document.body.style.background = this.backgroundColors[this.curSect];
		}
	},

	handleLevelChanges: function(timer){
		// update the timer, and change levels if necessary
		this.timerDiv.innerHTML = SONG_LENGTH - Math.floor(timer);
		if ((timer>67.9 && this.curLevel==1) || 
			(timer>120.09 && this.curLevel==2) ||
			(timer>177.161 && this.curLevel==3)) {
				this.curLevel++;
				this.showNextMessage();
		} else if (timer>250){
			var html = [
				"<p>Game Over!</p>",
				"<p class='smaller'>You hit ",this.scoreNum," out of ",this.scoreDenom," space particles</p>",
				"<p class='smaller'>Share your score on ",
				"<a href='http://twitter.com/home?status=I just got ",this.scoreNum," out of ",this.scoreDenom,
				" playing Space Cannon 3D: http://labs.brian-stoner.com/spacecannon/' title='Share on Twitter'>",
				"Twitter</a> and ",
				 "<a href='http://facebook.com/share.php?u=I just got ",this.scoreNum," out of ",this.scoreDenom,
				" playing Space Cannon 3D: http://labs.brian-stoner.com/spacecannon/' title='Share on Facebook'>",
				"Facebook</a></p>"
			]
			this.messages[0].innerHTML = html.join("");
			this.messages[0].style.display = "block";
			
			clearInterval(this.playLoopInterval);
		}
	},

	loop: function(){
		var context = jsGameInstance; // Need to 
		var collisionizer = context.collisionController;
		var gun = context.gun
		var bullets = gun.bullets;
		var targets = context.targets;
		
		// First let's get the gun straight, fire it if a click was detected, and reposition based on mouse position
		if (clicked){
			var bullet = context.gun.fire();
			collisionizer.registerPossibleCollisions(bullet,targets);
			clicked=null;
		}
		context.gun.animate();

		// get the timer from the song
		var timer = context.audio.currentTime;
		
		context.handleLevelChanges(timer);

		context.handleSongPartChanges(timer);

		context.timbres.animate(context.curSeg,timer);

		// Animate the Bullets:
		for (var b=0,blen=bullets.length;b<blen;b++){
			if(bullets[b].exploded){
				bullets[b].mesh.size = 0;
				bullets.remove(b);
				b--;
				blen--;
			} else {
				bullets[b].animate();
			};
		}

		// Animate the Targets:
	    for (var h=0,tslen=targets.length;h<tslen;h++){
			if(targets[h].exploded){
				targets[h].mesh.size = 0;
				targets.remove(h); // remove the target if it's moved off the screen depth;
				h--;
				tslen--;
			} else {
	        	targets[h].animate();
			}
		}
		
		// Tell the collision controller to animate itself,check for collisions,send back score for any hits:
		context.scoreNum += collisionizer.animate();
		
		// Update Score on the DOM:
		context.updateScore();
		
		// Intro Popups, need to clean up, kind of messy...
		if(timer<7){
			var introDivs = context.messages;
			if( (introDivs.length==8 && timer > 1) ||
				(introDivs.length==7 && timer > 3) ||
				(introDivs.length==6 && timer > 4.5) ||
				(introDivs.length==5 && timer > 6)){
				document.body.removeChild(document.getElementById(introDivs[0].id));
	            introDivs.remove(0);
	            if(timer<6){introDivs[0].style.display = "block";}
			}
		}

		renderer.render(scene, camera);
	}
});


jsTimbreMesh = Class.extend({
	depth: TIMBRE_MESH_NUM_Y,
	mesh: null,
	vRows: null,
	pitches: window.segmentPitches,
	loudness: window.segmentLoudness,
	
	init: function(){
	    // Create the floor mesh that will move based on pitches/loudness, and add to scene:
		var timbres = new TimbrePlane(TIMBRE_MESH_WIDTH, TIMBRE_MESH_HEIGHT, TIMBRE_MESH_DEPTH, TIMBRE_MESH_NUM_X, TIMBRE_MESH_NUM_Y);
		for (var ic = 0; ic < timbres.faces.length; ic++) {
			timbres.faces[ic].color.setRGBA( 39, 64, 140, 255 );
		}
		this.mesh = new Mesh(timbres, new FaceColorMaterial());
		this.mesh.rotation.x = 90 * (Math.PI / 180);
		scene.add(this.mesh);
		
		// Shortcuts for the animate:
		this.vRows = this.mesh.geometry.vRows;
	},
	
	animate: function(curSeg,timer){
		// Loop through the rows of vectors in the main mesh and adjust based on pitch/loudness:
		for(var r=0,depth=this.depth;r<depth;r++){
			var row = this.vRows[r];
			var pitchArray = this.pitches[curSeg-r];
			var rowLoudness = this.loudness[curSeg-r]+.035;
			var i = depth-r;
			for(var v=0,rl=row.length;v<rl;v++){
				if(curSeg-r>0){
	                row[v].z = Math.sin((pitchArray[v]/6) * rowLoudness) * 105;
	            }
			}
		}
	    this.mesh.updateMatrix();
	}
})

var jsGun =  Class.extend({
	bullets: [],
	mesh: null,
	
	init: function(){
		var gun = new Cube(15,75,10);
		for (var ic = 0; ic < gun.faces.length; ic++) {
			gun.faces[ic].color.setRGBA( 148, 148, 148, 255 );
		}
		var m = this.mesh = new Mesh(gun,new FaceColorMaterial());
		m.position.y = GUN_Y;
		m.position.x = GUN_X;
		m.position.z = GUN_Z;
		m.rotation.x = 90 * (Math.PI / 180);
		m.updateMatrix();

		scene.add(m);
	},

	fire: function(){
		var bul = new jsBullet(GUN_X,GUN_Y,GUN_Z);
		this.bullets.push(bul);
		return bul;
	},
	
	animate: function(){
		if (Math.abs(mouseX * .005) < 1.45){
			this.mesh.rotation.z = (mouseX * .005);
		}

		if(Math.abs(-mouseY * .005) + 1.2 < 2.2){
			this.mesh.rotation.x = (-mouseY * .005) + 1.2;
		}
		this.mesh.updateMatrix();
	}
	
});


jsBullet = Class.extend({
	mesh: null,
	end: null,
	trajectory: null,
	
	init: function(x, y, z){
		var m = this.mesh = new Particle( new ColorMaterial(0xffffff, 1) );
		var pos = m.position;
		
		m.size = BULLET_SIZE;
		pos.x = x;
		pos.y = y;
		pos.z = z;
		
		// Set the trajectory based on the mouse position, with constant z
		var traj = this.trajectory = new Vector3(mouseX/15,-mouseY/20,-15);
		
		m.updateMatrix();
		scene.add(m);
		
		// Figure out the ending coordinate so we can do some predictive collision detection
		var numAnimates = BULLET_Z_DIST/traj.z;
		this.end = new Vector3( traj.x*numAnimates+pos.x, traj.y*numAnimates+pos.y, NEG_SCREEN_DEPTH)
	},

	animate:function(){
		// If the bullet moved beyond screen depth, let's get rid of it:
		var m = this.mesh;
		var pos = m.position;
		
		if (pos.z<(NEG_SCREEN_DEPTH)){
			this.exploded = true;
		}

		pos.addSelf(this.trajectory);
		m.updateMatrix();
	}
})

jsTarget = Class.extend({
	mesh: null,
	end: null,

	// This creates the actual balls that fly by, their size is relative to the current loudness of the song	
	init: function(loudness){
		
		// Make the location a little random, with some constraints:
		var rand = Math.random();
		var xPos = (Math.floor(rand*2)==1) ? -250 - Math.floor(rand * 200) : 250 + Math.floor(rand * 200);
		
		// Create the particle with random color:
	    var m = this.mesh = new Particle( new ColorMaterial(Math.random() * 0x808008 + 0x808080, 1) );

		// set the size of the particle based on the loudness of the current segment:
		m.size = 65+(loudness);
		
		// set the current position
	    m.position.x = xPos + CAMERA_X;
	    m.position.z = NEG_SCREEN_DEPTH;
	    m.position.y = Math.random() * 150 + CAMERA_Y + 50;

		// set the end position so we can do predictive collision detection:
		this.end = new Vector3(m.position.x,m.position.y,500);

	    m.updateMatrix();
		scene.add(m);
	},

	animate: function(){
		var pos = this.mesh.position;
        pos.z += 10;
        this.mesh.updateMatrix();
		if (pos.z >= 500){
            this.exploded = true;
		}
	},
	
});

jsCollisionController = Class.extend({
	possibleCollisions: [],
	explodingTargets: [],
	
	init: function(){
		// Nothing to init yet, maybe later...
	},
	
    registerPossibleCollisions: function(bullet,targets){
        // Do some predictive stuff here so we don't have to constantly check for collisions between every object
		// on the screen. 
		// 
		// As soon as a bullet is launched we loop through the targets on the screen and determine based on their paths
		// how close they will get to each other, and whether they will ever be close enough to collide.
		//
		// If their paths come close enough for a collision we push them into the possibleCollisions array, and this is the
		// array we loop through later checking for collisions.

		for (var t=0,tlen=targets.length;t<tlen;t++){
			var target = targets[t];
			var targetV = target.mesh.position;
			var bulletV = bullet.mesh.position;
			
			var p13 = Vector3.sub(targetV,bulletV);
			var p43 = Vector3.sub(bullet.end,bulletV);
			var p21 = Vector3.sub(target.end,targetV);
			
			var d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
			var d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
			var d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
			var d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
			var d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;
			var denom = d2121 * d4343 - d4321 * d4321;
			
			numer = d1343 * d4321 - d1321 * d4343;
			var mua = numer / denom;
			var mub = (d1343 + d4321 * (mua)) / d4343;
			
			var pa = {
				x: targetV.x + mua * p21.x,
				y: targetV.y + mua * p21.y,
				z: targetV.z + mua * p21.z
			}
			
			var pb = {
				x: bulletV.x + mub * p43.x,
				y: bulletV.y + mub * p43.y,
				z: bulletV.z + mub * p43.z
			}
			
			var relPos = Vector3.sub(pb,pa);
			
			// Finally we have the length of the smallest line connecting the paths of the bullet and target:
			var dist = Math.abs(Math.sqrt(relPos.x * relPos.x + relPos.y * relPos.y + relPos.z * relPos.z));

			// Get the combined sizes to compare to the min. distance:
			var size = target.mesh.size+bullet.mesh.size;
			
			// If the closest the 2 get is half of their combined sizes then they may collide:
			if (dist<(size/2)+15){
				this.possibleCollisions.push({	bullet:bullet,
												target:target,
												combinedSize:size,
												sincelastCheck: 15 });
			}

        }
    },
	
	animate: function(){
		var score = 0;
		var pcs = this.possibleCollisions;
		var ets = this.explodingTargets;
		
		for (var pc=0,pclen=pcs.length;pc<pclen;pc++){
			var obj = pcs[pc];
			
			// Trying for some performance help here...let's not do a collision check every frame, only if the objects were close
			// last time we checked:
			if (obj.sincelastCheck < 15 && obj.prevDist > 350){
				obj.sincelastCheck++;
				continue;
			} else {
				obj.sincelastCheck=0;
			}
			
			var bulletV = obj.bullet.mesh.position;
			var targetV = obj.target.mesh.position;
			
			// If the bullet or target already exploded from some other event, get rid of the item from the possibleCollisions array
			if (obj.bullet.exploded || obj.target.exploded){
				pcs.remove(pc);
				pc--;
				pclen--;
				continue;
			}
			
			// Calc the relative position of the bullet and target:
			var relPos = {
	            x: targetV.x - bulletV.x,
	            y: targetV.y - bulletV.y,
	            z: targetV.z - bulletV.z
	        }
	
			// Figure out the distance between the 2
	        var dist = Math.sqrt(relPos.x * relPos.x + relPos.y * relPos.y + relPos.z * relPos.z);
			
			// Check current dist vs. cached previous dist, if we're getting further apart, we missed our chance to collide, so remove:
			if (obj.prevDist && dist > obj.prevDist){
				pcs.remove(pc);
				pc--;
				pclen--;
				continue;
			}
			obj.prevDist = dist; // cache distance for next time through the loop
			
			// If the distance is smaller than the combined size, it's a collision:
	        if(dist<obj.combinedSize){		
				// set flag, so it can be removed from all arrays by the game instance:
				obj.bullet.exploded = true;
				obj.target.exploded = true;
				
				score += 1;

				// Add the target to the exploding targets array, so we can animate the explosion:
				obj.target.mesh.opacity = 0.75;
				ets.push(obj.target);
				
				// remove the possible collision:
				pcs.remove(pc);
				pc--;
				pclen--;
			}
		}
		
		// Animate the Exploding Targets
	    for(var eb=0,eblen=ets.length;eb<eblen;eb++){
			var et = ets[eb].mesh;
			
			// If it's been animated to a size of 120, time to remove it...
	        if(et.size>120){
	            et.size=0;
	            ets.remove(eb);
				eblen--;
				eb--;
			} else {
				// ..otherwise make it bigger, diff color, and more opacic:
	            et.size += 15;
	            et.opacity += -.15;
	            et.material = new ColorMaterial(Math.random() * 0x808008 + 0x808080, et.opacity);
			}
		}
		
		return score;
	}
	
});

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

// Using Array Remove prototype, seems faster than splicing:
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

function init()
{
	// Only allow to run for browsers that can handle it (basically just not ie)
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    var is_safari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
	var is_ie = navigator.userAgent.indexOf('MSIE') > -1;
    //var is_gecko = navigator.userAgent.toLowerCase().indexOf('gecko') > -1;
    if(!is_chrome && !is_safari && !is_ie){
        alert("Sorry, the Javascript engine in your Browser can't handle this game. \n\nThis site works best with the latest version of Google Chrome.")
        return;
    }
	
	CFInstall.check({
		mode: "popup"
	});
	
	jsGameInstance = new jsGame();
}
