import requests
from bs4 import BeautifulSoup
from io import BytesIO
from PyPDF2 import PdfReader
import time

MAX_WORDS = 500


def get_links(data):
    links = []
    for item in data:
        links.append(item["link"])
    return links


def scrape_text_from_url(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

    if (
        url.endswith(".pdf")
        or url.endswith(".jpg")
        or url.endswith(".png")
        or url.endswith(".jpeg")
    ):
        try:
            pdf_file = BytesIO(response.content)
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return [" ".join(text.split()[:MAX_WORDS])]
        except Exception as e:
            print(f"Error processing PDF: {e}")
            return None
    else:
        try:
            soup = BeautifulSoup(response.content, "html.parser")
            text = soup.get_text(separator=" ")
            cleaned_text = " ".join(text.split())
            return cleaned_text
        except Exception as e:
            print(f"Error processing HTML: {e}")
            return None


def format_search_data(results):
    return "\n".join([f"- {res['title']}: {res['snippet']}" for res in results])


def format_search_query(data):
    results = []
    for item in data:
        link = item["link"]
        scraped_text = scrape_text_from_url(link)
        if scraped_text:
            # Add the scraped text to the snippet field
            item["snippet"] = scraped_text
            results.append(item)
        time.sleep(0.1)
    return format_search_data(results)
