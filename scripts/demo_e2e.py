#!/usr/bin/env python3
"""
ThermoShelter — End-to-End Architectural Intelligence Demonstration Script

Demonstrates the full multi-model intelligent pipeline (Models A through H):
    "Design a passive winter emergency shelter for 4 people in Leh with high warmth."

AI recommends. Physics proves. Civil engineering validates.
"""

import sys
import os
import json
import time

# Ensure src/ is on python path
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from thermoshelter import (
    ShelterRequest, ShelterDesignOrchestrator, NaturalLanguageInterpreter
)


def main():
    print("=" * 78)
    print("  THERMOSHELTER -- ARCHITECTURAL INTELLIGENCE UPGRADE (MODELS A TO H)")
    print("  AI recommends. Physics proves. Civil engineering validates.")
    print("=" * 78)
    print()

    # -- 1. NATURAL LANGUAGE BRIEF --
    natural_prompt = "We urgently need a high-warmth emergency winter shelter for a family of 4 people in Leh with approximately 24 m2 area."
    print(f"  Natural Language User Brief:")
    print(f"    \"{natural_prompt}\"")
    print()

    request = NaturalLanguageInterpreter.parse_natural_language_request(natural_prompt)
    print(f"  Interpreted Technical Request:")
    print(f"    Location:          {request.location}")
    print(f"    Occupants:         {request.occupants} persons")
    print(f"    Purpose:           {request.purpose}")
    print(f"    Thermal Priority:  {request.thermal_objective}")
    print(f"    Preferred Area:    {request.preferred_area_m2} m2")
    print()

    # -- 2. RUN FULL MULTI-MODEL PIPELINE --
    print("  Executing Master Design Pipeline (Models A -> H)...")
    start = time.time()

    orchestrator = ShelterDesignOrchestrator(
        n_candidates=36,
        n_finalists=6,
        simulation_hours=48
    )

    report = orchestrator.design_shelter(request)
    elapsed = time.time() - start

    # -- 3. PRINT REPORT SUMMARY --
    print(report.format_summary())

    # -- 4. MULTI-OBJECTIVE & COMFORT BREAKDOWN (RECOMMENDED DESIGN) --
    rec = report.recommended
    print()
    print("  -- MODEL G: THERMAL COMFORT & BIOCLIMATIC HABITABILITY --")
    if rec.comfort_report:
        c = rec.comfort_report
        print(f"  Adaptive Neutral Temp:     {c.neutral_comfort_temp_C:.1f} C (Comfort Band: {c.comfort_band_min_C:.1f} C - {c.comfort_band_max_C:.1f} C)")
        print(f"  Comfort Band Hours:        {c.hours_in_comfort_band}/48 h ({c.comfort_hours_percent:.0f}%)")
        print(f"  Thermal Buffer Index (TBI): {c.thermal_buffer_index:.2f} (1.0 = perfect thermal damping)")
        print(f"  Indoor Temp Swing:         {c.indoor_temperature_swing_C:.1f} C (Outdoor Swing: {c.outdoor_temperature_swing_C:.1f} C)")
        print(f"  Sub-Zero Freeze Hours:     {c.hours_below_0C} h (<5 C: {c.hours_below_5C} h)")
        print(f"  Discomfort Degree-Hours:   {c.discomfort_degree_hours_10C:.1f} C-hours (<10 C)")
        print(f"  Comfort Verdict:           {c.comfort_verdict}")
        print(f"  Interpretation:            {c.interpretation}")

    print()
    print("  -- MODEL H: MULTI-OBJECTIVE DECISION SCORES (0 - 100) --")
    if rec.multi_objective:
        mo = rec.multi_objective
        print(f"  Composite Utility Score:   {mo.composite_utility_score:.1f} / 100")
        print(f"  1. Thermal Comfort Score:  {mo.comfort_score:.1f} / 100")
        print(f"  2. Solar Efficiency Score: {mo.solar_efficiency_score:.1f} / 100")
        print(f"  3. Economic / Cost Score:  {mo.economic_cost_score:.1f} / 100")
        print(f"  4. Embodied Carbon Score:  {mo.embodied_carbon_score:.1f} / 100 (high = low carbon)")
        print(f"  5. Code Safety Margin:     {mo.safety_compliance_score:.1f} / 100")
        print(f"  Pareto Optimal Status:     {'YES (Non-dominated design)' if mo.is_pareto_optimal else 'Dominated'}")

    # -- 5. MODEL F: 5 PURPOSEFUL ARCHETYPES MATRIX --
    print()
    print("  -- MODEL F: ARCHITECTURAL ALTERNATIVE ARCHETYPES --")
    table = report.comparison_table.to_table()
    if table:
        headers = ["Design", "Archetype", "Geometry", "Wall", "Avg Indoor (C)", "Comfort Hours (%)", "Score", "Compliance"]
        col_w = [18, 26, 16, 16, 15, 18, 8, 11]
        
        row_fmt = "  " + " | ".join(f"{{:<{w}}}" for w in col_w)
        header_str = row_fmt.format(*headers)
        print(header_str)
        print("  " + "-" * (sum(col_w) + 3 * (len(col_w) - 1)))
        
        for row in table:
            vals = [
                str(row.get("Design", ""))[:18],
                str(row.get("Archetype", ""))[:26],
                str(row.get("Geometry", ""))[:16],
                str(row.get("Wall", ""))[:16],
                str(row.get("Avg Indoor (C)", ""))[:15],
                str(row.get("Comfort Hours (%)", ""))[:18],
                str(row.get("Score", ""))[:8],
                str(row.get("Compliance", ""))[:11],
            ]
            print(row_fmt.format(*vals))

    # -- 6. CONTROLLED MATERIAL COMPARISON --
    if report.material_comparison:
        print()
        print("  -- CONTROLLED MATERIAL COMPARISON --")
        print(f"  (Same geometry, orientation, climate -- only material envelope changes)")
        mat_table = report.material_comparison.to_comparison_table()
        if mat_table:
            m_headers = ["Wall Material", "Roof Material", "Wall U-value", "Avg Indoor (C)", "Score", "Compliance"]
            m_w = [18, 16, 16, 15, 8, 12]
            m_fmt = "  " + " | ".join(f"{{:<{w}}}" for w in m_w)
            print(m_fmt.format(*m_headers))
            print("  " + "-" * (sum(m_w) + 3 * (len(m_w) - 1)))
            for row in mat_table:
                m_vals = [
                    str(row.get("Wall Material", ""))[:18],
                    str(row.get("Roof Material", ""))[:16],
                    str(row.get("Wall U-value", ""))[:16],
                    str(row.get("Avg Indoor (C)", ""))[:15],
                    str(row.get("Score", ""))[:8],
                    str(row.get("Compliance", ""))[:12],
                ]
                print(m_fmt.format(*m_vals))

    # -- 7. BLUEPRINT / CONCEPTUAL FLOOR PLAN --
    if report.floor_plan:
        print()
        print("  -- CONCEPTUAL ARCHITECTURAL 2D PLAN --")
        fp = report.floor_plan
        print(f"  Title: {fp['title']} ({fp['floor_area_m2']} m2)")
        print(f"  Wall Thickness: {fp['wall_thickness_m']*1000:.0f} mm | North Arrow: {fp['north_arrow_angle_deg']} deg")
        print(f"  Openings Schedule ({len(fp['openings'])} items):")
        for op in fp['openings']:
            print(f"    * {op['type']} on {op['orientation']} Facade: {op['width_m']}x{op['height_m']}m ({op['area_m2']} m2) [{op['glazing']}]")
        print(f"  Safety Note: {fp['note']}")

    print()
    print(f"  Total Pipeline Execution Time: {elapsed:.2f} seconds")
    print("=" * 78)
    print("  DEMONSTRATION COMPLETE")
    print("=" * 78)


if __name__ == "__main__":
    main()
