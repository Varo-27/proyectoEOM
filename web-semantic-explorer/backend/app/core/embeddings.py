from sentence_transformers import SentenceTransformer
from functools import lru_cache
import os

class EmbeddingService:
    def __init__(self):
        # Usamos HF_HOME para mapear el volumen y no descargar el modelo cada vez
        cache_folder = os.getenv("HF_HOME", "/app/huggingface_cache")
        # Initialize model as None to handle it in lifespan
        self.model = None
        self.cache_folder = cache_folder

    def load_model(self):
        if self.model is None:
            print("Cargando modelo SentenceTransformer en memoria...")
            self.model = SentenceTransformer(
                "mixedbread-ai/mxbai-embed-large-v1",
                cache_folder=self.cache_folder,
                device="cpu", # Usaremos CPU por defecto en la API para simplificar la imagen Docker
            )
            print("Modelo cargado correctamente.")

    def embed_text(self, text: str) -> list[float]:
        return _get_cached_embedding(text)

# Instancia global para inyectar o usar en el backend
embedding_client = EmbeddingService()

# Función plana fuera de la clase para evitar cachear la instancia de la clase 'self'
@lru_cache(maxsize=1024)
def _get_cached_embedding(text: str) -> list[float]:
    if embedding_client.model is None:
        raise RuntimeError("El modelo no ha sido inicializado. Llama a load_model() en el ciclo de vida.")
    # Generar embedding y normalizar para usar distancia de coseno en pgvector
    vector = embedding_client.model.encode(text, normalize_embeddings=True)
    return vector.tolist()
