# 💰 Finanzas: Optimización de Portafolio y Rebalanceo

> Minimizar costos de transacción al rebalancear portafolios de inversión.

## El Problema

Cuando un inversionista necesita rebalancear su portafolio desde una asignación actual a una objetivo, incurre en costos de transacción (comisiones, spread, impacto de mercado). El objetivo es encontrar el **camino de costo mínimo** para transformar el portafolio.

```
    Portafolio Actual              Portafolio Objetivo
    ┌─────────────────┐           ┌─────────────────┐
    │ AAPL  12%       │           │ AAPL  10%       │
    │ MSFT  11%       │   OTX     │ MSFT  10%       │
    │ JPM    7%       │ ───────►  │ XOM   10%       │
    │ XOM    2%       │           │ JPM    8%       │
    └─────────────────┘           └─────────────────┘
           ↓                             ↓
    Distribución Fuente         Distribución Objetivo
           └──────── Transporte Óptimo ────────┘
                          ↓
              Plan de Costo Mínimo de Transacciones
```

## ¿Por qué Transporte Óptimo?

1. **Optimización global**: Considera todas las formas de mover dinero entre activos
2. **Consciente de costos**: Diferentes costos de trading por activo
3. **Correlación sectorial**: Más barato rebalancear dentro del mismo sector
4. **Escalable**: Funciona para portafolios con cientos de activos

## Ejecutar

```bash
bun examples/finance-portfolio-optimization/index.js
```

## Uso como Librería

```javascript
import { buildCostMatrix, embedPortfolio } from './examples/finance-portfolio-optimization';

const misActivos = [{ ticker: "BTC", tradingCost: 0.002 }, { ticker: "ETH", tradingCost: 0.002 }];
const costMatrix = buildCostMatrix(misActivos);
const coords = embedPortfolio(misActivos);
```

## Escenarios de Prueba

| Escenario | Descripción | Costo Esperado |
|-----------|-------------|----------------|
| Drift Menor | Rebalanceo trimestral después de movimientos pequeños | Bajo (< 5 bps) |
| Rotación Sectorial | Cambio de Tech a Energía | Medio (10-20 bps) |
| Evento Risk-Off | Huida hacia activos defensivos | Medio-Alto |
| Revisión Completa | Nuevo mandato de inversión | Alto (> 30 bps) |

## ¿Qué Solver Usar?

| Caso de Uso | Solver | Por Qué |
|-------------|--------|---------|
| Order routing tiempo real | **OTX-Nano** | Decisiones en microsegundos |
| Rebalanceo fin de día | **OTX-Base** | Precisión para trades grandes |
| Fondos índice (500+ activos) | **OTX-Max** | Escala al S&P 500 |

## Aplicaciones

- 📈 **Gestión de Portafolios**: Tax-loss harvesting, ajuste de factores
- 🏦 **Market Making**: Matching de order book, gestión de inventario
- 📊 **Gestión de Riesgo**: Comparación de stress tests, análisis VaR
- 🤖 **Trading Algorítmico**: Ejecución VWAP, asignación a dark pools
