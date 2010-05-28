_WIDTH  			= 900;
_HEIGHT 			= 500;

TEXT_COLOR 			= '#828292';
BG_COLOR   			= '#202023';

FROG_SPEED 			= 0.2;
FROG_FILL           = '#850';
//FROG_FILL_OPACITY   = 1;
FROG_WIDTH			= 30;
FROG_HEIGHT			= 30;

CAR_DEFAULT_SPEED 	= 0.1;
CAR_SIZE 			= 15;
CAR_FILL 			= '#a9a9a9';
CAR_EXPLODE			= 'rgba(240,195,96,0.5)';
CAR_FILL_OPACITY 	= 1;
CAR_STROKE 			= '#464646';
CAR_STROKE_OPACITY 	= 0.25;
CAR_STROKE_WIDTH 	= 2;

PLAIN_CAR_WIDTH		= 80;
PLAIN_CAR_HEIGHT	= 40;
TRUCK_WIDTH 		= 110;
TRUCK_HEIGHT		= 40;
RACECAR_WIDTH		= 80;
RACECAR_HEIGHT		= 40;

FROG_RECEIVER_HEIGHT= 50;

POINTS_FOR_SAFE_FROG= 100;

GAME_BG_COLOR 		= new Gradient({ endX:_WIDTH, endY:0, colorStops:[[0, "#191919"], [1, "#111115"]] });
GAME_ERASE_COLOR 	= '#FFF';

WIDTH  				= _WIDTH;
HEIGHT 				= _HEIGHT;


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
    	
    	//this.pwidth = 30;
        //this.pheight = 28;
        
        //this.node = new Rectangle(this.pwidth, this.pheight)
        //var img = new Image();
    	//img.src = '/site_media/frogger/images/frog2.png'
    	//this.node = new ImageNode(img)
    	
        //this.node.x = x - this.pwidth/2
        //this.node.y = y - this.pheight/2
        //this.node.height = this.pheight
        //this.node.width = this.pwidth
        
        //this.node.w = 30
        //this.node.h = 28
		
		var xPart = FROG_WIDTH/10;
		var yPart = FROG_HEIGHT/10;
		
		this.node = new Path([
		    ['moveTo', [x+4*xPart,y-yPart*9]],
			['quadraticCurveTo', [x+5*xPart,y-FROG_HEIGHT, 	x+6*xPart,y-yPart*9]],
			['quadraticCurveTo', [x+7*xPart,y-yPart*5.5,	x+6*xPart,y-yPart*2]],
			['quadraticCurveTo', [x+5*xPart,y-yPart,		x+4*xPart,y-yPart*2]],
			['quadraticCurveTo', [x+3*xPart,y-yPart*5.5,	x+4*xPart,y-yPart*9]],
			
			['moveTo', [x+3*xPart,y-yPart*4]],
			['lineTo', [x+xPart,y-yPart*6]],
			['lineTo', [x+2*xPart,y-yPart*7]],
			['lineTo', [x+2*xPart,y-yPart*6]],
			['lineTo', [x+4*xPart,y-yPart*4]],
			
			['moveTo', [x+7*xPart,y-yPart*4]],
			['lineTo', [x+9*xPart,y-yPart*6]],
			['lineTo', [x+8*xPart,y-yPart*7]],
			['lineTo', [x+8*xPart,y-yPart*6]],
			['lineTo', [x+4*xPart,y-yPart*4]],
			
			['moveTo', [x+6*xPart,y-yPart*2]],
			['lineTo', [x+7*xPart,y-yPart]],
			['lineTo', [x+6*xPart,y]],
			['lineTo', [x+7*xPart,y]],			
			['lineTo', [x+9*xPart,y-yPart*2]],
			['lineTo', [x+8*xPart,y-yPart*3]],
			['lineTo', [x+7*xPart,y-yPart*3]]
			
		],{
			fill: FROG_FILL
		});

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


