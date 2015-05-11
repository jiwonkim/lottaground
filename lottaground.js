function lottaground(canvas, settings) {
    /** Constants **/
    var PERSISTENCE = 0.25;
    var NUM_OCTAVES = 32;
    var SMOOTHNESS = 0.06;

    var NUM_SAMPLES = 100;
    var STEP = 1 / NUM_SAMPLES;

    /** Variables **/
    var _width = canvas.width;
    var _height = canvas.height;
    var _context = canvas.getContext('2d');
    var _currentPosition = 0;
    var _heightmap = new Float32Array(NUM_SAMPLES);

    /**
     * Following methods implement the perlin noise function in 1 dimension.
     * Source: http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
     */

    function _noise(x) {
        x = (x >> 13) ^ x;
        var xx = (x * (x * x * 60493 + 19990303) + 1376312589) & 0x7fffffff;
        return 1.0 - (xx / 1073741824.0);
    }

    function _smoothedNoise(x) {
        return _noise(x) / 2 + _noise(x - 1) / 4 + _noise(x + 1) / 4;
    }

    function _interpolate(a, b, x) {
        var ft = x * Math.PI; 
        var f = (1 - Math.cos(ft)) * .5
        return a*(1-f) + b*f;
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
        var frequency = 1;
        var amplitude = PERSISTENCE;
        for (var i = 0; i < NUM_OCTAVES; i++) {
            total += _interpolatedNoise(x * frequency) * amplitude;
            frequency *= 2;
            amplitude *= PERSISTENCE;
        }
        return total;
    }

    function _make() {
        var currPos = _currentPosition / SMOOTHNESS;
        for (var i = 0; i < NUM_SAMPLES; i++) {
            var pos = currPos + i * STEP / SMOOTHNESS;
            _heightmap[i] = _perlinNoise(pos);
        }
    }

    function _render() {
        //console.log(_heightmap);
        _context.clearRect(0, 0, _width, _height);

        _context.beginPath();
        _context.moveTo(0, y(0));
        for (var i = 1; i < NUM_SAMPLES; i++) {
            _context.lineTo(x(i), y(i));
        }
        _context.stroke();
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

    function x(i) {
        return i * STEP * _width;
    }

    function y(i) {
        return (_heightmap[i] + 1) * 0.5 * _height;
    }

    return {
        // actions
        fastforward: fastforward,
        rewind: rewind,

        // getters
        x: x,
        y: y
    };
}
