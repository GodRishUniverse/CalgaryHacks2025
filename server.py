import langchain as lc
from langchain.chat_models import ChatOpenAI

from langchain.document_loaders import TextLoader


class Server:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=1)    
        self.qa_chain = lc.load_qa_with_sources_chain(self.llm, chain_type="stuff")

    def answer(self, question):
        return self.qa_chain.run(input_documents=[], question=question)
