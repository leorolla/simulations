/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Constants to match different colors with different site conditions
const ttasX = 3;
const ttasY = 2;
const ttasVacant = 1;


// Initialize matrices if model is TTAS
// The procedure reads the global variable Mat and changes its value
function ttasInit() {
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Starts with X and Y uniformly distributed (p = 1/2)
            if(myRand() < 1/2) {
                colorConfiguration[i][j] = ttasX;
                particleCount[i][j] = 1;
            }
            else {
                colorConfiguration[i][j] = ttasY;
                particleCount[i][j] = 1;
            }
        }
    }
}


// Ramdonly choose a site and update
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function ttasUpdateSite(deltaTime) {
    var iterTime = Math.ceil( deltaTime * gridSize * gridSize);
    while(iterTime--) {
        // Randomly choose Mat[i][j] to update
        var i = Math.floor(myRand() * gridSize);
        var j = Math.floor(myRand() * gridSize);
        var particleType = colorConfiguration[i][j]
        if((particleType == ttasVacant) || (particleType == ttasY && myRand() > paramDelta)) {
            // 1. When the site is vacant, do nothing
            // 2. When the Y site is chosen, there is paramDelta probability for the particle
            //    to jump out
            continue;
        }

        // Pick a neighbor randomly
        var temp = ttasPickNeighbor(i,j);
        var newi = temp[1];
        var newj = temp[2];
        // The particle jump into this neighbor
        // It should first leave the original site
        switch(particleCount[i][j]) {
            case 1 : {
                colorConfiguration[i][j] = ttasVacant;
                particleCount[i][j] = 0;
                break;
            }
            default : {
                particleCount[i][j]--;
                break;
            }
        }

        // It should then enter the new site
        switch(colorConfiguration[newi][newj]) {
            case ttasVacant : {
                colorConfiguration[newi][newj] = particleType;
                particleCount[newi][newj] = 1;
                break;
            }
            case particleType : {
                particleCount[newi][newj]++;
                break;
            }
            default : {
                // Where annihilation happens
                if(particleCount[newi][newj] == 1) {
                    colorConfiguration[newi][newj] = ttasVacant;
                    particleCount[newi][newj] = 0;
                }
                else {
                    particleCount[newi][newj]--;
                }
                break;
            }
        }
    }
}

// Randomly pick up a neighbor (do with boundary checks)
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function ttasPickNeighbor(i,j) {
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


// Output of TTAS
function ttasOutput(){
    /*
    // Count the number of X and Y particles
    var XCount = 0, YCount = 0;
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            if(colorConfiguration[i][j] == ttasX) {
                XCount += particleCount[i][j];
            }
            else if(colorConfiguration[i][j] == ttasY) {
                YCount += particleCount[i][j];
            }
        }
    }
    */
    var outstring = "Two-Type Annihilating System.";
    return outstring;
}




