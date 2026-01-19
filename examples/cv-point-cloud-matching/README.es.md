# 🔬 Computer Vision: Matching y Registro de Nubes de Puntos

> Alinear nubes de puntos 3D de sensores LiDAR para vehículos autónomos, robótica y escaneo 3D.

## El Problema

Cuando un robot o vehículo autónomo se mueve, su sensor LiDAR captura nubes de puntos 3D desde diferentes posiciones. Para construir un mapa consistente, necesitamos **alinear (registrar)** estas nubes.

```
       Escaneo T₀                 Escaneo T₁
    ┌─────────────┐           ┌─────────────┐
    │  • • •  •   │  Robot    │   •  • • •  │
    │ •   ┌───┐ • │  Se Movió │  • ┌───┐  • │
    │  •  └───┘ • │  ───────► │  • └───┘  • │
    └─────────────┘           └─────────────┘
              ↓                       ↓
         Nube de Puntos A      Nube de Puntos B
              └─────── OTX ────────┘
                       ↓
             Distancia Wasserstein
```

## ¿Por qué Transporte Óptimo?

1. **Significado geométrico**: Mide el "trabajo" mínimo para transformar una nube en otra
2. **Robusto al ruido**: Menos sensible a outliers que Chamfer
3. **Diferenciable**: Permite aprendizaje end-to-end para deep SLAM

## Ejecutar

```bash
bun examples/cv-point-cloud-matching/index.js
```

## Uso como Librería

```javascript
import { generatePointCloud, buildCostMatrix, projectTo2D } from './examples/cv-point-cloud-matching';

const cloudA = generatePointCloud(100);
const cloudB = generatePointCloud(100, 0.01, { dx: 0.1, dy: 0, dz: 0, theta: 0 });
const costMatrix = buildCostMatrix(cloudA, cloudB);
```

## Casos de Prueba

| Prueba | Escenario | Distancia Esperada |
|--------|-----------|-------------------|
| Escaneos Idénticos | Misma posición | ≈ 0 |
| Movimiento Pequeño | 5cm, 2° rotación | Baja |
| Movimiento Grande | 30cm, 15° rotación | Media |
| Habitación Diferente | Ambiente diferente | Alta |

## ¿Qué Solver Usar?

| Caso de Uso | Solver | Por Qué |
|-------------|--------|---------|
| SLAM tiempo real (60Hz) | **OTX-Nano** | < 1ms por frame |
| Loop closure | **OTX-Base** | Mayor precisión |
| LiDAR denso (500+ pts) | **OTX-Max** | Escala linealmente |

## Aplicaciones

- 🚗 **Vehículos Autónomos**: Localización, detección de objetos, SLAM
- 🤖 **Robótica**: Estimación de pose, planificación de agarre
- 🏥 **Imágenes Médicas**: Navegación quirúrgica
- 🎮 **AR/VR**: Reconstrucción 3D tiempo real
