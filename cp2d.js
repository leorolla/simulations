/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

// Constants to match different colors with different site conditions
const cp2dOccupied = 3;
const cp2dVacant = 1;

// Initialize matrices if model is Contact2d
// The procedure reads the global variable Mat and changes its value
function cp2dInit() {
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Starts with density Zeta
            if(myRand() < paramZeta) {
                // An occupied site
                colorConfiguration[i][j] = cp2dOccupied;
            }
            else {
                // A vacant site
                colorConfiguration[i][j] = cp2dVacant;
            }
        }
    }
}


// Ramdonly choose a site and update Mat in CP
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function cp2dUpdateSite(deltaTime) {
    var iterTime = Math.ceil( deltaTime * gridSize * gridSize);
    while(iterTime--) {
        // Randomly choose Mat[i][j] to update
        var i = Math.floor(myRand() * gridSize);
        var j = Math.floor(myRand() * gridSize);
        switch(colorConfiguration[i][j]) {
            case cp2dOccupied : {
                // If occupied

                // Couple parameters of Contact Process
                // Make sure that myRand is called 2 times in all the switch cases
                myRand();

                var r = myRand();
                if(r < paramDelta){
                    colorConfiguration[i][j] = cp2dVacant;
                }
                break;
            }
            case cp2dVacant : {
                // If vacant
                var r = myRand();
                var s = myRand();
                if(r < paramLambda){
                    // Copy state of random neighbors
                    if(s < 1/4){
                        colorConfiguration[i][j] =  colorConfiguration[commonTorus(i - 1)][commonTorus(j)];
                    }
                    else if(s < 2/4){
                        colorConfiguration[i][j] =  colorConfiguration[commonTorus(i)][commonTorus(j - 1)];
                    }
                    else if(s < 3/4){
                        colorConfiguration[i][j] =  colorConfiguration[commonTorus(i)][commonTorus(j + 1)];
                    }
                    else{
                        colorConfiguration[i][j] =  colorConfiguration[commonTorus(i + 1)][commonTorus(j)];
                    }
                }
                break;
            }
        }
    }
}

// Output of Contact2d model
function cp2dOutput(){
    // Count the amount of occupied sites
    var occupied = 0;
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            occupied += (colorConfiguration[i][j] == cp2dOccupied);
        }
    }

    var outstring = "Contact Process 2D with parameter ζ = " + paramZeta + ", parameter δ = " + paramDelta +
    " and parameter λ = " + paramLambda + ". In the end, there are " + occupied + " occupied sites.";
    return outstring;
}
