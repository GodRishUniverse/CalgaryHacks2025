import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.util.pipeline import query_vectorstore, full_pipeline
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

CHAT_TEMPLATE = """You are an expert in wildlife conservation. Use the following context to answer questions about the following wildlife conservation project proposal:

Context from database:
{context}

Project proposal description:
{project_text}

User question: {question}

Answer the question based on the context. If you cannot find the answer in the context, say so clearly."""


def chat_interface():
    print("Wildlife Conservation Project Chat Interface")
    print("==========================================")
    print(
        "You can:\n1. Ask questions about the project\n2. Type 'analyze' to get a project score\n3. Type 'quit' to exit"
    )

    chat = ChatOpenAI(temperature=0.2)
    prompt = PromptTemplate(
        template=CHAT_TEMPLATE, input_variables=["context", "question"]
    )

    while True:
        print("\nEnter your question:")
        question = input().strip()

        if question.lower() == "quit":
            break

        if question.lower() == "analyze":
            print("\nEnter project description for analysis:")
            project_text = input()
            try:
                result = full_pipeline(project_text)
                if "error" in result:
                    print(f"Error: {result['error']}")
                else:
                    print("\nAnalysis Results:")
                    print(f"Final Score: {result['final_score']}")
                    print("\nScore Breakdown:")
                    for category, score in result["score_breakdown"].items():
                        print(f"{category}: {score}")
            except Exception as e:
                print(f"An error occurred during analysis: {str(e)}")
            continue

        try:
            # Query the vector database for relevant context
            context = query_vectorstore(question)
            context_text = "\n".join(context)

            # Generate response using the LLM
            response = chat.invoke(
                prompt.format(context=context_text, question=question)
            )

            print("\nResponse:", response.content)

        except Exception as e:
            print(f"An error occurred: {str(e)}")


if __name__ == "__main__":
    chat_interface()
