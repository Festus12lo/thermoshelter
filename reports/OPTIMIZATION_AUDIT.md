# MULTI-OBJECTIVE OPTIMIZATION AUDIT

## Model H (MCDA)
The `MultiObjectiveOptimizer` evaluates designs across Comfort, Thermal Performance, Cost, Carbon, and Safety.

## Constraint Hierarchy
- Safety and structural engineering compliance act as **HARD CONSTRAINTS**.
- A cheaper, highly-insulating design with a flat roof in a snow zone will score `0.0/100` and be rejected from the Pareto frontier, proving that engineering truth outranks synthetic optimization.

## Verdict
PASS. Hard engineering limits successfully gate optimization scores.
