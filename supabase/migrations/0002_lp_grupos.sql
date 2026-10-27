-- 0002_lp_grupos.sql — 27/10/2026
-- O /painel/lp passa a cobrir as 6 páginas dos anúncios (uma por grupo da campanha
-- "[MP] - [S] - Massas Artesanais - Goiânia"), não só a /massas-em-goiania.
-- Mesma regra de antes (rota exata ou subcaminho; landing nulo fica fora dos dois escopos).
-- Ao criar uma LP nova em data/lpTemas.ts, incluir a rota aqui (sem a barra) numa migração nova.
-- `create or replace` mantém dono e grants (execute para popolare_app).

create or replace function popolare.in_scope(p_landing text, p_scope text)
returns boolean language sql immutable set search_path = ''
as $$
  select case p_scope
    when 'lp'   then split_part(p_landing, '/', 2) = any (array[
      'massas-em-goiania', 'massas-artesanais', 'lasanha-congelada',
      'canelone-rondelli-sfogliatti', 'nhoque-artesanal', 'ravioli-e-capeletti'])
    when 'site' then not (split_part(p_landing, '/', 2) = any (array[
      'massas-em-goiania', 'massas-artesanais', 'lasanha-congelada',
      'canelone-rondelli-sfogliatti', 'nhoque-artesanal', 'ravioli-e-capeletti']))
    else true end
$$;

-- Funil "viu o cardápio": abrir qualquer LP conta (antes, só /massas-em-goiania), e a seção do
-- cardápio da LP é 'lp-catalogo' (a 0001 procurava 'lp-produtos', que nunca existiu; mantido por
-- compatibilidade). Mesma assinatura da 0001.
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
   where (name = 'page_view' and (path = '/cardapio' or in_scope(path, 'lp')))
      or (name = 'section_view' and params->>'secao' in ('catalogo', 'vitrine', 'lp-catalogo', 'lp-produtos'))
      or name = 'catalog_filter'
  union all
  select 'pediu', count(distinct session_id) from ev where is_conversion(name);
$$;
