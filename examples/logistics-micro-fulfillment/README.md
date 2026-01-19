# ⚡ Micro-Fulfillment (Dark Stores) Optimization

This example demonstrates how OTX solves advanced urban logistics problems where delivery speed is critical (< 15 mins). In "Quick Commerce," simply picking the closest store isn't enough; you must balance the **picking load** and **store congestion** globally.

## The Scenario

- **5 Dark Stores**: Micro-warehouses located inside dense urban areas.
- **Congestion Factor**: Stores have real-time congestion levels (from 10% to 90%).
- **On-Demand Orders**: 100 orders appearing throughout the city.
- **Priority Weights**: VIP/Urgent orders take priority in the transport distribution.

## How OTX Helps

Unlike greedy algorithms that assign the nearest neighbor, OTX performs a **Global Optimization**:
1. It looks at all 100 orders and 5 stores simultaneously.
2. It assigns orders such that the total "operational friction" (Distance + Congestion) is minimized.
3. It prevents "Store Clogging" by rerouting orders to slightly farther but less busy stores.

## Run the Example

```bash
bun examples/logistics-micro-fulfillment/index.js
```

## Usage as a Library

```javascript
import { dispatchAdvanced, generateUrbanScenario } from './examples/logistics-micro-fulfillment';

const { stores, orders } = generateUrbanScenario(5, 100);
const result = dispatchAdvanced(stores, orders);

console.log(`Optimized Global Friction: ${result.dist}`);
```
