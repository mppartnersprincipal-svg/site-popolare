@AGENTS.md

# Site — Popolare Massas e Empório

Site institucional imersivo (intro 3D → hero em arco → scroll "entrando na loja" → vitrine 3D → catálogo) para a Popolare, fábrica/loja de massas italianas artesanais em Goiânia. Convive com o WordPress antigo (popolare.com.br, Cerrado Propaganda), que a cliente quis manter no domínio raiz.

## Cliente

| Campo | Valor |
|-------|-------|
| Cliente | Popolare Massas e Empório (Carina Popolare) |
| Segmento | Alimentação — massas artesanais congeladas + empório italiano |
| Objetivo | Pedido via WhatsApp, visita à loja (rota), encomendas; SEO local + GEO |
| WhatsApp | Setor Sul (62) 3945-6633 (loja única — o Eldorado fechou em out/2026) |
| URL de produção | https://loja.popolare.com.br (popolare.com.br segue com o WordPress antigo, por decisão da cliente) |

## Stack

Next.js 16.4 (App Router, `cacheComponents` + `partialPrefetching`), React 19.3, TypeScript, Tailwind 4, GSAP 3 + ScrollTrigger (`@gsap/react`), Lenis, React Three Fiber 9 + drei 10 + three, `@react-spring/web` (tilt dos cards), zod (carregado sob demanda), sharp/ffmpeg (scripts), Vitest, Playwright.

> Next 16 tem APIs novas: consulte `node_modules/next/dist/docs/`. Com `cacheComponents`, não use `new Date()`/`Math.random()` em Server Components (quebra o prerender); `dynamicParams` não existe.

## Fonte única de dados (`data/`)

- `business.ts` — NAP, unidades, horários, WhatsApp, redes, regras de encomenda
- `menu.ts` — cardápio 2026 (categorias, itens, pesos, selos, imagem). **Sem preços por decisão do cliente** — não reintroduzir em UI, JSON-LD, llms ou WhatsApp
- `content.ts` — história, pilares, imprensa, FAQ, modo de preparo, fatos rápidos (GEO)
- `*.generated.json` — gerados por script (imagens, quadros do vídeo, blog); não editar à mão

Tudo (UI, JSON-LD em `lib/schema.ts`, `/llms.txt` em `lib/llms.ts`, mensagens de WhatsApp em `lib/whatsapp.ts`) lê daqui.

## Experiência (home)

| Peça | Arquivo | Notas |
|---|---|---|
| Intro "Scegli la tua pasta" | `components/experience/IntroPastaPicker.tsx` | Overlay SSR; escondida por CSS (`html.intro-vista`) em visitas repetidas/reduced-motion. Escolha → `lib/experienceStore.ts` personaliza hero, vitrine e WhatsApp |
| Hero + portal + scrub do vídeo | `components/experience/HeroPortal.tsx` + `lib/frameSequence.ts` | Arco cresce e vira o vídeo da fachada→interior (96 quadros em `public/frames/loja`). Desktop: transform; mobile: clip-path com valores explícitos (`mobileArchClip`) |
| 3D | `components/three/*` + `components/experience/Scene3DLoader.tsx` | UM canvas fixo; cada `[data-3d="intro:<massa>" | "vetrina:<massa>" | "ribbon"]` vira um drei `View`. Geometrias procedurais (sem GLB). Carrega na 1ª interação ou 3,5s após o load; nunca em modo leve. Canvas com `.cena-3d` (pointer-events: none!) e frameloop pausado fora da tela |
| Fita de massa no scroll | `components/three/PastaRibbon.tsx` | Segue o wrapper `[data-trilha]` da home |
| Reveals/parallax | `components/experience/ScrollReveals.tsx` | Atributos `data-reveal` e `data-parallax` em qualquer página |

Modo leve (`lib/device.ts`): reduced-motion, `deviceMemory < 4`, saveData ou 2G/3G → sem 3D, sem pin/scrub.

**Não use `gsap.ticker.lagSmoothing(0)`**: faz timelines "pularem" em frames pesados (quebrou a transição da intro).

## Assets

