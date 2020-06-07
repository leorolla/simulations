/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"


/* Declaration of variables and auxiliary functions */

// The following variables may be used by all models

// Read only:
var gridSize;		// Grid size
var colorNumber;	// Number of colors
var paramBeta;		// Inverse of temperature (Potts)
var paramZeta;		// Density (ARW)
var paramLambda;	// Probability of active particle to fall asleep (ARW and CP2d and CP1d)
var paramDelta;		// Probability of an occupied site becoming vacant (CP2d and CP1d)
var myRand;		    // Function variable to give a Uniform distribution on [0,1)

// Read and write:
var colorConfiguration;	// Color configuration
var particleCount;	    // Number of particles on each site


// The following variables ARE ONLY USED IN common.js

// Parameters:
const delay = 50;	    // Simulation time before drawing (in ms)
var timePerDraw;	    // How many time to run before redrawing
var randSeed;		    // The seed to generate random numbers
var modelType;		    // Which model? A string variable.
var colorType;          // Which kind of color in the simulation?
var modelTime;          // The time in the model to run, set running speed
var modelTimeType;      // Indicate whether the model is a continuous-time one or a discrete-time one


// For drawing:
var drawnConfiguration;	// to decide which sites need to be redrawn
var canvas;
var ctx;
var canvasSize;
var siteSize;
var colorArray;


// For main loop:
var timeMax;		    // How much real time does the model run
var timeCount;		    // How much time has passed
var nIntervId;		    // timer
var startTime;
var speed;
var modelUpdateSite;	// function variable, random updates according to model
var modelOutput;	    // function variable, final message according to model
var modelInit;		    // function variable, initialization according to model


// Get input from users and initialize matrices
function commonInitAll(){
    // User inputs.  The + forces the values to be numeric:
    gridSize = +document.getElementById("gridSize").value;
    modelTime = +document.getElementById("modelTime").value;
    colorNumber = +document.getElementById("colorNumber").value;
    paramBeta = +document.getElementById("paramBeta").value;
    paramZeta = +document.getElementById("paramZeta").value;
    paramLambda = +document.getElementById("paramLambda").value;
    paramDelta = +document.getElementById("paramDelta").value;
    randSeed = +document.getElementById("randSeed").value;
    modelType = document.getElementById("model").value;
    colorType = document.getElementById("colorOption").value;
    speed = document.querySelector('input[name="speed"]:checked');

    // Is the model discrete-time or continuous-time?
    modelTimeType = speedDefaults[modelType][0];

    // Handle with input errors:
    if(commonErrorHandler()) {
        document.getElementById("Ends").innerHTML += "Some invalid input was fixed. ";
    }

    // Make sure that the simulation is matched with the definition of the continuous-time model
    // Set the speed
    commonSetSpeed(speed);
    timeMax = modelTime;

    /* Set the random seed:
       If rand_seed is 1, use Math.random in the simulation (native PRNG)
       If rand_seed is 0, randomly generate a seed and use the current PRNG in simulation
       Else rand_seed is used as a seed and use the current PRNG in simulation */
    switch(randSeed) {
        case 1 : {
            myRand = Math.random;
            document.getElementById("Ends").innerHTML += "Native PRNG. ";
            break;
        }
        case 0 : {
            // Generate a seed (let it fall through to the default case)
            randSeed = Math.floor(Math.random() * 9999 + 1);
        }
        default : {
            // Set the seed
            myRand = prngNew(randSeed);
            document.getElementById("Ends").innerHTML += "Seed: " + randSeed + ". ";
            break;
        }
    }

    // Which update function, output function and initialization function to choose
    eval("modelUpdateSite = "+ modelType + "UpdateSite");
    eval("modelOutput = "    + modelType + "Output");
    eval("modelInit = "      + modelType + "Init");

    commonInitMatrix();
    timeCount = 0;
}


// Initialize the matrices and canvas
function commonInitMatrix() {

    // Set up the canvas
    canvas = document.getElementById('animation');
    ctx = canvas.getContext('2d');
    canvasSize = canvas.width; // = height because square canvas assumed
    siteSize = (canvasSize / gridSize);

    // Set up colorArray to save different colors
    colorArray = [];
    commonSetUpColor(colorType);

    // Build up colorConfiguration
    colorConfiguration = [];
    for(var i = 0; i < gridSize; ++i){
        colorConfiguration[i] = [];
        for(var j = 0; j < gridSize; ++j){
            colorConfiguration[i][j] = 0;
        }
    }
    // Build up particleCount
    particleCount = [];
    for(var i = 0; i < gridSize; ++i){
        particleCount[i] = [];
        for(var j = 0; j < gridSize; ++j){
            particleCount[i][j] = 0;
        }
    }
    // Build up drawnConfiguration matrix
    drawnConfiguration = [];
    for(var i = 0; i < gridSize; ++i){
        drawnConfiguration[i] = [];
        for(var j = 0; j < gridSize; ++j){
            drawnConfiguration[i][j] = 0;
        }
    }

    // Initialize matrices
    modelInit();
    mainDraw();
}


