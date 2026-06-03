direction right
colorMode pastel
typeface clean

group g_user {
  user [shape: rectangle, label: user]
  u_email [shape: oval, label: email]
  u_hashed_password [shape: oval, label: hashed_password]
  u_is_active [shape: oval, label: is_active]
  u_is_superuser [shape: oval, label: is_superuser]
  u_full_name [shape: oval, label: full_name]
  u_created_at [shape: oval, label: created_at]
  u_email -- user
  u_hashed_password -- user
  u_is_active -- user
  u_is_superuser -- user
  u_full_name -- user
  u_created_at -- user
}

group g_article {
  article [shape: rectangle, label: article]
  a_url [shape: oval, label: url]
  a_title [shape: oval, label: title]
  a_excerpt [shape: oval, label: excerpt]
  a_content [shape: oval, label: content]
  a_image_url [shape: oval, label: image_url]
  a_date [shape: oval, label: date]
  a_paywalled [shape: oval, label: paywalled]
  a_url -- article
  a_title -- article
  a_excerpt -- article
  a_content -- article
  a_image_url -- article
  a_date -- article
  a_paywalled -- article
}

group g_author {
  author [shape: rectangle, label: author]
  au_name [shape: oval, label: name]
  au_profile_url [shape: oval, label: profile_url]
  au_bio [shape: oval, label: bio]
  au_name -- author
  au_profile_url -- author
  au_bio -- author
}

group g_category {
  category [shape: rectangle, label: category]
  c_name [shape: oval, label: name]
  c_slug [shape: oval, label: slug]
  c_url [shape: oval, label: url]
  c_type [shape: oval, label: type]
  c_name -- category
  c_slug -- category
  c_url -- category
  c_type -- category
}

group g_tag {
  tag [shape: rectangle, label: tag]
  t_name [shape: oval, label: name]
  t_slug [shape: oval, label: slug]
  t_url [shape: oval, label: url]
  t_name -- tag
  t_slug -- tag
  t_url -- tag
}

group g_topic {
  topic [shape: rectangle, label: topic]
  tp_name [shape: oval, label: name]
  tp_description [shape: oval, label: description]
  tp_keywords [shape: oval, label: keywords]
  tp_size [shape: oval, label: size]
  tp_name -- topic
  tp_description -- topic
  tp_keywords -- topic
  tp_size -- topic
}

group g_place {
  place [shape: rectangle, label: place]
  pl_name [shape: oval, label: name]
  pl_slug [shape: oval, label: slug]
  pl_url [shape: oval, label: url]
  pl_name -- place
  pl_slug -- place
  pl_url -- place
}

group g_book {
  book [shape: rectangle, label: book]
  b_title [shape: oval, label: title]
  b_author [shape: oval, label: author]
  b_year [shape: oval, label: year]
  b_isbn [shape: oval, label: isbn]
  b_url [shape: oval, label: url]
  b_title -- book
  b_author -- book
  b_year -- book
  b_isbn -- book
  b_url -- book
}

group g_podcast_show {
  podcast_show [shape: rectangle, label: podcast_show]
  ps_title [shape: oval, label: title]
  ps_description [shape: oval, label: description]
  ps_rss_url [shape: oval, label: rss_url]
  ps_image_url [shape: oval, label: image_url]
  ps_title -- podcast_show
  ps_description -- podcast_show
  ps_rss_url -- podcast_show
  ps_image_url -- podcast_show
}

group g_podcast_episode {
  podcast_episode [shape: rectangle, label: podcast_episode]
  pe_title [shape: oval, label: title]
  pe_description [shape: oval, label: description]
  pe_audio_url [shape: oval, label: audio_url]
  pe_date [shape: oval, label: date]
  pe_duration_seconds [shape: oval, label: duration_seconds]
  pe_transcript [shape: oval, label: transcript]
  pe_title -- podcast_episode
  pe_description -- podcast_episode
  pe_audio_url -- podcast_episode
  pe_date -- podcast_episode
  pe_duration_seconds -- podcast_episode
  pe_transcript -- podcast_episode
}

group g_podcast_author {
  podcast_author [shape: rectangle, label: podcast_author]
  pa_name [shape: oval, label: name]
  pa_profile_url [shape: oval, label: profile_url]
  pa_name -- podcast_author
  pa_profile_url -- podcast_author
}

group g_embedding {
  embedding [shape: rectangle, label: embedding]
  e_entity_type [shape: oval, label: entity_type]
  e_entity_id [shape: oval, label: entity_id]
  e_vector [shape: oval, label: vector]
  e_entity_type -- embedding
  e_entity_id -- embedding
  e_vector -- embedding
}

group g_comment {
  comment [shape: rectangle, label: comment]
  cm_content [shape: oval, label: content]
  cm_status [shape: oval, label: status]
  cm_created_at [shape: oval, label: created_at]
  cm_updated_at [shape: oval, label: updated_at]
  cm_content -- comment
  cm_status -- comment
  cm_created_at -- comment
  cm_updated_at -- comment
}

group g_comment_report {
  comment_report [shape: rectangle, label: comment_report]
  cr_reason [shape: oval, label: reason]
  cr_status [shape: oval, label: status]
  cr_created_at [shape: oval, label: created_at]
  cr_reason -- comment_report
  cr_status -- comment_report
  cr_created_at -- comment_report
}

group g_note {
  note [shape: rectangle, label: note]
  n_content [shape: oval, label: content]
  n_created_at [shape: oval, label: created_at]
  n_updated_at [shape: oval, label: updated_at]
  n_content -- note
  n_created_at -- note
  n_updated_at -- note
}

