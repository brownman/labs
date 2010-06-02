var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var AUDIO_URL = "/site_media/reptar/audio/Houseboat_Babies.mp3";

var RepGame = Class.extend({
	audio: null,
	earth: null,
	timeout: null,
	message: null,
	canvas: null,
	context: null,

	buildings: null,

	init: function(){
		this.createCanvas();

		// Instantiate Objects:
		this.earth = new RepEarth(this.context);
		this.buildings = new RepBuildingFactory(this.context);
		this.message = new RepMessageManager();
		this.audio = new RepSong();
				
		// Show the popup to start the game, can't auto-start if we want it to work on iPhone
		this.message.show('<a href="#" id="playGame">Click to Start</a>');
		
		// Setup the click handler:
		var context = this;
		document.getElementById("playGame").onclick = this.startGame.bind(this);
	},
	
	createCanvas: function(){
		this.canvas = document.createElement("canvas");
		this.canvas.style.position = "absolute";
		
		this.canvas.width = SCREEN_WIDTH;
		this.canvas.height = SCREEN_HEIGHT;
		
		this.context = this.canvas.getContext("2d");
		
		document.getElementById("screen").appendChild(this.canvas);
	},
	
	startGame: function(){
		this.message.hide();
	    this.audio.play();
		this.timeout = setInterval(this.loop.bind(this), 1000 / 30);
	},
	
	loop: function(){
		this.audio.update();
		
		// Clear Canvas before redrawing anything:
		this.context.globalCompositeOperation = 'destination-over';
		this.context.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
		
		// Update the objects and redraw them:
		this.buildings.animate(this.audio.timer,this.audio.changedBeat);
		this.earth.animate(this.audio.timer);
	}
});

var RepSong = Class.extend({
	audio: null,
	curSeg: 0,
	curBeat: 0,
	changedSeg: 0,
	changedBeat: 0,
	timer: null,

	init: function(){
		this.audio = new Audio(AUDIO_URL);
	},
	
	play: function(){
		this.audio.play();
	},
	
	update: function(timer){
		this.timer = this.audio.currentTime;
		
		// Reset the variables to keep track of when we have beat/seg changes:
		if (this.changedSeg==1){
			this.changedSeg=0;
		}
		if (this.changedBeat==1){
			this.changedBeat=0;
		}
		
		// Figure out what Segment, Beat and Section we're in:
		if(this.timer>=segmentStarts[this.curSeg+1]){
			this.changedSeg=1;
			this.curSeg++;
		}

		if(this.timer>=beatStarts[this.curBeat+1]){
			this.changedBeat=1;
			this.curBeat++;
		}
	}
	
});

var RepMessageManager = Class.extend({
	div: null,
	
	init: function(){
		this.div = document.getElementById("message");
		this.div.style.top = SCREEN_HEIGHT/2-80 + "px";
        this.div.style.left = SCREEN_WIDTH/2-250 + "px";
	},

	show: function(message,hidetime){
		this.div.innerHTML = message;
		this.div.style.display = "block";
		
		if (hidetime){
			var context = this;
			setTimeout(function(){
				context.hide();
			},hidetime);
		}
	},

	hide: function(){
		this.div.style.display = "none";
		this.div.innerHTML = "";
	}
});

var RepBuildingFactory = Class.extend({
	context: null,
	buildings: null,
	
	x: SCREEN_WIDTH,
	y: SCREEN_HEIGHT,
	
	xStep: SCREEN_WIDTH / 400,
	
	x1: 0,
	y1: SCREEN_HEIGHT,
	x2: SCREEN_WIDTH/2,
	y2: SCREEN_HEIGHT - SCREEN_HEIGHT/4,
	x3: SCREEN_WIDTH,
	y3: SCREEN_HEIGHT,
	
	a: 0,
	b: 0,
	c: 0, 
	
	init: function(context){
		this.context = context;
		this.buildings = [];
	},
	
	calcABC: function(){
		// Figure out A, B and C for the quadratic equation that represents the house's path:
		var aNum = (this.y2-this.y1) * (this.x1-this.x3) + (this.y3 - this.y1) * (this.x2 - this.x1);
		var aDenom = (this.x1 - this.x3) * (this.x2 * this.x2 - this.x1 * this.x1) + (this.x2 - this.x1) * (this.x3 * this.x3 - this.x1 * this.x1);
		this.a = aNum / aDenom;
		this.b = ((this.y2 - this.y1) - this.a * (this.x2 * this.x2 - this.x1 * this.x1 )) / (this.x2 - this.x1);
		this.c = this.y1 - this.a * this.x1 * this.x1 - this.b * this.x1;
	},

	f: function(x){
		// quadratic equation of the houses path, solve for x:
		return (this.a * x * x) + (this.b * x) + this.c;
	},
	
	animate: function(timer,changedBeat){
		var offset = Math.sin(timer)*20);
		
		if (changedBeat){
			this.buildings.push(new RepBuilding(this.context));
		}
		
		for (var b=0;b<this.buildings.length;b++){
			var bldg = this.buildings[b];
			
			if (bldg.offScreen){
				delete this.buildings[b];
			}
			bldg.x  -= this.xStep;
			bldg.y = this.f(this.x);
			bldg.animate(offset);
		}
	}
});

var RepBuilding = Class.extend({
	context: null,
	
	x: SCREEN_WIDTH, // Starting Point
	y: SCREEN_HEIGHT, // Starting Point
	w: 0,
	h: 0,
	
	x2: SCREEN_WIDTH/2,
	y2: SCREEN_HEIGHT - SCREEN_HEIGHT/4,
	
	init: function(context, w, h){
		this.context = context;
		
		this.w = w;
		this.h = h;
		
		this.calcABC();
		
		// Doesn't draw itself on init
	},
	
	drawSelf: function(offset){
		
		var secantSlope = (this.x > this.x2) ? Math.atan2(this.y - this.y2, this.x - this.x2) : Math.atan2(this.y2 - this.y, this.x2 - this.x);
		
		this.context.save();
		this.context.translate(this.x,this.y-offset);
		this.context.rotate(secantSlope * (115 * Math.PI / 180));
		this.context.fillStyle = "#dcdcdc";
		this.context.fillRect(0, 0, this.w + offset , -1 * this.h - offset);
		this.context.restore();
	},
	
	animate: function(offset){
		this.drawSelf(offset);
	}

});

var RepEarth = Class.extend({
	context: null,
	
	init: function(context){		
		this.context = context;
		this.drawSelf(1);
	},

	drawSelf: function(scale){
		this.context.fillStyle = "#66CD00";//"rgba(200,200,200,0.3)";
		this.context.beginPath();
		this.context.moveTo(0-scale,SCREEN_HEIGHT);
		this.context.quadraticCurveTo(SCREEN_WIDTH/2,(SCREEN_HEIGHT/2)-scale, SCREEN_WIDTH+scale,SCREEN_HEIGHT);
		this.context.closePath();
		this.context.fill();
		
	},
	
	animate: function(timer){
		this.drawSelf(Math.sin(timer)*20);
		//this.drawSelf(0);
	}
	
});

function init(){
	var game = new RepGame();
}