/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

// Constants to match different colors with different site conditions
const wettingVacant = 1;
const wettingCeiling = 2;
const wettingOccupied = 3;


// Use an array to save the values of exp{paramBeta * Delta_negative energy}
// so that we do not have to call Math.exp() every time during update, which speeds up the code
// Note that Delta_negative energy only has values in -3,-2,-1,0,1,2,3
// So we use expValue[i] to represent exp{paramBeta * (i+3)}
var wettingExpValue = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]; 



// Initialize matrices if model is Wetting Kawasaki
// The procedure reads the global variable colorConfiguration and changes its value
function wettingInit() {
    // In wetting model, the first row is set as the interaction ceiling
    for (var j = 0; j < gridSize; ++j) {
        colorConfiguration[0][j] = wettingCeiling;
    }

    // The last row is always vacant
    for (var i = 1; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            colorConfiguration[i][j] = wettingVacant;
        }
    }

    // For the remaining sites, we organize them as a square bubble adjacent to the ceiling
    // Starts with density Zeta
    var volume = (gridSize - 2) * gridSize * paramZeta;
    var bubbleSize = Math.round(Math.sqrt(volume));
    var startingColumn = Math.floor((gridSize - bubbleSize) / 2);
    var endingColumn = Math.floor((gridSize + bubbleSize) / 2);

    // Put the bubble horizontally centered
    for (var i = 6; i <= bubbleSize + 5 && i < gridSize - 1; ++i) {
        for (var j = startingColumn; j < endingColumn; ++j) {
            colorConfiguration[i][j] = wettingOccupied;
        }
    }

    // Initialize wettingExpValue when beta is fixed
    for (var i = 0; i < 7; ++i) {
        wettingExpValue[i] = Math.exp(paramBeta * (i - 3));
    }
}



// Ramdonly choose a site and update Mat in Wetting
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function wettingUpdateSite(deltaTime) {
    var iterTime = Math.ceil(deltaTime * gridSize * gridSize);

    while(iterTime--) {
        // Randomly choose Mat[i][j], i = 1,2,...,N-2, j = 0,1,...,N-1
        var i = Math.floor(myRand() * (gridSize - 2)) + 1;
        var j = Math.floor(myRand() * gridSize);

        // Randomly pick a neighbor of Mat[i][j]
        var temp = wettingPickNeighbor(i,j);

        var newi = temp[1];
        var newj = temp[2];

        // Try to exchange these two sites and calculate the negative energy
        var formerIJ = colorConfiguration[i][j];
        var formerNewIJ = colorConfiguration[newi][newj];
        var deltaNegativeEnergy = wettingCountDeltaEnergy(colorConfiguration,i,j,newi,newj);

        // If the energy increases, accept the exchange
        // If the negative energy drops, there's exp(Beta * Delta_negative energy) probability
        // to accept the exchange.
        var threshold;
        if(deltaNegativeEnergy % 1 == 0) {
            // If the delta energy is an integer, use calculated values to speed up
            threshold = wettingExpValue[deltaNegativeEnergy + 3];
        }
        else {
            threshold = Math.exp(paramBeta * deltaNegativeEnergy);
        }


        if(myRand() >  threshold) {
            // Reject the exchange
            continue;
        }
        else {
            // Accept the change, update the negative energy
            colorConfiguration[i][j] = formerNewIJ;
            colorConfiguration[newi][newj] = formerIJ;
        }
    }
    
}



