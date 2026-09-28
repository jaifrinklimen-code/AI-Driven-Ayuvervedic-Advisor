"""
Live Endpoint Verification Script for IP-SAKTI Sahayak
Runs assertions against live FastAPI backend at http://127.0.0.1:8000
Exits with code 0 if all tests pass, or nonzero code if any mandatory assertion fails.
"""

import sys
import os
import json
import time
import urllib.request
import urllib.error
import urllib.parse

# Ensure utf-8 stdout encoding on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
failures = 0


def log_pass(msg):
    print(f"  [PASS] {msg}")


def log_fail(msg):
    global failures
    failures += 1
    print(f"  [FAIL] {msg}")


print("=" * 80)
print(f"RUNNING LIVE ENDPOINT TEST SUITE AGAINST: {backend_url}")
print("=" * 80)

# -------------------------------------------------------------
# 1. ROOT ENDPOINT TEST
# -------------------------------------------------------------
print("\n--- 1. ROOT ENDPOINT TEST ---")
try:
    with urllib.request.urlopen(f"{backend_url}/", timeout=10) as r:
        assert r.status == 200, f"Expected HTTP 200, got {r.status}"
        data = json.loads(r.read().decode())
        assert data.get("status") == "online"
        log_pass("Root endpoint returned status 'online' and endpoint directory.")
except Exception as e:
    log_fail(f"Root endpoint failed: {e}")

# -------------------------------------------------------------
# 2. HEALTH & RAG READINESS TEST
# -------------------------------------------------------------
print("\n--- 2. HEALTH & RAG READINESS TEST ---")
try:
    with urllib.request.urlopen(f"{backend_url}/health", timeout=10) as r:
        assert r.status == 200
        data = json.loads(r.read().decode())
        assert data.get("status") == "ok", f"Status not ok: {data.get('status')}"
        assert data.get("rag_status") == "ready", f"RAG status not ready: {data.get('rag_status')}"
        assert data.get("faiss_ready") is True, "FAISS vectorstore is not ready"
        assert data.get("vectorstore_index_count", 0) > 1000, f"FAISS vector count: {data.get('vectorstore_index_count')}"
        log_pass(f"Health verified: RAG ready ({data.get('vectorstore_index_count')} vectors, model: {data.get('embedding_model')}).")
except Exception as e:
    log_fail(f"Health endpoint failed: {e}")

# -------------------------------------------------------------
# 3. FOUR-QUESTION RAG VERIFICATION SUITE
# -------------------------------------------------------------
print("\n--- 3. FOUR-QUESTION RAG VERIFICATION SUITE ---")
queries = [
    (
        "patentability of a modified Ayurvedic formulation of Ashwagandha and Curcumin",
        "India",
        "en",
        lambda d: (
            d.get("status") == "SUCCESS" and
            ("polyherbal" in d.get("product_classification", "").lower() or "patent" in d.get("product_classification", "").lower() or "ashwagandha" in d.get("product_classification", "").lower()) and
            len(d.get("citations", [])) >= 1 and
            d.get("confidence", {}).get("score", 0) >= 55
        ),
        "Polyherbal Patentability (Ashwagandha + Curcumin)"
    ),
    (
        "Can I patent a traditional knowledge formulation under Section 3(p)?",
        "India",
        "en",
        lambda d: (
            d.get("status") == "SUCCESS" and
            "3(p)" in d.get("product_classification", "") and
            len(d.get("citations", [])) >= 1 and
            any("patents_act" in c.get("title", "").lower() for c in d.get("citations", []))
        ),
        "Traditional Knowledge Exclusion (Section 3(p))"
    ),
    (
        "What are the NBA approval requirements under Section 6 of Biological Diversity Act?",
        "India",
        "en",
        lambda d: (
            d.get("status") == "SUCCESS" and
            ("Biological" in d.get("product_classification", "") or "ABS" in d.get("product_classification", "")) and
            ("national biodiversity authority" in d.get("short_answer", "").lower() or "nba" in d.get("short_answer", "").lower() or "section 6" in d.get("short_answer", "").lower() or "form iii" in d.get("short_answer", "").lower())
        ),
        "Biological Diversity Act NBA Approval (Section 6)"
    ),
    (
        "How to perform selective breeding of wheat varieties for drought tolerance?",
        "India",
        "en",
        lambda d: (
            d.get("status") in ["ABSTAINED", "INSUFFICIENT_EVIDENCE", "OUT_OF_SCOPE"] and
            ("Out-of-Scope" in d.get("product_classification", "") or "Plant Breeding" in d.get("product_classification", "")) and
            len(d.get("citations", [])) == 0 and
            d.get("confidence", {}).get("abstain_recommended") is True
        ),
        "Out-of-Scope Wheat Breeding (Safe Abstention)"
    )
]

