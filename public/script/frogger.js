
_WIDTH  			= 900
_HEIGHT 			= 500

TEXT_COLOR 			= '#828292'
BG_COLOR   			= '#202023'

FROG_SPEED 			= 0.2
FROG_FILL           = '#850'
FROG_FILL_OPACITY   = 1

CAR_DEFAULT_SPEED 	= 0.1
CAR_SIZE 			= 15
CAR_FILL 			= '#a9a9a9'
CAR_EXPLODE			= 'rgba(240,195,96,0.5)'
CAR_FILL_OPACITY 	= 1
CAR_STROKE 			= '#464646'
CAR_STROKE_OPACITY 	= 0.25
CAR_STROKE_WIDTH 	= 2

POINTS_FOR_SAFE_FROG= 100

GAME_BG_COLOR 		= new Gradient({ endX:_WIDTH, endY:0, colorStops:[[0, "#191919"], [1, "#111115"]] });
GAME_ERASE_COLOR 	= '#FFF'

WIDTH  				= _WIDTH
HEIGHT 				= _HEIGHT


NodesCollided = function(obj1, obj2){
		//     ^       ^
		//  <--F--> <--C-->
		//     ^       ^

		if (obj1.x + obj1.w < obj2.x) {
			return false;
		}
		
		
		//     ^
		// <-- C -->
		//     ^
		//     ^
		// <-- F -->
		//     ^
		if (obj1.y + obj1.h < obj2.y) {
			return false;
		}
		
		
		//     ^       ^
		//  <--C--> <--F-->
		//     ^       ^
		if (obj1.x > obj2.x + obj2.w) {
			return false;
		}
		
		//     ^
		// <-- F -->
		//     ^
		//     ^
		// <-- C -->
		//     ^
		if (obj1.y > obj2.y + obj2.h){
			return false;
		}

		return true;
}

Frog = function(root, x, y) {

	this.isAlive = true
    this.speed = FROG_SPEED
    this.initial_points = 0
    this.points = 0

    this.initialize = function(root, x, y) {
    	
    	this.pwidth = 20;
        this.pheight = 20;
        
        this.node = new Rectangle(this.pwidth, this.pheight)
        //var img = new Image();
    	//img.src = 'frogger.png'
    	//this.node = new ImageNode(img)
    	
        this.node.x = x - this.pwidth/2
        this.node.y = y - this.pheight/2
        this.node.height = this.pheight
        this.node.width = this.pwidth
        
        this.node.w = 20
        this.node.h = 20
        this.node.fill = FROG_FILL
        this.node.fillOpacity = FROG_FILL_OPACITY
        this.node.zIndex = 1

        this.eraser = new Rectangle(this.pwidth, this.pheight)
        this.eraser.x = x - this.pwidth/2
        this.eraser.y = y - this.pheight/2
        this.eraser.fill = GAME_BG_COLOR
        this.eraser.fillOpacity = 1
        this.eraser.zIndex = 0
        
        this.root.append(this.node)
        this.root.append(this.eraser)
    }

	this.up = function() {
		if (this.node.y<=0){
			this.root.endGame("Congrats, you made it.");
		} else {
			this.node.y = this.node.y - (this.pheight*this.speed);
		}
	}
	
	this.down = function() {
		if (this.node.y!=HEIGHT){
			this.node.y = this.node.y + (this.pheight*this.speed);
		}
	}
	
	this.moveLeft = function() {
		if (this.node.x!=0){
			this.node.x = this.node.x - (this.pwidth*this.speed);
		}
	}
	
	this.moveRight = function() {	
		if (this.node.x!=WIDTH){
			this.node.x = this.node.x + (this.pwidth*this.speed);
		}
	}

	this.runOver = function() {
		this.node.scale = 0.7
        this.node.stroke = false
        this.node.animateTo('fillOpacity', 0, 500, 'sine')
        this.node.removeSelf()
        this.eraser.removeSelf()
	}
	
	this.destroy = function(){
	    this.node.removeSelf()
	    this.eraser.removeSelf()
	}

	this.animate = function(t, dt){
		this.eraser.x = this.node.x
        this.eraser.y = this.node.y
        
        if (this.root.keys["Up"]==1){
        	this.up();
        }
        if (this.root.keys["Down"]==1){
        	this.down();
        }
        if (this.root.keys["Left"]==1){
        	this.moveLeft();
        }
        if (this.root.keys["Right"]==1){
        	this.moveRight();
        }
	}

    this.root = root
    this.initialize(root, x, y)
}


