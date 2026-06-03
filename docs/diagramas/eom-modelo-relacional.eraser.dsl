article {
  id int pk
  url string unique
  title string
  excerpt text
  content text
  image_url string
  date timestamp
  paywalled boolean
}

author {
  id int pk
  name string unique
  profile_url string
  bio string
}

category {
  id int pk
  name string
  slug string
  url string
  type string
}

tag {
  id int pk
  name string
  slug string
  url string
}

topic {
  id int pk
  name string
  description text
  keywords text
  size int
}

place {
  id int pk
  name string
  slug string
  url string
}

book {
  id int pk
  title string
  author string
  year int
  isbn string
  url string
}

podcast_show {
  id int pk
  title string
  description text
  rss_url string
  image_url string
}

podcast_episode {
  id int pk
  show_id int
  title string
  description text
  audio_url string
  date timestamp
  duration_seconds int
  transcript text
}

podcast_author {
  id int pk
  name string unique
  profile_url string
}

article_author {
  article_id int pk
  author_id int pk
}

article_category {
  article_id int pk
  category_id int pk
}

article_tag {
  article_id int pk
  tag_id int pk
}

article_topic {
  article_id int pk
  topic_id int pk
}

article_place {
  article_id int pk
  place_id int pk
}

article_book {
  article_id int pk
  book_id int pk
}

topic_hierarchy {
  parent_topic_id int pk
  child_topic_id int pk
  level int
}

episode_author {
  episode_id int pk
  author_id int pk
}

episode_topic {
  episode_id int pk
  topic_id int pk
}

episode_book {
  episode_id int pk
  book_id int pk
}

episode_mention_article {
  episode_id int pk
  article_id int pk
}

episode_mention_episode {
  episode_id int pk
  referenced_episode_id int pk
}

embedding {
  id int pk
  entity_type string
  entity_id int
  vector vector
}

user {
  id uuid pk
  email string unique
  hashed_password string
  is_active boolean
  is_superuser boolean
  full_name string
  created_at timestamptz
}

favorite {
  id int pk
  user_id uuid
  article_id int
  created_at timestamptz
}

rating {
  id int pk
  user_id uuid
  article_id int
  value int
  created_at timestamptz
  updated_at timestamptz
}

comment {
  id int pk
  user_id uuid
  article_id int
  content text
  status string
  created_at timestamptz
  updated_at timestamptz
}

comment_report {
  id int pk
  comment_id int
  reporter_user_id uuid
  reason text
  status string
  created_at timestamptz
}

note {
  id int pk
  user_id uuid
  article_id int
  content text
  created_at timestamptz
  updated_at timestamptz
}

follow {
  id int pk
  user_id uuid
  target_type string
  target_id int
  created_at timestamptz
}

workspace {
  id uuid pk
  user_id uuid
  name string
  snapshot json
  server_revision int
  schema_version int
  created_at timestamptz
  updated_at timestamptz
}

article_visit {
  id int pk
  user_id uuid
  workspace_id uuid
  article_id int
  visited_at timestamptz
}

exploration_step {
  id int pk
  user_id uuid
  workspace_id uuid
  step_index int
  action string
  payload json
  created_at timestamptz
}

article_author.article_id > article.id
article_author.author_id > author.id
article_category.article_id > article.id
article_category.category_id > category.id
article_tag.article_id > article.id
article_tag.tag_id > tag.id
article_topic.article_id > article.id
article_topic.topic_id > topic.id
article_place.article_id > article.id
article_place.place_id > place.id
article_book.article_id > article.id
article_book.book_id > book.id
topic_hierarchy.parent_topic_id > topic.id
topic_hierarchy.child_topic_id > topic.id
podcast_episode.show_id > podcast_show.id
episode_author.episode_id > podcast_episode.id
episode_author.author_id > podcast_author.id
episode_topic.episode_id > podcast_episode.id
episode_topic.topic_id > topic.id
episode_book.episode_id > podcast_episode.id
episode_book.book_id > book.id
episode_mention_article.episode_id > podcast_episode.id
episode_mention_article.article_id > article.id
episode_mention_episode.episode_id > podcast_episode.id
episode_mention_episode.referenced_episode_id > podcast_episode.id
favorite.user_id > user.id
favorite.article_id > article.id
rating.user_id > user.id
rating.article_id > article.id
comment.user_id > user.id
comment.article_id > article.id
comment_report.comment_id > comment.id
comment_report.reporter_user_id > user.id
note.user_id > user.id
note.article_id > article.id
follow.user_id > user.id
workspace.user_id > user.id
article_visit.user_id > user.id
article_visit.workspace_id > workspace.id
article_visit.article_id > article.id
exploration_step.user_id > user.id
exploration_step.workspace_id > workspace.id
