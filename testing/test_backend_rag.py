"""
Automated Backend, RAG, and PDF Test Suite for IP-SAKTI Sahayak
Uses explicit assertions to test:
1. Backend health & RAG readiness (FAISS availability, vector count > 0)
2. Four distinct domain questions:
   - Polyherbal patentability (Ashwagandha + Curcumin)
   - Traditional knowledge exclusion under Section 3(p)
   - Biological Diversity Act NBA approval under Section 6
   - Out-of-scope wheat breeding (safe abstention & no fabricated citations)
3. Citation grounding & source file verification
4. PDF serving:
   - Valid PDF content-type and %PDF- signature
   - Filenames with spaces and URL encoding
   - HTTP Range requests (206 Partial Content)
   - Missing PDF (404)
   - Invalid file extension / non-PDF (400)
   - Corrupted PDF without %PDF- signature (400)
   - Path traversal attempts (400/403)
"""

import sys
import os
import urllib.parse
try:
    import pytest
except ImportError:
    pytest = None
from fastapi.testclient import TestClient

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, backend_dir)

from server import app
from engine.retriever import retriever_instance

client = TestClient(app)


class TestBackendReadiness:
    def test_root_endpoint(self):
        resp = client.get("/")
        assert resp.status_code == 200, f"Root endpoint failed: {resp.status_code}"
        data = resp.json()
        assert data.get("status") == "online"
        assert "endpoints" in data

    def test_health_and_faiss_readiness(self):
        resp = client.get("/health")
        assert resp.status_code == 200, f"Health check failed: {resp.status_code}"
        data = resp.json()
        assert data.get("status") == "ok"
        assert data.get("rag_status") == "ready", f"RAG status not ready: {data.get('rag_status')}"
        assert data.get("faiss_ready") is True, "FAISS vectorstore is not reported as ready"
        assert data.get("vectorstore_index_count", 0) > 1000, f"FAISS vector count too low: {data.get('vectorstore_index_count')}"
        assert data.get("embedding_model") == "sentence-transformers/all-MiniLM-L6-v2"
        assert data.get("corpus_documents_loaded", 0) > 0


