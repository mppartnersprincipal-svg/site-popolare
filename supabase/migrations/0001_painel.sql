-- ============================================================
-- Painel /painel — analytics first-party da Popolare
-- Projeto Supabase compartilhado "Meta-Ads-Inteligence"
-- (rylxisgblhhzbsuslitf). Tudo fica no schema `popolare`, fora da API
-- REST (só `public` é exposto), e o site acessa com a role `popolare_app`
-- (criada fora deste arquivo, com senha SCRAM gerada localmente).
-- Baseado nas migrations 0003–0005 do site da Sólida, adaptado aos eventos
-- da Popolare (click_whatsapp, click_phone, click_directions, form_submit…).
--
-- Privacidade: nada de IP, cookie de rastreio ou user-agent cru. A sessão é um
-- UUID aleatório da aba; visitor_id (novo × recorrente) não existe para quem
-- recusou os cookies.
-- ============================================================

create schema if not exists popolare;
revoke all on schema popolare from public, anon, authenticated;

-- ---------- Sessões ----------
create table if not exists popolare.sessions (
  id             uuid primary key,
  started_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  landing_path   text not null,
  referrer_host  text,
  channel        text not null check (channel in
                   ('google_ads','google_organic','other_search','social','referral','direct')),
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_term       text,
  utm_content    text,
  has_gclid      boolean not null default false,
  device         text check (device in ('mobile','tablet','desktop')),
  browser        text,
  os             text,
  country        text,
  region         text,
  city           text,
  screen_w       smallint,
  screen_h       smallint,
  lang           text,
  visitor_id     uuid,
  is_returning   boolean not null default false,
  page_views     integer not null default 0,
  events         integer not null default 0,
  converted      boolean not null default false
);

create index if not exists sessions_started_idx on popolare.sessions (started_at desc);
create index if not exists sessions_channel_idx on popolare.sessions (channel, started_at desc);
create index if not exists sessions_visitor_idx on popolare.sessions (visitor_id, started_at desc)
  where visitor_id is not null;

-- ---------- Eventos ----------
create table if not exists popolare.events (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references popolare.sessions (id) on delete cascade,
  ts          timestamptz not null default now(),
  name        text not null,
  path        text not null,
  title       text,
  params      jsonb not null default '{}'::jsonb
);

create index if not exists events_ts_idx on popolare.events (ts desc);
create index if not exists events_name_ts_idx on popolare.events (name, ts desc);
create index if not exists events_session_idx on popolare.events (session_id, ts);

-- ---------- Usuários do painel (login próprio do site, sem Supabase Auth) ----------
create table if not exists popolare.dashboard_users (
  email       text primary key check (email = lower(email)),
  name        text not null,
  pass_hash   text not null,           -- scrypt$N$r$p$salt$hash (gerado no Node)
  created_at  timestamptz not null default now(),
  last_login  timestamptz
);

alter table popolare.sessions        enable row level security;
alter table popolare.events          enable row level security;
alter table popolare.dashboard_users enable row level security;

-- Conversões da Popolare: WhatsApp, telefone e pedido de encomenda
create or replace function popolare.is_conversion(p_name text)
returns boolean language sql immutable set search_path = ''
as $$ select p_name in ('click_whatsapp', 'click_phone', 'form_submit') $$;

-- Painel: 'lp' = visitas que entraram pela LP do Google Ads; 'site' = demais; null = tudo
create or replace function popolare.in_scope(p_landing text, p_scope text)
returns boolean language sql immutable set search_path = ''
as $$
  select case p_scope
    when 'lp'   then p_landing = '/massas-em-goiania' or p_landing like '/massas-em-goiania/%'
    when 'site' then not (p_landing = '/massas-em-goiania' or p_landing like '/massas-em-goiania/%')
    else true end
$$;

-- ---------- Triggers ----------
create or replace function popolare.bump_session()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update popolare.sessions
     set last_seen_at = greatest(last_seen_at, new.ts),
         page_views   = page_views + (new.name = 'page_view')::int,
         events       = events + 1,
         converted    = converted or popolare.is_conversion(new.name)
   where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists events_bump on popolare.events;
create trigger events_bump after insert on popolare.events
  for each row execute function popolare.bump_session();

