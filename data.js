/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/


/* This file saves all the data used in simulation.*/
/* If user wants to change some default values and behaviors of the program
   by himself/herself, merely this file needs to be changed. */


// Default value of relevant parameters for each model
const inputDefaults = {
    "voter"         : [ ["gridSize", 50]   ],
    "potts"         : [ ["gridSize", 50] , ["paramBeta", 1.6]     ],
    "arw"           : [ ["gridSize", 50] , ["paramZeta", 0.21]  , ["paramLambda", 0.1] ],
    "crw"           : [ ["gridSize", 50] , ["paramZeta", 0.1]     ],
    "cp2d"          : [ ["gridSize", 50] , ["paramZeta", 0.1]   , ["paramLambda", 0.1], ["paramDelta", 0.06] ],
    "dp"            : [ ["gridSize", 300], ["paramZeta", 0.1]   , ["paramLambda", 0.4], ["paramDelta", 0.5] ],
    "otas"          : [ ["gridSize", 200], ["paramZeta", 0.1]   , ],
    "ttas"          : [ ["gridSize", 200], ["paramDelta", 0.3]    ],
    "dynamicBBS"    : [ ["gridSize", 200], ["paramLambda", 0.2] , ],
    "staticBBS"     : [ ["gridSize", 200], ["paramLambda", 0.15], ],
    "wetting"       : [ ["gridSize", 300] , ["paramZeta", 0.2]  , ["paramBeta", 2.0], ["paramDelta", 0.4] ],
    "wettingFast"   : [ ["gridSize", 300] , ["paramZeta", 0.2]   , ["paramBeta", 2.0], ["paramDelta", 0.4] ],
};



// Store different time type of models and their default speed values
// Notice that the speed of discrete-time model = modelTime = gridSize
const speedDefaults = {
    "voter"         : [ "continuous" , "fast"],
    "potts"         : [ "continuous" , "slow"],
    "arw"           : [ "continuous" , "fast"],
    "crw"           : [ "continuous" , "fast"],
    "cp2d"          : [ "continuous" , "fast"],
    "dp"            : [ "discrete"   , "full_speed"],
    "otas"          : [ "continuous" , "fast"],
    "ttas"          : [ "continuous" , "fast"],
    "dynamicBBS"    : [ "continuous" , "very_fast"],
    "staticBBS"     : [ "discrete"   , "fast"],
    "wetting"       : [ "continuous" , "ultra_fast"],
    "wettingFast"   : [ "continuous" , "very_fast"],
};



// Store speed values correspondent to different speed options
// indicating whether the speed value is constant or not
// If constant, the next number is the value of speed
// otherwise speed = next number * modelTime
const speedValues = {
    "full_speed" : [ "non-constant" , 1.0   ],
    "ultra_fast" : [ "constant"     , 100.0 ],
    "very_fast"  : [ "constant"     , 20.0  ],
    "fast"       : [ "constant"     , 5.0   ],
    "slow"       : [ "constant"     , 1.0   ],
    "very_slow"  : [ "constant"     , 0.1   ],
};



// Store the requirements of inputs
// Used in error handler
// First two strings indicate whether the number
// test and int test should be applied to the input
// Next two numbers indicate the lower bound and upper
// bound of the input
// The last sub-array is to explain how to set default value // if a type-error occur. If the first element is "HasDefaultValue"
// it means the default value can be fetched here
// Otherwise, the default value is stored in inputDefaults
const inputRange = {
    "randSeed"    : [ "number" , "int", 0 , 9999 ,    ["HasDefaultValue" , 0]],
    "gridSize"    : [ "number" , "int", 2 , 600 ,     ["NoDefaultValue"  , 0]],
    "modelTime"   : [ "number" , ""   , 0 , 1000000,  ["HasDefaultValue" , 40000]],
    "colorNumber" : [ "number" , "int", 2 , 9 ,       ["HasDefaultValue" , 5]],
    "paramBeta"   : [ "number" , ""   , 0 , 100 ,     ["NoDefaultValue"  , 0]],
    "paramZeta"   : [ "number" , ""   , 0 , 1 ,       ["NoDefaultValue"  , 0]],
    "paramLambda" : [ "number" , ""   , 0 , 1 ,       ["NoDefaultValue"  , 0]],
    "paramDelta"  : [ "number" , ""   , 0 , 1 ,       ["NoDefaultValue"  , 0]],
};


// Three different kinds of color combinations
const primaryColors = [
    "Black"     ,
    "Lightgray" ,
    "Blue"      ,
    "Red"       ,
    "Green"     ,
    "Orange"    ,
    "Pink"      ,
    "White"     ,
    "Lime"      ,
    "Olive"     ,
];

const lightColors = [
    "#000000",
    "#ebf4f6",
    "#84c1ff",
    "#ffbbee",
    "#fdf498",
    "#fce9db",
    "#ee4035",
    "#f37736",
    "#a8e6cf",
    "#3d1e6d",
];

const earthColors = [
    "#000000",
    "#d6eaff",
    "#00a0b0",
    "#cc2a36",
    "#4f372d",
    "#eb6841",
    "#edc951",
    "Olive"  ,
    "#fafafa",
    "#3344bb",
];
