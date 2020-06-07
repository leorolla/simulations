/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Initialize matrices if model is Voter
// The procedure reads the global variable Mat and changes its value
function voterInit() {
    for (var row = 0; row < gridSize; ++row) {
        for (var col = 0; col < gridSize; ++col) {
            // Give out random numbers
            var r = myRand();
            for (var id = 1; id <= colorNumber; ++id) {
                if(r < id / colorNumber) {
                    colorConfiguration[row][col] = id;
                    break;
                }
            }
        }
    }
}


// Ramdonly choose a site and update Mat in Voter Model
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function voterUpdateSite(deltaTime) {
    var iterTime = Math.ceil( deltaTime * gridSize * gridSize);
    while(iterTime--) {
        // Randomly choose Mat[i][j] to update
        var i = Math.floor(myRand() * gridSize);
        var j = Math.floor(myRand() * gridSize);
        var r = myRand();

        // Update
        if(r < 1/4){
            colorConfiguration[i][j] = colorConfiguration[commonTorus(i - 1)][commonTorus(j)];
        }
        else if(r < 2/4){
            colorConfiguration[i][j] = colorConfiguration[commonTorus(i)][commonTorus(j - 1)];
        }
        else if(r < 3/4){
            colorConfiguration[i][j] = colorConfiguration[commonTorus(i)][commonTorus(j + 1)];
        }
        else{
            colorConfiguration[i][j] = colorConfiguration[commonTorus(i + 1)][commonTorus(j)];
        }
    }
}


// Output of voter model
function voterOutput(){
    var outstring = "Voter Model with " + colorNumber + " colors.";
        // " for " + turn_max + " times"
    return outstring;
}
