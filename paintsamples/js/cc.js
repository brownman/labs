// Public Global Variables:
var CANVAS_ID = "canvas",
	CANVAS_WIDTH = 800,
	CANVAS_HEIGHT = 400,
	VERTICAL_LINE_COLOR = '#eee',
	BOTTOM_BAR_HEIGHT = 60,
	BACKGROUND_COLOR = 'rgba(255, 255, 255, 0.5)',
	
	TEMPO = 120,
	NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
	OCTAVES = [1,2,3,4,5,6], // available octaves that can be used
	
	PLAYER_INTERVAL = 30000 / TEMPO,
	PIXEL_BEAT_INTERVAL	= 6, // 20px measures
	LINE_WIDTH = PIXEL_BEAT_INTERVAL / 2, // to allow for eigth notes
	
	PATTERNS = [
		{name: "Solid",value:"00000000"},
		{name: "On The 1's", value: "10000000"},
		{name: "On The 1's & 3's", value: "10001000"},
		{name: "On The 2's & 4's", value: "00100010"}
		//{name: "1's, 2's, 3's & 4's", value: "10101010"},
		//{name: "On The off-beats", value: "01000100"}
	],
	
	INSTRUMENTS = {
		BASS_DRUM: {
			displayName: "Bass Drum", 
			file: '/paintsamples/audio/ogg/NON BD 1_A1.ogg',
			color: [255, 0, 0],  // red
			textColor: "rgb(128, 0, 0)",
			restartOnOctaveChange: true
		},
		SNARE_DRUM: {
			displayName: "Snare Drum", 
			file: '/paintsamples/audio/ogg/NON SD 8_A1.ogg',
			color: [255, 128, 0], // orange
			textColor: "rgb(128, 64, 0)",
			restartOnOctaveChange: true
		},
		TOM_DRUM: {
			displayName: "Tom Drum", 
			file: '/paintsamples/audio/ogg/NON LT 6_A2.ogg',
			color: [255, 255, 0], // yellow
			textColor: "rgb(128, 128, 0)",
			restartOnOctaveChange: true
		},
		HI_HAT_OPEN: {
			displayName: "Hi-Hat",
			file: '/paintsamples/audio/ogg/NON CH 2.ogg',
			color: [128,255,0], // neon green
			textColor: "rgb(64, 128, 0)",
			restartOnOctaveChange: true
		},
		CRASH: {
			displayName: "Crash",
			file: '/paintsamples/audio/ogg/NON CR 2_AS5.ogg',
			color: [255,0,255], // pink
			textColor: "rgb(128, 0, 128)",
			restartOnOctaveChange: true
		},
		GUITAR_STRUM: {
			displayName: "Guitar (strum)",
			file: '/paintsamples/audio/ogg/41662_NoiseCollector_yamaha_C.ogg',
			color: [128,0,255], // purple
			textColor: "rgb(32, 0, 128)",
			restartOnOctaveChange: true
		},
		DISTORTED_GUITAR: {
			displayName: "Guitar (Dist.)",
			file: '/paintsamples/audio/ogg/5360_NoiseCollector_dynaC3.ogg',
			color: [0,0,255], // blue
			textColor: "rgb(128, 128, 255)",
			restartOnOctaveChange: true
		},
		ORGAN: {
			displayName: "Organ",
			file: '/paintsamples/audio/ogg/7265__kingkrunk__thomas_organ_dab.ogg',
			color: [0,0,64], // blue
			textColor: "rgb(128, 128, 255)",
			restartOnOctaveChange: true			
		},
		DRIP: {
			displayName: "Drip",
			file: '/paintsamples/audio/ogg/DK_chrd_01.ogg',
			color: [0,0,0], // black
			textColor: "rgb(200, 200, 200)",
			restartOnOctaveChange: true			
		}
	};

