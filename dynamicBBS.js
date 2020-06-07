/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Constants to match different colors with different site conditions
const dynamicBBSBox = 1;
const dynamicBBSBall = 3;



// The number of balls in carrier
var dynamicBBSCarrier;
// Record the location of the next site to be updated
var dynamicBBSTargetI;
var dynamicBBSTargetJ;


// Initialize matrices if model is BBS
// The procedure reads the global variable Mat and changes its value
function dynamicBBSInit() {
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Lambda works as the density of balls
            if(myRand() < paramLambda) {
                colorConfiguration[i][j] = dynamicBBSBall;
            }
            else {
                colorConfiguration[i][j] = dynamicBBSBox;
            }
        }
    }
    dynamicBBSCarrier = 0;
    dynamicBBSTargetI = 0;
    dynamicBBSTargetJ = 0;
}


// Sequentially update the whole matrix
// The procedure reads the global variable Mat and changes its value
function dynamicBBSUpdateSite(deltaTime) {
    //console.log(colorConfiguration);
    var iterTime = Math.ceil( deltaTime * gridSize * gridSize);
    while(iterTime--) {
        // Do the update for a single site        
        if(colorConfiguration[dynamicBBSTargetI][dynamicBBSTargetJ] == dynamicBBSBox && dynamicBBSCarrier > 0) {
            dynamicBBSCarrier--;
            colorConfiguration[dynamicBBSTargetI][dynamicBBSTargetJ] = dynamicBBSBall;
        }
        else if(colorConfiguration[dynamicBBSTargetI][dynamicBBSTargetJ] == dynamicBBSBall) {
            dynamicBBSCarrier++;
            colorConfiguration[dynamicBBSTargetI][dynamicBBSTargetJ] = dynamicBBSBox;
        }
        // Decide which site to update in the next turn
        var temp = dynamicBBSNextUpdate(dynamicBBSTargetI,dynamicBBSTargetJ);
        dynamicBBSTargetI = temp[0];
        dynamicBBSTargetJ = temp[1];
    }
}

// Decide which site to update next 
// Organize N^2 sites as a circuit
// [i+1][N] after [i][N-1], [0][0] after [N-1][N-1]
function dynamicBBSNextUpdate(i,j) {
    var result = [];
    if(i == gridSize - 1 && j == gridSize - 1) {
        result[0] = 0;
        result[1] = 0;
    }
    else if(j == gridSize - 1) {
        result[0] = i + 1;
        result[1] = 0;
    }
    else {
        result[0] = i;
        result[1] = j + 1;
    }
    return result;
}


// Output of BBS
function dynamicBBSOutput(){
    var outstring = "Dynamic Box-Ball System.";
    return outstring;
}


