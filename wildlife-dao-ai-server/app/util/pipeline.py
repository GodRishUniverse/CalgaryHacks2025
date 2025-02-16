import json
from langchain.schema import StrOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence
from langchain_openai import ChatOpenAI
from langchain_google_community import GoogleSearchAPIWrapper
from langchain.output_parsers import CommaSeparatedListOutputParser
from app.util.web_scrape import format_search_query
from dotenv import load_dotenv

load_dotenv()

MAX_SEARCH_RESULTS = 3

KEYWORD_TEMPLATE = """Identify 5-7 specific keywords or topics from this wildlife conservation project text and only the project text that would help find relevant scientific papers or conservation reports.
Focus on:
- Species names
- Conservation techniques
- Geographic locations
- Ecological challenges

Return ONLY a comma-separated list, no commentary.
When you have insufficient information, enter 'insufficient'. Generally when there is insufficient information, it will not be descriptive. Make sure to analyze it using the content and the context.

Project Text:
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

search = GoogleSearchAPIWrapper()

scoring_prompt = PromptTemplate.from_template(SCORING_TEMPLATE)

scoring_chain = (
    {
        "project_text": lambda x: x["project_text"],
        "search_results": lambda x: x["search_results"],
    }
    | scoring_prompt
    | ChatOpenAI(
        temperature=0,
        model="gpt-4o-mini",
        model_kwargs={"response_format": {"type": "json_object"}},
    )
    | StrOutputParser()
)


def search_conservation_data(keywords):
    query = f"wildlife conservation recent data {', '.join(keywords)}"
    return search.results(query, MAX_SEARCH_RESULTS)


def full_pipeline(project_text):
    keywords = keyword_chain.invoke({"project_text": project_text})

    if "insufficient" in keywords:
        return {"final_score": 0, "score_breakdown": {}}

    search_results = search_conservation_data(keywords)

    score_response = scoring_chain.invoke(
        {
            "project_text": project_text,
            "search_results": format_search_query(search_results),
        }
    )

    try:
        return json.loads(score_response)
    except json.JSONDecodeError:
        return {"error": "Failed to parse response"}
