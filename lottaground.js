var DEFAULT_SETTINGS = {
    numSamples: 100,
    persistence: 0.25,
    octaves: 32,
    smoothness: 0.05,
    waterlevel: 0.5
}

function lottaground(canvas, settings) {
    var _settings = _initSettings(settings);
    var _step = 1 / _settings.numSamples;
    var _width = canvas.width;
    var _height = canvas.height;
    var _context = canvas.getContext('2d');
    var _currentPosition = 0;
    var _heightmap = new Float32Array(_settings.numSamples);

    function _initSettings(val) {
        if (val === undefined) {
            return DEFAULT_SETTINGS;
        }
        return {
            numSamples: val.numSamples || DEFAULT_SETTINGS.numSamples,
            persistence: val.persistence || DEFAULT_SETTINGS.persistence,
            octvaves: val.octaves || DEFAULT_SETTINGS.octaves,
            smoothness: val.smoothness || DEFAULT_SETTINGS.smoothness,
            waterlevel: val.waterlevel || DEFAULT_SETTINGS.waterlevel
        }
    }

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
        var amplitude = _settings.persistence;
        for (var i = 0; i < _settings.octaves; i++) {
            total += _interpolatedNoise(x * frequency) * amplitude;
            frequency *= 2;
            amplitude *= _settings.persistence;
        }
        return total;
    }

    function _make() {
        var currPos = _currentPosition / _settings.smoothness;
        for (var i = 0; i < _settings.numSamples; i++) {
            var pos = currPos + i * _step / _settings.smoothness;
            _heightmap[i] = _perlinNoise(pos);
        }
    }

    function _render() {
        //console.log(_heightmap);
        _context.clearRect(0, 0, _width, _height);

        _context.beginPath();
        _context.moveTo(0, y(0));
        for (var i = 1; i < _settings.numSamples; i++) {
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
        _move(speed || _step);
    }

    function rewind(speed) {
        _move(-(speed || _step));
    }

    function x(i) {
        return i * _step * _width;
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