// Internal variables:
var mouseX = 0,
	mouseY = 0,
	oldMouseX = 0,
	oldMouseY = 0,
	mouseDown = false,
	drawStartCoord = [],
	isDrawing = false,
	
	// drawing vars:
	cvs = null, // the canvas on bodyLoad
	ctx = null, // the context on the canvas on bodyLoad
	insList = null, // the ul for the instrument selector on bodyLoad
	noteHelper = null, // the hidden div for the note helper on the left of the screen
	stopButton = null,
	playButton = null,
	playerPosition = null,
	
	selectedInstrument = INSTRUMENTS.BASS_DRUM,
	curColor = getInstrumentColor(selectedInstrument),
	curPattern = PATTERNS[0].value,
	
	// dsp vars:
	sampleRate = 44100,
    bufferSize = 1024,
    bufferTime = Math.floor(1000 / (sampleRate / bufferSize)),
    amplitude  = 0.1, // Default amplitude at 70%
    oct = 4, // Root Octave
    oscs = [],
    noteOn = [],
    playSample = false,
    // Borrowed from F1LTER's code
    midiNoteFreq =  [ 16.35,    17.32,    18.35,    19.45,    20.6,     21.83,    23.12,    24.5,     25.96,    27.5,  29.14,    30.87,
                      32.7,     34.65,    36.71,    38.89,    41.2,     43.65,    46.25,    49,       51.91,    55,    58.27,    61.74,
                      65.41,    69.3,     73.42,    77.78,    82.41,    87.31,    92.5,     98,       103.83,   110,   116.54,   123.47,
                      130.81,   138.59,   146.83,   155.56,   164.81,   174.61,   185,      196,      207.65,   220,   233.08,   246.94,
                      261.63,   277.18,   293.66,   311.13,   329.63,   349.23,   369.99,   392,      415.3,    440,   466.16,   493.88,
                      523.25,   554.37,   587.33,   622.25,   659.26,   698.46,   739.99,   783.99,   830.61,   880,   932.33,   987.77,
                      1046.5,   1108.73,  1174.66,  1244.51,  1318.51,  1396.91,  1479.98,  1567.98,  1661.22,  1760,  1864.66,  1975.53,
                      2093,     2217.46,  2349.32,  2489.02,  2637.02,  2793.83,  2959.96,  3135.96,  3322.44,  3520,  3729.31,  3951.07,
                      4186.01,  4434.92,  4698.64,  4978 
    ],
    silence = new Float32Array(bufferSize),
	semi = 4,
	
	// Player variables
	noteGrid = [],
	shiftPressed = false,
	pxInterval = 0, // vertical note height
	pxBeatInterval = 0, // horizontal px per beat
	curPlayingPixel = 0,
	playingInstruments = [], // active array of instruments currently outputting to the audio buffer
	colorToInstrumentMap = {}; // for reading canvas pixels and figuring out what instrument should be playing
    
function onBodyLoad(){
	insList = document.getElementById("instrumentList");
	noteHelper = document.getElementById("noteHelper");
	noteHelperBar = document.getElementById("noteHelperBar");
	beatHelper = document.getElementById("beatHelper");
	beatHelperBar = document.getElementById("beatHelperBar");
	stopButton = document.getElementById("stopButton");
	playButton = document.getElementById("playButton");
	playerPosition = document.getElementById("playerPosition");
	playStatus = document.getElementById("playStatus");
	patternSelect = document.getElementById("patternSelect");
	cvs = document.getElementById(CANVAS_ID);
	
	resize();
	
	ctx = cvs.getContext( '2d' );
	ctx.lineWidth = LINE_WIDTH;
	ctx.fillStyle = BACKGROUND_COLOR;
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	// Load the samples for each of the instruments (so they're ready when the user hits play):
	for (var i in INSTRUMENTS){
		var ins = INSTRUMENTS[i];
		
		// set default values for each instrument:
		ins.semi = semi;
		ins.oct = oct;
		ins.writeCount = 0;
		ins.programStarted = null;

		ins.output = new Audio();
		ins.output.mozSetup(1, sampleRate);
		
		ins.s = new Sampler(INSTRUMENTS[i].file, bufferSize, sampleRate);
		ins.s.envelope = new ADSR(0, 0, 1, Infinity, 0, sampleRate);
		ins.s.envelope.disable(); // turn off so it does not auto trigger	
		
		renderInstrument(ins);
		
		// for the player, since it will need to translate pixel rgb data back to an instrument:
		colorToInstrumentMap[ins.color.join("")] = ins;
	}
	
	/* eventually do something about other browsers....
    if ( typeof output.mozSetup === 'function' ) {
      
    }
	*/
	
	renderPatterns();
	
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	
	playButton.addEventListener( 'click', play, false );
	stopButton.addEventListener( 'click', stop, false );
	patternSelect.addEventListener( 'change', selectPattern, false);
	
	setInterval(audioWriter, bufferTime); // start audioWriter timer
	
	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );
	window.addEventListener( 'resize', resize, false );
}

