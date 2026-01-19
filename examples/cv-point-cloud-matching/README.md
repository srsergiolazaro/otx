# 🔬 Computer Vision: Point Cloud Matching & Registration

> Align 3D point clouds from LiDAR sensors for autonomous vehicles, robotics, and 3D scanning.

## The Problem

When a robot or autonomous vehicle moves through space, its LiDAR sensor captures 3D point clouds from different positions. To build a consistent map, we need to **align (register)** these point clouds.

```
        Scan T₀                    Scan T₁
    ┌─────────────┐           ┌─────────────┐
    │  • • •  •   │           │   •  • • •  │
    │ •   ┌───┐ • │  Robot    │  • ┌───┐  • │
    │ •   │   │   │  Moved    │    │   │ •  │
    │  •  └───┘ • │  ───────► │  • └───┘  • │
    │   • • •     │           │     • • •   │
    └─────────────┘           └─────────────┘
              ↓                       ↓
         Point Cloud A          Point Cloud B
              └─────── OTX ────────┘
                       ↓
              Wasserstein Distance
           (How much did things move?)
```

## Why Optimal Transport?

The Wasserstein distance is ideal for point cloud comparison because:

1. **Geometric meaning**: Measures the minimum "work" to transform one cloud into another
2. **Works with different sizes**: Handles point clouds with different densities
3. **Robust to noise**: Less sensitive to outliers than Chamfer distance
4. **Differentiable**: Enables end-to-end learning for deep SLAM

## Run the Example

```bash
bun examples/cv-point-cloud-matching/index.js
```

## Usage as a Library

```javascript
import { generatePointCloud, buildCostMatrix, projectTo2D } from './examples/cv-point-cloud-matching';

const cloudA = generatePointCloud(100);
const cloudB = generatePointCloud(100, 0.01, { dx: 0.1, dy: 0, dz: 0, theta: 0 });
const costMatrix = buildCostMatrix(cloudA, cloudB);
```

## Test Cases

| Test | Scenario | Expected Distance |
|------|----------|-------------------|
| Identical Scans | Same position | ≈ 0 |
| Small Movement | 5cm forward, 2° rotation | Low |
| Large Movement | 30cm forward, 15° rotation | Medium |
| Different Room | Completely different environment | High |

## Which Solver to Use?

| Use Case | Solver | Why |
|----------|--------|-----|
| Real-time SLAM (60Hz) | **OTX-Nano** | < 1ms per frame |
| Loop closure detection | **OTX-Base** | Accuracy matters more |
| Dense LiDAR (500+ pts) | **OTX-Max** | Scales linearly |

## Applications

- 🚗 **Autonomous Vehicles**: Localization, moving object detection, SLAM
- 🤖 **Robotics**: Pose estimation, grasp planning
- 🏥 **Medical Imaging**: Surgical navigation, tumor tracking
- 🎮 **AR/VR**: Real-time 3D reconstruction
