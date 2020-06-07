/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

// Constants to match different colors with different site conditions
const wettingFastVacant = 1;
const wettingFastCeiling = 2;
const wettingFastOccupied = 3;

// Use an array to save the values of exp{paramBeta * Delta_negative energy}
// so that we do not have to call Math.exp() every time during update, which speeds up the code
// Note that Delta_negative energy only has values in -4,-3,-2,-1,0,1,2,3,4 in normal cases.
// So we use expValue[i] to represent exp{paramBeta * (i + 4)}
var wettingFastExpValue = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];


// For boundary situations (sites next to the ceiling), use another expValue array
// DeltaNegativeEnergy falls in {-3,-2,-1,0,1,2,3} + {-1,0,1} * Delta
// Use expValueDelta[i][j] to represent exp{paramBeta * (j - 3 + (i - 1) * Delta)}
var wettingFastExpValueDelta = [[], [], []];


// Initialize matrices if model is Wetting Fast
// The procedure reads the global variable colorConfiguration and changes its value
function wettingFastInit() {
    // In wetting model, the first row is set as the interaction ceiling
    for (var j = 0; j < gridSize; ++j) {
        colorConfiguration[0][j] = wettingFastCeiling;
    }

    // The last row is always vacant
    for (var i = 1; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            colorConfiguration[i][j] = wettingFastVacant;
        }
    }

    // For the remaining sites, we organize them as a square bubble adjacent to the ceiling
    // Starts with density Zeta
    var volume = (gridSize - 2) * gridSize * paramZeta;
    var bubbleSize = Math.round(Math.sqrt(volume));
    var startingColumn = Math.floor((gridSize - bubbleSize) / 2);
    var endingColumn = Math.floor((gridSize + bubbleSize) / 2);

    // Put the bubble horizontally centered, five sites away from the ceiling
    for (var i = 6; i <= bubbleSize + 5 && i < gridSize - 1; ++i) {
        for (var j = startingColumn; j < endingColumn; ++j) {
            colorConfiguration[i][j] = wettingFastOccupied;
        }
    }

    // Initialize wettingExpValue when beta is fixed
    for (var i = 0; i < 9; ++i) {
        wettingFastExpValue[i] = Math.exp(paramBeta * (i - 4));
    }
    for (var i = 0; i < 3; ++i) {
        for (var j = 0; j < 7; ++j) {
            wettingFastExpValueDelta[i] = Math.exp(paramBeta * ((j - 3) + (i - 1) * paramDelta));
        }
    }
}



// Ramdonly choose a site and update Mat in Wetting
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function wettingFastUpdateSite(deltaTime) {
    var iterTime = Math.ceil(deltaTime * gridSize * gridSize);

    while(iterTime--) {
        // Randomly choose Mat[i][j], i = 1,2,...,N-2, j = 0,1,...,N-1
        var i = Math.floor(myRand() * (gridSize - 2)) + 1;
        var j = Math.floor(myRand() * gridSize);

/*        if(i == 1) {
            // The site is next to the ceiling, then compute delta energy if we flip it (Glauber)
            var deltaNegativeEnergy = wettingFastCountDeltaEnergyCeiling(colorConfiguration,i,j);
            var deltaPart = 2 * (colorConfiguration[i][j] == wettingFastVacant) - 1;
            var intPart = Math.round(deltaNegativeEnergy - deltaPart * paramDelta);
            // delta energy = intpart + deltapart * delta

            if(myRand() < wettingFastExpValue[deltaPart + 1][intPart + 3]) {
                // Accept the change, flip [i][j]
                colorConfiguration[i][j] = wettingFastOccupied + wettingFastVacant - colorConfiguration[i][j];
            }

        }
        else
*/
        {
            // Randomly pick [newi][newj], newi = 2,3,...,N-2, j = 0,1,...,N-1
            var newi = Math.floor(myRand() * (gridSize - 3)) + 2;
            var newj = Math.floor(myRand() * gridSize);
            if(colorConfiguration[i][j] == colorConfiguration[newi][newj] || i == newi || j == newj) {
                continue;
            }
            else {
                // Make sure that [i][j] and [newi][newj] are not neighbors
                // Try to exchange these two sites and calculate the delta negative energy
                var formerIJ = colorConfiguration[i][j];
                var formerNewIJ = colorConfiguration[newi][newj];
                var deltaNegativeEnergy = wettingFastCountDeltaEnergy(colorConfiguration,i,j,newi,newj);

                var proab;

                if (i >= 2)
                    probab = wettingFastExpValue[deltaNegativeEnergy + 4]
                else {
                    deltaNegativeEnergy += (2 * (colorConfiguration[i][j] == wettingFastVacant) - 1) * paramDelta;
                    probab = Math.exp(paramBeta * deltaNegativeEnergy);
                }

                // Use saved exponantial values
                if(myRand() < probab) {
                    // Accept the exchange
                    colorConfiguration[i][j] = formerNewIJ;
                    colorConfiguration[newi][newj] = formerIJ;
                }
            }
        }
    }

}


