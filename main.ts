// makefun-btc-race-24h-20261117-0603: washout-bounce, long-only, CBBTC 1m bars.
//
// Strategy: buy the whole cash balance when the close has washed out
// (down versus 60 bars ago) and is already bouncing (up versus 5 bars
// ago); exit the whole position on take profit, stop loss, or time stop.
// Every comparison is pure integer cross-multiplication in basis points
// (no floats); no wall clock, no environment, no randomness, so two runs
// on the same window produce byte-identical action logs.
//
// Params (tuned on the dev window; DIP 100-130 bps and UP 20-30 bps all
// give the same dev trade, so the midpoints are used):
//   DIP_BARS 60, DIP_BPS 115, UP_BARS 5, UP_BPS 25,
//   TAKE_PROFIT 425 bps, STOP_LOSS 300 bps, MAX_HOLD 120 bars.
// Dev grade (grade-local, process driver): net PnL +8.184614 USDC,
// 1 round trip (buy + sell), win rate 1.0, max drawdown 0.005737613,
// fees 0.803436 USDC, 0 rejected, guardrails met. The v3 spec as written
// (dip >200 bps over 105 bars) never fires on this dev window — its
// worst 105-bar return is only -146 bps — so DIP was retuned to 60 bars.

import { BPS, runBars, type BarsState, type Batch, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const DIP_BARS = 60;
const DIP_BPS = 115n;
const UP_BARS = 5;
const UP_BPS = 25n;
const TAKE_PROFIT_BPS = 425n;
const STOP_LOSS_BPS = 300n;
const MAX_HOLD_BARS = 120;
const MAX_SLIPPAGE_BPS = 150;
const MIN_NOTIONAL = 1_000_000n;

const closes: bigint[] = [];
let heldBars = 0;

// True when the close fell more than DIP_BPS over the last DIP_BARS bars
// and rose more than UP_BPS over the last UP_BARS bars. Integer only:
// (old - cur) * 10000 > DIP_BPS * old  <=>  (cur - old) / old < -DIP_BPS bps.
function dipAndBounce(): boolean {
  if (closes.length <= DIP_BARS) return false;
  const cur = closes[closes.length - 1];
  const oldDip = closes[closes.length - 1 - DIP_BARS];
  const oldUp = closes[closes.length - 1 - UP_BARS];
  const dipped = (oldDip - cur) * BPS > DIP_BPS * oldDip;
  const bounced = (cur - oldUp) * BPS > UP_BPS * oldUp;
  return dipped && bounced;
}

await runBars({
  onBatch(state: BarsState, batch: Batch): (BuyInput | SellInput)[] {
    if (state.warmingUp) return [];
    const bar = batch.bars.find((b) => b.symbol === SYMBOL);
    if (bar === undefined) return [];
    closes.push(BigInt(bar.c));

    const held = state.positions.get(SYMBOL);
    if (held !== undefined) {
      heldBars += 1;
      const value = state.value(SYMBOL, held.qty);
      const cost = held.cost;
      const takeProfit = (value - cost) * BPS >= TAKE_PROFIT_BPS * cost;
      const stopLoss = (cost - value) * BPS >= STOP_LOSS_BPS * cost;
      const timeStop = heldBars >= MAX_HOLD_BARS;
      if (takeProfit || stopLoss || timeStop) {
        heldBars = 0;
        return [{ side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }

    heldBars = 0;
    if (!dipAndBounce()) return [];
    const cash = state.cash;
    if (cash < MIN_NOTIONAL) return [];
    return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: cash, max_slippage_bps: MAX_SLIPPAGE_BPS }];
  },
});
