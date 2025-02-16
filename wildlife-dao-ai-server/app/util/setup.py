from langchain_chroma import Chroma
from app.util.pipeline import VECTOR_DB_DIR, embeddings
from pathlib import Path


def setup_vector_chroma_database():
    path = Path(VECTOR_DB_DIR)
    if path.exists():
        print("✅ Vector database already exists.")
        return
    # Initialize ChromaDB
    Chroma(persist_directory=VECTOR_DB_DIR, embedding_function=embeddings)
    print("✅ Initialized vector database.")
