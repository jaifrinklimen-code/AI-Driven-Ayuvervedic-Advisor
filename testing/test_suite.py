"""
Automated Backend, RAG, and PDF Test Suite for IP-SAKTI Sahayak (unittest compatible)
Runs without requiring external packages beyond FastAPI dependencies.
"""

import sys
import os
import unittest
import urllib.parse
from fastapi.testclient import TestClient

# Ensure utf-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, backend_dir)

from server import app
from engine.retriever import retriever_instance


class TestBackendAndRAG(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_root_endpoint(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "online")
        self.assertIn("endpoints", data)

    def test_02_health_and_faiss_readiness(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("rag_status"), "ready")
        self.assertTrue(data.get("faiss_ready"))
        self.assertGreater(data.get("vectorstore_index_count", 0), 1000)
        self.assertEqual(data.get("embedding_model"), "sentence-transformers/all-MiniLM-L6-v2")
        self.assertGreater(data.get("corpus_documents_loaded", 0), 0)

    def test_03_question_1_polyherbal_patentability(self):
        payload = {
            "query": "patentability of a modified Ayurvedic formulation of Ashwagandha and Curcumin",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = self.client.post("/api/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertEqual(data.get("status"), "SUCCESS")
        cls_name = data.get("product_classification", "").lower()
        self.assertTrue("polyherbal" in cls_name or "patent" in cls_name or "ashwagandha" in cls_name)
        
        answer = data.get("short_answer", "")
        self.assertGreater(len(answer), 80)
        
        citations = data.get("citations", [])
        self.assertGreaterEqual(len(citations), 1)
        for c in citations:
            self.assertTrue(c["source_url"].startswith("/data/"))
            self.assertIn("#page=", c["source_url"])

        conf = data.get("confidence", {})
        self.assertGreaterEqual(conf.get("score", 0), 55)
        self.assertFalse(conf.get("abstain_recommended"))

    def test_04_question_2_section_3p_traditional_knowledge(self):
        payload = {
            "query": "Can I patent a traditional knowledge formulation under Section 3(p)?",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = self.client.post("/api/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertIn("3(p)", data.get("product_classification", ""))
        
        answer = data.get("short_answer", "").lower()
        self.assertTrue("section 3(p)" in answer or "traditional knowledge" in answer)
        
        citations = data.get("citations", [])
        self.assertGreaterEqual(len(citations), 1)
        has_patents_act = any("patents_act" in c.get("title", "").lower() for c in citations)
        self.assertTrue(has_patents_act)

    def test_05_question_3_nba_approval_section_6(self):
        payload = {
            "query": "What are the NBA approval requirements under Section 6 of Biological Diversity Act?",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = self.client.post("/api/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertTrue("Biological" in data.get("product_classification", "") or "ABS" in data.get("product_classification", ""))
        
        answer = data.get("short_answer", "").lower()
        self.assertTrue("national biodiversity authority" in answer or "nba" in answer or "section 6" in answer or "form iii" in answer)

    def test_06_question_4_out_of_scope_wheat_breeding(self):
        payload = {
            "query": "How to perform selective breeding of wheat varieties for drought tolerance?",
            "jurisdiction": "India",
            "language": "en"
        }
        resp = self.client.post("/api/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Safe Abstention & No Fabricated Citations
        self.assertIn(data.get("status"), ["ABSTAINED", "INSUFFICIENT_EVIDENCE", "OUT_OF_SCOPE"])
        cls_name = data.get("product_classification", "")
        self.assertTrue("Out-of-Scope" in cls_name or "Plant Breeding" in cls_name)
        self.assertEqual(len(data.get("citations", [])), 0)
        self.assertTrue(data.get("confidence", {}).get("abstain_recommended"))

    def test_07_pdf_valid_serving_and_magic_bytes(self):
        resp = self.client.get("/data/patents_act_1970.pdf")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("content-type"), "application/pdf")
        self.assertEqual(resp.headers.get("accept-ranges"), "bytes")
        self.assertTrue(resp.content.startswith(b"%PDF-"))

    def test_08_pdf_with_space_in_filename(self):
        encoded = urllib.parse.quote("Patents Act 1970.pdf")
        resp = self.client.get(f"/data/{encoded}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("content-type"), "application/pdf")
        self.assertTrue(resp.content.startswith(b"%PDF-"))

    def test_09_three_distinct_real_pdfs(self):
        pdfs = [
            "patents_act_1970.pdf",
            "API-Vol-1.pdf",
            "Charaka_Samhita_by_Acharya_Charaka.pdf"
        ]
        for p in pdfs:
            resp = self.client.get(f"/data/{p}")
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.headers.get("content-type"), "application/pdf")
            self.assertTrue(resp.content.startswith(b"%PDF-"))
            self.assertGreater(len(resp.content), 1000)

    def test_10_pdf_http_range_request(self):
        resp = self.client.get("/data/patents_act_1970.pdf", headers={"Range": "bytes=0-99"})
        self.assertEqual(resp.status_code, 206)
        self.assertIn("Content-Range", resp.headers)
        self.assertTrue(resp.headers["Content-Range"].startswith("bytes 0-99/"))
        self.assertEqual(len(resp.content), 100)
        self.assertTrue(resp.content.startswith(b"%PDF-"))

    def test_11_pdf_missing_returns_404(self):
        resp = self.client.get("/data/non_existent_doc_12345.pdf")
        self.assertEqual(resp.status_code, 404)

    def test_12_pdf_invalid_extension_returns_400(self):
        resp = self.client.get("/data/server.py")
        self.assertEqual(resp.status_code, 400)

    def test_13_pdf_corrupt_signature_returns_400(self):
        resp = self.client.get("/data/fake_corrupt.pdf")
        self.assertEqual(resp.status_code, 400)

    def test_14_pdf_path_traversal_blocked(self):
        traversals = [
            "/data/..%2fserver.py",
            "/data/%2e%2e%2fserver.py",
            "/data/../server.py"
        ]
        for path in traversals:
            resp = self.client.get(path)
            self.assertIn(resp.status_code, [400, 403, 404])


if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestBackendAndRAG)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