function onDocumentMouseDown(event){
	mouseX = oldMouseX = event.clientX - cvs.offsetLeft;
	mouseY = oldMouseY = event.clientY - cvs.offsetTop;

	if (mouseY > CANVAS_HEIGHT){
		return;
	}

	mouseDown = true;
	
	startBeatX = Math.ceil((mouseX + 1) / pxBeatInterval) * pxBeatInterval;
	drawStartCoord = [startBeatX, mouseY];
	
	draw(0,0,mouseX, mouseY);
}

function onDocumentMouseUp(event){
	mouseX = event.clientX - cvs.offsetLeft;
	mouseY = event.clientY - cvs.offsetTop;
	
	//if (mouseX < oldMouseX){
	//	mouseX = oldMouseX;
	//}
	
	oldMouseX = oldMouseY = 0;
	
	mouseDown = false;
	drawStartCoord = [];
	startBeat = 0;
	draw(0,0,mouseX, mouseY);
}

function onDocumentMouseMove(event){
	mouseX = event.clientX - cvs.offsetLeft;
	mouseY = event.clientY - cvs.offsetTop;

	if (mouseY > CANVAS_HEIGHT){
		oldMouseY = mouseY;
		oldMouseX = mouseX;
		return;
	}

	renderNoteHelper(mouseY);
	renderBeatHelper(mouseX);

	// Don't let them draw backwards, only forward
	//if (mouseX < oldMouseX){
	//	mouseX = oldMouseX;
	//}

	if (shiftPressed){
		mouseY = oldMouseY;
	}

	if ( mouseDown) {
		draw( oldMouseX, oldMouseY, mouseX, mouseY);
	}

	oldMouseX = mouseX;
	oldMouseY = mouseY;
}

function onDocumentKeyDown(event){
	if (event.keyCode==16){
		shiftPressed = true;
	}
}

function onDocumentKeyUp(event){
	if (event.keyCode==16){
		shiftPressed = false;
	}
}

function resize(){
	CANVAS_WIDTH = document.body.offsetWidth;
	CANVAS_HEIGHT = document.body.offsetHeight - BOTTOM_BAR_HEIGHT;
	
	cvs.width = CANVAS_WIDTH;
	cvs.height = CANVAS_HEIGHT;
	
	calculateNoteGrid();
	
	pxInterval = Math.floor(CANVAS_HEIGHT / (NOTES.length * OCTAVES.length));
	pxBeatInterval = PIXEL_BEAT_INTERVAL; //1800 / TEMPO; // TEMPO / px per minute
	pxEigthBeatInterval = pxBeatInterval / 2;
	
	playerPosition.style.height = CANVAS_HEIGHT;
	noteHelperBar.style.height = pxInterval;
	noteHelperBar.style.width = CANVAS_WIDTH;
	beatHelperBar.style.height = CANVAS_HEIGHT;
	beatHelperBar.style.width = pxBeatInterval;
}

function calculateNoteGrid(){
	noteGrid = [];
	for (var oct=OCTAVES.length-1;oct>=0;oct--){
		for(var nte=NOTES.length-1;nte>=0;nte--){
			noteGrid.push({octave: OCTAVES[oct], note: NOTES[nte], noteIdx: nte});
		}
	}
}

