# 💰 Finance: Portfolio Optimization & Rebalancing

> Minimize transaction costs when rebalancing investment portfolios.

## The Problem

When an investor needs to rebalance their portfolio from a current allocation to a target allocation, they incur transaction costs (commissions, bid-ask spread, market impact). The goal is to find the **minimum-cost path** to transform the portfolio.

```
    Current Portfolio              Target Portfolio
    ┌─────────────────┐           ┌─────────────────┐
    │ AAPL  12%       │           │ AAPL  10%       │
    │ MSFT  11%       │   OTX     │ MSFT  10%       │
    │ JPM    7%       │ ───────►  │ XOM   10%       │
    │ XOM    2%       │           │ JPM    8%       │
    └─────────────────┘           └─────────────────┘
           ↓                             ↓
    Source Distribution         Target Distribution
           └──────── Optimal Transport ────────┘
                          ↓
              Minimum Transaction Cost Plan
```

## Why Optimal Transport?

1. **Global optimization**: Considers all possible ways to move money between assets
2. **Cost-aware**: Accounts for different trading costs per asset
3. **Sector correlation**: Cheaper to rebalance within same sector
4. **Scalable**: Works for portfolios with hundreds of assets

## Run the Example

```bash
bun examples/finance-portfolio-optimization/index.js
```

## Usage as a Library

```javascript
import { buildCostMatrix, embedPortfolio } from './examples/finance-portfolio-optimization';

const myAssets = [{ ticker: "BTC", tradingCost: 0.002 }, { ticker: "ETH", tradingCost: 0.002 }];
const costMatrix = buildCostMatrix(myAssets);
const coords = embedPortfolio(myAssets);
```

## Test Scenarios

| Scenario | Description | Expected Cost |
|----------|-------------|---------------|
| Minor Drift | Quarterly rebalance after small moves | Low (< 5 bps) |
| Sector Rotation | Shift from Tech to Energy | Medium (10-20 bps) |
| Risk-Off Event | Flight to defensive stocks | Medium-High |
| Complete Overhaul | New investment mandate | High (> 30 bps) |

## Which Solver to Use?

| Use Case | Solver | Why |
|----------|--------|-----|
| Real-time order routing | **OTX-Nano** | Microsecond decisions |
| End-of-day rebalancing | **OTX-Base** | Accuracy matters for large trades |
| Index funds (500+ assets) | **OTX-Max** | Scales to S&P 500 |

## Applications

- 📈 **Portfolio Management**: Tax-loss harvesting, factor adjustment
- 🏦 **Market Making**: Order book matching, inventory management
- 📊 **Risk Management**: Stress test comparison, VaR analysis
- 🤖 **Algo Trading**: VWAP execution, dark pool allocation