// Calculate how much negative energy has changed after the [i][j]
// element is exchanged with the [newi][newj] element in 
// the configuration Mat
function wettingCountDeltaEnergy(Mat,i,j,newi,newj) {
    if(Mat[i][j] == Mat[newi][newj]) {
        // Negative energy does not change
        return 0;
    }

    // When [i][j] site is occupied, indicator = 1, else indicator = -1
    var IJOccupiedIndicator = 2 * (Mat[i][j] == wettingOccupied) - 1;

    if(j == newj) {
        // Two sites are on the same column

        if(i < newi) {
            // The original site is higher
            if(i == 1) {
                // Boundary situation
                return (  (Mat[newi][commonTorus(newj - 1)] == wettingOccupied) + (Mat[newi + 1][newj] == wettingOccupied) + 
                (Mat[newi][commonTorus(newj + 1)] == wettingOccupied) - (Mat[i][commonTorus(j - 1)] == wettingOccupied) -
                paramDelta  - (Mat[i][commonTorus(j + 1)] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
            else {
                // Normal situation
                return (  (Mat[newi][commonTorus(newj - 1)] == wettingOccupied) + (Mat[newi + 1][newj] == wettingOccupied) + 
                (Mat[newi][commonTorus(newj + 1)] == wettingOccupied) - (Mat[i][commonTorus(j - 1)] == wettingOccupied) -
                (Mat[i - 1][j] == wettingOccupied) - (Mat[i][commonTorus(j + 1)] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
        }
        else {
            // The original site is lower
            if(newi == 1) {
                // Boundary situation
                return (  (Mat[newi][commonTorus(newj - 1)] == wettingOccupied) + paramDelta + 
                (Mat[newi][commonTorus(newj + 1)] == wettingOccupied) - (Mat[i][commonTorus(j - 1)] == wettingOccupied) -
                (Mat[i + 1][j] == wettingOccupied) - (Mat[i][commonTorus(j + 1)] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
            else {
                // Normal situation
                return (  (Mat[newi][commonTorus(newj - 1)] == wettingOccupied) + (Mat[newi - 1][newj] == wettingOccupied) + 
                (Mat[newi][commonTorus(newj + 1)] == wettingOccupied) - (Mat[i][commonTorus(j - 1)] == wettingOccupied) -
                (Mat[i + 1][j] == wettingOccupied) - (Mat[i][commonTorus(j + 1)] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
        }
    }
    else {
        // Two sites are on the same row
        if(commonTorus(j + 1) == newj) {
            // The original site is lefter (note that the left and right edge of Mat is connected)
            if(i == 1) {
                // Boundary situation
                return (  (Mat[newi + 1][newj] == wettingOccupied) + (Mat[newi][commonTorus(newj + 1)] == wettingOccupied) -
                (Mat[i][commonTorus(j - 1)] == wettingOccupied) - (Mat[i + 1][j] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
            else {
                // Normal situation
                return (  (Mat[newi + 1][newj] == wettingOccupied) + (Mat[newi][commonTorus(newj + 1)] == wettingOccupied) + 
                (Mat[newi - 1][newj] == wettingOccupied) - (Mat[i - 1][j] == wettingOccupied) -
                (Mat[i][commonTorus(j - 1)] == wettingOccupied) - (Mat[i + 1][j] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
        }
        else {
            // The original site is righter
            if(i == 1) {
                // Boundary situation
                return (  (Mat[newi + 1][newj] == wettingOccupied) + (Mat[newi][commonTorus(newj - 1)] == wettingOccupied) -
                (Mat[i][commonTorus(j + 1)] == wettingOccupied) - (Mat[i + 1][j] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
            else {
                // Normal situation
                return (  (Mat[newi + 1][newj] == wettingOccupied) + (Mat[newi][commonTorus(newj - 1)] == wettingOccupied) + 
                (Mat[newi - 1][newj] == wettingOccupied) - (Mat[i - 1][j] == wettingOccupied) -
                (Mat[i][commonTorus(j + 1)] == wettingOccupied) - (Mat[i + 1][j] == wettingOccupied)  ) 
                * IJOccupiedIndicator;
            }
        }
    }
}






// Calculate the negative energy of the configurations given
function wettingCalculateEnergy(Mat) {
    var negativeEnergy = 0;

    // The part produced from the interaction with the ceiling
    for (var j = 0; j < gridSize; ++j) {
        if(Mat[1][j] == wettingOccupied) {
            negativeEnergy += paramDelta;
        }
    }

    // The part produced from the interaction between particles
    for (var i = 1; i < gridSize - 1; ++i) {
        for (var j = 0; j < gridSize; ++j) {
           // A pair of neighboring occupied sites contributes 1 negative energy
           // Search from left to right, up to down
           negativeEnergy += ( (Mat[i][j] == wettingOccupied) && (Mat[i][commonTorus(j + 1)] == wettingOccupied) )+
           ( (Mat[i][j] == wettingOccupied) && (Mat[i + 1][j] == wettingOccupied) );
        }
    }

    return negativeEnergy;
}



// Randomly pick up a neighbor
// Note that the Mat IS ACTUALLY A TORUS during the simulation
// Be careful to deal with 2 boundary situations
function wettingPickNeighbor(i,j) {
    var result = new Array();
    var r = myRand();

    if(i == 1) {
        // If mat[i][j] is in the second highest row
        if(r < 1/3){
            result[1] = i + 1;
            result[2] = j;
        }
        else if(r < 2/3){
            result[1] = i;
            result[2] = commonTorus(j - 1);
        }
        else{
            result[1] = i;
            result[2] = commonTorus(j + 1);
        }
    }
    else if(i == gridSize - 2) {
        // If mat[i][j] is in the second lowest row
        if(r < 1/3){
            result[1] = i - 1;
            result[2] = j;
        }
        else if(r < 2/3){
            result[1] = i;
            result[2] = commonTorus(j - 1);
        }
        else{
            result[1] = i;
            result[2] = commonTorus(j + 1);
        }
    }
    else {
        // If mat[i][j] is neither in the second highest row
        // nor in the second lowest row, it's the normal situation
        if(r < 1/4){
            result[1] = i - 1;
            result[2] = j;
        }
        else if(r < 2/4){
            result[1] = i;
            result[2] = commonTorus(j - 1);
        }
        else if(r < 3/4){
            result[1] = i;
            result[2] = commonTorus(j + 1);
        }
        else{
            result[1] = i + 1;
            result[2] = j;
        }
    }

    return result;
}




// Output of Wetting Kawasaki model
function wettingOutput(){

    var outstring = "Wetting Kawasaki with parameter ζ = " + paramZeta + ", parameter δ = " + paramDelta +
    " and parameter β = " + paramBeta + ". In the end, the negative energy is " + wettingCalculateEnergy(colorConfiguration) + " .";

    // console.log(wettingCalculateEnergy(colorConfiguration));
    return outstring;
}





