import csv
import os
import json
from dataclasses import dataclass
from typing import Dict, List, Any

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2_DIR = os.path.join(ROOT, "data", "research", "v2")

def audit_materials():
    materials_path = os.path.join(V2_DIR, "materials_v2.csv")
    registry_path = os.path.join(V2_DIR, "source_registry.csv")
    
    registry = {}
    with open(registry_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            registry[row['source_id']] = row
            
    findings = []
    with open(materials_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mat_id = row['material_id']
            k = float(row['thermal_conductivity_W_mK'])
            source = row['source_reference']
            status = "VERIFIED" if source in registry else "UNVERIFIED"
            
            # Simple check
            findings.append({
                "material_id": mat_id,
                "k": k,
                "source": source,
                "status": status
            })
            
    return findings

def audit_assemblies():
    assemblies_path = os.path.join(V2_DIR, "assemblies_v2.csv")
    layers_path = os.path.join(V2_DIR, "assembly_layers_v2.csv")
    
    layers_by_assembly = {}
    with open(layers_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            aid = row['assembly_id']
            if aid not in layers_by_assembly:
                layers_by_assembly[aid] = []
            layers_by_assembly[aid].append(row)
            
    findings = []
    with open(assemblies_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            aid = row['assembly_id']
            expected_r = float(row['total_r_value_m2K_W'])
            expected_u = float(row['effective_u_value_W_m2K'])
            
            calculated_r = 0.0
            for layer in layers_by_assembly.get(aid, []):
                t_mm = float(layer['thickness_mm'])
                k = float(layer['thermal_conductivity_W_mK'])
                r_val = float(layer['layer_r_value_m2K_W'])
                
                if k > 0:
                    calc_r = (t_mm / 1000.0) / k
                else:
                    calc_r = r_val
                
                calculated_r += calc_r
                
            calc_u = 1.0 / calculated_r if calculated_r > 0 else 0.0
            
            abs_err_r = abs(expected_r - calculated_r)
            abs_err_u = abs(expected_u - calc_u)
            
            findings.append({
                "assembly_id": aid,
                "expected_r": expected_r,
                "calc_r": calculated_r,
                "err_r": abs_err_r,
                "expected_u": expected_u,
                "calc_u": calc_u,
                "err_u": abs_err_u,
                "status": "PASS" if abs_err_r < 1e-4 else "FAIL"
            })
            
    return findings

if __name__ == "__main__":
    out = {
        "materials": audit_materials(),
        "assemblies": audit_assemblies()
    }
    print(json.dumps(out, indent=2))