```bash
npm run images                         # fotos originais (../Produtos Massas, ../Fotos Ambiente-Loja, ../Fotos da Carina, ../Fotos 2026) → public/img (AVIF/WebP 640/1080/1600[/2400]) + data/images.generated.json
npm run frames -- ../video/<video>.mp4 # vídeo "entrando na loja" → public/frames/loja (96 WebP 768w) + data/frames.generated.json
node scripts/contact-sheet.mjs <origem> <saida>  # grades para curadoria de fotos
```

Curadoria de fotos fica em `SOURCES` de `scripts/process-images.mjs` (grupo `equipe/` = fotos da Carina: história "Hoje", topo de /sobre-nos, Na mídia, empório, modo de preparo; também no JSON-LD). O conector do Drive não lista as pastas do cliente, mas elas são públicas: `curl "https://drive.google.com/embeddedfolderview?id=<pasta>"` dá IDs/nomes e `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t` baixa o original. Vídeo atual: gerado por IA (Higgsfield, MiniMax H3, 1º quadro = fachada, último = interior) em `../video/loja-ia-higgsfield.mp4`. **Trocar pelo take real do Rafael** (fachada → porta → balcão, 8–12s, sem cortes, retrato ou 16:9) rodando `npm run frames`.

## Design

Marsala `#9B1B20` (logo), vinho `#590E13`, creme `#F6EEE3`, massa `#F0D9A6`, madeira `#B9802F` (texto pequeno: `madeira-escura #85561A`), dourado `#EEAB3A`. Fontes: Marcellus (caixa-alta, eco do wordmark), Cormorant Garamond itálico (frases em italiano), Manrope (texto). Arcos (`rounded-t-[999px]`) ecoam as janelas da loja. Logos vetoriais em `public/brand/` (`currentColor`).

Tamanhos com variável CSS no Tailwind 4: use `text-[length:var(--x)]` (sem `length:` vira cor).

## SEO / GEO

- Metadata por página + canonical; 1 `h1` por página; OG estática `app/opengraph-image.jpg`
- JSON-LD: Organization, WebSite, FoodEstablishment/Store, Menu (sem preços), FAQPage, BreadcrumbList, Article
- `app/sitemap.ts`, `app/robots.ts` (libera GPTBot, ClaudeBot, PerplexityBot, Google-Extended…), `/llms.txt` e `/llms-full.txt`
- Redirects permanentes das URLs do WordPress em `next.config.ts` (posts → `/blog/<slug>`, `/nossas-massas` → `/cardapio`, sitemaps antigos)

## Trackeamento

GTM via `components/tracking/TrackingProvider.tsx` (`NEXT_PUBLIC_GTM_ID`). Cliques: qualquer elemento com `data-track="<evento>"` (+ `data-track-*` como parâmetros). Automáticos: `scroll_25/50/75/100`, `section_view` (`data-section`). Específicos: `intro_pasta_select`, `catalog_filter`, `form_submit`. UTMs da URL de entrada vão em todos os eventos. GA4/Ads/Meta Pixel são tags dentro do GTM (skill `lp-tracking-dashboard`).

## Painel `/painel` (métricas próprias — 19/10/2026)

Portado do dashboard da Sólida (`../../Site - Sólida Transporte/solida-site`, fases D1–D4 + Google Ads), com diferenças decididas pelo Pedro:

