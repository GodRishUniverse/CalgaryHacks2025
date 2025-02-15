import os
from typing import List, Union
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import TextLoader, PyPDFLoader, CSVLoader
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document

class Server:
    def __init__(self, openai_api_key=None):
        # Use provided API key or get from environment
        if openai_api_key:
            os.environ["OPENAI_API_KEY"] = openai_api_key
        
        # Initialize the language model
        self.llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.7)
        
        # Initialize embeddings model
        self.embeddings = OpenAIEmbeddings()
        
        # Text splitter for large documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
    
    def load_documents(self, file_paths: List[str]) -> List[Document]:
        """Load multiple documents from different file paths."""
        all_docs = []
        
        for file_path in file_paths:
            ext = file_path.split(".")[-1].lower()
            
            try:
                if ext == "txt":
                    loader = TextLoader(file_path)
                    docs = loader.load()
                elif ext == "pdf":
                    loader = PyPDFLoader(file_path)
                    docs = loader.load()
                elif ext == "csv":
                    loader = CSVLoader(file_path)
                    docs = loader.load()
                else:
                    print(f"Unsupported file extension: {ext} for file {file_path}")
                    continue
                
                all_docs.extend(docs)
            except Exception as e:
                print(f"Error loading {file_path}: {str(e)}")
        
        # Split documents if they're too large
        if all_docs:
            all_docs = self.text_splitter.split_documents(all_docs)
        
        return all_docs
    
    def answer(self, question: str, file_paths: Union[str, List[str]]):
        """Answer a question based on the provided documents."""
        # Handle single file path
        if isinstance(file_paths, str):
            file_paths = [file_paths]
        
        # Load and process documents
        documents = self.load_documents(file_paths)
        
        if not documents:
            return "No valid documents were loaded."
        
        # Create vector store from documents
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        
        # Create retrieval QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=vectorstore.as_retriever(),
            return_source_documents=True
        )
        
        # Get answer
        result = qa_chain({"query": question})
        
        # Extract the answer and source documents
        answer = result["result"]
        source_docs = result.get("source_documents", [])
        
        # Format the response with sources
        response = f"Answer: {answer}\n\nSources:"
        for i, doc in enumerate(source_docs, 1):
            source = doc.metadata.get("source", "Unknown source")
            page = doc.metadata.get("page", "")
            page_info = f" (page {page})" if page else ""
            response += f"\n{i}. {source}{page_info}"
        
        return response

# Example usage
if __name__ == "__main__":
    server = Server()
    answer = server.answer(
        question="What is the main topic?",
        file_paths=["document1.txt", "document2.pdf"]
    )
    print(answer)
