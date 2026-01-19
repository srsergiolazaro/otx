# 🕶️ Detector de Marcadores AR (Registro Geométrico)

Este ejemplo demuestra cómo se puede utilizar OTX en **Realidad Aumentada** para detectar y alinear marcadores mediante el emparejamiento de características (feature matching).

## El Reto

En AR, necesitas hacer coincidir un patrón fijo (el marcador) con su versión distorsionada en la vista de la cámara (rotada, escalada, con ruido). Los algoritmos de emparejamiento tradicionales fallan cuando hay mucho ruido o elementos extraños en el fondo.

## La Solución OTX

OTX trata el problema como un **Transporte Óptimo** entre dos conjuntos de puntos:
1.  **Conjunto Plantilla**: Los puntos clave (keypoints) ideales de la imagen del marcador.
2.  **Conjunto Escena**: Puntos clave extraídos del fotograma de la cámara (que contiene el marcador + otros objetos del escritorio).

Al minimizar la distancia de Wasserstein, OTX encuentra la orientación y escala más probables del marcador en la escena, incluso si faltan puntos o están oscurecidos.

## Ventajas para AR

- **Robusto al Ruido**: Ignora los puntos de fondo que no pertenecen a la distribución del marcador.
- **Ultra Rápido**: OTX-Max logra el registro en **< 10ms**, permitiendo experiencias de AR a 60fps.
- **Preciso**: A diferencia de RANSAC simple, utiliza la distribución global de puntos para una mayor estabilidad.

## Ejecutar

```bash
bun examples/ar-marker-detector/index.js
```

## Uso como Librería

```javascript
import { detectMarkerFeatureMatch, generateMarkerScene } from './examples/ar-marker-detector';

const { markerPoints, scenePoints } = generateMarkerScene(100);
const match = detectMarkerFeatureMatch(markerPoints, scenePoints);

if (match.alignmentScore > 0.9) {
    console.log("¡Colocar modelo 3D aquí!");
}
```
