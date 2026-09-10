import os
import glob
import time
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data')
DB_FAISS_PATH = os.path.join(BASE_DIR, 'vectorstore', 'db_faiss')

def create_vector_db():
    print(f"Starting ingestion from: {DATA_PATH}", flush=True)
    pdf_files = sorted(glob.glob(os.path.join(DATA_PATH, "*.pdf")))
    print(f"Found {len(pdf_files)} PDF files in {DATA_PATH}", flush=True)
    if not pdf_files:
        raise FileNotFoundError(f"No PDF files found in {DATA_PATH}")

    all_documents = []
    total_pages = 0
    t0 = time.time()

    for i, pdf_path in enumerate(pdf_files, 1):
        filename = os.path.basename(pdf_path)
        try:
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            total_pages += len(docs)
            for d in docs:
                d.metadata["source"] = filename
                d.metadata["file_name"] = filename
                # Ensure page is preserved
                if "page" not in d.metadata:
                    d.metadata["page"] = 0
            all_documents.extend(docs)
            print(f"[{i}/{len(pdf_files)}] Loaded {filename}: {len(docs)} pages", flush=True)
        except Exception as e:
            print(f"[{i}/{len(pdf_files)}] Error loading {filename}: {e}", flush=True)

    print(f"\nTotal pages loaded: {total_pages} across {len(pdf_files)} PDFs", flush=True)
    print(f"Loading took {round(time.time() - t0, 2)}s", flush=True)

    print("Splitting documents into chunks (chunk_size=500, chunk_overlap=50)...", flush=True)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_documents(all_documents)
    print(f"Generated {len(texts)} chunks.", flush=True)

    print("Initializing HuggingFace embeddings (sentence-transformers/all-MiniLM-L6-v2)...", flush=True)
    embeddings = HuggingFaceEmbeddings(
        model_name='sentence-transformers/all-MiniLM-L6-v2',
        model_kwargs={'device': 'cpu'}
    )

    print("Building FAISS index (this may take a couple of minutes)...", flush=True)
    t1 = time.time()
    db = FAISS.from_documents(texts, embeddings)
    print(f"FAISS indexing complete in {round(time.time() - t1, 2)}s.", flush=True)

    os.makedirs(DB_FAISS_PATH, exist_ok=True)
    db.save_local(DB_FAISS_PATH)
    print(f"FAISS index successfully saved to: {DB_FAISS_PATH}", flush=True)
    print(f"Total entries in FAISS index: {db.index.ntotal}", flush=True)

if __name__ == "__main__":
    create_vector_db()
