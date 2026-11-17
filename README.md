# makefun-btc-race-24h-20261117

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/fauzandaulay89-cloud/makefun-btc-race-24h-20261117/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/fauzandaulay89-cloud/makefun-btc-race-24h-20261117/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

Washout-bounce bot for the BTC race: long-only on CBBTC (Coinbase Wrapped BTC) 1-minute bars with $1,000 paper money. It buys with the full cash balance when the close has washed out — down more than 115 bps over the last 60 bars — and is already bouncing — up more than 25 bps over the last 5 bars — then exits the whole position on take profit (+425 bps), stop loss (−300 bps), or after 120 bars held. Every comparison is pure integer math in basis points (no floats), fully deterministic: two runs on the same window produce byte-identical action logs.

## Run it

Grade locally against the dev window (from the kit directory, process driver — no Docker on this machine):

```sh
node cli/makefun.mjs grade-local --kit . --bot /path/to/makefun-btc-race-24h-20261117/main.ts --driver process
```

<sub>Entered on [make.fun](https://make.fun/?ref=fxram5cz&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>
