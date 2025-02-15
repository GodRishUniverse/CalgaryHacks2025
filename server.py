import langchain as lc
from langchain.chat_models import ChatOpenAI

from langchain.document_loaders import TextLoader, PyPDFLoader, CSVLoader


class Server:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=1)    
        self.qa_chain = lc.load_qa_with_sources_chain(self.llm, chain_type="stuff")

    def answer(self, question, documents):

        doc_list = []
        for doc in documents:
            ext = doc.split(".")[-1]
            if ext == "txt":
                text_loader = TextLoader(documents)
                text_docs = text_loader.load()
                doc_list.append(text_docs)
            elif ext == "pdf":
                pdf_loader = PyPDFLoader(documents)
                pdf_docs = pdf_loader.load()
                doc_list.append(pdf_docs)
            elif ext == "csv":
                csv_loader = CSVLoader(documents)
                csv_docs = csv_loader.load()
                doc_list.append(csv_docs)

           
        return self.qa_chain.run(input_documents=doc_list, question=question)
