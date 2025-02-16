import json
import os
from pathlib import Path
from langchain.schema import StrOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence
from langchain_openai import ChatOpenAI
from langchain_google_community import GoogleSearchAPIWrapper
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from app.util.web_scrape import format_search_query
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

# pip install langchain-community chromadb

load_dotenv()

VECTOR_DB_DIR = Path("./chroma_db").resolve()  # Vector DB settings

MAX_SEARCH_RESULTS = 3

KEYWORD_TEMPLATE = """Identify 5-7 specific keywords or topics from this wildlife conservation project text and only the project text that would help find relevant scientific papers or conservation reports.

Focus on extracting keywords from these categories:
- Species names (e.g., "Panthera tigris", "sea turtles")
- Conservation techniques (e.g., "captive breeding", "habitat restoration")
- Geographic locations (e.g., "Amazon Rainforest", "Great Barrier Reef")
- Ecological challenges (e.g., "deforestation", "climate change impact")

**Insufficiency Check**: 
If the text lacks **at least two distinct categories from the list above**, return **'insufficient'** instead of extracting keywords. Generally, a text is insufficient if it is short (a few sentences) or lacks specific conservation details.

**Output Format:**  
Return ONLY a comma-separated list, no commentary. If insufficient, return `'insufficient'`.

---

**Example of Sufficient Input:**
*"The snow leopard (Panthera uncia) faces habitat loss in the Himalayas due to deforestation and climate change. Conservationists are implementing anti-poaching patrols and habitat restoration projects."*
**Output:**  
`Panthera uncia, Himalayas, habitat loss, climate change, anti-poaching patrols, habitat restoration`

---

**Example of Insufficient Input:**
*"Polar bears are endangered due to climate change."*  
**Output:**  
`insufficient`

---

This is the Project Text to evaluate:  
{project_text}

{format_instructions}"""

SCORING_TEMPLATE = """Analyze this wildlife conservation project and recent conservation data. 
Generate a success score (0-100) considering:

**Project Details:**
{project_text}

**Recent Relevant Data:**
{search_results}

Use these criteria:
1. Alignment with latest conservation science (0-25)
2. Community impact (0-20) 
3. Biodiversity outcomes (0-30)
4. Sustainability (0-15)
5. Replicability (0-10)

Return ONLY a JSON object with 'score_breakdown' and 'final_score'. No commentary."""

keyword_parser = CommaSeparatedListOutputParser()

keyword_prompt = PromptTemplate(
    template=KEYWORD_TEMPLATE,
    input_variables=["project_text"],
    partial_variables={"format_instructions": keyword_parser.get_format_instructions()},
)

keyword_chain = RunnableSequence(
    keyword_prompt | ChatOpenAI(temperature=0.2, model="gpt-4o-mini") | keyword_parser
)

# Setup for vector database
embeddings = OpenAIEmbeddings()


# Initialize or load the vector database
def get_vectorstore():
    if os.path.exists(VECTOR_DB_DIR):
        return Chroma(persist_directory=VECTOR_DB_DIR, embedding_function=embeddings)
    else:
        # Create an empty database if it doesn't exist
        db = Chroma(persist_directory=VECTOR_DB_DIR, embedding_function=embeddings)
        db.persist()
        return db


# Function to add new documents to the vector database
def add_to_vectorstore(texts, metadatas=None):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_splitter.create_documents(texts, metadatas)

    db = get_vectorstore()
    db.add_documents(docs)
    db.persist()


search = GoogleSearchAPIWrapper()

scoring_prompt = PromptTemplate.from_template(SCORING_TEMPLATE)

scoring_chain = (
    {
        "project_text": lambda x: x["project_text"],
        "search_results": lambda x: x["search_results"],
    }
    | scoring_prompt
    | ChatOpenAI(
        temperature=0.2,
        model="gpt-4o-mini",
        model_kwargs={"response_format": {"type": "json_object"}},
    )
    | StrOutputParser()
)


# Function to query vector database
def query_vectorstore(query, n_results=3):
    db = get_vectorstore()
    docs = db.similarity_search(query, k=n_results)
    return [doc.page_content for doc in docs]


# Fallback to web search if vector DB doesn't have enough relevant info
def search_conservation_data(keywords):
    query = f"wildlife conservation recent data {', '.join(keywords)}"
    return search.results(query, MAX_SEARCH_RESULTS)


def search_conservation_data(keywords):
    query = f"wildlife conservation recent data {', '.join(keywords)}"
    return search.results(query, MAX_SEARCH_RESULTS)


def full_pipeline(project_text):
    words = project_text.split()
    project_text = " ".join(words[:400])
    keywords = keyword_chain.invoke({"project_text": project_text})

    if "insufficient" in keywords:
        return {"final_score": 0, "score_breakdown": {}}

    # First try to get results from vector database
    db_query = f"wildlife conservation {', '.join(keywords)}"
    db_results = query_vectorstore(db_query)

    # If not enough results from DB, fall back to web search
    if len(db_results) < 2:
        search_results = search_conservation_data(keywords)
        formatted_results = format_search_query(search_results)

        # Add these web results to our vector database for future use
        if formatted_results:
            add_to_vectorstore([formatted_results])

        db_results = formatted_results
    else:
        db_results = "\n\n".join(db_results)

    score_response = scoring_chain.invoke(
        {
            "project_text": project_text,
            "search_results": db_results,
        }
    )

    try:
        return json.loads(score_response)
    except json.JSONDecodeError:
        return {"error": "Failed to parse response"}
