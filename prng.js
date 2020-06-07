/*
Copyright (c) 2019 Yunfei Dai, Martin Ma, Harry Zhou, Leonardo T. Rolla
You can use, modify and redistribute this program under the terms of the GNU Lesser General Public License, either version 3 of the License, or any later version.
*/

"use strict"

// Returns a function:
function prngNew(seed) {
    // function sfc32 was copied from StackOverflow's answer which based on PractRand suite which in Public Domain
    function sfc32(a, b, c, d) {
        return function() {
            a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
            var t = (a + b) | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            d = d + 1 | 0;
            t = t + d | 0;
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }
    }
    var prngRandGen = sfc32(seed,seed,seed,seed);
    for (var i=0 ; i<10000 ; i++ ) prngRandGen() ;      // mix initial state
    return prngRandGen ;
}