function draw( x1, y1, x2, y2){	
	// If they just clicked, or just clicked up, draw a circle, instead of a line.
	if (x1==0 && y1==0){	
		if (curPattern!="00000000"){
			return;
		}
		return drawDot(x2, y2);
	}
	
	ctx.fillStyle = BACKGROUND_COLOR;
	
	if (curPattern!=="00000000"){
		return drawPattern(x1, y1, x2, y2);
	}
	
	ctx.lineCap = "round";
	ctx.strokeStyle = curColor;
	ctx.beginPath();
	ctx.moveTo( x1, y1 );
	ctx.lineTo( x2, y2 );
	ctx.closePath();
	ctx.stroke();
}

function drawDot(x, y){
	ctx.beginPath();
	ctx.arc(x, y, LINE_WIDTH/1.6, 0, 360, false);
	ctx.fillStyle = curColor;
	ctx.closePath();
	ctx.fill();
	
	// set the fill color back to 'transparent'
	ctx.fillStyle = BACKGROUND_COLOR;
}	

function drawPattern(x1, y1, x2, y2){
	startX = drawStartCoord[0];
	
	ctx.strokeStyle = curColor;
	ctx.beginPath();
	
	var	startBeat = Math.ceil((startX) / pxBeatInterval),
		measure = Math.ceil(startBeat / 4),
		beatInMeasure = startBeat - ((measure - 1) * 4); // assuming 4/4 time
	
	for(var c=startX;c<x2;c+=pxBeatInterval){
		ctx.moveTo( c, y2 );
		//if (c>=x1){
			if (curPattern.substr((beatInMeasure - 1)*2,1)=="1"){
				ctx.lineTo( c + pxEigthBeatInterval, y2);
			}
			beatInMeasure = (beatInMeasure==4) ? 1 : beatInMeasure+1;
		//}
	}
	
	ctx.closePath();
	ctx.stroke();
}

// Handle different patterns:
function renderPatterns(){
	for(var p=0;p<PATTERNS.length;p++){
		var ptnOpt = document.createElement("option");
		ptnOpt.value = PATTERNS[p].value
		ptnOpt.textContent = PATTERNS[p].name;
		
		patternSelect.appendChild(ptnOpt);
	}
}

function selectPattern(event){
	curPattern = patternSelect.value;
}


// Handle different instruments:
function renderInstrument(instrument){
	var instrumentLi = document.createElement('li');
	var instrumentA = document.createElement('a');
	instrumentA.textContent = instrument.displayName;
	instrumentA.style.backgroundColor = getInstrumentColor(instrument);
	instrumentA.style.color = instrument.textColor;
	
	instrumentA.addEventListener("click", function(){
		selectInstrument(instrument, this);
	}, false);
	
	instrumentLi.appendChild(instrumentA);
	
	insList.appendChild(instrumentLi);
}

function selectInstrument(instrument, clickedItem){
	selectedInstrument = instrument;
	curColor = getInstrumentColor(instrument);
	
	var selected = document.getElementsByClassName("selected");
	for(var s in selected){
		if (selected[s].className){
			selected[s].className = selected[s].className.replace("selected","");
		}
	}
	clickedItem.className = "selected";
}

function renderNoteHelper(mouseY){
	var noteHelperNote = noteGrid[Math.floor(mouseY / pxInterval)];
	if (noteHelperNote){
		noteHelper.textContent = noteHelperNote.note + "" + noteHelperNote.octave;
		
		var lineTop = Math.floor(mouseY / pxInterval) * pxInterval;
		noteHelperBar.style.top = lineTop;
		noteHelper.style.top =  lineTop - 5;
		noteHelperBar.style.display = noteHelper.style.display = "block";		
	}
}

function renderBeatHelper(mouseX){
	var beatObj = getBeatObject(mouseX);

	beatHelper.textContent = beatObj.measure + ":" + beatObj.beatInMeasure;
	
	var lineLeft = beatObj.beat * pxBeatInterval;
	beatHelperBar.style.left = lineLeft;
	beatHelper.style.left = lineLeft;
	beatHelper.style.display = beatHelperBar.style.display = "block";
}