- **Dois painéis separados pela página de ENTRADA da visita**: `/painel/lp` (entrou por `/massas-em-goiania`, a LP dos anúncios — inclui Google Ads e Campanhas/UTM) e `/painel/site` (home e demais páginas — inclui páginas, blog e massa escolhida na intro). Filtro `p_scope` (`popolare.in_scope`) em todas as funções SQL.
- **Banco**: schema isolado `popolare` no projeto Supabase compartilhado **Meta-Ads-Inteligence** (`rylxisgblhhzbsuslitf`) — escolha do Pedro para não pagar projeto novo. O site NUNCA usa a service role nem o Supabase Auth de lá: conecta pelo pooler (porta 6543) com a role própria `popolare_app` (`lib/painel/db.ts`, `postgres` com `prepare:false`), que só tem `usage` no schema `popolare`, `select/insert` em sessions/events, leitura dos usuários e `execute` nas agregações. SQL em `supabase/migrations/0001_painel.sql` (testado em PGlite com seed e checagem de permissões). Senha da role definida por verificador SCRAM gerado localmente (`../painel-acesso.sql`, fora do Git).
- **Login próprio** (`lib/painel/auth.ts`): `popolare.dashboard_users` com scrypt; cookie `popolare_painel` (HMAC-SHA256, `PAINEL_SESSION_SECRET`, 7 dias, `path=/painel`); `proxy.ts` só redireciona quem não tem cookie — a validação real roda em `requireUser()` dentro do `<Suspense>` (exigência do `cacheComponents`). Rate limit de login em memória. Acessos em `../ACESSO-PAINEL.txt` (fora do Git).
- **Coleta** (`lib/tracker.ts` + `components/tracking/Collector.tsx` + `app/api/collect/route.ts`): page_view/page_leave (tempo visível e rolagem), todo clique, e todo `track()` (exceto `scroll_*`) via `collect()`; `cookie_consent` sai do `updateConsent`. Anônimo (sessão em sessionStorage; visitante novo × recorrente em localStorage `popolare_v`, apagado se recusar cookies). Conversões do painel: `click_whatsapp`, `click_phone`, `form_submit` (`popolare.is_conversion`).
- **Google Ads**: `lib/painel/google-ads-api.ts` (só leitura, REST v25) com as credenciais OAuth da MCC (as mesmas da Sólida); conta Popolare `652-370-3488`.
- **Env (Vercel → Production)**: `POPOLARE_DATABASE_URL`, `PAINEL_SESSION_SECRET`, `GOOGLE_ADS_CUSTOMER_ID/DEVELOPER_TOKEN/CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN/LOGIN_CUSTOMER_ID/API_VERSION`. Sem elas o site funciona igual (coleta descartada, painel avisa que não está conectado).
- Estrutura: o site foi para o route group `app/(site)/` (layout com Header/Footer/GTM/Lenis); o layout raiz só tem html/fontes; `app/not-found.tsx` traz Header/Footer porque fica fora do grupo. `/painel` fica fora do robots e com `X-Robots-Tag: noindex`.
- **UTMs** (padrão para as campanhas, para GA4/Ads/painel baterem): `utm_source=google&utm_medium=cpc&utm_campaign=<slug-da-campanha>&utm_content=<slug-do-grupo>&utm_term={keyword}` no "Sufixo do URL final" de cada grupo de anúncios; marcação automática (gclid) ligada. O painel identifica Ads pelo gclid; as UTMs dão nome à campanha/grupo. `utm_term` com `{keyword}` cru = teste → conta como Direto.

## Comandos

```bash
npm run dev | build | start
npm test                 # vitest (lib/*.test.ts)
npx tsc --noEmit
```

## Pendências do cliente (ver `TODO(cliente)` no código)

Ano de fundação (1992 × 1994) · coordenadas exatas da loja · links das matérias Hora Extra/Giro Goiás · nomes de fotos ("Manicaretti Verde" e qual foto da pasta "Raviolli de Carne - 3 queijos - Brie" é de cada sabor; o Drive do cliente não expõe essas fotos ao conector) · vídeo real da fachada · IDs de GTM/GA4/Meta · texto da política de privacidade.

Resolvidas (14/10/2026): Instagram oficial = @popolaremassas · preços não aparecem no site · horário do Eldorado 9h–19h.

## LP de campanha (Google Ads)

`/massas-em-goiania` (`app/(site)/massas-em-goiania/page.tsx`, conteúdo em `data/lp.ts`): página leve (sem intro/3D/vídeo), 5 dobras com CTA (hero · produtos [carrossel no mobile] · diferenciais · lojas · FAQ+CTA final), WhatsApp flutuante com link direto para o Setor Sul (`components/lp/WhatsAppFloat.tsx`, evento `click_whatsapp` local `lp-flutuante`). FAQPage + Breadcrumb próprios; no sitemap com prioridade 0.9. `gclid/gbraid/wbraid` são capturados junto das UTMs e vão em todos os eventos. GSAP/Lenis do layout carregam sob demanda (não entram no bundle inicial).