// Calculate how much negative energy has changed after the [i][j]
// element is flipped in the configuration Mat
// Note that [i][j] is next to the ceiling.
function wettingFastCountDeltaEnergyCeiling(Mat,i,j) {

    // If [i][j] is vacant, IJVacant = 1; else IJVacant = -1
    var IJVacantIndicator = 2 * (Mat[i][j] == wettingFastVacant) - 1;

    return ( paramDelta + (Mat[i][commonTorus(j - 1)] == wettingFastOccupied) +
    (Mat[i][commonTorus(j + 1)] == wettingFastOccupied) + (Mat[i + 1][j] == wettingFastOccupied) )
    * IJVacantIndicator;
}




// Calculate how much negative energy has changed after the [i][j]
// element is exchanged with the [newi][newj] element in
// the configuration Mat
// Note that the two sites are not neighboring in Wetting Fast, and their states are different
// and neither of the two sites is next to the ceiling
function wettingFastCountDeltaEnergy(Mat,i,j,newi,newj) {

    // When [i][j] site is occupied, indicator = 1, else indicator = -1
    var IJOccupiedIndicator = 2 * (Mat[i][j] == wettingFastOccupied) - 1;

    // Two arrays to traverse through all neighbors
    var di = [ 1, -1, 0, 0];
    var dj = [ 0, 0, 1, -1];

    // Return variable
    var result = 0;

    for(var index = 0; index < 4; ++index) {
        result += ( (Mat[newi + di[index]][commonTorus(newj + dj[index])] == wettingFastOccupied) -
        (Mat[i + di[index]][commonTorus(j + dj[index])] == wettingFastOccupied) );
    }
    return result * IJOccupiedIndicator;
}






// Calculate the negative energy of the configurations given
function wettingFastCalculateEnergy(Mat) {
    var negativeEnergy = 0;

    // The part produced from the interaction with the ceiling
    for (var j = 0; j < gridSize; ++j) {
        if(Mat[1][j] == wettingFastOccupied) {
            negativeEnergy += paramDelta;
        }
    }

    // The part produced from the interaction between particles
    for (var i = 1; i < gridSize - 1; ++i) {
        for (var j = 0; j < gridSize; ++j) {
           // A pair of neighboring occupied sites contributes 1 negative energy
           // Search from left to right, up to down
           negativeEnergy += ( (Mat[i][j] == wettingFastOccupied) && (Mat[i][commonTorus(j + 1)] == wettingFastOccupied) )+
           ( (Mat[i][j] == wettingFastOccupied) && (Mat[i + 1][j] == wettingFastOccupied) );
        }
    }

    return negativeEnergy;
}



// Output of Wetting Fast model
function wettingFastOutput(){

    var outstring = "Wetting Fast with parameter ζ = " + paramZeta + ", parameter δ = " + paramDelta +
    " and parameter β = " + paramBeta + ". In the end, the negative energy is " + wettingFastCalculateEnergy(colorConfiguration) + " .";

    //  console.log(globalEnergy);
    return outstring;
}
