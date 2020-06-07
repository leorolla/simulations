/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Constants to match different colors with different site conditions
const crwOccupied = 3;
const crwVacant = 1;

// Initialize matrices if model is CRW
// The procedure reads the global variable Mat and changes its value
function crwInit() {
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Starts with density Zeta
            if(myRand() < paramZeta) {
                colorConfiguration[i][j] = crwOccupied;
            }
            else {
                colorConfiguration[i][j] = crwVacant;
            }
        }
    }
}


// Ramdonly choose a site and update Mat in CRW
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function crwUpdateSite(deltaTime) {
    var iterTime = Math.ceil( deltaTime * gridSize * gridSize);
    while(iterTime--) {
        // Randomly choose Mat[i][j] to update
        var i = Math.floor(myRand() * gridSize);
        var j = Math.floor(myRand() * gridSize);
        if(colorConfiguration[i][j] == crwVacant) {
            // Vacant site, run PRNG for one time so that no matter whether the elected
            // site is vacant, PRNG is always run for one time
            // In order to match the CRW with otas
            myRand();
            continue;
        }

        // Pick a neighbor randomly
        var temp = crwPickNeighbor(i,j);
        var newi = temp[1];
        var newj = temp[2];
        // The particle jump into this neighbor
        // If there is a particle there, they merge
        colorConfiguration[newi][newj] = crwOccupied;
        colorConfiguration[i][j] = crwVacant;
    }
}

// Randomly pick up a neighbor (do with boundary checks)
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function crwPickNeighbor(i,j) {
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


// Output of Coalescing Random Walk
function crwOutput(){
    var outstring = "Coalescing Random Walks.";
    return outstring;
}
