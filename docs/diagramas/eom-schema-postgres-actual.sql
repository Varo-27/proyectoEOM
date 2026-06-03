--
-- PostgreSQL database dump
--

\restrict fQ8B1npMMiQMzntTuOrrsivYRrkwzEXtdwz6Of1g5HhgBUBpf2zw6uWFnTsWpoB

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: article; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article (
    id integer NOT NULL,
    url character varying NOT NULL,
    title character varying NOT NULL,
    excerpt text,
    content text,
    image_url character varying,
    date timestamp without time zone,
    paywalled boolean DEFAULT false
);


--
-- Name: article_author; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_author (
    article_id integer NOT NULL,
    author_id integer NOT NULL
);


--
-- Name: article_book; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_book (
    article_id integer NOT NULL,
    book_id integer NOT NULL
);


--
-- Name: article_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_category (
    article_id integer NOT NULL,
    category_id integer NOT NULL
);


--
-- Name: article_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.article_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.article_id_seq OWNED BY public.article.id;


--
-- Name: article_place; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_place (
    article_id integer NOT NULL,
    place_id integer NOT NULL
);


--
-- Name: article_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_tag (
    article_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- Name: article_topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_topic (
    article_id integer NOT NULL,
    topic_id integer NOT NULL
);


--
-- Name: author; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.author (
    id integer NOT NULL,
    name character varying NOT NULL,
    profile_url character varying,
    bio character varying
);


--
-- Name: author_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.author_id_seq OWNED BY public.author.id;


--
-- Name: book; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book (
    id integer NOT NULL,
    title character varying NOT NULL,
    author character varying,
    year integer,
    isbn character varying,
    url character varying
);


--
-- Name: book_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_id_seq OWNED BY public.book.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category (
    id integer NOT NULL,
    name character varying NOT NULL,
    slug character varying,
    url character varying,
    type character varying
);


--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.category_id_seq OWNED BY public.category.id;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    article_id integer NOT NULL,
    content text NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;


--
-- Name: comment_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_report (
    id integer NOT NULL,
    comment_id integer NOT NULL,
    reporter_user_id uuid NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: comment_report_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_report_id_seq OWNED BY public.comment_report.id;


--
-- Name: embedding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.embedding (
    id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    vector public.vector(1024) NOT NULL
);


--
-- Name: embedding_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.embedding_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: embedding_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.embedding_id_seq OWNED BY public.embedding.id;


--
-- Name: episode_author; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_author (
    episode_id integer NOT NULL,
    author_id integer NOT NULL
);


--
-- Name: episode_book; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_book (
    episode_id integer NOT NULL,
    book_id integer NOT NULL
);


--
-- Name: episode_mention_article; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_mention_article (
    episode_id integer NOT NULL,
    article_id integer NOT NULL
);


--
-- Name: episode_mention_episode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_mention_episode (
    episode_id integer NOT NULL,
    referenced_episode_id integer NOT NULL
);


--
-- Name: episode_topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_topic (
    episode_id integer NOT NULL,
    topic_id integer NOT NULL
);


--
-- Name: favorite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorite (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    article_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: favorite_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorite_id_seq OWNED BY public.favorite.id;


--
-- Name: follow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.follow (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    target_type character varying(20) NOT NULL,
    target_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: follow_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.follow_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: follow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.follow_id_seq OWNED BY public.follow.id;


--
-- Name: item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.item (
    description character varying(255),
    title character varying(255) NOT NULL,
    id uuid NOT NULL,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone
);


--
-- Name: note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.note (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    article_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: note_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.note_id_seq OWNED BY public.note.id;


--
-- Name: place; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.place (
    id integer NOT NULL,
    name character varying NOT NULL,
    slug character varying,
    url character varying
);


--
-- Name: place_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.place_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: place_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.place_id_seq OWNED BY public.place.id;


--
-- Name: podcast_author; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_author (
    id integer NOT NULL,
    name character varying NOT NULL,
    profile_url character varying
);


--
-- Name: podcast_author_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.podcast_author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: podcast_author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.podcast_author_id_seq OWNED BY public.podcast_author.id;


--
-- Name: podcast_episode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_episode (
    id integer NOT NULL,
    show_id integer,
    title character varying NOT NULL,
    description text,
    audio_url character varying,
    date timestamp without time zone,
    duration_seconds integer,
    transcript text
);


--
-- Name: podcast_episode_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.podcast_episode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: podcast_episode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.podcast_episode_id_seq OWNED BY public.podcast_episode.id;


--
-- Name: podcast_show; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_show (
    id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    rss_url character varying,
    image_url character varying
);


--
-- Name: podcast_show_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.podcast_show_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: podcast_show_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.podcast_show_id_seq OWNED BY public.podcast_show.id;


--
-- Name: rating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rating (
    id integer NOT NULL,
    user_id uuid,
    article_id integer NOT NULL,
    value integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT rating_value_check CHECK (((value >= 1) AND (value <= 5)))
);


--
-- Name: rating_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rating_id_seq OWNED BY public.rating.id;


--
-- Name: tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag (
    id integer NOT NULL,
    name character varying NOT NULL,
    slug character varying,
    url character varying
);


--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tag_id_seq OWNED BY public.tag.id;


--
-- Name: topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    keywords text,
    size integer
);


--
-- Name: topic_hierarchy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_hierarchy (
    parent_topic_id integer NOT NULL,
    child_topic_id integer NOT NULL,
    level integer
);


--
-- Name: topic_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.topic_id_seq OWNED BY public.topic.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    email character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    is_superuser boolean NOT NULL,
    full_name character varying(255),
    hashed_password character varying NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone
);


--
-- Name: article id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article ALTER COLUMN id SET DEFAULT nextval('public.article_id_seq'::regclass);


--
-- Name: author id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.author ALTER COLUMN id SET DEFAULT nextval('public.author_id_seq'::regclass);


--
-- Name: book id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book ALTER COLUMN id SET DEFAULT nextval('public.book_id_seq'::regclass);


--
-- Name: category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);


--
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);


--
-- Name: comment_report id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_report ALTER COLUMN id SET DEFAULT nextval('public.comment_report_id_seq'::regclass);


--
-- Name: embedding id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.embedding ALTER COLUMN id SET DEFAULT nextval('public.embedding_id_seq'::regclass);


--
-- Name: favorite id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite ALTER COLUMN id SET DEFAULT nextval('public.favorite_id_seq'::regclass);


--
-- Name: follow id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follow ALTER COLUMN id SET DEFAULT nextval('public.follow_id_seq'::regclass);


--
-- Name: note id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note ALTER COLUMN id SET DEFAULT nextval('public.note_id_seq'::regclass);


--
-- Name: place id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.place ALTER COLUMN id SET DEFAULT nextval('public.place_id_seq'::regclass);


--
-- Name: podcast_author id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_author ALTER COLUMN id SET DEFAULT nextval('public.podcast_author_id_seq'::regclass);


--
-- Name: podcast_episode id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_episode ALTER COLUMN id SET DEFAULT nextval('public.podcast_episode_id_seq'::regclass);


--
-- Name: podcast_show id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_show ALTER COLUMN id SET DEFAULT nextval('public.podcast_show_id_seq'::regclass);


--
-- Name: rating id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating ALTER COLUMN id SET DEFAULT nextval('public.rating_id_seq'::regclass);


--
-- Name: tag id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag ALTER COLUMN id SET DEFAULT nextval('public.tag_id_seq'::regclass);


--
-- Name: topic id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic ALTER COLUMN id SET DEFAULT nextval('public.topic_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: article_author article_author_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_author
    ADD CONSTRAINT article_author_pkey PRIMARY KEY (article_id, author_id);


--
-- Name: article_book article_book_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_book
    ADD CONSTRAINT article_book_pkey PRIMARY KEY (article_id, book_id);


--
-- Name: article_category article_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_category
    ADD CONSTRAINT article_category_pkey PRIMARY KEY (article_id, category_id);


--
-- Name: article article_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article
    ADD CONSTRAINT article_pkey PRIMARY KEY (id);


--
-- Name: article_place article_place_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_place
    ADD CONSTRAINT article_place_pkey PRIMARY KEY (article_id, place_id);


--
-- Name: article_tag article_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tag
    ADD CONSTRAINT article_tag_pkey PRIMARY KEY (article_id, tag_id);


--
-- Name: article_topic article_topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_topic
    ADD CONSTRAINT article_topic_pkey PRIMARY KEY (article_id, topic_id);


--
-- Name: article article_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article
    ADD CONSTRAINT article_url_key UNIQUE (url);


--
-- Name: author author_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_name_key UNIQUE (name);


--
-- Name: author author_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_pkey PRIMARY KEY (id);


--
-- Name: author author_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_unique UNIQUE (name);


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: comment_report comment_report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_report
    ADD CONSTRAINT comment_report_pkey PRIMARY KEY (id);


--
-- Name: embedding embedding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.embedding
    ADD CONSTRAINT embedding_pkey PRIMARY KEY (id);


--
-- Name: episode_author episode_author_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_author
    ADD CONSTRAINT episode_author_pkey PRIMARY KEY (episode_id, author_id);


--
-- Name: episode_book episode_book_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_book
    ADD CONSTRAINT episode_book_pkey PRIMARY KEY (episode_id, book_id);


--
-- Name: episode_mention_article episode_mention_article_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_mention_article
    ADD CONSTRAINT episode_mention_article_pkey PRIMARY KEY (episode_id, article_id);


--
-- Name: episode_mention_episode episode_mention_episode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_mention_episode
    ADD CONSTRAINT episode_mention_episode_pkey PRIMARY KEY (episode_id, referenced_episode_id);


--
-- Name: episode_topic episode_topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_topic
    ADD CONSTRAINT episode_topic_pkey PRIMARY KEY (episode_id, topic_id);


--
-- Name: favorite favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite
    ADD CONSTRAINT favorite_pkey PRIMARY KEY (id);


--
-- Name: follow follow_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_pkey PRIMARY KEY (id);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);


--
-- Name: note note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_pkey PRIMARY KEY (id);


--
-- Name: place place_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT place_pkey PRIMARY KEY (id);


--
-- Name: podcast_author podcast_author_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_author
    ADD CONSTRAINT podcast_author_name_key UNIQUE (name);


--
-- Name: podcast_author podcast_author_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_author
    ADD CONSTRAINT podcast_author_pkey PRIMARY KEY (id);


--
-- Name: podcast_episode podcast_episode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_episode
    ADD CONSTRAINT podcast_episode_pkey PRIMARY KEY (id);


--
-- Name: podcast_show podcast_show_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_show
    ADD CONSTRAINT podcast_show_pkey PRIMARY KEY (id);


--
-- Name: rating rating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: topic_hierarchy topic_hierarchy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_hierarchy
    ADD CONSTRAINT topic_hierarchy_pkey PRIMARY KEY (parent_topic_id, child_topic_id);


--
-- Name: topic topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_pkey PRIMARY KEY (id);


--
-- Name: comment_report uq_comment_reporter; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_report
    ADD CONSTRAINT uq_comment_reporter UNIQUE (comment_id, reporter_user_id);


--
-- Name: favorite uq_favorite_user_article; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite
    ADD CONSTRAINT uq_favorite_user_article UNIQUE (user_id, article_id);


--
-- Name: follow uq_follow_user_target; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT uq_follow_user_target UNIQUE (user_id, target_type, target_id);


--
-- Name: note uq_note_user_article; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT uq_note_user_article UNIQUE (user_id, article_id);


--
-- Name: rating uq_rating_user_article; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT uq_rating_user_article UNIQUE (user_id, article_id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: idx_article_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_date ON public.article USING btree (date);


--
-- Name: idx_article_paywalled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_paywalled ON public.article USING btree (paywalled);


--
-- Name: idx_article_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_title ON public.article USING btree (title);


--
-- Name: idx_author_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_author_name ON public.author USING btree (name);


--
-- Name: idx_category_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_slug ON public.category USING btree (slug);


--
-- Name: idx_tag_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tag_slug ON public.tag USING btree (slug);


--
-- Name: idx_tag_slug_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tag_slug_1 ON public.place USING btree (slug);


--
-- Name: ix_comment_article_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comment_article_id ON public.comment USING btree (article_id);


--
-- Name: ix_comment_report_comment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comment_report_comment_id ON public.comment_report USING btree (comment_id);


--
-- Name: ix_comment_report_reporter_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comment_report_reporter_user_id ON public.comment_report USING btree (reporter_user_id);


--
-- Name: ix_comment_report_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comment_report_status ON public.comment_report USING btree (status);


--
-- Name: ix_comment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comment_status ON public.comment USING btree (status);


--
-- Name: ix_comment_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comment_user_id ON public.comment USING btree (user_id);


--
-- Name: ix_favorite_article_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_favorite_article_id ON public.favorite USING btree (article_id);


--
-- Name: ix_favorite_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_favorite_user_id ON public.favorite USING btree (user_id);


--
-- Name: ix_follow_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_follow_target ON public.follow USING btree (target_type, target_id);


--
-- Name: ix_follow_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_follow_target_id ON public.follow USING btree (target_id);


--
-- Name: ix_follow_target_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_follow_target_type ON public.follow USING btree (target_type);


--
-- Name: ix_follow_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_follow_user_id ON public.follow USING btree (user_id);


--
-- Name: ix_note_article_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_note_article_id ON public.note USING btree (article_id);


--
-- Name: ix_note_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_note_user_id ON public.note USING btree (user_id);


--
-- Name: ix_rating_article_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_rating_article_id ON public.rating USING btree (article_id);


--
-- Name: ix_rating_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_rating_user_id ON public.rating USING btree (user_id);


--
-- Name: ix_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_user_email ON public."user" USING btree (email);


--
-- Name: article_place article_place_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_place
    ADD CONSTRAINT article_place_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.article(id) ON DELETE CASCADE;


--
-- Name: article_place article_place_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_place
    ADD CONSTRAINT article_place_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.place(id) ON DELETE CASCADE;


--
-- Name: comment comment_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.article(id) ON DELETE CASCADE;


--
-- Name: comment_report comment_report_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_report
    ADD CONSTRAINT comment_report_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comment(id) ON DELETE CASCADE;


--
-- Name: comment_report comment_report_reporter_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_report
    ADD CONSTRAINT comment_report_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: comment comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: favorite favorite_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite
    ADD CONSTRAINT favorite_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.article(id) ON DELETE CASCADE;


--
-- Name: favorite favorite_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite
    ADD CONSTRAINT favorite_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: article_author fk_article_author; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_author
    ADD CONSTRAINT fk_article_author FOREIGN KEY (article_id) REFERENCES public.article(id);


--
-- Name: article_book fk_article_book; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_book
    ADD CONSTRAINT fk_article_book FOREIGN KEY (article_id) REFERENCES public.article(id);


--
-- Name: article_category fk_article_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_category
    ADD CONSTRAINT fk_article_category FOREIGN KEY (article_id) REFERENCES public.article(id);


--
-- Name: article_tag fk_article_tag; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tag
    ADD CONSTRAINT fk_article_tag FOREIGN KEY (article_id) REFERENCES public.article(id);


--
-- Name: article_topic fk_article_topic; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_topic
    ADD CONSTRAINT fk_article_topic FOREIGN KEY (article_id) REFERENCES public.article(id);


--
-- Name: article_author fk_author_article; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_author
    ADD CONSTRAINT fk_author_article FOREIGN KEY (author_id) REFERENCES public.author(id);


--
-- Name: episode_author fk_author_episode; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_author
    ADD CONSTRAINT fk_author_episode FOREIGN KEY (author_id) REFERENCES public.podcast_author(id);


--
-- Name: article_book fk_book_article; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_book
    ADD CONSTRAINT fk_book_article FOREIGN KEY (book_id) REFERENCES public.book(id);


--
-- Name: episode_book fk_book_episode; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_book
    ADD CONSTRAINT fk_book_episode FOREIGN KEY (book_id) REFERENCES public.book(id);


--
-- Name: article_category fk_category_article; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_category
    ADD CONSTRAINT fk_category_article FOREIGN KEY (category_id) REFERENCES public.category(id);


--
-- Name: topic_hierarchy fk_child_topic; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_hierarchy
    ADD CONSTRAINT fk_child_topic FOREIGN KEY (child_topic_id) REFERENCES public.topic(id) ON DELETE CASCADE;


--
-- Name: episode_author fk_episode_author; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_author
    ADD CONSTRAINT fk_episode_author FOREIGN KEY (episode_id) REFERENCES public.podcast_episode(id);


--
-- Name: episode_book fk_episode_book; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_book
    ADD CONSTRAINT fk_episode_book FOREIGN KEY (episode_id) REFERENCES public.podcast_episode(id);


--
-- Name: episode_mention_article fk_episode_mention_article; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_mention_article
    ADD CONSTRAINT fk_episode_mention_article FOREIGN KEY (episode_id) REFERENCES public.podcast_episode(id);


--
-- Name: episode_mention_episode fk_episode_mention_episode; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_mention_episode
    ADD CONSTRAINT fk_episode_mention_episode FOREIGN KEY (episode_id) REFERENCES public.podcast_episode(id);


--
-- Name: podcast_episode fk_episode_show; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_episode
    ADD CONSTRAINT fk_episode_show FOREIGN KEY (show_id) REFERENCES public.podcast_show(id);


--
-- Name: episode_topic fk_episode_topic; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_topic
    ADD CONSTRAINT fk_episode_topic FOREIGN KEY (episode_id) REFERENCES public.podcast_episode(id);


--
-- Name: episode_mention_article fk_mentioned_article; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_mention_article
    ADD CONSTRAINT fk_mentioned_article FOREIGN KEY (article_id) REFERENCES public.article(id);


--
-- Name: topic_hierarchy fk_parent_topic; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_hierarchy
    ADD CONSTRAINT fk_parent_topic FOREIGN KEY (parent_topic_id) REFERENCES public.topic(id) ON DELETE CASCADE;


--
-- Name: episode_mention_episode fk_referenced_episode; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_mention_episode
    ADD CONSTRAINT fk_referenced_episode FOREIGN KEY (referenced_episode_id) REFERENCES public.podcast_episode(id);


--
-- Name: article_tag fk_tag_article; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tag
    ADD CONSTRAINT fk_tag_article FOREIGN KEY (tag_id) REFERENCES public.tag(id);


--
-- Name: article_topic fk_topic_article; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_topic
    ADD CONSTRAINT fk_topic_article FOREIGN KEY (topic_id) REFERENCES public.topic(id);


--
-- Name: episode_topic fk_topic_episode; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_topic
    ADD CONSTRAINT fk_topic_episode FOREIGN KEY (topic_id) REFERENCES public.topic(id);


--
-- Name: follow follow_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: item item_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: note note_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.article(id) ON DELETE CASCADE;


--
-- Name: note note_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: rating rating_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.article(id) ON DELETE CASCADE;


--
-- Name: rating rating_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict fQ8B1npMMiQMzntTuOrrsivYRrkwzEXtdwz6Of1g5HhgBUBpf2zw6uWFnTsWpoB