## LGPD

Consent Mode v2 (padrão negado) prefixado no script do GTM (`lib/consent.ts`) + `ConsentBanner` (só aparece com GTM configurado) + `/politica-de-privacidade` (texto a validar com o cliente: razão social, CNPJ, e-mail do encarregado).

## Deploy

Repositório: https://github.com/mppartnersprincipal-svg/site-popolare (branch `main`, público — nunca commitar `.env*`). Ligado à Vercel desde 14/10/2026: push na `main` publica em produção; outras branches geram preview. A CLI fica só como plano B.

Se `vercel deploy` falhar com "fetch failed"/"Not authorized" no upload, use `vercel deploy --prod --yes --archive=tgz`.

Vercel, projeto `popolare-site` → https://popolare-site.vercel.app (envia `X-Robots-Tag: noindex` em qualquer host ≠ loja.popolare.com.br).

Produção: **https://loja.popolare.com.br** (desde 19/10/2026). A cliente quis manter o WordPress antigo em popolare.com.br, então o site novo vive no subdomínio: CNAME `loja` → `fb446e8bd2ee492a.vercel-dns-017.com.` no Editor de Zona do cPanel (HostGator, NS cerrado360). Não usar a ferramenta "Subdomínios" do cPanel (cria A para a hospedagem antiga). LP do Google Ads: `/massas-em-goiania`. Se o host mudar, atualizar o fallback de `SITE_URL` em `data/business.ts` e o regex do noindex em `next.config.ts`. Tracking: GTM `GTM-MJCKV4JS` fixo em `TrackingProvider.tsx` (só carrega com `VERCEL_ENV=production`; `NEXT_PUBLIC_GTM_ID` sobrescreve). No container: Google tag GA4 `G-9K3RYMGLS7`, evento GA4 genérico (`{{Event}}` + parâmetros do dataLayer) e conversão do Google Ads `AW-18514930194` no `click_whatsapp`. Arquivo de importação: `../GTM-Popolare-importar.json`.

## Pontos conhecidos

- `/blog/<slug-inexistente>` responde 200 + `noindex` (prerender parcial); para 404 real, checar slug num `proxy.ts`.
- Visita repetida com massa diferente da padrão troca a foto do hero após hidratar (pequeno flash).
- Lab (Lighthouse mobile simulado, Vercel): LCP 3,7–3,9s, CLS 0, TBT 0,8–2,4s (custo do 3D carregado após o load). A11y/BP 100; SEO 100 no domínio oficial.

## Histórico

- 2026-10-19 — unidade Eldorado removida (fechou): só o Setor Sul em UI, JSON-LD, llms, LP, formulário (retirada fixa) e WhatsApp flutuante (link direto). O painel mantém o rótulo "Eldorado (encerrada)" para eventos antigos.
- 2026-10-14 — sem preços no site; Instagram e horário do Eldorado; botão "Trocar massa" no hero; LP `/massas-em-goiania` para Google Ads.
- 2026-10-14 — cardápio: +6 fotos novas (involtino, tortelli, rondelli de muçarela, molho ao sugo, alla panna, brodo — Drive `2026/EMPÓRIO POPOLARE - FEV-26`) e itens "ao sugo" reaproveitando a foto do produto base. Ainda sem foto no Drive: sfoglia, agnolotti giallo, sfogliatti carne seca, sfogliattini pera, rondelli sem lactose, lasanha de berinjela, fettuccine verde, pappardelle (2), cappelletti de carne, salsa bianca, ragù, quattro formaggi.
- 2026-10-14 — fotos da Carina (pasta "Fotos da Carina" do Drive) em 5 pontos do site + `employee.image` no JSON-LD.
- 2026-10-13 — v1: site completo (home imersiva, 8 páginas internas, blog migrado, SEO/GEO, tracking, LGPD), revisado por 2 agentes (geral + React) e publicado em popolare-site.vercel.app.
