import requests
from bs4 import BeautifulSoup
from io import BytesIO
from PyPDF2 import PdfReader
import time

def get_links(data):
    links = []
    for item in data:
        links.append(item['link'])
    return links

def scrape_text_from_url(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

    if url.endswith('.pdf') or url.endswith('.jpg') or url.endswith('.png') or url.endswith('.jpeg'):
        try:
            pdf_file = BytesIO(response.content)
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            print(f"Error processing PDF: {e}")
            return None
    else:
        try:
            soup = BeautifulSoup(response.content, 'html.parser')
            text = soup.get_text(separator=' ')
            cleaned_text = ' '.join(text.split())
            return cleaned_text
        except Exception as e:
            print(f"Error processing HTML: {e}")
            return None

if __name__ == "__main__":
    data = [
        {'title': 'OREGON WOLF CONSERVATION AND MANAGEMENT PLAN', 'link': 'https://www.dfw.state.or.us/Wolves/docs/2019_Oregon_Wolf_Plan.pdf', 'snippet': 'Jun 7, 2019 ... Develop an effective workload sharing program with the U.S. Fish and Wildlife Service. (USFWS) to monitor expanding wolf populations and address\xa0...'},
        {'title': 'Restoring historical moose densities results in fewer wolves killed ...', 'link': 'https://wildlife.onlinelibrary.wiley.com/doi/10.1002/jwmg.22673', 'snippet': 'Oct 23, 2024 ... Habitat alteration is causing woodland caribou populations to decline owing to increased predation by wolves, which benefit from the\xa0...'},
        {'title': 'Caribou recovery actions - Province of British Columbia', 'link': 'https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/wildlife/wildlife-conservation/caribou/management-activities', 'snippet': 'Jun 24, 2024 ... Caribou habitat recovery actions; Caribou population recovery actions; Caribou glossary. Monitoring and research. The B.C. government relies on\xa0...'}
    ]

    links = get_links(data)
    for link in links:
        print(scrape_text_from_url(link))
        time.sleep(2)  # Add a delay to avoid overwhelming the server


