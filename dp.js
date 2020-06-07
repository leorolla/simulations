/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

// Constants to match different colors with different site conditions
const dpOccupied = 3;
const dpUnexplored = 2;
const dpVacant = 1;

// Record the location of the next site to be updated
var dpTargetI,dpTargetJ;
// How much time have passed in dp model
var dpTime;



// Initialize matrices if model is Contact1d
// 1 for vacant, 2 for unexplored, 3 for occupied, sites have 8 neighbors!!!
// The procedure reads the global variable colorConfiguration and changes its value
function dpInit() {
    for (var j = 0; j < gridSize; ++j) {
        // For top row
        // Give out random numbers
        var r = myRand();
        if(r < paramZeta) {
            // An occupied site
            colorConfiguration[0][j] = dpOccupied;
        }
        else {
            // A vacant site
            colorConfiguration[0][j] = dpVacant;
        }
    }
    for (var i = 1; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Rest unexplored
            colorConfiguration[i][j] = dpUnexplored;
        }
    }
    // Update should begin at i = 0 , j = 0
    dpTargetI = 0;
    dpTargetJ = 0;
    dpTime = 0;
}



// Randomly choose a site and update colorConfiguration in CP1d
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A CYLINDER during the simulation
function dpUpdateSite(deltaTime) {
    dpTime += deltaTime;
    // For dp, model time = grid size, so in N model time, N^2 updates should be done
    // which means that in 1 model time, exactly N updates should be done, equivalent to
    // updating a row.
    while (dpTargetI < dpTime && dpTargetI < gridSize - 1) {
        var i = dpTargetI;
        for (var j = 0; j < gridSize ; ++j) {
            colorConfiguration[i+1][j] = dpVacant;
        }

        // Update the target row from left to right
        for (var j = 0; j < gridSize ; ++j) {
            if (colorConfiguration[i][j] == dpOccupied) {
                // Connect the leftest and rightest column
                // But do not connect the highest and lowest rows!!!
                if (myRand() < paramLambda)
                    colorConfiguration[i + 1][commonTorus(j + 1)] = dpOccupied;
                if (myRand() < paramLambda)
                    colorConfiguration[i + 1][commonTorus(j - 1)] = dpOccupied;
                if (myRand() >= paramDelta)
                    colorConfiguration[i + 1][j] = dpOccupied;
            }
            else {
                // To couple parameters of DP
                // Make sure that in all the cases, myRand is called 3 times
                // in a single iteration
                myRand();
                myRand();
                myRand();
            }
        }
        dpTargetI++ ;
    }

}


// Output of Contact1d model
function dpOutput(){
    // Count the amount of occupied and unexplored sites
    var occupied = 0;
    var unexplored = 0;
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            occupied += (colorConfiguration[i][j] == dpOccupied);
            unexplored += (colorConfiguration[i][j] == dpUnexplored);
        }
    }
    var outstring = "Directed Percolation with parameter ζ = "+ paramZeta + ", with parameter δ = " + paramDelta +
    " and parameter λ = " + paramLambda + ". In the end, there are "
     + occupied + " occupied sites, " + unexplored + " unexplored sites, and "
     + (gridSize * gridSize - occupied - unexplored) +" vacant sites.";
    return outstring;
}
