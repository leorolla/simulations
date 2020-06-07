/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Constants to match different colors with different site conditions
const arwActive = 3;
const arwSleeping = 2;
const arwVacant = 1;

// Initialize matrices if model is ARW
// The procedure reads the global variable Mat, Mat_count and changes their values
function arwInit() {
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Give out random numbers
            var r = myRand();
            if(r < paramZeta) {
                // An active particle
                colorConfiguration[i][j] = arwActive;
                particleCount[i][j] = 1;
            }
            else {
                // A vacant site
                colorConfiguration[i][j] = arwVacant;
                particleCount[i][j] = 0;
            }
        }
    }
}


// Ramdonly choose a site and update Mat, Mat_count
// The procedure reads the global variable Mat, Mat_count and changes their values
function arwUpdateSite(deltaTime) {
    var iterTime = Math.ceil( deltaTime * gridSize * gridSize);
    while(iterTime--) {
        // Randomly choose Mat[i][j] to update
        var i = Math.floor(myRand() * gridSize);
        var j = Math.floor(myRand() * gridSize);

        if(colorConfiguration[i][j] != arwActive) {
            // Vacant or sleeping, do nothing
        }
        else if(particleCount[i][j] == arwVacant) {
            // One active particle
            var r = myRand();
            if(r < paramLambda) {
                // lambda prob to convert to sleeping
                colorConfiguration[i][j] = arwSleeping;
            }
            else {
                // not want to sleep, then jump out
                arwParticleJump(i,j);
            }
        }
        else{
            // Two or more active particles
            arwParticleJump(i,j);
        }
    }
}


// Jump out of the original grid (i,j) to one of its neighbors
// The procedure reads the global variable Mat, Mat_count and changes their values
function arwParticleJump(i,j) {
    // Deal with the state of the original site
    switch(particleCount[i][j]) {
        case 1 : {
            // If one active particle
            // The original site becomes vacant
            colorConfiguration[i][j] = arwVacant;
            particleCount[i][j] = 0;
            break;
        }
        default : {
            // The number reduces by one
            particleCount[i][j]--;
            break;
        }
    }

    // Deal with the state of its neighbor
    var temp = arwPickNeighbor(i,j);
    var newi = temp[1];
    var newj = temp[2];

    switch(colorConfiguration[newi][newj]) {
        case arwVacant : {
            // Vacant
            colorConfiguration[newi][newj] = arwActive;
            particleCount[newi][newj] = 1;
            break;
        }
        case arwSleeping : {
            // A sleeping particle
            // Change into 2 active particles
            colorConfiguration[newi][newj] = arwActive;
            particleCount[newi][newj]++;
            break;
        }
        case arwActive : {
            // Active
            particleCount[newi][newj]++;
            break;
        }
    }
}


// Randomly pick up a neighbor (do with boundary checks)
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function arwPickNeighbor(i,j) {
    var result = new Array();
    var r = myRand();
    // Pick up
    if(r < 1/4){
        result[1] = commonTorus(i - 1);
        result[2] = commonTorus(j);
    }
    else if(r < 2/4){
        result[1] = commonTorus(i);
        result[2] = commonTorus(j - 1);
    }
    else if(r < 3/4){
        result[1] = commonTorus(i);
        result[2] = commonTorus(j + 1);
    }
    else{
        result[1] = commonTorus(i + 1);
        result[2] = commonTorus(j);
    }
    return result;
}


function arwOutput(){
    // Count the number of particles and sleeping particles
    var total = 0;
    var sleeping = 0 ;
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            total += particleCount[i][j];
            sleeping += (colorConfiguration[i][j] == arwSleeping);
        }
    }
    var outstring = "Activated Random Walks with ζ = " + paramZeta +
        " and λ = " + paramLambda + ". In the end, there are " +
        (total - sleeping) + " active and " + sleeping +
        " sleeping particles (total " + total + ").";
    return outstring;
}