CarFactory = {
	
	makeCar: function(type,x,y,direction,color){
		switch(type){
			case "TRUCK":
				return this._makeTruck(x,y,direction,color);
				break;
			case "RACECAR":
				return this._makeRaceCar(x,y,direction,color);
				break;
			case "PLAINCAR":
				return this._makePlainCar(x,y,direction,color);
				break;
		}
	},
	
	_makeCarWrapper: function(x,y,w,h){
		var wrapper = new Rectangle(w, h)
        wrapper.x = x
        wrapper.y = y
        wrapper.w = w
        wrapper.h = h
        return wrapper;
	},
	
	_makeTruck: function(x, y, direction,color){
		var base_w = TRUCK_WIDTH;
		var base_h = TRUCK_HEIGHT;
		
		var car = this._makeCarWrapper(x,y,base_w,base_h)
		
		// update w and x based on direction
		var w = (direction=="LEFT") ? base_w : -base_w;
		var h = base_h;
		x = (direction=="LEFT") ? 0 : base_w;
        
		var path1 = new Path([
          ['moveTo', [x+0		,h/4]],
	      ['lineTo', [x+2*w/11	,h/4]],
	      ['lineTo', [x+2*w/11	,0]],
	      ['lineTo', [x+4*w/11	,0]],
	      ['lineTo', [x+4*w/11	,h/4]],
	      ['lineTo', [x+5*w/11	,h/4]],
	      ['lineTo', [x+5*w/11	,0]],
	      ['lineTo', [x+w		,0]],
	      ['lineTo', [x+w		,h]],
	      ['lineTo', [x+5*w/11	,h]],
	      ['lineTo', [x+5*w/11	,3*h/4]],
	      ['lineTo', [x+4*w/11	,3*h/4]],
	      ['lineTo', [x+4*w/11	,h]],
	      ['lineTo', [x+2*w/11	,h]],
	      ['lineTo', [x+2*w/11	,3*h/4]],
	      ['lineTo', [x+0		,3*h/4]],
	      ['lineTo', [x+0		,h/4]]
        ],{
        	fill: color
        })

		path1.w = w;
		path1.h = h;
		car.append(path1)
		return car;
	},
	
	_makeRaceCar: function(x, y, direction,color){
		var base_w = RACECAR_WIDTH;
		var base_h = RACECAR_HEIGHT;
		
		var car = this._makeCarWrapper(x,y,base_w,base_h)
		
		// Reinitialize w / h / x, based on direction
		var w = (direction=="LEFT") ? base_w : -base_w;
		var h = base_h;
		x = (direction=="LEFT") ? 0 : base_w;
				
		//Car body
		var path1 = new Path([
		    ['moveTo', [x+0,h]],
		    ['lineTo', [x+15*w/120,h]],
		    ['lineTo', [x+15*w/120,55*h/70]],
		    ['lineTo', [x+100*w/120,55*h/70]],
		    ['lineTo', [x+100*w/120,h]],
		    ['lineTo', [x+w,h]],
		    ['lineTo', [x+w,0]],
		    ['lineTo', [x+100*w/120,0]],
		    ['lineTo', [x+100*w/120,15*h/70]],
		    ['lineTo', [x+15*w/120,15*h/70]],
		    ['lineTo', [x+15*w/120,0]],
		    ['lineTo', [x+0,0]]
	    ],{
	    	fill:color
	    });
	    car.append(path1);
	    
	    //Bottom Left Tire
	    var path2 = new Path([
		    ['moveTo', [x+w/6,55*h/70]],
		    ['lineTo', [x+w/3,55*h/70]],
		    ['lineTo', [x+w/3,65*h/70]],
		    ['lineTo', [x+w/6,65*h/70]],
	    ],{
	    	fill:"#000"
	    });
		car.append(path2);
	      
	    //Top Left Tire
	    var path3 = new Path([
		    ['moveTo', [x+w/6,5*h/70]],
		    ['lineTo', [x+w/3,5*h/70]],
		    ['lineTo', [x+w/3,15*h/70]],
		    ['lineTo', [x+w/6,15*h/70]]
		],{
			fill:"#000"
		});
	    car.append(path3);
		
	    //Top Right Tire
	    var path4 = new Path([
		    ['moveTo', [x+7*w/12,15*h/70]],
		    ['lineTo', [x+7*w/12,0]],
		    ['lineTo', [x+3*w/4,0]],
		    ['lineTo', [x+3*w/4,15*h/70]]
		],{
			fill:"#000"
		});
	    car.append(path4)
		
	    //Bottom Right Tire
	    var path5 = new Path([
		    ['moveTo', [x+7*w/12,55*h/70]],
		    ['lineTo', [x+3*w/4,55*h/70]],
		    ['lineTo', [x+3*w/4,h]],
		    ['lineTo', [x+7*w/12,h]]
		],{
			fill:"#000"
		});
		car.append(path5)
	    
	    //Racing Strip
	    var path6 = new Path([
		    ['moveTo', [x+0,3*h/7]],
		    ['lineTo', [x+w,3*h/7]],
		    ['lineTo', [x+w,4*h/7]],
		    ['lineTo', [x+0,4*h/7]]
		],{
			fill:"#2E3192"
		});
		car.append(path6)
	    
	    //Windshield
	    var path7 = new Path([
		    ['moveTo', [x+w/2,2*h/7]],
		    ['lineTo', [x+2*w/3,2*h/7]],
		    ['lineTo', [x+2*w/3,5*h/7]],
		    ['lineTo', [x+w/2,5*h/7]]
		],{
			fill:"#000"
		});
	    car.append(path7)
		
		return car
	},
	
	_makePlainCar: function(x, y, direction,color){
		var base_w = PLAIN_CAR_WIDTH;
		var base_h = PLAIN_CAR_HEIGHT;
		
		var car = this._makeCarWrapper(x,y,base_w,base_h)
		
		// Reinitialize w / h / x, based on direction
		var w = (direction=="LEFT") ? base_w : -base_w;
		var h = base_h;
		x = (direction=="LEFT") ? 0 : base_w;
				
		//Car body
		var path1 = new Path([
		    ['moveTo', [x+0,h]],
		    ['moveTo', [x+1*w/7,0]],
			['lineTo', [x+2*w/7,0]],
			['lineTo', [x+2*w/7,h/8]],
			['lineTo', [x+3*w/7,h/8]],
			['lineTo', [x+3*w/7,0]],
			['lineTo', [x+5*w/7,0]],
			['lineTo', [x+5*w/7,h/8]],
			['lineTo', [x+6*w/7,h/8]],
			['lineTo', [x+6*w/7,0]],
			['quadraticCurveTo', [x+w,0, x+w,h/4]],
			['lineTo', [x+w,3*h/4]],
			['quadraticCurveTo', [x+w,h, x+6*w/7,h]],
			['lineTo', [x+6*w/7,h]],
			['lineTo', [x+6*w/7,35*h/40]],
			['lineTo', [x+5*w/7,35*h/40]],
			['lineTo', [x+5*w/7,h]],
			['lineTo', [x+3*w/7,h]],
			['lineTo', [x+3*w/7,35*h/40]],
			['lineTo', [x+2*w/7,35*h/40]],
			['lineTo', [x+2*w/7,h]],
			['lineTo', [x+w/7,h]],
			['quadraticCurveTo', [x+0,h/2, x+1*w/7,0]]
		],{
			fill: color
		});
		
		car.append(path1);
		return car;
	}
}