Car = function(root, x, y, speed, direction, color) {

    this.initialize = function(root, x, y, speed, direction, color) {
    	var w = Math.floor(Math.random()*100+50);
		var h = 40;

		this.speed = speed
		this.direction = direction

        this.node = new Rectangle(w, h)
        this.node.x = x
        this.node.y = y
        this.node.w = w
        this.node.h = h
        
        this.node.fill = color
        this.node.fillOpacity = CAR_FILL_OPACITY
        this.node.zIndex = 2
        
        this.eraser = new Rectangle(w,h)
        this.eraser.x = x
        this.eraser.y = y
        this.eraser.fill = GAME_ERASE_COLOR
        this.eraser.fillOpacity = 0
        this.eraser.zIndex = 0
        
        this.root.append(this.node)
        this.root.append(this.eraser)
    }

    this.destroy = function() {
        this.root.unregister(this)
    	this.node.removeSelf()
    	this.eraser.removeSelf()
    }


    this.animate = function(t, dt) {
        this.eraser.x = this.node.x
    	
        if (this.direction=="LEFT"){
    		this.node.x -= this.speed;
    		if((this.node.x + this.node.w)<10){
        		this.destroy();
        	}
    	} else {
    		this.node.x += this.speed;
    		if((this.node.x)>WIDTH-10){
        		this.destroy();
        	}
    	}
        
    }

    this.root = root
    this.speed = speed
    this.initialize(root, x, y, speed, direction, color)
}


CarDispatcher = function(root, x, y, speed, direction) {
	this.speed = CAR_DEFAULT_SPEED;
	this.space_between_cars = 150;
	this.carColor = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255),1.0];

    this.initialize = function(root, x, y, speed, direction) {
		this.speed = Math.floor(Math.random()*10)+1;	
		this.space_between_cars = Math.random()*50+150
		this.y = y
		this.x = x
		this.direction = direction; // LEFT or RIGHT
		this.max_cars = 3
		this.cars = new Array();
    }

    this.new_car = function() {
	    var car = new Car(this, this.x, this.y, this.speed, this.direction, this.carColor)
	    this.cars.push(car);
	    this.num_cars = this.cars.length;
    }

	this.append = function(obj){
		this.root.append(obj);
	}

	this.unregister = function(car){
		this.cars.deleteFirst(car);
	}
	
	this.destroy = function(){
    	for(var i=0;i<this.cars.length;i++){
			this.cars[i].node.removeSelf();
			this.cars[i].eraser.removeSelf();
		}
	}
	
    this.animate = function(t, dt) {
    	for(var i=0;i<this.cars.length;i++){
    		this.cars[i].animate(t, dt);
    	}

    	// If there's no cars, add one
    	if (this.cars.length==0){
    		this.new_car()
    	}
    	
		// if the cur number of cars isn't the max, see if we're ready to add one:
    	if(this.cars.length!=this.max_cars){
			
    		// get the last car that was added
    		var last_car = this.cars[this.cars.length-1];
    		
    		// If cars are moving to the left, and the top right corner of the car is more than the required space between cars away from the right side of canvas,
    		// then add another car
			if (this.direction=="LEFT" && last_car.node.x+last_car.node.w < (WIDTH-this.space_between_cars)){
    			this.new_car()
    			
    		// opposite of above condition, for cars moving to the right.  If there is enough spacing add another car
    		} else if (this.direction=="RIGHT" && last_car.node.x > (this.space_between_cars)){
    			this.new_car()
    		}
        }
        
    }

    this.root = root
    this.initialize(root, x, y, speed, direction)
}

FrogReceiver = function(root,x,y,w,h){
	isEmpty: true;
	
	this.initialize = function(x,y,w,h) {
		this.isEmpty=true;
		
		this.node =  new Path([
	      ['moveTo', [x, y]],
	      ['lineTo', [x, y-h]],
	      ['lineTo', [x+w,y-h]],
	      ['lineTo', [x+w,y]],
	      ['bezierCurveTo', [x+w,y-h, x,y-h, x,y]],
	    ], {
	    	//stroke: '#fff',
      		fill: '#850'
	    });
	    
	    
	    this.x = x;
	    this.y = y;
	    this.w = w;
	    this.h = h;

		this.root.append(this.node);
    }

    this.holdFrog = function(frog){
    	this.isEmpty=false;
		this.frog = frog
    	this.node.fill = '#dcdcdc';
    }
	
	this.destroy = function(){
		if(this.frog){
			this.frog.destroy();
		}
		this.node.removeSelf();
	}
	
    this.root = root;
    this.initialize(x,y,w,h);
}


