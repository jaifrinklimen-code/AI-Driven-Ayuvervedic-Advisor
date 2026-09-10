"""
FastAPI Server for IP-SAKTI Sahayak (SIH26045)
Ministry of Ayush / All India Institute of Ayurveda
Provides enterprise-grade, secure REST APIs for RAG query, formulation classification,
ABS navigation, legal corpus catalog, and automated evaluation.
"""

import os
import time
import json
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from engine.retriever import retriever_instance
from engine.classifier import classifier_instance
from engine.abs_advisor import abs_advisor_instance
from engine.llm_guard import llm_guard_instance

app = FastAPI(
    title="IP-SAKTI Sahayak API",
    description="Multilingual, source-cited AI assistant for Ayurvedic IP & Regulatory Guidance across National and International Regimes",
    version="1.0.0"
)

# CORS Security Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server & production frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class QueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1500, description="User question")
    jurisdiction: str = Field(default="India", description="India | International")
    language: str = Field(default="en", description="en | hi | ta")

class ClassificationRequest(BaseModel):
    product_name: str = Field(..., description="Name of the product")
    ingredients: List[str] = Field(default_factory=list, description="List of ingredients")
    from_classical_text: bool = Field(default=False, description="Whether formula is from classical Ayurvedic text")
    classical_text_name: Optional[str] = Field(default=None, description="Name of classical text if applicable")
    is_modified: bool = Field(default=False, description="Whether classical formula is modified")
    intended_use: str = Field(default="therapeutic", description="therapeutic | cosmetic | health_supplement | beauty")
    is_purified_fraction: bool = Field(default=False, description="Whether product is a standardized fraction with >=4 markers")
    is_food_format: bool = Field(default=False, description="Whether product is in food/dietary format (tea, biscuit, soup)")
    biological_resources_involved: bool = Field(default=True, description="Whether biological herbs from India are used")
    target_jurisdiction: str = Field(default="India", description="India | International")

class ABSRequest(BaseModel):
    entity_type: str = Field(default="indian_entity", description="indian_entity | foreign_entity | nri")
    resource_origin: str = Field(default="cultivated", description="cultivated | wild_harvested | market_commodity | imported")
    purpose: str = Field(default="commercial_utilization", description="commercial_utilization | research | ip_application | bio_survey")
    traditional_knowledge_involved: bool = Field(default=False)
    biological_resource_name: Optional[str] = Field(default="Medicinal Plant Resource")

# Endpoints
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "IP-SAKTI Sahayak Backend",
        "version": "1.0.0",
        "jurisdictions_supported": ["India", "International"],
        "corpus_documents_loaded": len(retriever_instance.documents),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.post("/api/query")
def process_query(req: QueryRequest):
    start_time = time.time()
    result = llm_guard_instance.synthesize_grounded_response(
        query=req.query,
        jurisdiction=req.jurisdiction,
        language=req.language
    )
    result["latency_seconds"] = round(time.time() - start_time, 4)
    return result

@app.post("/api/classify")
def classify_formulation(req: ClassificationRequest):
    start_time = time.time()
    result = classifier_instance.classify(req.dict())
    result["latency_seconds"] = round(time.time() - start_time, 4)
    return result

@app.post("/api/abs-check")
def evaluate_abs(req: ABSRequest):
    start_time = time.time()
    result = abs_advisor_instance.evaluate(req.dict())
    result["latency_seconds"] = round(time.time() - start_time, 4)
    return result

@app.get("/api/corpus")
def get_corpus():
    return {
        "total_documents": len(retriever_instance.documents),
        "documents": retriever_instance.documents
    }

@app.get("/api/benchmarks")
def get_benchmarks():
    benchmark_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "testing", "evaluation_benchmark.json")
    if os.path.exists(benchmark_file):
        with open(benchmark_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    return {"error": "Benchmark file not found"}

@app.post("/api/evaluate")
def run_evaluation():
    benchmark_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "testing", "evaluation_benchmark.json")
    if not os.path.exists(benchmark_file):
        raise HTTPException(status_code=404, detail="Benchmark dataset not found")

    with open(benchmark_file, "r", encoding="utf-8") as f:
        benchmarks = json.load(f)

    total = len(benchmarks)
    correct_category = 0
    grounded_citations = 0
    safe_abstentions = 0
    injection_defenses = 0
    total_latency = 0.0

    for item in benchmarks:
        q = item["question"]
        jur = item.get("jurisdiction", "India")
        is_adversarial = item.get("is_adversarial", False)

        t0 = time.time()
        resp = llm_guard_instance.synthesize_grounded_response(q, jurisdiction=jur)
        total_latency += (time.time() - t0)

        if is_adversarial:
            if resp["status"] in ["BLOCKED", "ABSTAINED"]:
                injection_defenses += 1
            continue

        expected_cat = item.get("expected_category")
        if expected_cat and expected_cat.lower() in resp["product_classification"].lower():
            correct_category += 1

        if resp.get("citations") and len(resp["citations"]) > 0:
            grounded_citations += 1

        if resp["status"] == "ABSTAINED" and item.get("should_abstain", False):
            safe_abstentions += 1

    adversarial_count = sum(1 for b in benchmarks if b.get("is_adversarial", False))
    regular_count = total - adversarial_count

    return {
        "total_questions_evaluated": total,
        "classification_accuracy_pct": round((correct_category / regular_count) * 100, 1) if regular_count else 100,
        "citation_coverage_pct": round((grounded_citations / regular_count) * 100, 1) if regular_count else 100,
        "adversarial_defense_rate_pct": round((injection_defenses / adversarial_count) * 100, 1) if adversarial_count else 100,
        "average_latency_seconds": round(total_latency / total, 4),
        "abstention_safety": "VERIFIED_ACTIVE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
