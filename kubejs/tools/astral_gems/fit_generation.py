"""Legacy version-1 logistic fitting; current version-2 generation uses the bounded old-style sampler."""
import json
from pathlib import Path
import numpy as np

rng = np.random.default_rng(41703)
n = 40000
u = rng.uniform(1e-12, 1 - 1e-12, (n, 3))
log_u, log_tail = np.log(u), np.log1p(-u)
minimum = np.array([1 / 500, 1 / 200, 1 / 100])
thresholds = np.array([.4, .6, .8, .9, .99])
targets = np.array([[.10, .04, .01, .002, .00002],
                    [.20, .10, .05, .01, .0001],
                    [.35, .20, .10, .03, .0005]])
positive = [rng.binomial(1 + rng.binomial(4, extra, n), sign, n)
            for extra, sign in [(0.25, .55), (.50, .70), (.75, .85)]]

def qualities(logit, offset, tier):
    values = minimum + (1 - minimum) / (1 + np.exp(np.clip(offset - logit, -700, 700)))
    sums = values.sum(axis=1) * .15
    main = sums + values[:, 0] * .55
    other = sums + values[:, 1] * .55
    return main * .8 + positive[tier] * .04, np.maximum(main, other) * .8 + positive[tier] * .04

best = None
candidate = None
for power in [.25, .5, 1, 1.5, 2, 3, 4, 6, 8]:
    for tail_power in [.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24]:
        logit = power * log_u - tail_power * log_tail
        offsets, observed, loss = [], [], 0
        for tier in range(3):
            lo, hi = -50., 80.
            for _ in range(19):
                offset = (lo + hi) / 2
                q = qualities(logit, offset, tier)
                rate = sum(np.mean(x >= .4) for x in q) / 2
                if rate > targets[tier, 0]: lo = offset
                else: hi = offset
            offset = (lo + hi) / 2
            q = qualities(logit, offset, tier)
            rates = np.array([[np.mean(x >= t) for t in thresholds] for x in q])
            actual = rates.mean(axis=0)
            loss += np.sum(np.log((actual[:4] + 1 / n) / targets[tier, :4]) ** 2)
            offsets.append(offset)
            observed.append(rates.tolist())
        if not offsets[0] >= offsets[1] >= offsets[2]: continue
        if power == 1 and tail_power == 3:
            candidate = dict(power=power, tailPower=tail_power, offsets=offsets, observed=observed, loss=float(loss))
        if best is None or loss < best['loss']:
            best = dict(power=power, tailPower=tail_power, offsets=offsets,
                        observed=observed, loss=float(loss))
assert best is not None
result = dict(samplesPerRegime=n, thresholds=thresholds.tolist(), targets=targets.tolist(), candidate=candidate, **best)
output = Path('.cache/astral_gem_investigation/generation_fit.json')
output.write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result, indent=2))