class TestRAGFourQuestionSuite:
    def test_question_1_polyherbal_patentability(self):
        """Test Query: Patentability of modified Ayurvedic formulation of Ashwagandha and Curcumin."""
        payload = {
            "query": "patentability of a modified Ayurvedic formulation of Ashwagandha and Curcumin",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = client.post("/api/query", json=payload)
        assert resp.status_code == 200, f"Query endpoint error: {resp.status_code}"
        data = resp.json()

        # Status & Classification assertions
        assert data.get("status") == "SUCCESS", f"Expected SUCCESS, got: {data.get('status')}"
        classification = data.get("product_classification", "").lower()
        assert ("polyherbal" in classification or "patent" in classification or "ashwagandha" in classification), \
            f"Unexpected classification: {classification}"

        # Grounding assertions
        answer = data.get("short_answer", "")
        assert len(answer) > 80, "Short answer is unexpectedly brief"
        assert "Section 3(p)" in answer or "Section 3(e)" in answer or "synerg" in answer.lower()

        # Citations assertions
        citations = data.get("citations", [])
        assert len(citations) >= 1, "Expected at least 1 citation for polyherbal query"
        for c in citations:
            assert "source_url" in c
            assert c["source_url"].startswith("/data/")
            assert "#page=" in c["source_url"]

        # Confidence assertions
        conf = data.get("confidence", {})
        assert conf.get("score", 0) >= 60, f"Confidence score too low: {conf.get('score')}"
        assert conf.get("label") in ["HIGH", "MEDIUM"]
        assert conf.get("abstain_recommended") is False

    def test_question_2_section_3p_traditional_knowledge(self):
        """Test Query: Can I patent a traditional knowledge formulation under Section 3(p)?"""
        payload = {
            "query": "Can I patent a traditional knowledge formulation under Section 3(p)?",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = client.post("/api/query", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        assert data.get("status") == "SUCCESS"
        assert "3(p)" in data.get("product_classification", "")
        
        answer = data.get("short_answer", "").lower()
        assert "section 3(p)" in answer or "traditional knowledge" in answer
        assert "cannot be patented" in answer or "not patentable" in answer or "नहीं" in answer or "விலக்கு" in answer or "exclusion" in answer

        # Citation should link to patents_act_1970.pdf
        citations = data.get("citations", [])
        assert len(citations) >= 1
        found_patents_act = any("patents_act" in c.get("title", "").lower() for c in citations)
        assert found_patents_act, "Patents Act citation not found for Section 3(p) query"

    def test_question_3_nba_approval_section_6(self):
        """Test Query: What are the NBA approval requirements under Section 6 of Biological Diversity Act?"""
        payload = {
            "query": "What are the NBA approval requirements under Section 6 of Biological Diversity Act?",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = client.post("/api/query", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        assert data.get("status") == "SUCCESS"
        assert "Biological Diversity" in data.get("product_classification", "") or "ABS" in data.get("product_classification", "")
        
        answer = data.get("short_answer", "").lower()
        assert "national biodiversity authority" in answer or "nba" in answer or "section 6" in answer or "form iii" in answer

        conf = data.get("confidence", {})
        assert conf.get("score", 0) >= 50

    def test_question_4_out_of_scope_wheat_breeding(self):
        """Test Query: How to perform selective breeding of wheat varieties for drought tolerance?"""
        payload = {
            "query": "How to perform selective breeding of wheat varieties for drought tolerance?",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = client.post("/api/query", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        # MUST Abstain and NOT return false success or fabricated citations
        assert data.get("status") in ["ABSTAINED", "INSUFFICIENT_EVIDENCE", "OUT_OF_SCOPE"], \
            f"Expected abstention status for out-of-scope question, got: {data.get('status')}"
        
        classification = data.get("product_classification", "")
        assert "Out-of-Scope" in classification or "Plant Breeding" in classification

        # Should NOT fabricate Ayurvedic PDF citations for plant breeding
        citations = data.get("citations", [])
        assert len(citations) == 0, f"Expected 0 citations for out-of-scope query, got: {len(citations)}"

        # Confidence should recommend abstention
        conf = data.get("confidence", {})
        assert conf.get("abstain_recommended") is True


class TestPDFServingAndSecurity:
    def test_valid_pdf_serving(self):
        """Verify serving a valid PDF returns application/pdf and %PDF- header."""
        resp = client.get("/data/patents_act_1970.pdf")
        assert resp.status_code == 200, f"Failed to retrieve patents_act_1970.pdf: {resp.status_code}"
        assert resp.headers.get("content-type") == "application/pdf"
        assert resp.headers.get("accept-ranges") == "bytes"
        assert resp.content.startswith(b"%PDF-"), "Response does not start with valid PDF magic bytes"

    def test_pdf_with_space_in_filename(self):
        """Verify serving a PDF whose filename contains spaces with URL encoding."""
        encoded = urllib.parse.quote("Patents Act 1970.pdf")
        resp = client.get(f"/data/{encoded}")
        assert resp.status_code == 200
        assert resp.headers.get("content-type") == "application/pdf"
        assert resp.content.startswith(b"%PDF-")

    def test_three_distinct_real_pdfs(self):
        """Test serving at least three real distinct PDFs."""
        pdfs = [
            "patents_act_1970.pdf",
            "API-Vol-1.pdf",
            "Charaka_Samhita_by_Acharya_Charaka.pdf"
        ]
        for p in pdfs:
            resp = client.get(f"/data/{p}")
            assert resp.status_code == 200, f"Failed on {p}"
            assert resp.headers.get("content-type") == "application/pdf"
            assert resp.content.startswith(b"%PDF-")
            assert len(resp.content) > 1000

    def test_http_range_request(self):
        """Verify HTTP Range requests return 206 Partial Content with correct byte slice."""
        headers = {"Range": "bytes=0-99"}
        resp = client.get("/data/patents_act_1970.pdf", headers=headers)
        assert resp.status_code == 206, f"Expected 206 Partial Content, got: {resp.status_code}"
        assert "Content-Range" in resp.headers
        assert resp.headers["Content-Range"].startswith("bytes 0-99/")
        assert len(resp.content) == 100
        assert resp.content.startswith(b"%PDF-")

    def test_missing_pdf_returns_404(self):
        resp = client.get("/data/non_existent_document_12345.pdf")
        assert resp.status_code == 404

    def test_invalid_extension_returns_400(self):
        resp = client.get("/data/server.py")
        assert resp.status_code == 400

    def test_corrupted_fake_pdf_returns_400(self):
        resp = client.get("/data/fake_corrupt.pdf")
        assert resp.status_code == 400

    def test_path_traversal_protection(self):
        traversals = [
            "/data/..%2f..%2frequirements.txt",
            "/data/..%5c..%5cserver.py",
            "/data/%2e%2e%2fserver.py",
            "/data/../server.py"
        ]
        for path in traversals:
            resp = client.get(path)
            assert resp.status_code in [400, 403, 404], f"Traversal not blocked on {path}: {resp.status_code}"


if __name__ == "__main__":
    test_classes = [TestBackendReadiness, TestRAGFourQuestionSuite, TestPDFServingAndSecurity]
    total_passed = 0
    total_failed = 0
    for cls in test_classes:
        instance = cls()
        for attr in dir(instance):
            if attr.startswith("test_"):
                test_func = getattr(instance, attr)
                try:
                    test_func()
                    print(f"  [PASS] {cls.__name__}.{attr}")
                    total_passed += 1
                except Exception as e:
                    print(f"  [FAIL] {cls.__name__}.{attr}: {e}")
                    total_failed += 1

    print(f"\nResults: {total_passed} Passed, {total_failed} Failed.")
    sys.exit(0 if total_failed == 0 else 1)