Car = function(root, x, y, speed, direction, color, type) {

    this.initialize = function(root, x, y, speed, direction, color, type) {
		this.speed = speed
		this.direction = direction

        this.node = CarFactory.makeCar(type,x, y, direction,color)
	    this.root.append(this.node)
	    
        this.eraser = new Rectangle(this.node.w,this.node.h)
        this.eraser.x = x
        this.eraser.y = y
        this.eraser.fill = GAME_ERASE_COLOR
        this.eraser.fillOpacity = 0
        this.eraser.zIndex = 0
        
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
    		if((this.node.x)>WIDTH){
        		this.destroy();
        	}
    	}
        
    }

    this.root = root
    this.speed = speed
    this.initialize(root, x, y, speed, direction, color, type)
}


CarDispatcher = function(root, x, y, speed, direction,type) {
	this.speed = CAR_DEFAULT_SPEED;
	this.space_between_cars = 150;
	this.carColor = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255),1.0];

    this.initialize = function(root, x, y, speed, direction,type) {
		this.speed = Math.floor(Math.random()*10);	
		this.space_between_cars = Math.random()*50+150
		this.y = y
		this.x = x
		this.direction = direction; // LEFT or RIGHT
		this.max_cars = 3
		this.cars = new Array();
    }

    this.new_car = function() {
	    var car = new Car(this, this.x, this.y, this.speed, this.direction, this.carColor,type)
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
    		} else if (this.direction=="RIGHT" && last_car.node.x > this.space_between_cars){
    			this.new_car()
    		}
        }
        
    }

    this.root = root
    this.initialize(root, x, y, speed, direction,type)
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
      		fill: '#996600'
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
        
        // remove the frog from the canvas;
        this.frog.destroy();

        var x = this.x;
        var y = this.y;
        var w = this.w;
        var h = this.h;
        
        this.star =  new Path([
          ['moveTo', [x+w/2, y]],
          ['lineTo', [x+w/4, y]],
          ['lineTo', [x+w/6, y-h/4]],
          ['lineTo', [x+w/5, y-h/3]],
          ['lineTo', [x+w/2, y-h/3]],
          ['lineTo', [x+w/3, y-h/3]],
          ['lineTo', [x+w/3, y-h/3]],
          ['lineTo', [x+w,y]],
          ['bezierCurveTo', [x+w,y-h, x,y-h, x,y]],
        ], {
            //stroke: '#fff',
            fill: '#850'
        });
    	
        this.node.fill = '#dcdcdc';
    }
	
	this.destroy = function(){
		if(this.frog){
			this.frog.destroy();
		}
		if(this.star){
			this.star.removeSelf();
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
		this.score += POINTS_FOR_SAFE_FROG;
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
		if (this.lives!=0 && this.root.user){
			// only save the score if we're out of lives...otherwise game isn't over
			return;
		}
		
		ajaxData = {
			score: this.score,
			user_id :this.root.user.id,
			first_name: this.root.user.first_name,
			last_name: this.root.user.last_name
		}
			
		$.ajax({
			type:'POST',
			url: '/frogger/api/score/',
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

    initialize : function(canvasElem) {
        CanvasNode.initialize.call(this)
        this.canvas = new Canvas(canvasElem)
        this.canvas.frameDuration = 35
        this.canvas.append(this)
        this.canvas.fixedTimestep = true
        this.canvas.clear = false

		// setup the background
		this.setupBg();
		
		this.user = null; // Put fbUser here
		
		// Add the scoreboard
		this.scoreboard = new Scoreboard(this)
		
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
		
		
		var offset = 10+this.frogReceiverHeight;
		// Instantiate the Car Dispatchers on top (not actually drawn on canvas, just placeholders where the cars come from)
		this.carDispatchers.push(new CarDispatcher(this, WIDTH, offset,CAR_DEFAULT_SPEED, "LEFT","RACECAR"));
		this.carDispatchers.push(new CarDispatcher(this, WIDTH, offset+60,CAR_DEFAULT_SPEED, "LEFT","TRUCK"));
		this.carDispatchers.push(new CarDispatcher(this, WIDTH, offset+120,CAR_DEFAULT_SPEED, "LEFT","PLAINCAR"));
		
		// Instantiate the Car Dispatchers (not actually drawn on canvas, just placeholders where the cars come from)
		this.carDispatchers.push(new CarDispatcher(this, -100, offset+240,CAR_DEFAULT_SPEED, "RIGHT","TRUCK"));
		this.carDispatchers.push(new CarDispatcher(this, -100, offset+300,CAR_DEFAULT_SPEED, "RIGHT","RACECAR"));
		
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

	getUser: function(){
		var context = this;
		FB.api('/me', function(response) {
		 	$("#fbLogin").hide();
		 	context.user = response;
			context.scoreboard.sendFinalScore();
		});
	},
	
    endGame : function(msg) {
		var context = this;
		
		if (!this.user){
			FB.getLoginStatus(function(response) {
			  if (response.session) {
				$("#fbLogin").show();
			  } else {
			    context.getUser();
			  }
			});
		}
		
		this.removeFrameListener(this.animate)
		this.cleanUpCanvas();
		this.canvas.removeAllChildren();
		
		// Show link to start new game:
		//document.getElementById("startOver").style.display = "block";
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
		// Add popup so new frog doesn't go flying up into cars
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
    				break;
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
						break;
					} else {
						this.recordDeadFrog();
						break;
					}
				}
			}
		}
		

	}

})





init = function() {
    var c = E.canvas(WIDTH, HEIGHT)
    var d = E('div', { id: 'screen' })
    
	// remove the canvas container from the DOM, so we can insert a new one if they play again
	var screenDiv = document.getElementById("screen");
	if (screenDiv) document.body.removeChild(screenDiv);
	
	//document.getElementById("startOver").style.display = "none";

    d.appendChild(c)
    document.body.appendChild(d) 
    
    FG = new FroggerGame(c)

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


