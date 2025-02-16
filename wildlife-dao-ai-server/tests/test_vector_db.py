import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.util.pipeline import add_to_vectorstore, query_vectorstore, get_vectorstore
from dotenv import load_dotenv

load_dotenv()

def test_vector_db():
    # 1. Sample conservation documents to populate the database
    sample_docs = [
        """The Bengal Tiger Conservation Project in Sundarbans focuses on anti-poaching measures 
        and habitat preservation. Recent efforts have shown a 15% increase in tiger population.""",
        
        """Great Barrier Reef restoration project implements coral gardening techniques 
        and reduces agricultural runoff to improve water quality.""",
        
        """Amazon Rainforest conservation initiative works with indigenous communities 
        to prevent deforestation and establish sustainable farming practices."""
    ]

    # 2. Add documents to vector database
    print("Adding documents to vector database...")
    add_to_vectorstore(sample_docs)

    # 3. Test queries
    test_queries = [
        "tiger conservation in Sundarbans",
        "coral reef restoration",
        "rainforest protection"
    ]

    # 4. Query and display results
    for query in test_queries:
        print(f"\nQuery: {query}")
        results = query_vectorstore(query, n_results=2)
        for i, result in enumerate(results, 1):
            print(f"\nResult {i}:")
            print(result)

if __name__ == "__main__":
    test_vector_db()