// Sample Player
function play(){
	// Start iterating through the canvas data
	
	canvasPlayerInterval = setInterval(canvasPlayer, PLAYER_INTERVAL);
	
	playButton.style.display = "none";
	stopButton.style.display = "block";
	playerPosition.style.display = "block";
}

function stop(){
	clearInterval(canvasPlayerInterval);

	curPlayingPixel = 0;
	playButton.style.display = "block";	
	stopButton.style.display = "none";
	playerPosition.style.display = "none";
	playerPosition.style.width = 0;
	playStatus.textContent = "0:0";
}

function canvasPlayer(){
	var beatObj = getBeatObject(curPlayingPixel);
	playStatus.textContent = beatObj.measure + ":" + beatObj.beatInMeasure;
	
	//renderBeatHelper(curPlayingPixel);
	
	var pxlArray = ctx.getImageData(curPlayingPixel, 0, 1, CANVAS_HEIGHT),
		curFrameInstruments = [];
	
	for(var i=0;i+3<pxlArray.data.length;i+=4){
		var rgbKey = [pxlArray.data[i], pxlArray.data[i+1], pxlArray.data[i+2]].join("");
		// if the color matches an instrument AND the instrument isn't already in the playing instruments array, add it:
		if (colorToInstrumentMap[rgbKey]){
			var ins = colorToInstrumentMap[rgbKey],
				note = noteGrid[Math.floor((i/4)/pxInterval)];
			//console.log((i/4)/pxInterval, i, pxInterval);
			if (note){
				ins.oct = note.octave;
				ins.semi = note.noteIdx;
				ins.s.reset();
				ins.s.setFreq(midiNoteFreq[12*ins.oct+ins.semi]);
				ins.s.envelope.noteOn();
				ins.curNote = note;
				playingInstruments.push(ins);
			}
			
			/*
			if (ins.restartOnOctaveChange && note && ins.curNote != note) {
				//console.log("playing: " + note.octave + note.note );
				ins.oct = note.octave;
				ins.semi = note.noteIdx;
				ins.s.reset();
				ins.s.setFreq(midiNoteFreq[12*ins.oct+ins.semi]);
				ins.s.envelope.noteOn();
				ins.curNote = note;
			} 
			*/
			curFrameInstruments.push(ins);
		}
	}
	
	for (var i=0,len=playingInstruments.length;i<len;i++){
		if (curFrameInstruments.indexOf(playingInstruments[i])==-1){
			playingInstruments.splice(i,1);
			i--;
			len--;
		}
	}
	
	playerPosition.style.width = curPlayingPixel + "px";
	curPlayingPixel+= pxEigthBeatInterval;
}

// Audio Buffer Player
function audioWriter() {

  for(var i=0;i<playingInstruments.length;i++){
	  var ins = playingInstruments[i];
	  
	  if (ins.s.loaded) {
	    if ( !ins.programStart) {
	       ins.programStart = new Date();
	    }
 
	    while ( (new Date() - ins.programStart) / 1000 * sampleRate / bufferSize >= ins.writeCount ) {
	      var additiveSignal;

	      if ( ins.s.envelope.isActive() ) {
	        ins.s.generate();
	        additiveSignal = ins.s.applyEnvelope();
	      }

	      // Flush buffer  
	      ins.output.mozWriteAudio([]);
   
	      if (additiveSignal) {
	        // Write next audio frame
	        ins.output.mozWriteAudio(additiveSignal);

	      }
	      ins.writeCount++;
	    }
	  }
	}
}

function getBeatObject(mouseX){
	var beat = Math.ceil((mouseX) / pxBeatInterval),
		measure = Math.ceil(beat / 4),
		beatInMeasure = beat - ((measure - 1) * 4); // assuming 4/4 time
	return {
		beat: beat,
		measure: measure,
		beatInMeasure: beatInMeasure
	};
}

function getInstrumentColor(Instrument, opacity){
	return 'rgb(' + Instrument.color.join(",") + ')';
}
