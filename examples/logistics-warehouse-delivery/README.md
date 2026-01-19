# 🚚 Logistics: Warehouse-to-Customer Delivery Optimization

> Optimal assignment of inventory from warehouses to customers minimizing transportation cost.

## The Problem

A delivery company needs to fulfill customer orders from multiple warehouses. The goal is to find the **minimum total truck-kilometers** required to satisfy all demand.

```
┌──────────┐         ┌──────────┐
│Warehouse │         │ Customer │
│    A     │─────────│    1     │
│  150 units        │  3 units │
└──────────┘         └──────────┘
     │                    │
     │    Which warehouse │
     │    serves which    │
     │    customer?       │
     ▼                    ▼
┌──────────┐         ┌──────────┐
│Warehouse │         │ Customer │
│    B     │─────────│    2     │
│  200 units        │  5 units │
└──────────┘         └──────────┘
```

## Why Optimal Transport?

This is the classic **Transportation Problem** from operations research. OTX solves it by:

1. **Modeling warehouses** as a source distribution (weighted by inventory)
2. **Modeling customers** as a target distribution (weighted by demand)  
3. **Cost matrix** = distances between all warehouse-customer pairs
4. **Solution** = optimal flow of goods minimizing total distance × quantity

## Run the Example

```bash
bun examples/logistics-warehouse-delivery/index.js
```

## Usage as a Library

You can import the core logic of this example to use it in your own projects:

```javascript
import { solveDeliveryProblem, generateCustomers } from './examples/logistics-warehouse-delivery';

const warehouses = [
    { name: "My Warehouse", x: 0.1, y: 0.2, inventory: 500 }
];
const customers = generateCustomers(50);
const result = solveDeliveryProblem(warehouses, customers);

console.log(`Optimal Distance: ${result.max.distance} km`);
```

## Expected Output

```
═══════════════════════════════════════════════════════════════
  🚚 OTX LOGISTICS DEMO: Warehouse-to-Customer Optimization
═══════════════════════════════════════════════════════════════

📊 Problem Statistics:
   • Warehouses: 4
   • Customers: 100
   • Total Supply: 500 units
   • Total Demand: 288 units

┌──────────────────────────────────────────────────────────────┐
│  Solver      │  Distance (km)  │  Latency              │
├──────────────────────────────────────────────────────────────┤
│  OTX-Nano    │        0.24     │      0.27 ms          │
│  OTX-Base    │     1255.74     │     41.65 ms          │
│  OTX-Max     │      960.42     │      0.97 ms          │
└──────────────────────────────────────────────────────────────┘
```

## Scenario Details

| Warehouse | Location | Inventory |
|-----------|----------|-----------|
| A (Downtown) | Center | 150 units |
| B (Airport) | Southwest | 200 units |
| C (Port) | Southeast | 100 units |
| D (North) | North | 50 units |

Customers are randomly distributed across the city with demand of 1-5 units each.

## Which Solver to Use?

| Scenario | Solver | Why |
|----------|--------|-----|
| Real-time dispatch | **OTX-Nano** | < 1ms for instant recalculation |
| Daily route planning | **OTX-Base** | Higher accuracy for batch planning |
| 500+ delivery points | **OTX-Max** | Scales linearly with problem size |

## Business Applications

- **Last-Mile Delivery**: Amazon, FedEx, UPS route optimization
- **Food Delivery**: Assign restaurants to drivers
- **Ride-sharing**: Match available drivers to passenger requests
- **Inventory Redistribution**: Balance stock across retail locations