create or replace function popolare.mark_returning()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.visitor_id is not null then
    new.is_returning := exists (
      select 1 from popolare.sessions s where s.visitor_id = new.visitor_id and s.id <> new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists sessions_returning on popolare.sessions;
create trigger sessions_returning before insert on popolare.sessions
  for each row execute function popolare.mark_returning();

-- ============================================================
-- Agregações (security invoker; datas em America/Sao_Paulo; p_channel null = todas)
-- ============================================================

create or replace function popolare.kpis(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (sessions bigint, page_views bigint, avg_session_ms numeric, avg_page_ms numeric,
               wa_clicks bigint, phone_clicks bigint, orders bigint, wa_sessions bigint, conv_rate numeric)
language sql stable set search_path = popolare
as $$
  with s as (
    select * from sessions
    where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel) and in_scope(landing_path, p_scope)
  ),
  ev as (select e.* from events e join s on s.id = e.session_id),
  agg as (
    select
      (select count(*) from s) as sessions,
      (select count(*) from ev where name = 'page_view') as page_views,
      (select coalesce(round(avg(extract(epoch from (last_seen_at - started_at)) * 1000)), 0) from s) as avg_session_ms,
      (select coalesce(round(avg((params->>'duration_ms')::numeric)), 0) from ev
        where name = 'page_leave' and (params->>'duration_ms') ~ '^[0-9]+$') as avg_page_ms,
      (select count(*) from ev where name = 'click_whatsapp') as wa_clicks,
      (select count(*) from ev where name = 'click_phone') as phone_clicks,
      (select count(*) from ev where name = 'form_submit') as orders,
      (select count(distinct session_id) from ev where is_conversion(name)) as wa_sessions
  )
  select sessions, page_views, avg_session_ms, avg_page_ms, wa_clicks, phone_clicks, orders, wa_sessions,
         case when sessions = 0 then 0 else round(wa_sessions::numeric / sessions * 100, 1) end
  from agg;
$$;

create or replace function popolare.daily(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (day date, sessions bigint, page_views bigint, wa_clicks bigint)
language sql stable set search_path = popolare
as $$
  with days as (
    select generate_series((p_from at time zone 'America/Sao_Paulo')::date,
                           ((p_to - interval '1 second') at time zone 'America/Sao_Paulo')::date,
                           interval '1 day')::date as day
  ),
  s as (
    select id, (started_at at time zone 'America/Sao_Paulo')::date as day from sessions
    where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel) and in_scope(landing_path, p_scope)
  ),
  ev as (
    select e.name, (e.ts at time zone 'America/Sao_Paulo')::date as day
    from events e join s on s.id = e.session_id
    where e.name = 'page_view' or is_conversion(e.name)
  )
  select d.day,
         (select count(*) from s where s.day = d.day),
         (select count(*) from ev where ev.day = d.day and ev.name = 'page_view'),
         (select count(*) from ev where ev.day = d.day and ev.name <> 'page_view')
  from days d order by d.day;
$$;

create or replace function popolare.heatmap(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (dow smallint, hour smallint, sessions bigint)
language sql stable set search_path = popolare
as $$
  select extract(dow  from (started_at at time zone 'America/Sao_Paulo'))::smallint,
         extract(hour from (started_at at time zone 'America/Sao_Paulo'))::smallint,
         count(*)
  from sessions
  where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel) and in_scope(landing_path, p_scope)
  group by 1, 2 order by 1, 2;
$$;

create or replace function popolare.by_channel(p_from timestamptz, p_to timestamptz, p_scope text default null)
returns table (channel text, sessions bigint, wa_clicks bigint)
language sql stable set search_path = popolare
as $$
  select s.channel, count(distinct s.id), count(e.id)
  from sessions s
  left join events e on e.session_id = s.id and e.name = 'click_whatsapp'
  where s.started_at >= p_from and s.started_at < p_to and in_scope(s.landing_path, p_scope)
  group by s.channel order by 2 desc;
$$;

create or replace function popolare.by_device(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (device text, sessions bigint)
language sql stable set search_path = popolare
as $$
  select coalesce(device, 'desconhecido'), count(*) from sessions
  where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel) and in_scope(landing_path, p_scope)
  group by 1 order by 2 desc;
$$;

create or replace function popolare.top_pages(p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 20, p_scope text default null)
returns table (path text, title text, views bigint, avg_ms numeric, avg_scroll numeric)
language sql stable set search_path = popolare
as $$
  with ev as (
    select e.* from events e join sessions s on s.id = e.session_id
    where e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel) and in_scope(s.landing_path, p_scope)
      and e.name in ('page_view', 'page_leave')
  ),
  v as (select path, max(title) as title, count(*) as views from ev where name = 'page_view' group by path),
  l as (
    select path, round(avg((params->>'duration_ms')::numeric)) as avg_ms,
           round(avg((params->>'max_scroll_pct')::numeric)) as avg_scroll
    from ev where name = 'page_leave' and (params->>'duration_ms') ~ '^[0-9]+$' group by path
  )
  select v.path, v.title, v.views, coalesce(l.avg_ms, 0), coalesce(l.avg_scroll, 0)
  from v left join l on l.path = v.path order by v.views desc limit p_limit;
