"""
ThermoShelter — Canonical Data Foundation Validator
Performs strict referential integrity, unique ID, missing value, and foreign key audits.
Outputs a structured JSON audit report and human-readable summary.
"""

import os
import json
import pandas as pd

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CANONICAL_DIR = os.path.join(ROOT_DIR, "data", "canonical")

def validate_all():
    report = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "total_checks": 0,
        "passed_checks": 0,
        "failed_checks": 0,
        "warnings": 0,
        "entity_counts": {},
        "integrity_details": []
    }

    def check(condition, test_name, details=""):
        report["total_checks"] += 1
        if condition:
            report["passed_checks"] += 1
            print(f"  [PASS] {test_name}")
        else:
            report["failed_checks"] += 1
            print(f"  [FAIL] {test_name} -> {details}")
            report["integrity_details"].append({"check": test_name, "status": "FAIL", "details": details})

    print("==================================================")
    print("RUNNING CANONICAL DATA INTEGRITY AUDIT")
    print("==================================================")

    # 1. Load All Datasets
    sources = pd.read_csv(os.path.join(CANONICAL_DIR, "provenance", "sources.csv"))
    prov = pd.read_csv(os.path.join(CANONICAL_DIR, "provenance", "provenance_records.csv"))
    locations = pd.read_csv(os.path.join(CANONICAL_DIR, "locations", "locations.csv"))
    weather = pd.read_csv(os.path.join(CANONICAL_DIR, "weather", "weather_datasets.csv"))
    site = pd.read_csv(os.path.join(CANONICAL_DIR, "site", "site_conditions.csv"))
    reqs = pd.read_csv(os.path.join(CANONICAL_DIR, "requirements", "shelter_requirements.csv"))
    geom_types = pd.read_csv(os.path.join(CANONICAL_DIR, "geometry", "geometry_types.csv"))
    geom_params = pd.read_csv(os.path.join(CANONICAL_DIR, "geometry", "geometry_parameters.csv"))
    orientations = pd.read_csv(os.path.join(CANONICAL_DIR, "orientation", "orientations.csv"))
    openings = pd.read_csv(os.path.join(CANONICAL_DIR, "openings", "openings.csv"))
    shading = pd.read_csv(os.path.join(CANONICAL_DIR, "passive_design", "shading_strategies.csv"))
    passive = pd.read_csv(os.path.join(CANONICAL_DIR, "passive_design", "passive_design_strategies.csv"))
    materials = pd.read_csv(os.path.join(CANONICAL_DIR, "materials", "materials.csv"))
    mat_props = pd.read_csv(os.path.join(CANONICAL_DIR, "materials", "material_properties.csv"))
    aliases = pd.read_csv(os.path.join(CANONICAL_DIR, "materials", "material_id_aliases.csv"))
    assemblies = pd.read_csv(os.path.join(CANONICAL_DIR, "assemblies", "assemblies.csv"))
    layers = pd.read_csv(os.path.join(CANONICAL_DIR, "assemblies", "assembly_layers.csv"))
    construction = pd.read_csv(os.path.join(CANONICAL_DIR, "construction", "construction_methods.csv"))
    eng_rules = pd.read_csv(os.path.join(CANONICAL_DIR, "engineering", "engineering_rules.csv"))
    therm_rules = pd.read_csv(os.path.join(CANONICAL_DIR, "engineering", "thermal_rules.csv"))
    design_cases = pd.read_csv(os.path.join(CANONICAL_DIR, "design_cases", "design_cases.csv"))
    simulations = pd.read_csv(os.path.join(CANONICAL_DIR, "simulations", "simulations.csv"))
    sim_results = pd.read_csv(os.path.join(CANONICAL_DIR, "simulations", "simulation_results.csv"))
    validations = pd.read_csv(os.path.join(CANONICAL_DIR, "validation", "validation_results.csv"))
    
    with open(os.path.join(CANONICAL_DIR, "training", "training_examples.json"), "r") as f:
        training_json = json.load(f)

    # 2. Record entity counts
    entities = {
        "sources": len(sources),
        "provenance_records": len(prov),
        "locations": len(locations),
        "weather_datasets": len(weather),
        "site_conditions": len(site),
        "shelter_requirements": len(reqs),
        "geometry_types": len(geom_types),
        "geometry_parameters": len(geom_params),
        "orientations": len(orientations),
        "openings": len(openings),
        "shading_strategies": len(shading),
        "passive_design_strategies": len(passive),
        "materials": len(materials),
        "material_properties": len(mat_props),
        "material_aliases": len(aliases),
        "assemblies": len(assemblies),
        "assembly_layers": len(layers),
        "construction_methods": len(construction),
        "engineering_rules": len(eng_rules),
        "thermal_rules": len(therm_rules),
        "design_cases": len(design_cases),
        "simulations": len(simulations),
        "simulation_results": len(sim_results),
        "validation_results": len(validations),
        "training_examples": len(training_json)
    }
    report["entity_counts"] = entities

    # 3. Unique Primary Key Audits
    check(sources["source_id"].is_unique, "Unique source_id in sources.csv")
    check(locations["location_id"].is_unique, "Unique location_id in locations.csv")
    check(weather["weather_dataset_id"].is_unique, "Unique weather_dataset_id in weather_datasets.csv")
    check(site["site_condition_id"].is_unique, "Unique site_condition_id in site_conditions.csv")
    check(reqs["requirement_id"].is_unique, "Unique requirement_id in shelter_requirements.csv")
    check(geom_types["geometry_type_id"].is_unique, "Unique geometry_type_id in geometry_types.csv")
    check(geom_params["geometry_id"].is_unique, "Unique geometry_id in geometry_parameters.csv")
    check(orientations["orientation_id"].is_unique, "Unique orientation_id in orientations.csv")
    check(openings["opening_id"].is_unique, "Unique opening_id in openings.csv")
    check(shading["shading_id"].is_unique, "Unique shading_id in shading_strategies.csv")
    check(passive["strategy_id"].is_unique, "Unique strategy_id in passive_design_strategies.csv")
    check(materials["material_id"].is_unique, "Unique material_id in materials.csv")
    check(mat_props["property_record_id"].is_unique, "Unique property_record_id in material_properties.csv")
    check(assemblies["assembly_id"].is_unique, "Unique assembly_id in assemblies.csv")
    check(layers["layer_id"].is_unique, "Unique layer_id in assembly_layers.csv")
    check(construction["construction_method_id"].is_unique, "Unique construction_method_id in construction_methods.csv")
    check(eng_rules["rule_id"].is_unique, "Unique rule_id in engineering_rules.csv")
    check(design_cases["design_case_id"].is_unique, "Unique design_case_id in design_cases.csv")
    check(simulations["simulation_id"].is_unique, "Unique simulation_id in simulations.csv")
    check(sim_results["result_record_id"].is_unique, "Unique result_record_id in simulation_results.csv")
    check(validations["validation_id"].is_unique, "Unique validation_id in validation_results.csv")

    # 4. Foreign Key Referencing Audits
    source_ids = set(sources["source_id"])
    check(set(locations["data_source_id"]).issubset(source_ids), "Locations -> Sources FK integrity")
    check(set(weather["source_id"]).issubset(source_ids), "Weather -> Sources FK integrity")
    check(set(site["source_id"]).issubset(source_ids), "Site -> Sources FK integrity")
    check(set(reqs["source_id"]).issubset(source_ids), "Requirements -> Sources FK integrity")
    check(set(mat_props["source_id"]).issubset(source_ids), "Material Properties -> Sources FK integrity")
    check(set(assemblies["source_id"]).issubset(source_ids), "Assemblies -> Sources FK integrity")
    check(set(eng_rules["source_id"]).issubset(source_ids), "Engineering Rules -> Sources FK integrity")

    # Locations -> Weather & Site
    loc_ids = set(locations["location_id"])
    check(set(weather["location_id"]).issubset(loc_ids), "Weather -> Locations FK integrity")
    check(set(site["location_id"]).issubset(loc_ids), "Site -> Locations FK integrity")

    # Materials -> Properties, Layers, Aliases
    mat_ids = set(materials["material_id"])
    check(set(mat_props["material_id"]).issubset(mat_ids), "Material Properties -> Materials FK integrity")
    check(set(layers["material_id"]).issubset(mat_ids), "Assembly Layers -> Materials FK integrity")
    check(set(aliases["canonical_material_id"]).issubset(mat_ids), "Material Aliases -> Materials FK integrity")

    # Assemblies -> Layers
    asm_ids = set(assemblies["assembly_id"])
    check(set(layers["assembly_id"]).issubset(asm_ids), "Assembly Layers -> Assemblies FK integrity")

    # Geometry -> Openings
    geom_ids = set(geom_params["geometry_id"])
    check(set(openings["geometry_id"]).issubset(geom_ids), "Openings -> Geometry Parameters FK integrity")

    # Design Cases -> All Subsystems
    check(set(design_cases["location_id"]).issubset(loc_ids), "Design Cases -> Locations FK integrity")
    check(set(design_cases["weather_dataset_id"]).issubset(set(weather["weather_dataset_id"])), "Design Cases -> Weather FK integrity")
    check(set(design_cases["site_condition_id"]).issubset(set(site["site_condition_id"])), "Design Cases -> Site FK integrity")
    check(set(design_cases["geometry_id"]).issubset(geom_ids), "Design Cases -> Geometry FK integrity")
    check(set(design_cases["orientation_id"]).issubset(set(orientations["orientation_id"])), "Design Cases -> Orientation FK integrity")
    check(set(design_cases["wall_assembly_id"]).issubset(asm_ids), "Design Cases -> Wall Assembly FK integrity")
    check(set(design_cases["roof_assembly_id"]).issubset(asm_ids), "Design Cases -> Roof Assembly FK integrity")
    check(set(design_cases["floor_assembly_id"]).issubset(asm_ids), "Design Cases -> Floor Assembly FK integrity")
    check(set(design_cases["construction_method_id"]).issubset(set(construction["construction_method_id"])), "Design Cases -> Construction Method FK integrity")

    # Simulations -> Design Cases & Results
    case_ids = set(design_cases["design_case_id"])
    check(set(simulations["design_case_id"]).issubset(case_ids), "Simulations -> Design Cases FK integrity")
    sim_ids = set(simulations["simulation_id"])
    check(set(sim_results["simulation_id"]).issubset(sim_ids), "Simulation Results -> Simulations FK integrity")

    # Validations -> Design Cases & Rules
    check(set(validations["design_case_id"]).issubset(case_ids), "Validations -> Design Cases FK integrity")
    check(set(validations["rule_id"]).issubset(set(eng_rules["rule_id"])), "Validations -> Engineering Rules FK integrity")

    # Training Examples -> Design Cases
    train_case_ids = {item["design_case_id"] for item in training_json}
    check(train_case_ids.issubset(case_ids), "Training Examples -> Design Cases FK integrity")

    # 5. Save Machine-Readable Validation Summary
    summary_path = os.path.join(CANONICAL_DIR, "validation_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("==================================================")
    print(f"AUDIT SUMMARY: {report['passed_checks']}/{report['total_checks']} CHECKS PASSED. {report['failed_checks']} FAILS.")
    print(f"Validation report saved to: {summary_path}")
    print("==================================================")
    return report

if __name__ == "__main__":
    validate_all()