group g_follow {
  follow [shape: rectangle, label: follow]
  f_target_type [shape: oval, label: target_type]
  f_target_id [shape: oval, label: target_id]
  f_created_at [shape: oval, label: created_at]
  f_target_type -- follow
  f_target_id -- follow
  f_created_at -- follow
}

group g_workspace {
  workspace [shape: rectangle, label: workspace]
  w_name [shape: oval, label: name]
  w_snapshot [shape: oval, label: snapshot]
  w_server_revision [shape: oval, label: server_revision]
  w_schema_version [shape: oval, label: schema_version]
  w_created_at [shape: oval, label: created_at]
  w_updated_at [shape: oval, label: updated_at]
  w_name -- workspace
  w_snapshot -- workspace
  w_server_revision -- workspace
  w_schema_version -- workspace
  w_created_at -- workspace
  w_updated_at -- workspace
}

group g_article_visit {
  article_visit [shape: rectangle, label: article_visit]
  av_visited_at [shape: oval, label: visited_at]
  av_visited_at -- article_visit
}

group g_exploration_step {
  exploration_step [shape: rectangle, label: exploration_step]
  es_step_index [shape: oval, label: step_index]
  es_action [shape: oval, label: action]
  es_payload [shape: oval, label: payload]
  es_created_at [shape: oval, label: created_at]
  es_step_index -- exploration_step
  es_action -- exploration_step
  es_payload -- exploration_step
  es_created_at -- exploration_step
}

group g_favorita {
  fav_created_at [shape: oval, label: created_at]
}

group g_valora {
  val_value [shape: oval, label: value]
  val_created_at [shape: oval, label: created_at]
  val_updated_at [shape: oval, label: updated_at]
}

escribe [shape: diamond, label: escribe]
article > escribe: "N"
escribe > author: "M"

clasifica_en [shape: diamond, label: "clasifica en"]
article > clasifica_en: "N"
clasifica_en > category: "M"

etiqueta [shape: diamond, label: etiqueta]
article > etiqueta: "N"
etiqueta > tag: "M"

aborda [shape: diamond, label: aborda]
article > aborda: "N"
aborda > topic: "M"

ubicado_en [shape: diamond, label: "ubicado en"]
article > ubicado_en: "N"
ubicado_en > place: "M"

cita [shape: diamond, label: cita]
article > cita: "N"
cita > book: "M"

subclasifica [shape: diamond, label: subclasifica]
topic > subclasifica: "N"
subclasifica > topic: "M"

pertenece_a [shape: diamond, label: "pertenece a"]
podcast_episode > pertenece_a: "N"
pertenece_a > podcast_show: "1"

participa [shape: diamond, label: participa]
podcast_episode > participa: "N"
participa > podcast_author: "M"

trata [shape: diamond, label: trata]
podcast_episode > trata: "N"
trata > topic: "M"

recomienda [shape: diamond, label: recomienda]
podcast_episode > recomienda: "N"
recomienda > book: "M"

menciona [shape: diamond, label: menciona]
podcast_episode > menciona: "N"
menciona > article: "M"

referencia [shape: diamond, label: referencia]
podcast_episode > referencia: "N"
referencia > podcast_episode: "M"

indexa_art [shape: diamond, label: indexa]
indexa_top [shape: diamond, label: indexa]
indexa_epi [shape: diamond, label: indexa]
article > indexa_art: "1"
indexa_art > embedding: "N"
topic > indexa_top: "1"
indexa_top > embedding: "N"
podcast_episode > indexa_epi: "1"
indexa_epi > embedding: "N"

favorita [shape: diamond, label: favorita]
fav_created_at -- favorita
user > favorita: "1"
favorita > article: "M"

valora [shape: diamond, label: valora]
val_value -- valora
val_created_at -- valora
val_updated_at -- valora
user > valora: "1"
valora > article: "M"

publica [shape: diamond, label: publica]
pertenece_a_com [shape: diamond, label: "pertenece a"]
user > publica: "1"
publica > comment: "N"
comment > pertenece_a_com: "N"
pertenece_a_com > article: "1"

denuncia [shape: diamond, label: denuncia]
sobre_com [shape: diamond, label: sobre]
user > denuncia: "1"
denuncia > comment_report: "N"
comment_report > sobre_com: "N"
sobre_com > comment: "1"

anota [shape: diamond, label: anota]
referencia_nota [shape: diamond, label: referencia]
user > anota: "1"
anota > note: "N"
note > referencia_nota: "N"
referencia_nota > article: "1"

sigue [shape: diamond, label: sigue]
user > sigue: "1"
sigue > follow: "N"

posee [shape: diamond, label: posee]
user > posee: "1"
posee > workspace: "N"

registra_visita [shape: diamond, label: "registra visita"]
en_area [shape: diamond, label: "en area"]
sobre_articulo [shape: diamond, label: sobre]
user > registra_visita: "1"
registra_visita > article_visit: "N"
article_visit > en_area: "N"
en_area > workspace: "N"
article_visit > sobre_articulo: "N"
sobre_articulo > article: "1"

registra_paso [shape: diamond, label: "registra paso"]
en_workspace [shape: diamond, label: en]
user > registra_paso: "1"
registra_paso > exploration_step: "N"
exploration_step > en_workspace: "N"
en_workspace > workspace: "N"

legend [position: bottom-left] {
  [shape: rectangle, label: Entidad]
  [shape: oval, label: Atributo]
  [shape: diamond, label: Relacion]
}
