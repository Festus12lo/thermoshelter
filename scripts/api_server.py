#!/usr/bin/env python3
"""
ThermoShelter — Production REST API Server
Provides full application-level API endpoints for the ThermoShelter V2 Architectural Interface.
Strictly isolates physics calculations from commercial procurement while exposing all
canonical data structures, engineering gates, multi-supplier comparisons, and grounded explanations.
"""

import sys
import os
import json
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Ensure src/ is on python path
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from thermoshelter import (
    ShelterRequest, ShelterDesignOrchestrator, ContextBuilder, NaturalLanguageInterpreter,
    ProcurementAdapter, MaterialIntelligenceService, LLMExplanationEngine
)

ORCHESTRATOR = None
CONTEXT_BUILDER = None
MATERIAL_SERVICE = None
PROCUREMENT_ADAPTER = None
DESIGN_CACHE = {}


def get_services():
    global ORCHESTRATOR, CONTEXT_BUILDER, MATERIAL_SERVICE, PROCUREMENT_ADAPTER
    if ORCHESTRATOR is None:
        CONTEXT_BUILDER = ContextBuilder()
        ORCHESTRATOR = ShelterDesignOrchestrator(
            context_builder=CONTEXT_BUILDER,
            n_candidates=36,
            n_finalists=5,
            simulation_hours=48
        )
    if MATERIAL_SERVICE is None:
        MATERIAL_SERVICE = MaterialIntelligenceService()
        PROCUREMENT_ADAPTER = MATERIAL_SERVICE.procurement
    return ORCHESTRATOR, CONTEXT_BUILDER, MATERIAL_SERVICE, PROCUREMENT_ADAPTER


