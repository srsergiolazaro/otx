# 🚚 Logística: Optimización de Entregas Almacén-a-Cliente

> Asignación óptima de inventario desde almacenes a clientes minimizando costo de transporte.

## El Problema

Una empresa de entregas necesita cumplir pedidos desde múltiples almacenes. El objetivo es encontrar el **mínimo total de kilómetros de camión** requeridos para satisfacer toda la demanda.

```
┌──────────┐         ┌──────────┐
│ Almacén  │         │ Cliente  │
│    A     │─────────│    1     │
│ 150 uds  │         │  3 uds   │
└──────────┘         └──────────┘
     │    ¿Qué almacén    │
     │    sirve a qué     │
     │    cliente?        │
     ▼                    ▼
┌──────────┐         ┌──────────┐
│ Almacén  │         │ Cliente  │
│    B     │─────────│    2     │
│ 200 uds  │         │  5 uds   │
└──────────┘         └──────────┘
```

## ¿Por qué Transporte Óptimo?

Este es el clásico **Problema de Transporte**. OTX lo resuelve:

1. **Modelando almacenes** como distribución fuente (ponderada por inventario)
2. **Modelando clientes** como distribución objetivo (ponderada por demanda)
3. **Matriz de costos** = distancias entre todos los pares almacén-cliente
4. **Solución** = flujo óptimo de bienes minimizando distancia × cantidad

## Ejecutar

```bash
bun examples/logistics-warehouse-delivery/index.js
```

## Uso como Librería

Puedes importar la lógica central de este ejemplo para usarla en tus propios proyectos:

```javascript
import { solveDeliveryProblem, generateCustomers } from './examples/logistics-warehouse-delivery';

const warehouses = [
    { name: "Mi Almacén", x: 0.1, y: 0.2, inventory: 500 }
];
const customers = generateCustomers(50);
const result = solveDeliveryProblem(warehouses, customers);

console.log(`Distancia Óptima: ${result.max.distance} km`);
```

## Detalles del Escenario

| Almacén | Ubicación | Inventario |
|---------|-----------|-----------|
| A (Centro) | Centro | 150 uds |
| B (Aeropuerto) | Suroeste | 200 uds |
| C (Puerto) | Sureste | 100 uds |
| D (Norte) | Norte | 50 uds |

## ¿Qué Solver Usar?

| Escenario | Solver | Por Qué |
|-----------|--------|---------|
| Despacho tiempo real | **OTX-Nano** | < 1ms para recálculo instantáneo |
| Planificación diaria | **OTX-Base** | Mayor precisión para batch |
| 500+ puntos de entrega | **OTX-Max** | Escala linealmente |

## Aplicaciones

- **Last-Mile Delivery**: Amazon, FedEx, UPS
- **Food Delivery**: Asignar restaurantes a repartidores
- **Ride-sharing**: Match conductores a pasajeros
- **Redistribución de inventario**: Balancear stock entre tiendas
