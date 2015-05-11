function lottaground(settings) {
    /** Constants **/
    var PERSISTENCE = 0.25;
    var NUM_OCTAVES = 4;

    var NUM_SAMPLES = 100;
    var STEP = 1 / NUM_SAMPLES;

    /** Variables **/
    var _currentPosition = 0;
    var _heightmap = new Float32Array(NUM_SAMPLES);

    /**
     * Following methods implement the perlin noise function in 1 dimension.
     * Source: http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
     */

    function _noise(x) {
        x = Math.pow(x << 13, x);
        return (1 - ((x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824);
    }

    function _smoothedNoise(x) {
        return _noise(x) / 2 + _noise(x - 1) / 4 + _noise(x + 1) / 4;
    }

    // Cosine interpolation
    function _interpolate(a, b, x) {
        var ft = x * Math.PI;
        f = (1 - Math.cos(ft)) * 0.5;
        return a * (1 - f) + b * f;
    }

    function _interpolatedNoise(x) {
        var intX = Math.floor(x);
        var fractX = x - intX;

        var v1, v2;
        v1 = _smoothedNoise(intX);
        v2 = _smoothedNoise(intX + 1);
        return _interpolate(v1, v2, fractX);
    }

    function _perlinNoise(x) {
        var total = 0;
        var frequency, amplitude;
        for (var i = 0; i < NUM_OCTAVES; i++) {
            frequency = Math.pow(2, i);
            amplitude = Math.pow(PERSISTENCE, i);
            total += _interpolatedNoise(x * frequency) * amplitude;
        }
        return total;
    }

    function _make() {
        for (var i = 0; i < NUM_SAMPLES; i++) {
            var pos = _currentPosition + i * STEP;
            _heightmap[i] = _perlinNoise(pos);
        }
    }

    function _render() {
        console.log(_heightmap);
    }

    function _move(delta) {
        _currentPosition += delta;
        _make();
        _render();
    }

    /** Public Methods **/

    function fastforward(speed) {
        _move(speed || STEP);
    }

    function rewind(speed) {
        _move(-(speed || STEP));
    }

    function height(i) {
        return _heightmap[i];
    }

    return {
        // actions
        fastforward: fastforward,
        rewind: rewind,

        // getters
        height: height
    };
}