$$;

create or replace function popolare.geo(p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 30, p_scope text default null)
returns table (country text, region text, city text, sessions bigint, wa_clicks bigint)
language sql stable set search_path = popolare
as $$
  select s.country, s.region, s.city, count(distinct s.id), count(e.id)
  from sessions s
  left join events e on e.session_id = s.id and e.name = 'click_whatsapp'
  where s.started_at >= p_from and s.started_at < p_to and (p_channel is null or s.channel = p_channel) and in_scope(s.landing_path, p_scope)
  group by 1, 2, 3 order by 4 desc limit p_limit;
$$;

create or replace function popolare.campaigns(p_from timestamptz, p_to timestamptz, p_scope text default null)
returns table (utm_campaign text, utm_term text, utm_content text, sessions bigint, wa_clicks bigint, conv_rate numeric)
language sql stable set search_path = popolare
as $$
  with s as (select * from sessions where started_at >= p_from and started_at < p_to and channel = 'google_ads' and in_scope(landing_path, p_scope))
  select s.utm_campaign, s.utm_term, s.utm_content, count(distinct s.id), count(e.id),
         round(count(distinct e.session_id)::numeric / nullif(count(distinct s.id), 0) * 100, 1)
  from s left join events e on e.session_id = s.id and e.name = 'click_whatsapp'
  group by 1, 2, 3 order by 4 desc;
$$;

-- Botões de contato: WhatsApp, telefone, rota no mapa e encomenda
create or replace function popolare.buttons(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (kind text, unidade text, produto text, local text, channel text, clicks bigint, sessions bigint)
language sql stable set search_path = popolare
as $$
  select e.name, e.params->>'unidade', e.params->>'produto', e.params->>'local', s.channel,
         count(*), count(distinct e.session_id)
  from events e join sessions s on s.id = e.session_id
  where e.name in ('click_whatsapp', 'click_phone', 'click_directions', 'click_delivery', 'form_submit')
    and e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel) and in_scope(s.landing_path, p_scope)
  group by 1, 2, 3, 4, 5 order by 6 desc;
$$;

-- Interesses: massa escolhida na intro, categoria filtrada no cardápio, produto pedido no WhatsApp
create or replace function popolare.interests(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (kind text, item text, total bigint, sessions bigint)
language sql stable set search_path = popolare
as $$
  select e.name,
         case e.name
           when 'intro_pasta_select' then e.params->>'massa'
           when 'catalog_filter'     then e.params->>'categoria'
           else e.params->>'produto'
         end,
         count(*), count(distinct e.session_id)
  from events e join sessions s on s.id = e.session_id
  where e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel) and in_scope(s.landing_path, p_scope)
    and (e.name in ('intro_pasta_select', 'catalog_filter')
         or (e.name = 'click_whatsapp' and e.params ? 'produto'))
  group by 1, 2 order by 3 desc;
$$;

create or replace function popolare.clicks(p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 30, p_scope text default null)
returns table (label text, tag text, href text, clicks bigint, sessions bigint)
language sql stable set search_path = popolare
as $$
  select coalesce(e.params->>'track', e.params->>'text', e.params->>'href'),
         max(e.params->>'tag'), max(e.params->>'href'), count(*), count(distinct e.session_id)
  from events e join sessions s on s.id = e.session_id
  where e.name = 'click' and e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel) and in_scope(s.landing_path, p_scope)
  group by 1 order by 4 desc limit p_limit;
$$;

create or replace function popolare.blog(p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 20, p_scope text default null)
returns table (path text, title text, views bigint, avg_ms numeric, avg_scroll numeric)
language sql stable set search_path = popolare
as $$
  select * from top_pages(p_from, p_to, p_channel, 500, p_scope) t
  where t.path like '/blog/%' limit p_limit;
$$;

-- Funil: visitou → viu o cardápio → pediu (WhatsApp, telefone ou encomenda)
create or replace function popolare.funnel(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (step text, sessions bigint)
language sql stable set search_path = popolare
as $$
  with s as (
    select id from sessions
    where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel) and in_scope(landing_path, p_scope)
  ),
  ev as (select e.* from events e join s on s.id = e.session_id)
  select 'visitou'::text, count(*) from s
  union all
  select 'viu_cardapio', count(distinct session_id) from ev
   where (name = 'page_view' and path in ('/cardapio', '/massas-em-goiania'))
      or (name = 'section_view' and params->>'secao' in ('catalogo', 'vitrine', 'lp-produtos'))
      or name = 'catalog_filter'
  union all
  select 'pediu', count(distinct session_id) from ev where is_conversion(name);
$$;

create or replace function popolare.journeys(p_from timestamptz, p_to timestamptz, p_channel text default null,
  p_only_converted boolean default true, p_limit int default 50, p_scope text default null)
