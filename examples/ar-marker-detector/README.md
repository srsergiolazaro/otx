# 🕶️ AR Marker Detector (Geometric Registration)

This example demonstrates how OTX can be used in **Augmented Reality** to detect and align markers using feature matching.

## The Challenge

In AR, you need to match a fixed pattern (the marker) to its distorted version in the camera view (rotated, scaled, noisy). Traditional "greedy" matching algorithms fail when there is noise or background clutter.

## The OTX Solution

OTX treats the problem as an **Optimal Transport** matching between two point sets:
1.  **Template Set**: The idealistic keypoints of the marker image.
2.  **Scene Set**: Keypoints extracted from the camera frame (containing the marker + other desk objects).

By minimizing the Wasserstein distance, OTX finds the most likely orientation and scale of the marker in the scene, even if some points are missing or obscured.

## Advantages for AR

- **Robust to Clutter**: Ignores points that don't belong to the marker distribution.
- **Ultra-Fast**: OTX-Max achieves registration in **< 10ms**, enabling 60fps AR experiences.
- **Precise**: Unlike simple RANSAC, it uses the global distribution of points for better stability.

## Run

```bash
bun examples/ar-marker-detector/index.js
```

## Usage as a Library

```javascript
import { detectMarkerFeatureMatch, generateMarkerScene } from './examples/ar-marker-detector';

const { markerPoints, scenePoints } = generateMarkerScene(100);
const match = detectMarkerFeatureMatch(markerPoints, scenePoints);

if (match.alignmentScore > 0.9) {
    console.log("Place AR 3D model here!");
}
```
