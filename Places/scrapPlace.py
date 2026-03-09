import requests
from bs4 import BeautifulSoup
from .savePlace import save_place

def category(url: str):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="lxml")
    
    name = soup.select_one("h1.page-title").get_text(strip=True)
    slug = url.removeprefix("https://elordenmundial.com/").removesuffix("/")
    print(url, "  |  ", name, "  |  ", slug, "  |  ",)
    save_place(name, slug, url)



def searchPlaces():
    url = "https://elordenmundial.com/lugar-sitemap.xml"
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="xml")



    for url in soup.find_all("url"):
        loc:str = url.find("loc").text
        category(loc)