returns table (id uuid, started_at timestamptz, last_seen_at timestamptz, channel text,
  utm_campaign text, utm_term text, device text, browser text, os text, region text, city text,
  landing_path text, referrer_host text, converted boolean, is_returning boolean, trail jsonb)
language sql stable set search_path = popolare
as $$
  select s.id, s.started_at, s.last_seen_at, s.channel, s.utm_campaign, s.utm_term, s.device, s.browser, s.os,
         s.region, s.city, s.landing_path, s.referrer_host, s.converted, s.is_returning,
         coalesce((select jsonb_agg(jsonb_build_object('ts', e.ts, 'name', e.name, 'path', e.path,
                                                       'title', e.title, 'params', e.params) order by e.ts, e.id)
                   from events e where e.session_id = s.id), '[]'::jsonb)
  from sessions s
  where s.started_at >= p_from and s.started_at < p_to and (p_channel is null or s.channel = p_channel) and in_scope(s.landing_path, p_scope)
    and (not p_only_converted or s.converted)
  order by s.started_at desc limit p_limit;
$$;

create or replace function popolare.recent(p_limit int default 50, p_scope text default null)
returns table (ts timestamptz, session_id uuid, name text, path text, params jsonb,
               channel text, device text, city text, region text)
language sql stable set search_path = popolare
as $$
  select e.ts, e.session_id, e.name, e.path, e.params, s.channel, s.device, s.city, s.region
  from events e join sessions s on s.id = e.session_id
  where in_scope(s.landing_path, p_scope)
  order by e.ts desc, e.id desc limit p_limit;
$$;

create or replace function popolare.visitors(p_from timestamptz, p_to timestamptz, p_channel text default null, p_scope text default null)
returns table (kind text, sessions bigint, wa_clicks bigint)
language sql stable set search_path = popolare
as $$
  select case when s.visitor_id is null then 'unknown' when s.is_returning then 'returning' else 'new' end,
         count(distinct s.id), count(e.id)
  from sessions s left join events e on e.session_id = s.id and e.name = 'click_whatsapp'
  where s.started_at >= p_from and s.started_at < p_to and (p_channel is null or s.channel = p_channel) and in_scope(s.landing_path, p_scope)
  group by 1 order by 2 desc;
$$;

create or replace function popolare.consent(p_from timestamptz, p_to timestamptz, p_scope text default null)
returns table (choice text, sessions bigint)
language sql stable set search_path = popolare
as $$
  with s as (select id from sessions where started_at >= p_from and started_at < p_to and in_scope(landing_path, p_scope)),
  c as (
    select distinct on (e.session_id) e.session_id, e.params->>'consent_choice' as choice
    from events e join s on s.id = e.session_id
    where e.name = 'cookie_consent' order by e.session_id, e.ts desc
  )
  select coalesce(c.choice, 'none'), count(*) from s left join c on c.session_id = s.id
  group by 1 order by 2 desc;
$$;

create or replace function popolare.purge(p_months int default 13)
returns integer language plpgsql security definer set search_path = ''
as $$
declare n integer;
begin
  delete from popolare.sessions where started_at < now() - make_interval(months => p_months);
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Nada no schema é executável por public/anon/authenticated (a role popolare_app recebe grants à parte)
revoke all on all functions in schema popolare from public, anon, authenticated;
revoke all on all tables in schema popolare from public, anon, authenticated;

-- ---------- Role do site (login e senha definidos fora da migration) ----------
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'popolare_app') then
    create role popolare_app nologin noinherit;
  end if;
end $$;

grant usage on schema popolare to popolare_app;
grant select, insert on popolare.sessions, popolare.events to popolare_app;
grant select on popolare.dashboard_users to popolare_app;
grant update (last_login) on popolare.dashboard_users to popolare_app;
grant usage on all sequences in schema popolare to popolare_app;

do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'popolare' and p.proname not in ('bump_session', 'mark_returning', 'purge')
  loop
    execute format('grant execute on function %s to popolare_app', f.sig);
  end loop;
end $$;

-- RLS ligada; a única role com acesso é popolare_app (o dono ignora RLS nos triggers)
drop policy if exists app_all on popolare.sessions;
create policy app_all on popolare.sessions for all to popolare_app using (true) with check (true);
drop policy if exists app_all on popolare.events;
create policy app_all on popolare.events for all to popolare_app using (true) with check (true);
drop policy if exists app_read on popolare.dashboard_users;
create policy app_read on popolare.dashboard_users for select to popolare_app using (true);
drop policy if exists app_login on popolare.dashboard_users;
create policy app_login on popolare.dashboard_users for update to popolare_app using (true) with check (true);
