/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Constants to match different colors with different site conditions
const staticBBSBox = 1;
const staticBBSBall = 3;
const staticBBSFutureBall = 2;  // A site that will have a ball in the next turn


// For static BBS, another array staticBBSCircuit is needed to form a periodic simulation
// We actually do the simulation on a much longer circuit and only show the first N configuration
// as each row in colorConfiguration

//**************************************************************************** */
//Variables used for colorConfiguration:

var staticBBSTargetI,staticBBSTargetJ;  // Record the location of the next site to be updated in colorConfiguration
var staticBBSTime;                      // How much time have passed in the model

//**************************************************************************** */
//Variables used for staticBBSCircuit:

var staticBBSCircuit;   // Real simulation of BBS happens on this circuit
var circuitFormerConfig;// Record the former configuration of the circuit, help marking "Future Ball"
var circuitLength;      // Decide how long is the circuit (larger than gridSize)
var staticBBSCarrier;   // Used in the simulation on the circuit

//**************************************************************************** */



// Initialize the circuit according to the density
// The procedure reads the local variable staticBBSCircuit and changes its value
function staticBBSInit() {
    // Clear the picture when it starts
    for(var i = 0; i < gridSize; ++i) {
        for(var j = 0; j < gridSize; ++j) {
            colorConfiguration[i][j] = staticBBSBox;
        }
    }

    // Prepare for the simulation on circuit
    circuitLength = 4 * gridSize;
    staticBBSCarrier = 0;

    // Array Construction
    staticBBSCircuit = [];
    circuitFormerConfig = [];
    staticBBSCircuit.length = circuitLength;
    circuitFormerConfig.length = circuitLength;
    for(var i = 0; i < circuitLength; ++i){
        if(myRand() < paramLambda) {
            staticBBSCircuit[i] = staticBBSBall;
        }
        else {
            staticBBSCircuit[i] = staticBBSBox;
        }
    }

    // Run the simulation for one time to set circuitFormerConfig
    staticBBSSimulate();

    // Update of colorConfiguration should begin at i = 0 , j = 0
    staticBBSTargetI = 0;
    staticBBSTargetJ = 0;
    staticBBSTime = 0;
}


// Site update function of static BBS
// The procedure reads the global variable Mat and changes its value
function staticBBSUpdateSite(deltaTime) {
    staticBBSTime += deltaTime;
    while (staticBBSTargetI < staticBBSTime && staticBBSTargetI <= gridSize - 1) {

        staticBBSSimulate();

        // Copy the states to colorConfiguration
        var i = staticBBSTargetI;
        // Update the target row from left to right
        for (var j = 0; j < gridSize ; ++j) {
            // Return only the first N config of the circuit
            // Actually return the former config , so that we can set the "future ball"
            // sites in the configuration
            if(staticBBSCircuit[j] == staticBBSBall) {
                // Note that staticBBSCircuit actually stores the future configuration
                colorConfiguration[i][j] = staticBBSFutureBall;
            }
            else {
                colorConfiguration[i][j] = circuitFormerConfig[j];
            }
        }
        staticBBSTargetI++ ;
    }

}


/*
    Update the whole circuit for a single time and update circuitFutureConfig
*/

function staticBBSSimulate() {
    // Save the former configurations
    for(var i = 0; i < circuitLength; ++i) {
        circuitFormerConfig[i] = staticBBSCircuit[i];
    }

    // Do the update for the circuit
    for(var i = 0; i < circuitLength; ++i) {
        if(staticBBSCircuit[i] == staticBBSBox && staticBBSCarrier > 0) {
            staticBBSCarrier--;
            staticBBSCircuit[i] = staticBBSBall;
        }
        else if(staticBBSCircuit[i] == staticBBSBall) {
            staticBBSCarrier++;
            staticBBSCircuit[i] = staticBBSBox;
        }
    }
}


// Output of static BBS
function staticBBSOutput(){
    var outstring = "Static Box-Ball System.";
    return outstring;
}
