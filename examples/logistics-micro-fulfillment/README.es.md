# ⚡ Optimización de Micro-Fulfillment (Dark Stores)

Este ejemplo demuestra cómo OTX resuelve problemas avanzados de logística urbana donde la velocidad de entrega es crítica (< 15 min). En el "Quick Commerce", elegir simplemente la tienda más cercana no es suficiente; se debe equilibrar la **carga de picking** y la **congestión** de forma global.

## El Escenario

- **5 Dark Stores**: Micro-almacenes ubicados en zonas urbanas densas.
- **Factor de Congestión**: Las tiendas tienen niveles de saturación en tiempo real (del 10% al 90%).
- **Pedidos On-Demand**: 100 pedidos distribuidos por la ciudad.
- **Pesos de Prioridad**: Los pedidos VIP/Urgentes tienen mayor peso en la distribución de transporte.

## Cómo Ayuda OTX

A diferencia de los algoritmos "greedy" que asignan el vecino más cercano, OTX realiza una **Optimización Global**:
1. Analiza los 100 pedidos y las 5 tiendas simultáneamente.
2. Asigna los pedidos de modo que se minimice la "fricción operativa" total (Distancia + Congestión).
3. Evita el bloqueo de tiendas desviando pedidos a almacenes ligeramente más lejanos pero menos saturados.

## Ejecutar

```bash
bun examples/logistics-micro-fulfillment/index.js
```

## Uso como Librería

```javascript
import { dispatchAdvanced, generateUrbanScenario } from './examples/logistics-micro-fulfillment';

const { stores, orders } = generateUrbanScenario(5, 100);
const result = dispatchAdvanced(stores, orders);

console.log(`Fricción Global Optimizada: ${result.dist}`);
```
