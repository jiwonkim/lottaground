# lottaground.js
### Simple 1d terrain generator using Perlin noise

[usage](#usage) | [settings](#settings) | [demos](#demos)

## Usage
```javascript
var canvas = document.getElementById('ground-canvas');
var ground = lottaground(canvas);

// Render the ground
ground.render();

// Move forwards half the visible distance
ground.fastforward(0.5);

// Move backwards a quarter of the visible distance
ground.rewind(0.25);

// Shift ground down 50 pixels
ground.shift(50);
```

## Settings

| setting | type | default | description |
|---------|------|---------|-------------|
| `numSamples` | `int` | `1000` | terrain's resolution - height is computed at each sample |
| `persistence` | `float` | `0.25` | variable to Perlin noise |
| `octaves` | `int` | `32` | variable to Perlin noise |
| `smoothness` | `float` | `0.05` | Bigger the value, smoother the generated terrain |
| `waterlevel` | `int|null` | `null` | Pixel value for the canvas Y coordinate above which should be filled with water |
| `watercolor` | `string|null` | `null` | The color of the water |
| `background` | `string|null` | `null` | The color of the background |
| `ground` | `string|null` | `null` | The color of the ground |

## Demos

[Candyland](http://jiwonk.im/lottaground/demos/candyland.html)

[Splunking](http://jiwonk.im/lottaground/demos/splunking.html)