class ThermoShelterAPIHandler(BaseHTTPRequestHandler):
    """Handles API requests from frontend with full CORS support."""

    def _set_cors_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(200)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        orchestrator, ctx_builder, mat_service, procurement = get_services()

        # 1. Health Endpoint
        if path in ("/api/health", "/health"):
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({
                "status": "ok",
                "service": "ThermoShelter Architectural Intelligence Engine",
                "version": "2.0.0",
                "ml_surrogate": "GradientBoostingSurrogate (Model D)",
                "physics_engine": "Transient 48h ThermalEngine V1 (ISO 6946)",
                "engineering_validator": "NBC 2016 / IS 875 / IS 1904 Compliance Gate",
                "procurement_engine": "Multi-Supplier Market Intelligence Adapter",
                "explanation_engine": "Grounded Zero-Hallucination LLM Engine"
            }).encode("utf-8"))
            return

        # 2. Locations Endpoint
        elif path in ("/api/locations", "/locations"):
            self._set_cors_headers(200)
            locations_data = [
                {
                    "id": "LOC-IN-LEH",
                    "name": "Leh",
                    "region": "Ladakh, Cold-Arid High Altitude (3,500m)",
                    "climate_zone": "Cold-Arid (High Altitude Alpine)",
                    "winter_min_temp": -17.2,
                    "snow_load_kN_m2": 1.5,
                    "frost_depth_m": 1.20,
                    "recommended_objective": "winter_warmth",
                },
                {
                    "id": "LOC-IN-SHIMLA",
                    "name": "Shimla",
                    "region": "Himachal Pradesh, Montane Himalayan (2,205m)",
                    "climate_zone": "Cold-Humid (Montane Himalayan)",
                    "winter_min_temp": -7.3,
                    "snow_load_kN_m2": 2.5,
                    "frost_depth_m": 0.40,
                    "recommended_objective": "winter_warmth",
                },
                {
                    "id": "LOC-IN-JAIPUR",
                    "name": "Jaipur",
                    "region": "Rajasthan, Hot-Dry Desert (431m)",
                    "climate_zone": "Hot-Dry (Semi-Arid Desert)",
                    "winter_min_temp": 5.6,
                    "summer_max_temp": 43.7,
                    "snow_load_kN_m2": 0.0,
                    "frost_depth_m": 0.0,
                    "recommended_objective": "summer_cooling",
                },
                {
                    "id": "LOC-IN-KARUR",
                    "name": "Karur",
                    "region": "Tamil Nadu, Warm-Humid Peninsular (122m)",
                    "climate_zone": "Warm-Humid (Peninsular Plateau)",
                    "winter_min_temp": 18.3,
                    "summer_max_temp": 41.1,
                    "snow_load_kN_m2": 0.0,
                    "frost_depth_m": 0.0,
                    "recommended_objective": "balanced",
                }
            ]
            self.wfile.write(json.dumps(locations_data).encode("utf-8"))
            return

        # 3. All Materials Showcase & Specs
        elif path in ("/api/materials", "/materials"):
            self._set_cors_headers(200)
            cards = mat_service.get_all_material_cards()
            self.wfile.write(json.dumps(cards).encode("utf-8"))
            return

        # 4. Single Material Details
        match_mat = re.match(r"^/(?:api/)?material/([^/]+)$", path)
        if match_mat:
            mat_id = match_mat.group(1)
            card = mat_service.get_material_card(mat_id)
            self._set_cors_headers(200)
            self.wfile.write(json.dumps(card).encode("utf-8"))
            return

        # 5. Material Suppliers
        match_mat_supp = re.match(r"^/(?:api/)?material/([^/]+)/suppliers$", path)
        if match_mat_supp:
            mat_id = match_mat_supp.group(1)
            records = procurement.get_suppliers_for_material(mat_id)
            self._set_cors_headers(200)
            self.wfile.write(json.dumps([r.to_dict() for r in records]).encode("utf-8"))
            return

        # 6. Material Multi-Supplier Comparison
        match_mat_comp = re.match(r"^/(?:api/)?material/([^/]+)/comparison$", path)
        if match_mat_comp:
            mat_id = match_mat_comp.group(1)
            comp = procurement.get_supplier_comparison(mat_id)
            self._set_cors_headers(200)
            self.wfile.write(json.dumps(comp).encode("utf-8"))
            return

        # 7. Design Sub-resource endpoints: /api/design/{id}/...
        match_design_sub = re.match(r"^/(?:api/)?design/([^/]+)(?:/(thermal|engineering|materials|procurement|explanation|blueprint|floorplan))?$", path)
        if match_design_sub:
            design_id = match_design_sub.group(1)
            sub_res = match_design_sub.group(2)

            alt_data = DESIGN_CACHE.get(design_id)
            if not alt_data:
                # If not cached yet, generate a default design
                req = ShelterRequest(location="Leh", occupants=4, purpose="emergency_shelter", thermal_objective="winter_warmth")
                rep = orchestrator.design_shelter(req)
                for alt in rep.alternatives:
                    DESIGN_CACHE[alt.design_id] = alt.to_dict()
                alt_data = DESIGN_CACHE.get(design_id, rep.recommended.to_dict())

            if not sub_res:
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(alt_data).encode("utf-8"))
                return
            elif sub_res == "thermal":
                self._set_cors_headers(200)
                self.wfile.write(json.dumps({
                    "design_id": design_id,
                    "time_series": alt_data.get("time_series"),
                    "heat_flow": alt_data.get("heat_flow"),
                    "solar_analysis": alt_data.get("solar_analysis"),
                    "comfort": alt_data.get("comfort")
                }).encode("utf-8"))
                return
            elif sub_res == "engineering":
                self._set_cors_headers(200)
                self.wfile.write(json.dumps({
                    "design_id": design_id,
                    "is_compliant": alt_data.get("is_compliant"),
                    "validation": alt_data.get("validation")
                }).encode("utf-8"))
                return
            elif sub_res == "materials":
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(alt_data.get("materials", {})).encode("utf-8"))
                return
            elif sub_res == "procurement":
                self._set_cors_headers(200)
                mat_info = alt_data.get("materials", {})
                self.wfile.write(json.dumps(mat_info.get("cost_estimation", {})).encode("utf-8"))
                return
            elif sub_res == "explanation":
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(alt_data.get("llm_explanation", {"summary": alt_data.get("explanation", "")})).encode("utf-8"))
                return
            elif sub_res in ("blueprint", "floorplan"):
                self._set_cors_headers(200)
                self.wfile.write(json.dumps({
                    "blueprint": alt_data.get("blueprint"),
                    "floor_plan": alt_data.get("floor_plan")
                }).encode("utf-8"))
                return

        # 404 Fallback
        self._set_cors_headers(404)
        self.wfile.write(json.dumps({"error": f"Endpoint '{path}' not found"}).encode("utf-8"))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        orchestrator, ctx_builder, mat_service, procurement = get_services()

        if path in ("/api/design", "/design", "/api/design/generate", "/design/generate", "/api/design/analyze", "/design/analyze"):
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len).decode("utf-8")
                payload = json.loads(body) if body else {}

                # Natural language prompt parsing or parametric specification
                prompt_text = payload.get("prompt")
                if prompt_text and len(prompt_text.strip()) > 3:
                    request = NaturalLanguageInterpreter.parse_natural_language_request(prompt_text)
                    if "location" in payload:
                        request.location = payload["location"]
                    if "occupants" in payload:
                        request.occupants = int(payload["occupants"])
                    if "purpose" in payload:
                        request.purpose = payload["purpose"]
                    if "thermal_objective" in payload:
                        request.thermal_objective = payload["thermal_objective"]
                else:
                    location = payload.get("location", "Leh")
                    occupants = int(payload.get("occupants", 4))
                    purpose = payload.get("purpose", "emergency_shelter")
                    thermal_objective = payload.get("thermal_objective", "winter_warmth")
                    preferred_area = float(payload.get("preferred_area_m2", 24.0)) if payload.get("preferred_area_m2") else None

                    request = ShelterRequest(
                        location=location,
                        occupants=occupants,
                        purpose=purpose,
                        thermal_objective=thermal_objective,
                        preferred_area_m2=preferred_area
                    )

                report = orchestrator.design_shelter(request)
                response_data = report.to_dict()

                # Cache designs for subsequent GET requests
                for alt in report.alternatives:
                    DESIGN_CACHE[alt.design_id] = alt.to_dict()
                DESIGN_CACHE[report.recommended.design_id] = report.recommended.to_dict()

                self._set_cors_headers(200)
                self.wfile.write(json.dumps(response_data).encode("utf-8"))

            except Exception as e:
                self._set_cors_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": f"POST endpoint '{path}' not found"}).encode("utf-8"))

    def log_message(self, format, *args):
        pass


def run_server(port=8000):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, ThermoShelterAPIHandler)
    print(f"ThermoShelter API server listening on http://127.0.0.1:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping API server...")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
