import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

test_queries = [
    "Can I use ayurvedha",
    "What is Ayurveda?",
    "What is an Ayurvedic formulation?",
    "Can I sell an Ayurvedic medicine?",
    "Can I patent a traditional Ayurvedic formulation in India?",
    "Can a mere admixture of known substances be patented in India?",
    "Can I patent a novel combination of Ashwagandha and Brahmi?",
    "What is Ashwagandha?",
    "What is TKDL?",
    "What is traditional knowledge?",
    "Do I need biodiversity approval for an Ayurvedic product?",
    "Can I patent this internationally?",
    "What is a classical Ayurvedic formulation?",
    "What is a proprietary Ayurvedic medicine?",
    "How do I protect my Ayurvedic brand?",
    "Can I use this traditional formulation commercially?"
]

def run_tests():
    print("======================================================================")
    print("       16-QUERY END-TO-END VALIDATION TEST MATRIX")
    print("======================================================================")
    for idx, q in enumerate(test_queries, 1):
        data = json.dumps({"query": q, "jurisdiction": "India", "language": "en"}).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/api/query",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode())
            print(f"\n--- [TEST {idx}/16] ---")
            print(f"QUERY           : {q}")
            print(f"CLASSIFICATION  : {res.get('product_classification')}")
            print(f"CONFIDENCE      : {res.get('confidence', {}).get('score')}% ({res.get('confidence', {}).get('label')})")
            print(f"SHORT ANSWER    :\n{res.get('short_answer')}")
            print(f"CITATIONS ({len(res.get('citations', []))} returned):")
            for c in res.get("citations", []):
                stat = c.get("verification_status")
                sup = c.get("supports_claim")
                print(f"  • [{c.get('citation_index')}] {c.get('title')} (Section: {c.get('section')}) -> {stat} (supports_claim={sup})")

if __name__ == "__main__":
    run_tests()
