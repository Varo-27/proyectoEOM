import requests
from bs4 import BeautifulSoup
from .saveTag import save_tags_bulk
from utils import get_headers

URLS = ["https://elordenmundial.com/post_tag-sitemap.xml", "https://elordenmundial.com/post_tag-sitemap2.xml", "https://elordenmundial.com/post_tag-sitemap3.xml", "https://elordenmundial.com/post_tag-sitemap4.xml"]

def parse_tag(url: str) -> dict:
    splitted_name = url.removeprefix("https://elordenmundial.com/tag/").removesuffix("/").split("-")
    name = " ".join(splitted_name).title()
    slug = url.removeprefix("https://elordenmundial.com/").removesuffix("/")
    return {"name": name, "slug": slug, "url": url}


def searchTags():
    for url in URLS:

        resp = requests.get(url, headers=get_headers(), timeout=10)
        soup = BeautifulSoup(resp.text, features="xml")
        tags = [parse_tag(entry.find("loc").text) for entry in soup.find_all("url")]
        save_tags_bulk(tags)
        print(f"Guardados {len(tags)} tags de {url}")