Scoreboard = function(root){
	score: 0;
	lives: 5;
	timer: 0;
	level: 1;
	
	this.initialize = function(root){
		this.score = 0;
		this.lives = 5;
		this.timer = 0;
		this.level = 1;
	}
	
	this.scoreSafeFrog = function(){
		this.score += 10;
		this.updateStats();
	}

	this.scoreKilledFrog = function(){
		this.lives -= 1;
		if (this.lives==0){
			this.root.endGame();
		}
		this.updateStats();
	}

	this.scoreFinishedLevel = function(){
		if (this.timer < 10000){
			this.score += (10000 - this.timer) + POINTS_FOR_SAFE_FROG;
		} else {
			this.score += POINTS_FOR_SAFE_FROG;
		}
		this.timer = 0;
		this.level += 1;
	}

	this.updateStats = function(){
		var x = document.getElementById("score")
		x.innerHTML = "Score: " + this.score;
		
		var x = document.getElementById("lives")
		x.innerHTML = "Lives: " + this.lives;
		
		var x = document.getElementById("level")
		x.innerHTML = "Level: " + this.level;
	}
	
	this.updateTimer = function(){
		var x = document.getElementById("timer")
		x.innerHTML = "Time: " + this.timer;
	}
	
	this.timerTick = function(){
		this.timer += 1;
		this.updateTimer();
	}

	this.sendFinalScore = function(){
		console.log(this.root.user);
		
		ajaxData = {
			score: this.score,
			user_id :this.root.user.id,
			first_name: this.root.user.first_name,
			last_name: this.root.user.last_name
		}
			
		$.ajax({
			type:'POST',
			url: '/api/score/',
			data: ajaxData,
			error: function(XMLHttpRequest, textStatus, errorThrown){
						alert(errorThrown);
			}
		})	
	}

	this.root = root
	this.initialize(root);
}


