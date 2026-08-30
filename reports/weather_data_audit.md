# Weather Data Audit

## 1. Current State
- The system uses synthetic `weather_2026.csv` bounding models simulating 48 hours.

## 2. Recommendation
- Weather data must be fully decoupled from the core via a `WeatherAdapter` interface allowing direct ingestion of verified TMY3 / EPW datasets for real-world authoritative reporting.
