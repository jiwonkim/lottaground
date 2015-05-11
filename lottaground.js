var DEFAULT_SETTINGS = {
    numSamples: 1000,
    persistence: 0.25,
    octaves: 32,
    smoothness: 0.05,
    waterlevel: null,
    watercolor: null,
    background: null,
    ground: null
}

function lottaground(canvas, settings) {
    var LINE_WIDTH = 5;

    var _width = canvas.width;
    var _height = canvas.height;
    var _context = canvas.getContext('2d');
    var _currentPosition = 0;

    var _settings = _initSettings(settings);
    var _step = 1 / _settings.numSamples;
    var _heightmap = [];

    var _yshift = 0;

    // init
    _make(0, _settings.numSamples - 1);

    function _initSettings(val) {
        val = val || {};
        return {
            numSamples: val.numSamples || DEFAULT_SETTINGS.numSamples,
            persistence: val.persistence || DEFAULT_SETTINGS.persistence,
            octaves: val.octaves || DEFAULT_SETTINGS.octaves,
            smoothness: val.smoothness || DEFAULT_SETTINGS.smoothness,
            waterlevel: val.waterlevel || DEFAULT_SETTINGS.waterlevel,
            watercolor: val.watercolor || DEFAULT_SETTINGS.watercolor,
            background: val.background || DEFAULT_SETTINGS.background,
            ground: val.ground || DEFAULT_SETTINGS.ground
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

    function _make(startIdx, endIdx) {
        for (var i = startIdx; i <= endIdx; i++) {
            var pos = (_currentPosition + i * _step) / _settings.smoothness;
            _heightmap.splice(i, 0, _perlinNoise(pos));
        }
    }

    function _renderGround() {
        _context.beginPath();
        _context.moveTo(0, y(0));
        for (var i = 1; i < _settings.numSamples; i++) {
            _context.lineTo(x(i), y(i));
        }
        _context.lineWidth = LINE_WIDTH;
        _context.stroke();

        _context.lineTo(_width, _height);
        _context.lineTo(0, _height);
        _context.lineTo(0, y(0));
        _context.closePath();

        if (_settings.ground) {
            _context.fillStyle = _settings.ground;
            _context.fill();
        }
    }

    function _renderWater() {
        if (_settings.waterlevel === null) {
            return;
        }
        var inwater = false;
        var startIdx = 0;
        for (var i = 0; i < _settings.numSamples; i++) {
            var _y = y(i);
            if (_y > _settings.waterlevel) {
                if (inwater) {
                    _context.lineTo(x(i), _y);
                } else {
                    _context.beginPath();
                    if (i === 0) {
                        _context.moveTo(x(i), _settings.waterlevel);
                        _context.lineTo(x(i), _y);
                    } else {
                        _context.moveTo(x(i), _y);
                    } 
                    inwater = true;
                    startIdx = i;
                }
            }
            if (inwater) {
                if (_y <= _settings.waterlevel) {
                    _colorWater();

                } else if (i === _settings.numSamples - 1) {
                    var endIdx = _settings.numSamples - 1;
                    _context.lineTo(x(endIdx), _settings.waterlevel);
                    _colorWater();
                }
            }
        }

        function _colorWater() {
            _context.closePath();
            _context.stroke();
            if (_settings.watercolor) {
                _context.fillStyle = _settings.watercolor;
                _context.fill();
            }
            inwater = false;
        }
    }

    function _move(delta) {
        _currentPosition += delta;

        var numRemoved = Math.floor(Math.abs(delta) * _settings.numSamples);
        var startIdx, endIdx;
        if (delta > 0) {
            _heightmap.splice(0, numRemoved);
            startIdx = _settings.numSamples - numRemoved;
            endIdx = _settings.numSamples - 1;
        } else {
            _heightmap.splice(_settings.numSamples - numRemoved, numRemoved);
            startIdx = 0;
            endIdx = numRemoved - 1;
        }
        _make(startIdx, endIdx);
        render();
    }

    /** Public Methods **/

    function render() {
        _context.clearRect(0, 0, _width, _height);
        if (_settings.background !== null) {
            _context.fillStyle = _settings.background;
            _context.fillRect(0, 0, _width, _height);
        }
        _renderWater();
        _renderGround();
    }

    function fastforward(speed) {
        _move(speed || _step);
    }

    function rewind(speed) {
        _move(-(speed || _step));
    }

    function roughen(denom) {
        _settings.smoothness /= (2 || denom);
    }

    function shift(val) {
        _yshift = val;
    }

    function x(i) {
        return i * _step * _width;
    }

    function y(i) {
        return (_heightmap[i] + 1) * 0.5 * _height + _yshift;
    }

    return {
        // actions
        render: render,
        fastforward: fastforward,
        rewind: rewind,
        roughen: roughen,
        shift: shift,

        // getters
        x: x,
        y: y
    };
}
