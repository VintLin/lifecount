# LifeCount visual modes E2E verification

Date: 2026-11-16

## Browser flow

- Opened the local LifeCount page in a named agent-browser session.
- Opened the header Life view menu and verified Grid, Hourglass, Candle, and Daylight options.
- Switched to Hourglass, Candle, and Daylight and inspected the rendered page and screenshots.
- Switched the page to English and verified translated labels and summaries.
- Changed Maximum age from 85 to 90 in the existing settings surface and verified the visual progress changed from 37.5% to 35.4%.
- Reloaded the page and verified the selected visual mode, language, and maximum age were restored from local storage.
- Checked browser errors; result was an empty error list.

## Artifacts

- `hourglass.png`
- `candle.png`
- `daylight.png`
