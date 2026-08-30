# LLM Architecture Readiness

## 1. Integration Boundaries
- **Frontend**: Safe to use for parsing natural language ("Need a house for a family of 4 in Ladakh") into `ShelterRequest` datatypes.
- **Backend**: Safe to use for translating the numerical output of Model H and PhysicsBridge into plain English.
- **Restricted Zone**: The LLM MUST NEVER alter $U$-values, statutory limits, or physics logic.
