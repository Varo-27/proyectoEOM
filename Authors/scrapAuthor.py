import requests
from bs4 import BeautifulSoup
from .saveAuthor import save_author

def autor(url: str):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="lxml")
    
    name = soup.select_one("h1.page-title a.url.fn.n").get_text(strip=True)
    bio = soup.select_one("header.archive-header div p").get_text(" ", strip=True)
    save_author(name, url, bio)


def buscarAutores():
    url = "https://elordenmundial.com/author-sitemap.xml"
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="xml")


    autor("https://elordenmundial.com/author/valerii-pekar/")
    # for url in soup.find_all("url"):
    #     loc:str = url.find("loc").text
    #     autor(loc)


