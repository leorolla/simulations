/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/


/* Main functions of the web page */


// Main function:
function mainSimulate() {
    // Clean up:
    document.getElementById("Ends").innerHTML = "";
    clearInterval(nIntervId);
    // Initialize:
    commonInitAll();
    // Start:
    startTime = performance.now();
    nIntervId = setInterval(mainUpdateDraw,delay);
}


// A function for the update the configuration
function mainUpdateDraw(){
    // Update colorConfiguration
    if(timePerDraw + timeCount >= timeMax) {
        // When it is the last turn
        modelUpdateSite(timeMax - timeCount);
        timeCount = timeMax;
        mainDraw();
        clearInterval(nIntervId);
        document.getElementById("Ends").innerHTML +=
            "Time: " + Math.ceil(performance.now() - startTime) + "ms. " +
            modelOutput();
    }
    else {
        // It is not the last turn
        modelUpdateSite(timePerDraw);
        timeCount += timePerDraw;
    }
    mainDraw();
}


// Draw out the graph according to Mat <-- Mat changed to colorConfiguration
function mainDraw(){
    for (var i = 0; i < gridSize; ++i) {
        for (var j = 0; j < gridSize; ++j) {
            // Actually do the draw operation only if color differs
            var color = colorConfiguration[i][j];
            if ( colorConfiguration[i][j] != drawnConfiguration[i][j] ) {
                ctx.fillStyle = colorArray[ color ];
                ctx.fillRect(j * siteSize, i * siteSize, siteSize, siteSize);
                drawnConfiguration[i][j] = color;
            }
        }
    }
}
