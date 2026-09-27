import urllib.request
import json
import time

backend_url = "http://127.0.0.1:8000"

print("--- 1. ROOT ENDPOINT TEST ---")
try:
    with urllib.request.urlopen(f"{backend_url}/", timeout=5) as r:
        print(f"HTTP {r.status} OK: {r.read().decode()}")
except Exception as e:
    print(f"Root endpoint failed: {e}")

print("\n--- 2. HEALTH ENDPOINT TEST ---")
try:
    with urllib.request.urlopen(f"{backend_url}/health", timeout=5) as r:
        print(f"HTTP {r.status} OK: {r.read().decode()}")
except Exception as e:
    print(f"Health endpoint failed: {e}")

print("\n--- 3. FOUR-QUESTION RAG VERIFICATION SUITE ---")
queries = [
    ("patentability of a modified Ayurvedic formulation of Ashwagandha and Curcumin", "India", "en"),
    ("Can I patent a traditional knowledge formulation under Section 3(p)?", "India", "en"),
    ("What are the NBA approval requirements under Section 6 of Biological Diversity Act?", "India", "en"),
    ("How to perform selective breeding of wheat varieties for drought tolerance?", "India", "en")
]

for idx, (q, jur, lang) in enumerate(queries, 1):
    payload = json.dumps({"query": q, "jurisdiction": jur, "language": lang}).encode("utf-8")
    req = urllib.request.Request(f"{backend_url}/api/query", data=payload, headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            lat = round(time.time() - t0, 3)
            data = json.loads(resp.read().decode("utf-8"))
            print(f"\n[QUESTION {idx}]")
            print(f"Query: {q}")
            print(f"HTTP Status: {resp.status} (Latency: {lat}s)")
            print(f"Classification: {data.get('product_classification')}")
            print(f"Status: {data.get('status')}")
            print(f"Confidence: {data.get('confidence', {}).get('score')} ({data.get('confidence', {}).get('label')})")
            print(f"Citations Count: {len(data.get('citations', []))}")
            if data.get("citations"):
                top_c = data["citations"][0]
                print(f"Top Citation: {top_c.get('title')} ({top_c.get('section')})")
            ans = data.get("short_answer", "").replace("\n", " ")
            print(f"Short Answer Excerpt: {ans[:200]}...")
    except Exception as e:
        print(f"[QUESTION {idx}] FAILED: {e}")

print("\n--- 4. PDF SERVING & ACCESS TESTS ---")
pdf_tests = [
    ("/data/patents_act_1970.pdf", 200, "Valid Reference PDF Access"),
    ("/data/missing_document.pdf", 404, "Missing PDF 404 Response"),
    ("/data/unauthorized.txt", 400, "Invalid File Type Rejection")
]

for path, expected, label in pdf_tests:
    try:
        with urllib.request.urlopen(f"{backend_url}{path}", timeout=5) as resp:
            print(f"{label} ({path}) -> HTTP {resp.status} [Expected {expected}] | Content-Type: {resp.headers.get('content-type')}")
    except urllib.error.HTTPError as e:
        print(f"{label} ({path}) -> HTTP {e.code} [Expected {expected}] | Response: {e.read().decode()}")