// Set up different colors for the model
// The procedure changes the value of colorArray
function commonSetUpColor(colorIndex) {
    switch(colorIndex) {
        case "Primary Colors" : {
            colorArray = primaryColors;
            break;
        }
        case "Light Colors" : {
            colorArray = lightColors;
            break;
        }
        case "Earth Colors" : {
            colorArray = earthColors;
            break;
        }
    }
}


// Handle with user's input
// If there is invalid input, notice the user and choose an input for the users
function commonErrorHandler() {
    // Record whether there is an invalid input
    var error = false;

    // Judge whether the variable is a numeric type:
    function commonIsNumber(input) { return typeof input === 'number' && !isNaN(input) }
    // Judge whether a number is an integer:
    function commonIsInt(num) { return Number.isInteger(num); }


    // Traverse the whole dictionary to check through different variables
    for(var key in inputRange) {
        var type_error = false;     // Is the input a number? Is it an int? (if necessary)

        if(inputRange[key][0] == "number") {
            type_error = type_error || !commonIsNumber(eval(key));
        }
        if(inputRange[key][1] == "int") {
            type_error = type_error || !commonIsInt(eval(key));
        }

        // If type-error happens
        if(type_error) {
            error = true;
            if(inputRange[key][4][0] == "HasDefaultValue") {
                // The default value is stored here
                document.getElementById(key).value = inputRange[key][4][1];
                eval(key + "= inputRange[key][4][1]");
            }
            else {
                // Search the value in inputDefaults
                var subArray = inputDefaults[modelType];
                var subArrayLength = subArray.length;
                for (var i = 0; i < subArrayLength; ++i) {
                    // Change parameter values into default ones
                    if(subArray[i][0] == key) {
                        document.getElementById(key).value = subArray[i][1];
                        eval(key + "= subArray[i][1]");
                        break;
                    }
                }
            }
            continue;
        }

        // If no type-error, check whether the numeric values is in range 
        if(eval(key) < inputRange[key][2]) {
            // Too small
            document.getElementById(key).value = inputRange[key][2];
            eval(key + "= inputRange[key][2]");
            error = true;
        }
        else if(eval(key) > inputRange[key][3]) {
            // Too large
            document.getElementById(key).value = inputRange[key][3];
            eval(key + "= inputRange[key][3]");
            error = true;
        }

    }

    //********************************************************************* */
    // Deal with special case for DP and staticBBS (because they are discrete-time models)!
    // Make sure that when real time ends, the model updates end simultaneously
    if (modelTimeType == "discrete") {
        modelTime = gridSize;
    }
    //********************************************************************* */

    return error;
}


/*
   Wraps up the interval 0,...N-1 to organize the grid as torus.
   The function accepts i in -1,0,1,...,N-1,N
   The function outputs in      0,1,...,N-1  (where N=gridSize)
   In other programing languages this would be i % N, but in JavaScript
     we have (-1) % N = -1
*/
function commonTorus(i) {
    switch(i) {
        case -1 : {
            return gridSize - 1;
        }
        case gridSize : {
            return 0;
        }
        default : {
            return i;
        }
    }
}


/*
    Set all the default value of parameters according to model
    This function is only triggerred when the user selects a model
*/
function commonSelectDefault(obj) {
    var modelName = obj.value;
    var subArray = inputDefaults[modelName];
    var subArrayLength = subArray.length;
    for (var i = 0; i < subArrayLength; ++i) {
        // Change parameter values into default ones
        document.getElementById(subArray[i][0]).value = subArray[i][1] ;
    }

    // Default speed setting
    // For discrete-time model, default speed is set as "full-time"
    // For continuous-time model, default speed is according to the speedDefault array
    if(speedDefaults[modelName][0] == "discrete") {
        // Discrete-time situation
        document.getElementById(speedDefaults[modelName][1]).checked = true;
    }
    else {
        // Continuous-time situation
        document.getElementById(speedDefaults[modelName][1]).checked = true;
    }
}


/*
    Dynamically set the speed of the simulation
    This function is triggerred when the speed changes
    Read data from speedValues
*/
function commonSetSpeed(obj) {
    var speedOption = obj.value;
    if(speedValues[speedOption][0] == "constant") {
        speed = speedValues[speedOption][1];
    }
    else {
        speed = modelTime * speedValues[speedOption][1];
    }
    if (speed > modelTime) speed = modelTime;
    timePerDraw = speed * delay / 1000.0;
}
