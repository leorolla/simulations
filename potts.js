/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Making these global just to speed up function calls:
var cumuProb  = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
var countList = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];


// Use an array to save the values of exp{paramBeta * countList[colorIndex]}
// so that we do not have to call Math.exp() every time during update, which speeds up the code
// Note that elements in countList only have values in 0,1,2,3,4
var PottsExpValue = [0.0, 0.0, 0.0, 0.0, 0.0]; 



// Initialize matrices if model is Potts
// The procedure reads the global variable Mat and changes its value
function pottsInit() {
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Give out random numbers
            var r = myRand();
            for (var id = 1; id <= colorNumber; ++id) {
                if(r < id / colorNumber) {
                    colorConfiguration[i][j] = id;
                    break;
                }
            }
        }
    }

    // Initialize PottsExpValue when beta is fixed
    for (var i = 0; i < 5; ++i) {
        PottsExpValue[i] = Math.exp(paramBeta * i);
    }
}


// Ramdonly choose a site and update Mat
// The procedure reads the global variable Mat and changes its value
// Note that the Mat IS ACTUALLY A TORUS during the simulation
function pottsUpdateSite(deltaTime) {
    var iterTime = Math.ceil( deltaTime * gridSize * gridSize);
    while(iterTime--) {
        // Randomly choose Mat[i][j] to update
        var i = Math.floor(myRand() * gridSize);
        var j = Math.floor(myRand() * gridSize);
        for (var k = 1; k <= colorNumber; ++k) countList[k] = 0;
        // Updates
        countList[ colorConfiguration[commonTorus(i - 1)][commonTorus(j)] ]++;
        countList[ colorConfiguration[commonTorus(i)][commonTorus(j - 1)] ]++;
        countList[ colorConfiguration[commonTorus(i)][commonTorus(j + 1)] ]++;
        countList[ colorConfiguration[commonTorus(i + 1)][commonTorus(j)] ]++;
        pottsGenerateProb(); // uses count_list to generate cumu_prob
        colorConfiguration[i][j] = pottsElectColor(); // uses cumu_prob
    }
}


// Choose color according to the cumulative probability list cumu_prob
// returns an int informing which color to choose
function pottsElectColor() {
    var r = myRand();
    for(var colorIndex = 1; colorIndex <= colorNumber; ++colorIndex)
        if(r < cumuProb[colorIndex])
            return colorIndex;
}


// Computes cumu_prob from count_list
// count_list[i] is the number of the pixel's neighbors whose color is i
function pottsGenerateProb() {
    // Use an array to save the cumulative probability of different colors
    for (var colorIndex = 1; colorIndex <= colorNumber; ++colorIndex) {
        cumuProb[colorIndex] = cumuProb[colorIndex - 1] + PottsExpValue[countList[colorIndex]];
    }
    // Normalize the cumulative sum to the probability
    var normalizer = cumuProb[colorNumber];
    for (var colorIndex = 1; colorIndex <= colorNumber; ++colorIndex) {
        cumuProb[colorIndex] /= normalizer;
    }
}


// Output of potts model
function pottsOutput(){
    // Count how many pairs of neighboring sites are in disagreement
    var energy = 0;
    for (var row = 0; row < gridSize; ++row) {
        for (var col = 0; col < gridSize; ++col) {
            // Count along the right-down direction
            energy += (colorConfiguration[row][col] != colorConfiguration[commonTorus(row)][commonTorus(col + 1)] );
            energy += (colorConfiguration[row][col] != colorConfiguration[commonTorus(row + 1)][commonTorus(col)] );
        }
    }

    var outstring = "Potts Model with parameter β = " + paramBeta +
        " and " + colorNumber + " colors. In the end, the energy is " + energy + ".";
        // " for " + turn_max + " times"
    return outstring;
}
