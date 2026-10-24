"""Fetch a star's Kepler long-cadence light curve from MAST and reduce it to
what Chapter 5 draws: time in days and brightness in parts per million.

    python3 scripts/fetch-lightcurve.py 4814502 Q1 Q2 Q3 Q4   (Kepler-1933)

Needs astropy and numpy (pip install astropy numpy). The steps, each one a
standard part of a transit search, and each written into the output:

  1. PDCSAP_FLUX: the Kepler pipeline's flux with instrument systematics
     removed (Smith et al. 2012; Stumpe et al. 2012).
  2. Keep cadences with SAP_QUALITY == 0 and finite flux.
  3. Normalize each quarter by its median.
  4. Remove the star's own slow variability with a running median two days
     wide, much longer than a transit of a few hours, so the dips survive.
  5. Drop single points more than 5 sigma ABOVE the trend (flares, cosmic
     rays). Nothing below the trend is touched: that is where transits are.

No step uses the planet's known period or position.
"""

import json
import re
import sys
import urllib.request
from datetime import date
from io import BytesIO
from pathlib import Path

import numpy as np
from astropy.io import fits

kic = int(sys.argv[1])
wanted = {q.upper().lstrip("Q") for q in sys.argv[2:]}
folder = f"{kic:09d}"
url = f"https://archive.stsci.edu/missions/kepler/lightcurves/{folder[:4]}/{folder}/"
listing = urllib.request.urlopen(url).read().decode()
names = sorted(set(re.findall(r"kplr\d+-\d+_llc\.fits", listing)))

times, ppms, quarters, files = [], [], [], []
for name in names:
    with fits.open(BytesIO(urllib.request.urlopen(url + name).read())) as f:
        quarter = str(f[0].header["QUARTER"])
        if wanted and quarter not in wanted:
            continue
        d = f[1].data
        t = np.array(d["TIME"], dtype=float)
        flux = np.array(d["PDCSAP_FLUX"], dtype=float)
        ok = (d["SAP_QUALITY"] == 0) & np.isfinite(t) & np.isfinite(flux)
        t, flux = t[ok], flux[ok]
        flux = flux / np.median(flux)
        # Running median, two days wide.
        trend = np.array([np.median(flux[np.abs(t - ti) < 1.0]) for ti in t])
        rel = flux / trend - 1
        sigma = 1.4826 * np.median(np.abs(rel - np.median(rel)))
        keep = rel < 5 * sigma
        times.append(t[keep])
        ppms.append(rel[keep] * 1e6)
        quarters.append(int(quarter))
        files.append(name)
        print(f"Q{quarter}: {keep.sum()} points, scatter {sigma * 1e6:.0f} ppm per 29.4-min cadence")

t = np.concatenate(times)
ppm = np.concatenate(ppms)
t0 = float(t.min())
out = {
    "kic": kic,
    "quarters": quarters,
    "files": files,
    "source": url,
    "retrieved": date.today().isoformat(),
    "flux": "PDCSAP_FLUX, SAP_QUALITY == 0, per-quarter median normalized, 2-day running median removed, upward 5-sigma outliers dropped",
    "timeOrigin": f"BKJD {t0:.5f} (BJD - 2454833)",
    "units": "time in days from timeOrigin; brightness in parts per million relative to the trend",
    "time": [round(float(x - t0), 5) for x in t],
    "ppm": [round(float(x), 1) for x in ppm],
}
dest = Path(__file__).resolve().parent.parent / "public" / "data" / f"lightcurve-kic{kic}.json"
dest.write_text(json.dumps(out, separators=(",", ":")))
print(f"{len(t)} points over {t.max() - t0:.1f} days -> {dest.name} ({dest.stat().st_size // 1024} KB)")
