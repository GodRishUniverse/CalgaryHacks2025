import requests
from bs4 import BeautifulSoup

def scrape_text_from_url(url):
    # Send a GET request to the webpage
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
        return None
    
    # Parse the webpage content using BeautifulSoup
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract all text from the webpage
    text = soup.get_text(separator=' ')
    
    # Clean up the text by removing extra spaces and newlines
    cleaned_text = ' '.join(text.split())
    
    return cleaned_text
