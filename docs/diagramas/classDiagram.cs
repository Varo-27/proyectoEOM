classDiagram
    direction TB

    %% ── Dominio: núcleo ──
    class User {
        +UUID id
        +str email
        +str hashed_password
        +bool is_active
        +bool is_superuser
        +str color_theme
        +str appearance_mode
    }

    class Article {
        +int id
        +str url
        +str title
        +str excerpt
        +datetime date
        +bool paywalled
    }

    class Embedding {
        +int id
        +str entity_type
        +int entity_id
        +Vector~1024~ vector
    }

    %% ── Taxonomía ──
    class Author {
        +int id
        +str name
    }
    class Category {
        +int id
        +str name
        +str slug
    }
    class Place {
        +int id
        +str name
        +str slug
    }
    class Tag {
        +int id
        +str name
    }
    class Topic {
        +int id
        +str name
    }

    %% ── Tablas puente M:N ──
    class ArticleAuthor {
        +int article_id
        +int author_id
    }
    class ArticleCategory {
        +int article_id
        +int category_id
    }
    class ArticlePlace {
        +int article_id
        +int place_id
    }
    class ArticleTag {
        +int article_id
        +int tag_id
    }
    class ArticleTopic {
        +int article_id
        +int topic_id
    }
    class TopicHierarchy {
        +int parent_topic_id
        +int child_topic_id
    }

    %% ── Engagement por usuario ──
    class Favorite {
        +int id
        +UUID user_id
        +int article_id
    }
    class Rating {
        +int id
        +UUID user_id
        +int article_id
        +int value
    }
    class Comment {
        +int id
        +UUID user_id
        +int article_id
        +str content
    }
    class Note {
        +int id
        +UUID user_id
        +int article_id
        +str content
    }
    class Follow {
        +int id
        +UUID user_id
        +str target_type
        +int target_id
    }
    class CommentReport {
        +int comment_id
        +UUID reporter_user_id
    }

    %% ── Workspace ──
    class Workspace {
        +UUID id
        +UUID user_id
        +str name
        +JSON graph
        +int schema_version
    }
    class UserWorkspaceState {
        +UUID user_id
        +UUID active_workspace_id
    }

    %% ── Servicios (capa aplicación) ──
    class AuthService {
        +authenticate(email, password) User
    }
    class UserService {
        +create_user()
        +update_user()
    }
    class SearchService {
        +search_articles()
    }
    class GraphService {
        +expand_graph()
    }
    class RankingVectorService {
        +build_search_ranking_vector()
        +build_expand_ranking_vector()
    }
    class FilterService {
        +apply_metadata_filters()
    }
    class EngagementService {
        +get_article_detail()
        +list_favorites()
        +toggle_favorite()
        +upsert_rating()
        +list_comments()
        +get_article_note()
        +set_follow()
    }
    class WorkspaceService {
        +list_workspaces()
        +sync_workspaces()
        +create/update/delete_workspace()
    }

    %% ── DTOs (agrupados) ──
    class SearchSchemas {
        ArticleSearchResult
        SearchResponse
        ArticleMetadataFilters
    }
    class GraphSchemas {
        ExpandRequest
        ExpandResponse
        GraphNode
        GraphEdge
    }
    class EngagementSchemas {
        ArticleDetailPublic
        FavoriteArticlePublic
        CommentPublic
        RatingSummaryPublic
    }
    class WorkspaceSchemas {
        WorkspacePublic
        WorkspaceGraphSnapshotPublic
        WorkspaceSyncResponse
    }
    class StatsSchemas {
        HeatmapResponse
        PlacePreviewResponse
    }

    %% ── API (FastAPI routers) ──
    class ApiRoutes {
        login / users
        search / graph
        articles / favorites / follows / ratings
        workspaces / stats / taxonomy
    }

    %% Relaciones dominio
    User "1" --> "*" Favorite
    User "1" --> "*" Rating
    User "1" --> "*" Comment
    User "1" --> "*" Note
    User "1" --> "*" Follow
    User "1" --> "*" Workspace
    User "1" --> "1" UserWorkspaceState

    Article "1" --> "*" Favorite
    Article "1" --> "*" Rating
    Article "1" --> "*" Comment
    Article "1" --> "*" Note

    Article "1" --> "*" ArticleAuthor
    Author "1" --> "*" ArticleAuthor
    Article "1" --> "*" ArticleCategory
    Category "1" --> "*" ArticleCategory
    Article "1" --> "*" ArticlePlace
    Place "1" --> "*" ArticlePlace
    Article "1" --> "*" ArticleTag
    Tag "1" --> "*" ArticleTag
    Article "1" --> "*" ArticleTopic
    Topic "1" --> "*" ArticleTopic
    Topic "1" --> "*" TopicHierarchy
    TopicHierarchy --> Topic : parent/child

    Embedding ..> Article : entity_type=article

    Comment "1" --> "*" CommentReport

    Follow ..> Author : target_type=author
    Follow ..> Category : target_type=category
    Follow ..> Place : target_type=place

    %% Servicios → dominio / utilidades
    SearchService --> RankingVectorService
    SearchService --> FilterService
    SearchService --> Article
    SearchService --> Embedding

    GraphService --> RankingVectorService
    GraphService --> FilterService
    GraphService --> Article
    GraphService --> Embedding

    FilterService --> Article
    FilterService --> Author
    FilterService --> Category
    FilterService --> Place

    EngagementService --> User
    EngagementService --> Article
    EngagementService --> Favorite
    EngagementService --> Rating
    EngagementService --> Comment
    EngagementService --> Note
    EngagementService --> Follow

    WorkspaceService --> Workspace
    WorkspaceService --> UserWorkspaceState
    WorkspaceService --> User

    AuthService --> User
    UserService --> User

    %% API → servicios / schemas
    ApiRoutes --> AuthService
    ApiRoutes --> UserService
    ApiRoutes --> SearchService
    ApiRoutes --> GraphService
    ApiRoutes --> EngagementService
    ApiRoutes --> WorkspaceService
    ApiRoutes ..> SearchSchemas
    ApiRoutes ..> GraphSchemas
    ApiRoutes ..> EngagementSchemas
    ApiRoutes ..> WorkspaceSchemas
    ApiRoutes ..> StatsSchemas