FroggerGame = Klass(CanvasNode, {
	frogReceiverHeight: 50,

    initialize : function(canvasElem, fbUser) {
        CanvasNode.initialize.call(this)
        this.canvas = new Canvas(canvasElem)
        this.canvas.frameDuration = 35
        this.canvas.append(this)
        this.canvas.fixedTimestep = true
        this.canvas.clear = false

		// setup the background
		this.setupBg();

		this.user = fbUser;
		
		// Add the scoreboard
		this.scoreboard = new Scoreboard(this)
		
		// Add the lanes of traffic
		this.numTopDispatchers = 3;
		this.numBotDispatchers = 2;
		
		// number of frogs + targets at the top for frogs to reach
		this.numFrogs = 5;
		
		// setup the mapping for catching key presses
        this.keys = { "Up" : 0, "Down" : 0, "Left" : 0, "Right" : 0, "Ctrl" : 0 }

		// Initialize a new game
        this.startGame();
    },
    
    setupBg : function() {
        this.bg = new Rectangle(WIDTH, HEIGHT)
        this.bg.fill = GAME_BG_COLOR;
        this.bg.zIndex = -1000
        this.append(this.bg)
    },
    
	startGame: function() {
		this.addNewFrog();
		
		this.carDispatchers = [];
		this.frogReceivers = [];
		this.frogsLeft = this.numFrogs;

		// Add The frog receivers at the top:
		for (var f=0,ff=this.numFrogs;f<ff;f++){
			this.frogReceivers.push(new FrogReceiver(this,
											(WIDTH/this.numFrogs)*f, 
											this.frogReceiverHeight, 
											(WIDTH/this.numFrogs),  
											this.frogReceiverHeight)); 
		}
		
		
		var nextDispatchYCoord = 0+this.frogReceiverHeight;
		// Instantiate the Car Dispatchers (not actually drawn on canvas, just placeholders where the cars come from)
		for (var i=0, ii=this.numTopDispatchers;i<ii;i++){
			this.carDispatchers.push(new CarDispatcher(this, WIDTH, nextDispatchYCoord,CAR_DEFAULT_SPEED, "LEFT"));
			nextDispatchYCoord += 60;
		}
		
		nextDispatchYCoord += 50; // extra space between sections
		// Instantiate the Car Dispatchers (not actually drawn on canvas, just placeholders where the cars come from)
		for (var i=0,ii=this.numBotDispatchers;i<ii;i++){
			this.carDispatchers.push(new CarDispatcher(this, 0, nextDispatchYCoord,CAR_DEFAULT_SPEED, "RIGHT"));
			nextDispatchYCoord += 60;
		}

		// Start the animation
        this.addFrameListener(this.animate)
	},

	cleanUpCanvas : function() {
    	for(var i=0;i<this.carDispatchers.length;i++){
			this.carDispatchers[i].destroy();
		}
		for(var i=0;i<this.frogReceivers.length;i++){
			this.frogReceivers[i].destroy();
		}
	},

    endGame : function(msg) {
		this.scoreboard.sendFinalScore();
		
		this.removeFrameListener(this.animate)
		this.cleanUpCanvas();
		this.canvas.removeAllChildren();
		
		// Show link to start new game:
		document.getElementById("startOver").style.display = "block";
    },

	nextLevel : function(){
		// Score the Completed Level
		this.scoreboard.scoreFinishedLevel();

		// stop the animation madness
		this.removeFrameListener(this.animate)
		
		// clear the canvas
		this.cleanUpCanvas();

		// Restart the Game and the animation
		this.startGame();
	},
	
	recordDeadFrog : function(){
		this.frog.runOver();
		this.scoreboard.scoreKilledFrog();
		this.addNewFrog();
	},

	recordSafeFrog : function(){
		this.scoreboard.scoreSafeFrog();
		this.frogsLeft -= 1;
		if (this.frogsLeft==0){
			this.nextLevel();
		} else {
			this.addNewFrog();
		}
	},

	addNewFrog : function(){
		this.frog = new Frog(this,HEIGHT-10,WIDTH/2);
		this.scoreboard.updateStats();
	},


    key : function(state, name) {
    	this.keys[name] = state;
    },
    
    animate: function(t, dt){
		this.frog.animate(t, dt);
		this.scoreboard.timerTick();

    	for(var i=0;i<this.carDispatchers.length;i++){
    		this.carDispatchers[i].animate(t, dt);
    		
    		// Check if the frog got hit by any of the cars
    		var cars = this.carDispatchers[i].cars;
    		for(var c=0,cc=cars.length;c<cc;c++){
    			if (NodesCollided(cars[c].node,this.frog.node)){
    				this.recordDeadFrog();
    			}
    		}
    	}
    	
    	// The if doesn't event get entered unless the frog breaks the y-axis plane of the receivers at the top
		if (this.frog.node.y<this.frogReceiverHeight){
			for(var r=0,rr=this.frogReceivers.length;r<rr;r++){
				if(NodesCollided(this.frog.node,this.frogReceivers[r])){
					if (this.frogReceivers[r].isEmpty){
						this.frogReceivers[r].holdFrog(this.frog);
						this.recordSafeFrog();
					} else {
						this.recordDeadFrog();
					}
				}
			}
		}
		

	}

})


init = function(fbUser) {
    var c = E.canvas(WIDTH, HEIGHT)
    var d = E('div', { id: 'screen' })
    
	// remove the canvas container from the DOM, so we can insert a new one if they play again
	var screenDiv = document.getElementById("screen");
	if (screenDiv) document.body.removeChild(screenDiv);
	
	document.getElementById("startOver").style.display = "none";

    d.appendChild(c)
    document.body.appendChild(d) 
    
    FG = new FroggerGame(c,fbUser)

    if (document.addEventListener)
    {
        document.addEventListener("keypress", Ignore,  false)
        document.addEventListener("keydown",  KeyDown, false)
        document.addEventListener("keyup",    KeyUp,   false)
    }
    else if (document.attachEvent)
    {
        document.attachEvent("onkeypress", Ignore)
        document.attachEvent("onkeydown",  KeyDown)
        document.attachEvent("onkeyup",    KeyUp)
    }
    else
    {
        document.onkeypress = Ignore
        document.onkeydown  = KeyDown
        document.onkeyup    = KeyUp;
    }

    function Ignore(e) {
        if (e.preventDefault) e.preventDefault()
        if (e.stopPropagation) e.stopPropagation()
    }
    function KeyUp(e) {
        OnKey(0,e)
    }
    function KeyDown(e) {
        OnKey(1,e)
    }
    
    function OnKey(state, e)
    {
        if (e.preventDefault) e.preventDefault()
        if (e.stopPropagation) e.stopPropagation()
        var KeyID = (window.event) ? event.keyCode : e.keyCode;
        switch(KeyID)
        {
            case 37:
                FG.key(state,"Left")
                break;
            case 38:
                FG.key(state,"Up")
                break;
            case 39:
                FG.key(state,"Right")
                break;
            case 40:
                FG.key(state,"Down")
                break;
        }
    }
}