for idx, (q, jur, lang, validator, label) in enumerate(queries, 1):
    payload = json.dumps({"query": q, "jurisdiction": jur, "language": lang}).encode("utf-8")
    req = urllib.request.Request(f"{backend_url}/api/query", data=payload, headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            lat = round(time.time() - t0, 3)
            data = json.loads(resp.read().decode("utf-8"))
            print(f"\n[QUESTION {idx}: {label}]")
            print(f"  Query: {q}")
            print(f"  Status: {data.get('status')} | Classification: {data.get('product_classification')}")
            print(f"  Confidence: {data.get('confidence', {}).get('score')}% ({data.get('confidence', {}).get('label')})")
            print(f"  Citations: {len(data.get('citations', []))} | Latency: {lat}s")
            
            if validator(data):
                log_pass(f"Question {idx} assertions verified successfully.")
            else:
                log_fail(f"Question {idx} assertion failed! Data: status={data.get('status')}, citations={len(data.get('citations', []))}")
    except Exception as e:
        log_fail(f"Question {idx} request failed: {e}")

# -------------------------------------------------------------
# 4. PDF SERVING & SECURITY TESTS
# -------------------------------------------------------------
print("\n--- 4. PDF SERVING & SECURITY TESTS ---")

# Test 4A: Valid PDF signature and Content-Type
try:
    with urllib.request.urlopen(f"{backend_url}/data/patents_act_1970.pdf", timeout=10) as resp:
        assert resp.status == 200
        assert resp.headers.get("content-type") == "application/pdf"
        assert resp.headers.get("accept-ranges") == "bytes"
        header_bytes = resp.read(5)
        assert header_bytes == b"%PDF-", f"Invalid PDF signature: {header_bytes}"
        log_pass("Valid PDF access verified (Content-Type: application/pdf, Signature: %PDF-).")
except Exception as e:
    log_fail(f"Valid PDF test failed: {e}")

# Test 4B: PDF with space in filename
try:
    encoded_space_name = urllib.parse.quote("Patents Act 1970.pdf")
    with urllib.request.urlopen(f"{backend_url}/data/{encoded_space_name}", timeout=10) as resp:
        assert resp.status == 200
        assert resp.headers.get("content-type") == "application/pdf"
        header_bytes = resp.read(5)
        assert header_bytes == b"%PDF-"
        log_pass("PDF with space in filename served successfully with URL encoding.")
except Exception as e:
    log_fail(f"PDF with space test failed: {e}")

# Test 4C: HTTP Range Request support
try:
    range_req = urllib.request.Request(f"{backend_url}/data/patents_act_1970.pdf", headers={"Range": "bytes=0-99"})
    with urllib.request.urlopen(range_req, timeout=10) as resp:
        assert resp.status == 206, f"Expected 206 Partial Content, got {resp.status}"
        assert "Content-Range" in resp.headers
        chunk = resp.read()
        assert len(chunk) == 100
        assert chunk.startswith(b"%PDF-")
        log_pass(f"HTTP Range request verified (206 Partial Content, Content-Range: {resp.headers.get('Content-Range')}).")
except Exception as e:
    log_fail(f"Range request test failed: {e}")

# Test 4D: Missing document returns 404
try:
    urllib.request.urlopen(f"{backend_url}/data/non_existent_doc_99999.pdf", timeout=5)
    log_fail("Missing document did not return 404.")
except urllib.error.HTTPError as e:
    if e.code == 404:
        log_pass("Missing document correctly returned HTTP 404.")
    else:
        log_fail(f"Missing document returned HTTP {e.code} instead of 404.")
except Exception as e:
    log_fail(f"Missing document check failed: {e}")

# Test 4E: Invalid non-PDF file returns 400
try:
    urllib.request.urlopen(f"{backend_url}/data/server.py", timeout=5)
    log_fail("Invalid non-PDF file did not return 400.")
except urllib.error.HTTPError as e:
    if e.code == 400:
        log_pass("Invalid file type correctly rejected with HTTP 400.")
    else:
        log_fail(f"Invalid file type returned HTTP {e.code} instead of 400.")
except Exception as e:
    log_fail(f"Invalid file check failed: {e}")

# Test 4F: Corrupt non-PDF file signature returns 400
try:
    urllib.request.urlopen(f"{backend_url}/data/fake_corrupt.pdf", timeout=5)
    log_fail("Corrupt PDF file did not return 400.")
except urllib.error.HTTPError as e:
    if e.code == 400:
        log_pass("Corrupt PDF (invalid %PDF- magic bytes) rejected with HTTP 400.")
    else:
        log_fail(f"Corrupt PDF returned HTTP {e.code} instead of 400.")
except Exception as e:
    log_fail(f"Corrupt PDF check failed: {e}")

# Test 4G: Path traversal protection
traversal_paths = ["/data/..%2fserver.py", "/data/%2e%2e%2fserver.py", "/data/../server.py"]
for tp in traversal_paths:
    try:
        urllib.request.urlopen(f"{backend_url}{tp}", timeout=5)
        log_fail(f"Path traversal not blocked on {tp}")
    except urllib.error.HTTPError as e:
        if e.code in [400, 403, 404]:
            log_pass(f"Path traversal safely rejected with HTTP {e.code} on {tp}")
        else:
            log_fail(f"Unexpected status {e.code} on traversal path {tp}")
    except Exception as e:
        log_pass(f"Path traversal safely rejected on {tp} ({e})")

print("\n" + "=" * 80)
if failures == 0:
    print("ALL LIVE AUTOMATED TESTS PASSED SUCCESSFULLY! (0 Failures)")
    print("=" * 80)
    sys.exit(0)
else:
    print(f"AUTOMATED TESTS COMPLETED WITH {failures} FAILURE(S)!")
    print("=" * 80)
    sys.exit(1)
