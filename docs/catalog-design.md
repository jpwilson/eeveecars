# EVLineup catalog restructure: design

| | |
|---|---|
| Status | Proposal for JP's review (PR 1). Nothing gets merged by an agent. |
| Date | 2026-10-21 |
| Evidence | `docs/catalog-audit.md` (live audit, 2026-10-20). "audit #N" means row N of its issue table; "audit section N" means its section N. |
| How it was made | Two independent design drafts (A and B) were written from the same audits. Where they agreed, the choice was adopted. Where they differed, the stronger option was chosen or the two were combined; see Decisions. |
| Paths | `ev_backend/...` and `eeveecars/...` are repo-relative. Files marked *(new)* don't exist yet. |
| Markers | UNVERIFIED means it could not be confirmed without database or dashboard access |

## Summary for the owner

- **Fix the live breakage first (PR 0, a few lines in the backend, already opened as [ev_backend#7](https://github.com/jpwilson/ev_backend/pull/7)).** One required "average rating" field breaks 32 model pages, every manufacturer page and 6 compare pages. It ships before anything else and is separate from the five planned PRs.
- **New structure: Make → Model → Generation → Variant → Market and model year.** Today's trim rows become the variants and keep their IDs, so favourites, notes and old links keep working.
- **Every level gets a status: upcoming, current, discontinued, or cancelled for cars that were announced but never built.** A brand can be defunct.
  - The backend works out the status once, and every page and API uses that result.
  - Fisker and Canoo keep their pages as history but never appear as current, on the homepage or in best lists.
  - This replaces PR #8's hand-written brand list with data.
- **Every number gets a source link and a "verified on" date.**
  - Range always names its test cycle (EPA, WLTP or CLTC).
  - Prices carry currency and market.
  - Old numbers without a source stay visible, labelled "unverified", until research replaces them.
- **Yes, a database migration is needed.** It only adds tables and columns, and it can be undone. The first data step changes nothing on the live site (old pages and API return byte-identical data), which makes it easy to check.
- **New readable URLs**, for example `/make/tesla/model-3/2024/long-range-awd`. Every old URL (`/model_detail/...`, `/manufacturer/...`, `/car_detail/...`) permanently redirects to its new address in one hop, so nothing 404s and search ranking carries over.
- **Model pages show the newest generation first.** An "Earlier generations" section follows, and each earlier generation has its own specs and photos.
- **Photos come only from manufacturer press sites.** Each is stored with the press page it came from and the exact credit line, and you approve each one before it goes live. Existing photos stay until replaced.
- **Research is a repeatable pipeline, not hand edits.**
  - Scripts list every EV per region and rank them by interest (Wikipedia pageviews plus US sales).
  - An agent fills small batches with sources, and a validator checks them.
  - You approve the changes in the existing Data Inbox.
  - Order: the top 30 US EVs first (6 batches of 5), then the remaining US models, Europe, China, Japan, Korea and India.
- **The agent surface is generated from the database with real dates.** That covers `llms.txt`, the sitemap, the page markup (JSON-LD) and the public API. The dead API links in `llms.txt` get fixed.
- **What I need from you:** database read access, the GitHub secret for the data pipeline, and answers to the questions at the end. Each question has a recommended default.

## Decisions

Adopted because both drafts agreed:
- PR 0 hotfix first.
- `cars` stays as the variant table, with ids kept. Migration 002's `models` table is reused, and a `generations` table is added.
- A refresh (e.g. Model 3 "Highland") gets its own generation row (`kind='refresh'`). The generation slug is its first model year.
- Variant pages are real, indexable pages that replace `/car_detail/{id}`.
- The default generation is the newest current one.
- Lifecycle vocabulary: `upcoming / current / discontinued / cancelled`. The effective status is computed once in the backend.
- Every value carries a source URL and a verified date. Unsourced legacy values are shown as "unverified".
- Images come from manufacturer press sites only, with credit lines. Legacy images stay until replaced.
- Research flows as: batch file in a PR → change proposals → Data Inbox approval. Re-verifications with an unchanged value apply automatically; changed values always need JP.
- PR #8's `DEFUNCT_BRANDS` lists are replaced by data.
- Make financials are hidden.
- Battery-electric only.
- Never convert currencies, test cycles, or 0-60 to 0-100.
- No large multi-agent test campaigns.

Where the drafts differed:

| # | Decision | Chosen | Alternative considered | Why |
|---|---|---|---|---|
| 1 | Where specs, prices and their sources live | **Typed columns** (A). Variant-wide specs stay on `cars`. Market × model-year values go in a new `variant_markets` table. Every row has a `sources` list with per-field entries. | One `spec_facts` row per value, holding market, cycle, qualifier and history (B) | Lists, sorting and best-of rankings stay plain SQL with typed checks. Change history already lives in `change_proposals`. The multi-value cases B solves (EPA vs WLTP range, US vs EU price) are simply one `variant_markets` row each. |
| 2 | Shape of `sources` | **Keep migration 002's list**, adding `verified_at`, `quote` and `proposal_id` to each `{field, url, name}` entry (B) | Convert to an object keyed by column (A) | No data conversion. Matches the existing approval code (`ev_backend/routers/proposals.py:275`). Allows two sources for lifecycle facts. |
| 3 | Per-market status | **`model_markets`** for status and local name per model per market (B), **plus `variant_markets`** for per-market values (A) | A status on every variant × market row (A); facts only (B) | The real-world changes in the audit happen per model per market (Ioniq 6, Polestar 2 and ID.Buzz in the US). One row per model is cheap to research and drives list filtering. |
| 4 | Make status | **Keep `makes.status`** as the stored company fact (active / pre-production / defunct / acquired) and add `status_date`. The displayed make label is computed from it and from the make's models. | New `lifecycle` column with a new vocabulary (B); keep plus a CHECK only (A) | One stored fact, so no second status column can drift. Today's sidebar keeps working (`src/components/ManufacturerList.tsx:78-84`). A brand's current/upcoming/discontinued label follows from its models automatically. |
| 5 | Effective status | **Coerce down the tree.** Under a defunct brand or discontinued parent, a child's "current" becomes "discontinued" and "upcoming" becomes "cancelled". `brand_status` is exposed separately. One Python service computes it (B). | Replace the status with `'defunct-brand'`, computed in an SQL function (A) | The model's own fact stays visible ("Cancelled before production · brand defunct"). One testable implementation. |
| 6 | Migration tooling | **Alembic revisions.** `catalog_01` adopts 002/003 idempotently, `catalog_02` adds the hierarchy, and `catalog_03` adds NOT NULLs after the backfill. `alembic upgrade --sql` can produce plain SQL for the Supabase editor (B). | Hand-run `004/005` SQL files with snapshot tables (A) | Safe whether or not 002/003 already ran, which is unknown. One version history and a built-in downgrade. |
| 7 | What the migration PR changes on the live site | **Nothing.** The backfill writes only new tables and columns, and old endpoints stay byte-identical (B). | Also rewrite legacy columns so today's pages improve at once (A) | PR 2 is then safe to apply and trivial to verify. Visible corrections arrive through reviewed, sourced changes. A's legacy sync is kept for the approval path (section 4.5). |
| 8 | Redirect mechanism | **The existing prerender function** (`page=legacy`) asks the backend's `/catalog/resolve`. `url_redirects` stores the target *entity*, and the path is computed at request time. A backend error returns 503, never 404. (B's mechanism with A's table design and error rule.) | New `api/redirect.js` function (A); store a `to_path` per row (B) | No extra function. Later renames never create redirect chains. An outage never turns an old URL into a 404. |
| 9 | PR boundaries | **Read API is its own backend PR (3a). The new sitemap ships in 3a and is switched on in 3b**, in the same deploy as the URL change. The soft-404 fix is in PR 5. | Read API inside PR 2, `seo.py` changed "the same day" as PR 3, soft-404 fix in 3b (mix of A and B) | Smaller PRs, and an atomic URL and sitemap switch |
| 10 | `llms.txt` generation | **Backend endpoint**, rewritten through like the sitemap (B) | Frontend function `api/llms.js` (A) | The backend owns the data, and no extra function is needed |
| 11 | Model URL slug | **Prefix the make only when the name is all digits** (`polestar-2`) (A) | Also prefix names of 2 characters or fewer (B) | `/make/bmw/i4` reads better than `/make/bmw/bmw-i4` |
| 12 | Images | **`model_id` required, plus optional generation and variant.** Originals are only resized; the aspect ratio is enforced in CSS around a focal point. Files are uploaded as `pending` so JP sees the real file before approving (B). | One owner per image, logos included; every image cropped to 16:9; download only on approval (A) | No lossy crops, and review happens on the actual stored image. Logos are handled separately: self-hosted, with the source in `makes.sources`. |
| 13 | Body type level | **Variant column `body_type`**; NULL inherits `models.body_style` (B) | Model level only (A) | The brief lists body type among the variant specs |
| 14 | EPA checker | **Rewrite `epa_range_check.py` and `data-freshness.yml` in place**: one EPA id per variant and model year, weekly schedule, Node 24 actions (B) | Delete them and add a new workflow (A) | Prefer changing existing code; same result |
| 15 | Price history | **`change_proposals`** (old/new value, source, dates) plus `launch_price`. `price_snapshots` is left unused, not dropped (B). | Write a `price_snapshots` row on every price approval (A) | One history store; no speculative feature |
| 16 | Top-30 batch size | **6 batches of 5 models** (A) | 3 batches of 10 (B) | JP asked for small PRs; about 150-250 values per review |
| 17 | Interest ranking | **Score = 0.6 × Wikipedia-pageview percentile + 0.4 × US-sales percentile** (A) | Pageview rank, with sales only as a sanity check (B) | An explicit formula is repeatable and auditable |
| 18 | Top-30 membership | **Chevrolet Blazer EV and GMC Hummer EV in**; BMW iX and Nissan Ariya as alternates (B) | iX and Ariya in (A) | Ariya ended in the US for MY2026 (audit #4). The script's output decides the final list anyway. |
| 19 | JSON-LD offers | **Price only when sourced. Never `InStock`**, because EVLineup doesn't sell cars. `Discontinued` or `PreOrder` only when true (B). | `on_sale → InStock` (A) | Not a seller, so this avoids misleading rich results |
| 20 | Public API | **Extend `api/ev/specs.js` with the full tree** (A). `/api/ev/all` excludes defunct brands by default, as PR #8 does, and `?status=` selects others. | New `model.js` function (B); default `status=current` only (A) | One endpoint per concept, fewer functions. Matches PR #8's behaviour while discontinued models stay discoverable. |
| 21 | Admin Vehicle Editor | **Edits stay allowed but clear that field's source**, so the value shows as "unverified". A required source box comes later (B). | Make fact fields read-only and route edits through the Inbox (A) | Less work, and JP isn't locked out of quick fixes |

## 1. Goals and non-goals

**Goals**
1. Be the most complete, correct and current catalog of every EV, and be trusted by people and AI agents as the reference source.
2. Use the hierarchy Make → Model → Generation → Variant → Market and model year, with a status at every level.
3. Hold specs at variant level, with units, test cycle, currency and market. Every value has a source URL and a verified date.
4. Use stable, readable URLs. Every existing URL redirects in one hop, and nothing 404s.
5. Run a repeatable research and freshness process with human approval. US first, then EU, China, Japan, Korea and India.
6. Expose the hierarchy and real dates in `llms.txt`, the sitemap, JSON-LD and `/api/ev/*`.
7. Ship as small PRs with light validation, rebased on PR #8.

**Non-goals**
- Dealer listings, marketplace or ads. No changes to the privacy policy.
- PHEV, EREV or fuel-cell vehicles.
- Renaming the `cars` table, or dropping legacy columns or endpoints. That is a separate cleanup after 30 days of clean logs.
- Pages for individual model years. A model year redirects to its generation.
- Per-country EU prices. Presenting converted currency, a converted test cycle, or 0-60 converted to 0-100 as a fact.
- Copying specs between rebadged twins. Non-press or AI-generated images. Scraping Tesla's site or CDN.
- Auto-applying changed values.
- Fixing make financials; they are hidden instead.
- Moving all 254 MB of legacy images at once.
- A real MCP server, GraphQL, or a server-rendering framework rewrite.
- The apex-domain double redirect (audit #31), NewsTicker, and the People pages.
- Large multi-agent test campaigns.

## 2. Taxonomy and definitions

### 2.1 Levels

| Level | Definition | Stored in | Key | Example |
|---|---|---|---|---|
| Make | The brand on the badge, not the parent group | `makes` | `makes.slug` *(new)* | `tesla`, `polestar` |
| Model | One make's nameplate, continuous across generations | `models` (migration 002) | `models.url_slug` *(new)*, unique per make. `models.slug` = legacy `make_model_slug`, kept as the API key. | `model-3` / `tesla-model-3` |
| Generation | One design era: a new generation or a major refresh | `generations` *(new)* | `generations.slug` = start year, unique per model | `2024` ("Highland") |
| Variant | A configuration you can buy, with fixed hardware (battery, motors, drivetrain) | `cars` (existing rows; ids unchanged) | `cars.variant_slug` *(new)*, unique per generation | `long-range-awd` |
| Offering | A variant as sold in one market and model year: prices, range with test cycle, charge connector | `variant_markets` *(new)* | `(car_id, market, model_year)` | Model 3 Long Range AWD, US, MY2026 |
| Model × market | A model's lifecycle in one market | `model_markets` *(new)* | `(model_id, market)` | Ioniq 6, US, discontinued |

### 2.2 Generation, refresh, model year, variant

| Change | Treatment |
|---|---|
| The maker calls it a new generation, or it uses a new platform or body | New `generations` row with `kind='generation'` and `ordinal` + 1 |
| New exterior or interior design **and** at least one headline spec changed (battery, motors, range, charging) | New `generations` row with `kind='refresh'` and the same `ordinal`. It gets its own section, photos and URL, because buyers search for it separately ("Highland vs pre-Highland"). |
| New hardware under the same trim name | New variant; the old variant becomes `discontinued` |
| Price, colours, packages, small range re-ratings, software | New offering rows (model year) on the same variant. No new page. |

- `start_year` is the first US model year if the car was sold in the US, otherwise the first calendar year of customer deliveries. `end_year` is NULL while the car is on sale.
- Example (illustrative; the seed file decides): Tesla Model 3 `2017` (original, 2017-2023) and `2024` (Highland, refresh).

### 2.3 Markets and model years

- **Markets:** `US, CA, EU, UK, CN, JP, KR, IN, AU`. `EU` means the EEA plus Switzerland; its price is the German list price including VAT. More markets can be added to the CHECK lists later.
- **Model-year brands** (Kia, BMW, …): a new model year adds offering rows and never overwrites the previous year.
- **Continuous-update brands** (Tesla, Rivian, Lucid, Polestar, per `update_cadence` from 002):
  - US offerings still carry the EPA model year.
  - Markets without model years (EU, CN, JP) store `model_year = NULL`, meaning "currently offered".
  - Superseded values remain in `change_proposals`.
- **Market-only trims:** a trim sold only in China is one variant with only a `CN` offering. If the "same" trim has different hardware in different markets (for example an LFP vs an NMC battery), it is two variants.

### 2.4 Reuse, renames, rebadges

- **Same make, same name, same role** → one model with a new generation, even after a gap. Example: Chevrolet Bolt `2017` and `2027`. The Bolt EUV is a separate model.
- **Renamed in every market** (XC40 Recharge → EX40):
  - It stays one model under the current name.
  - The old name goes into `models.aliases`, and `generations.marketed_name` records the name used in each era.
  - The old slug redirects.
- **Renamed in some markets only** → `model_markets.local_name` (e.g. BYD Atto 3 is "Yuan Plus" in China).
- **Rebadges and twins** (bZ ↔ Solterra, Prologue ↔ Blazer EV):
  - Each badge is its own model.
  - They are linked in `model_relations` (`twin`, `successor`).
  - Specs are never copied from the twin.
- **Duplicates are merged in the seed, with redirects:**
  - `polestar-two` → `polestar-2`.
  - Canoo LDV 130 and LDV 190 → one `canoo-ldv` model with two variants.

### 2.5 Status

| Level | Stored values | Meaning |
|---|---|---|
| Make (`makes.status`, existing) | `active`, `pre-production`, `defunct`, `acquired` | Company fact. `acquired` is used only when the brand is no longer sold under its own name. |
| Model, generation, variant, model × market | `upcoming`, `current`, `discontinued`, `cancelled` | `cancelled` = announced but never delivered (Fisker Pear, Ronin, Kayak). A variant with NULL inherits its generation's status. |

The effective status is computed once (`ev_backend/services/catalog_status.py` *(new)*). Every page, list and API uses it.
- `brand_status` is `defunct` when `makes.status` is `defunct` or `acquired`. Every page under that make shows a "Defunct brand" badge with the date. This is the brief's "defunct-brand" status.
- The coercion rule `coerce(own, parent)` is applied make → model → generation → variant:
  - If the parent is discontinued or the brand is defunct: `current` becomes `discontinued` and `upcoming` becomes `cancelled`.
  - If the parent is cancelled, the child becomes cancelled.
  - A parent that is upcoming with a child that is current is flagged as a data error.
- The make's displayed label is:
  - `defunct` if the brand is defunct;
  - otherwise taken from its models: current if any model is current, else upcoming if any is upcoming, else discontinued;
  - for a make with no models yet, `pre-production` shows as upcoming and `active` as current.
- **On sale in market M** = effective status `current` **and** `model_markets(M).status = 'current'`.
- **Homepage, best lists and "current" counts** require: on sale in the selected market (default US), not `is_commercial`, and not under a defunct brand. A "Coming soon" row shows effective `upcoming`.
- **Weekly consistency checks** (reported as warnings, not database constraints):
  - A current model has at least one current generation, which has at least one current variant.
  - A current model has at least one current market.
  - A defunct brand has no current or upcoming models.
  - A cancelled entity has no prices.

### 2.6 Scope

- **Included:** battery-electric cars, SUVs, pickups and passenger vans.
- **Commercial vehicles:** the existing entries (Tesla Semi, `rivian-fleet`, the Canoo LDV) stay, with `models.is_commercial = true`, and are kept out of consumer lists.
- **Excluded:** PHEV, EREV and fuel-cell. The F-150 Lightning EREV is therefore out.

## 3. Data model

### 3.1 Shape

```
makes (existing)          + slug, status_date, external_ids            [002: sources, last_verified_at, update_cadence]
 └ models (002)           + url_slug, aliases[], is_commercial, external_ids; status vocabulary remapped
    ├ model_markets   NEW   lifecycle and local name per market, sourced
    ├ model_relations NEW   twin / successor
    └ generations     NEW
       ├ images       NEW   model_id required; generation_id, variant_id optional (section 7)
       └ cars = variants (existing ids) + generation_id, variant_slug, status, body_type, drivetrain,
          │                                acceleration_0_100_kmh, battery_capacity_basis   [002: model_id, sources, last_verified_at]
          └ variant_markets NEW   market × model year: prices, range + cycle + unit, connector, EPA id
url_redirects NEW · change_proposals and crawl_runs (003, extended) · price_snapshots (003, unused)
```

### 3.2 DDL sketch (Alembic `catalog_02_hierarchy`)

```sql
-- makes (existing). The legacy `status` column stays the stored company fact.
ALTER TABLE makes
  ADD COLUMN slug text,                                   -- frozen once published; NOT NULL in catalog_03
  ADD COLUMN status_date date,                            -- e.g. Fisker Chapter 11 on 2024-06-17
  ADD COLUMN external_ids jsonb NOT NULL DEFAULT '{}',    -- {"wikidata": "Q..."}
  ADD CONSTRAINT makes_status_chk
    CHECK (status IS NULL OR status IN ('active','pre-production','defunct','acquired'));
CREATE UNIQUE INDEX makes_slug_uq ON makes (slug);

-- models (from 002): new lifecycle vocabulary + URL slug
ALTER TABLE models
  DROP CONSTRAINT models_status_check,                    -- 002: announced/pre_order/in_production/discontinued/cancelled
  ADD COLUMN url_slug text,                               -- 'model-3'; NOT NULL in catalog_03
  ADD COLUMN aliases text[] NOT NULL DEFAULT '{}',        -- former and market names, used by search
  ADD COLUMN is_commercial boolean NOT NULL DEFAULT false,
  ADD COLUMN external_ids jsonb NOT NULL DEFAULT '{}',    -- {"wikidata": "...", "enwiki": "Tesla_Model_3"}
  ADD CONSTRAINT models_url_slug_chk CHECK (url_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      AND url_slug !~ '^[0-9]+$' AND position('-vs-' in url_slug) = 0);
UPDATE models SET status = CASE status WHEN 'in_production' THEN 'current'
  WHEN 'announced' THEN 'upcoming' WHEN 'pre_order' THEN 'upcoming' ELSE status END;
ALTER TABLE models ALTER COLUMN status SET DEFAULT 'current',
  ADD CONSTRAINT models_status_chk CHECK (status IN ('upcoming','current','discontinued','cancelled'));
CREATE UNIQUE INDEX models_make_url_slug_uq ON models (make_id, url_slug);

CREATE TABLE generations (
  id               serial PRIMARY KEY,
  model_id         int  NOT NULL REFERENCES models(id),
  slug             text NOT NULL CHECK (slug ~ '^[0-9]{4}(-[a-z0-9]+)*$'),    -- '2024', '2025-gen2'
  name             text NOT NULL,                       -- 'Highland', 'Second generation'
  kind             text NOT NULL CHECK (kind IN ('generation','refresh')),
  ordinal          smallint,                            -- a refresh keeps its generation's number
  code_name        text,
  marketed_name    text,                                -- the model's name in this era, e.g. 'bZ4X'
  platform         text,
  start_year       smallint,
  end_year         smallint,                            -- NULL while on sale
  status           text NOT NULL CHECK (status IN ('upcoming','current','discontinued','cancelled')),
  description      text,
  sources          jsonb NOT NULL DEFAULT '[]',
  last_verified_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (model_id, slug)
);

-- cars = variants (existing rows and ids unchanged; legacy columns untouched)
ALTER TABLE cars
  ADD COLUMN generation_id int REFERENCES generations(id),            -- NOT NULL in catalog_03
  ADD COLUMN variant_slug text,
  ADD COLUMN status text CHECK (status IN ('upcoming','current','discontinued','cancelled')),  -- NULL = inherit
  ADD COLUMN body_type text CHECK (body_type IN ('sedan','hatchback','wagon','coupe','convertible',
                                                 'suv','pickup','van','minivan','microcar')),  -- NULL = model's
  ADD COLUMN drivetrain text CHECK (drivetrain IN ('FWD','RWD','AWD')),
  ADD COLUMN acceleration_0_100_kmh real,                               -- measured separately, never derived
  ADD COLUMN battery_capacity_basis text CHECK (battery_capacity_basis IN ('usable','gross'));
CREATE UNIQUE INDEX cars_generation_variant_uq ON cars (generation_id, variant_slug);

CREATE TABLE model_markets (
  model_id         int  NOT NULL REFERENCES models(id),
  market           text NOT NULL CHECK (market IN ('US','CA','EU','UK','CN','JP','KR','IN','AU')),
  status           text NOT NULL CHECK (status IN ('upcoming','current','discontinued','cancelled')),
  local_name       text,
  launch_date      date,
  end_date         date,
  basis            text NOT NULL CHECK (basis IN ('sourced','legacy')),
  sources          jsonb NOT NULL DEFAULT '[]',
  last_verified_at timestamptz,
  PRIMARY KEY (model_id, market),
  CHECK (basis = 'legacy' OR jsonb_array_length(sources) > 0)
);

CREATE TABLE variant_markets (
  id                serial PRIMARY KEY,
  car_id            int  NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  market            text NOT NULL CHECK (market IN ('US','CA','EU','UK','CN','JP','KR','IN','AU')),
  model_year        smallint,                           -- NULL where the market has no model years
  currency          char(3),                            -- ISO 4217, native, never converted
  launch_price      numeric(12,2),
  launch_price_date date,
  current_price     numeric(12,2),
  price_basis       text CHECK (price_basis IN ('msrp_excl_destination','msrp_incl_destination','list_incl_vat')),
  range_value       numeric(6,1),
  range_unit        text CHECK (range_unit IN ('mi','km')),
  range_cycle       text CHECK (range_cycle IN ('EPA','WLTP','CLTC','WLTC','KR','MIDC')),
  connector         text CHECK (connector IN ('NACS','CCS1','CCS2','GBT','CHADEMO')),
  is_estimate       boolean NOT NULL DEFAULT false,     -- manufacturer target, upcoming models only
  external_ids      jsonb NOT NULL DEFAULT '{}',        -- {"epa_id": 12345}
  sources           jsonb NOT NULL DEFAULT '[]',
  last_verified_at  timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (range_value IS NULL OR (range_unit IS NOT NULL AND range_cycle IS NOT NULL)),
  CHECK (coalesce(launch_price, current_price) IS NULL OR (currency IS NOT NULL AND price_basis IS NOT NULL))
);
CREATE UNIQUE INDEX variant_markets_uq ON variant_markets (car_id, market, coalesce(model_year, 0));

CREATE TABLE model_relations (
  model_id         int  NOT NULL REFERENCES models(id),
  related_model_id int  NOT NULL REFERENCES models(id),
  relation         text NOT NULL CHECK (relation IN ('twin','successor')),
  sources          jsonb NOT NULL DEFAULT '[]',
  PRIMARY KEY (model_id, related_model_id, relation),
  CHECK (model_id <> related_model_id)
);

CREATE TABLE url_redirects (
  old_path    text PRIMARY KEY,                         -- '/model_detail/polestar-two', '/car_detail/204'
  entity_type text NOT NULL CHECK (entity_type IN ('make','model','generation','variant')),
  entity_id   int  NOT NULL,                            -- target path computed from the entity at request time
  reason      text NOT NULL CHECK (reason IN ('legacy','rename','merge','alias')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- change_proposals (003): creates, verifications, batches
ALTER TABLE change_proposals
  ADD COLUMN op text NOT NULL DEFAULT 'update' CHECK (op IN ('create','update','verify','retire')),
  ADD COLUMN entity_key text,         -- 'tesla/model-3/2024/long-range-awd'; resolves creates inside a batch
  ADD COLUMN payload jsonb,           -- full record for 'create'; market and model_year for offering fields
  ADD COLUMN source_quote text,       -- verbatim text containing the value, max 200 chars
  ADD COLUMN batch_key text,
  ALTER COLUMN entity_id DROP NOT NULL,
  ALTER COLUMN field DROP NOT NULL;
-- entity_type CHECK widened to: car, make, model, generation, variant_market, model_market, model_relation, image

-- Row-level security, no anon policies, on every new table and on the 002/003 tables:
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;   -- likewise model_markets, variant_markets, model_relations,
                                                     -- url_redirects, images, models, crawl_runs, change_proposals,
                                                     -- price_snapshots
```

- The `images` table is defined in section 7.2.
- Statuses and enums are TEXT columns with CHECK constraints, matching 002/003, so they are easy to change.
- RLS: migrations 002/003 never enabled it. Without it, Supabase's Data API could expose those tables to anyone holding the public anon key (UNVERIFIED; checked in pre-flight). The backend connects as the table owner, so RLS doesn't affect it (UNVERIFIED; the pre-flight lists table owners).

### 3.3 Provenance

- **Format.** Each row's `sources` is a list of `{field, url, name, verified_at, quote, proposal_id}`.
  - Today's approval code writes `{name, url, field}` (`ev_backend/routers/proposals.py:275`), so the new keys are additive.
  - Approving a value **replaces** that field's entries. Lifecycle facts may keep two entries.
- **Unsourced values.** A field with no entry is "unverified". The API returns `verified: false` and pages show a small label.
- **Row-level `last_verified_at`** is the newest `verified_at` on the row. "Last updated" is `max(updated_at, last_verified_at)` over a page's entity and everything under it.

### 3.4 Where each spec lives

| Spec | Column | Unit | Rule |
|---|---|---|---|
| Range | `variant_markets.range_value`, `range_unit`, `range_cycle` | mi (EPA) or km (WLTP, CLTC, WLTC, KR, MIDC) | Per market and model year. Never converted. `cars.epa_range` becomes a cache of the latest US EPA value. |
| Battery | `cars.battery_capacity`, `battery_capacity_basis` | kWh | Usable or gross must be stated |
| 0-60 mph / 0-100 km/h | `cars.acceleration_0_60` / `cars.acceleration_0_100_kmh` | s | Two separate measured facts |
| Top speed | `cars.top_speed` | mph | |
| Power, torque | `cars.power`, `cars.torque` | hp, lb-ft | Peak combined |
| DC charging peak | `cars.battery_max_charging_speed` | kW | |
| Connector | `variant_markets.connector` | NACS / CCS1 / CCS2 / GBT / CHADEMO | Per market |
| Price at launch, current price | `variant_markets.launch_price`, `launch_price_date`, `current_price`, `currency`, `price_basis` | Native currency | Never converted. `cars.current_price` becomes a cache of the latest US MSRP. |
| Body type | `cars.body_type` (NULL = `models.body_style`) | enum | |
| Drivetrain | `cars.drivetrain` | FWD / RWD / AWD | The legacy `drive_type` text is kept |
| Seats | `cars.number_of_full_adult_seats` | count | |

## 4. Migration and backfill plan

### 4.1 Is a migration needed? Yes.

Today generations, markets, model years, sources, image credits and URL history have nowhere to live except free text on one wide row (audit section 1). That is the root of the status, slug and best-list bugs. Every change below is additive. Old endpoints keep their exact response shapes.

### 4.2 Pre-flight (read-only; needs the database access JP offered)

1. Run the SQL in audit section 6. It answers:
   - whether 002/003 are applied, and the `alembic_version`;
   - constraints, triggers, RLS and table owners;
   - duplicate and NULL `full_slug` rows;
   - the Postgres version.
2. Stop and reconcile if `alembic_version` is not `a3f8b2c1d4e5`, or if any `makes.status` value falls outside the new CHECK.
3. Take a `pg_dump` of the public schema. Supabase point-in-time recovery is UNVERIFIED.
4. Run migrations over the direct connection (port 5432), not the transaction pooler (6543).

### 4.3 Revisions (`ev_backend/alembic/versions/`, chained after `a3f8b2c1d4e5`)

| Revision | Upgrade | Downgrade |
|---|---|---|
| `catalog_01_adopt_002_003` | The DDL of 002/003 as `IF NOT EXISTS`. It skips 002's backfill `INSERT`/`UPDATE`s, whose status mapping is wrong (`002:39-44`). Enables RLS on the 002/003 tables. | No-op (documented), because the objects may predate it |
| `catalog_02_hierarchy` | Everything in section 3.2, plus the `images` table (section 7.2) | Drops everything it added. Restores 002's status CHECK, mapping `upcoming→announced` and `current→in_production` (lossy for `pre_order`, documented). Deletes proposals that use the new ops or entity types, then restores the `NOT NULL`s. |
| `catalog_03_not_null` (after the backfill is reviewed and applied) | `NOT NULL` on `makes.slug`, `models.url_slug` and `cars.generation_id` | Drops those `NOT NULL`s |

`alembic upgrade a3f8b2c1d4e5:catalog_02_hierarchy --sql` prints plain SQL if JP prefers the Supabase SQL editor. The offline mode is already supported by `ev_backend/alembic/env.py`.

### 4.4 Backfill (`ev_backend/scripts/catalog/backfill.py` *(new)*, idempotent, `--dry-run` by default)

1. **`draft-seed`** reads today's rows and writes `ev_backend/catalog/seed/structure.yaml` *(new)*. It uses these heuristics:
   - Trim whitespace.
   - Group `previous_generation` rows by their cleaned `generation` label.
   - Treat trim names ending in "(2021)" or "(1st Gen)" as earlier generations.
   - Use "Highland" and "Juniper" as code names, and "Gen 2" or "2nd Generation" as the ordinal.
   - Take the start year from `carmodel_first_released`.
   - Mark anything uncertain `review: true`.
2. **The agent curates the YAML.** About 24 models have mixed generation labels; the rest get one generation each. Cases already known to need a decision:
   - Tesla: Model 3, Model Y, Roadster
   - Kia: EV6, Niro
   - Porsche: Macan, Taycan
   - Rivian: R1S, R1T
   - Audi Q8 e-tron (rename and refresh)
   - Nissan Leaf; Toyota bZ4X → bZ

   **JP reviews** the YAML and `backfill_report.csv` (every guess, one per line) in PR 2.
3. **`apply`** fills the new tables and columns only:
   - It writes with plain SQL that never sets `updated_at`, which drives sitemap `lastmod`. The pre-flight trigger query confirms that no trigger bumps it.
   - It never writes a legacy column.
   - **`--revert`** truncates the new tables and NULLs the new columns.

Illustrative seed entry:

```yaml
models:
  tesla-model-3:                  # models.slug = legacy make_model_slug (kept as the API key)
    url_slug: model-3
    status: current
    markets: {US: {status: current, basis: legacy}}
    generations:
      - {slug: "2017", kind: generation, ordinal: 1, name: Original, start_year: 2017, end_year: 2023,
         status: discontinued, variants: {23: standard-range, 24: long-range, 4: performance}}
      - {slug: "2024", kind: refresh, ordinal: 1, name: Highland, start_year: 2024, status: current,
         variants: {204: standard-range}}
    review: true                  # ids 24 and 4 are labelled current today
```

| Legacy value | New value | Review? |
|---|---|---|
| `available`, `Available` | `current` | No |
| NULL (31 models), year strings (`2020`, `2022`, `2024`) | `current` (a guess) | Yes |
| Any value, where the audit cites a sourced end (Model S/X, F-150 Lightning, I-Pace, Q8 e-tron, Genesis G80, Zoe; audit #4) | `discontinued`, with that source | Yes |
| `2025` (Roadster), `Not yet released` | `upcoming`. Exception: Polestar 4 becomes `current` (audit #6). | Yes |
| `discontinued` | `discontinued`. Fisker Pear, Ronin and Kayak become `cancelled`. | No |
| `previous_generation` trims | Assigned to an earlier, `discontinued` generation | Yes |
| `available_countries` mentions the US | `model_markets` US row, `basis='legacy'` | Yes |
| Sourced US exits (Ariya, Ioniq 6, ID.4, ID.Buzz, Polestar 2; audit #4) | `model_markets` US = `discontinued`, with the audit's source | Yes |
| `makes.status` | Unchanged. `status_date` comes from `status_details` where it states a date. | No |

The seed also holds:
- **Make slugs:** `mercedes-benz`, `volkswagen`, `kia`, `citroen`.
- **Merges** (section 2.4).
- **`is_commercial` flags.**
- **Placeholder values to ignore**, which are not copied anywhere new: Fisker Pear's zero range and 0-60, and the Tesla Semi's 20 s 0-60.
- **`url_redirects` for every legacy path:**
  - 87 model slugs plus `polestar-two`;
  - 35 manufacturer slugs plus the aliases `citroen`, `citroën`, `mercedes-benz` and `volkswagen`;
  - 212 `/car_detail/{id}`.

**Legacy prices and ranges are not copied into `variant_markets`.** Their currency and test cycle are unknown. They stay in the legacy columns as "unverified" fallbacks until research supplies sourced values.

**Name typos** ("Flaship", `"Leaf\n"`, submodel `_`) change visible text, so they are fixed through reviewed proposals in batch 1, not in the backfill. Until then, new pages take the model name from `models.name`, which the seed sets cleanly; variant-name typos remain until batch 1.

### 4.5 Keeping old endpoints working

- Every route in `ev_backend/routers/cars.py`, `makes.py` and `seo.py` keeps its response shape. The new API lives in `routers/catalog.py` *(new)*. Old routes are marked deprecated in the backend OpenAPI, not removed.
- **Slug freeze** (PR 2):
  - The update listener stops regenerating slugs (`ev_backend/models/orm_models.py:169-184`).
  - The insert listener fills a slug only when it is NULL (`:157-165`).
  - From then on, a URL changes only through `url_redirects`.
- **Legacy cache sync on approval** (PR 4a). Approving a sourced value also updates the legacy columns that old endpoints read:
  - `cars.epa_range` from the latest US EPA offering;
  - `cars.current_price` from the latest US MSRP;
  - `availability_desc` and `production_availability` from the effective status, mapped as in the table below.

  A one-off `backfill.py sync-legacy --dry-run`, then a real run, brings legacy columns in line with the seed after PR 3b ships, if JP wants the old endpoints corrected too.

| Effective status | `availability_desc` | `production_availability` |
|---|---|---|
| current | `available` | true |
| upcoming | `Not yet released` | false |
| discontinued, cancelled | `discontinued` | false |
| variant outside the default generation | `previous_generation` | unchanged |

- **Admin Vehicle Editor:** saving a spec field clears that field's `sources` entry, so it shows as unverified (decision 21).

### 4.6 Apply order and rollback

| Step | Who | Rollback |
|---|---|---|
| 1. Merge PR 2 (migrations, backfill script, seed, slug freeze; no runtime reads of the new columns) | JP | Revert the PR |
| 2. Pre-flight, then `pg_dump` | Agent, with read access | – |
| 3. `alembic upgrade catalog_02_hierarchy` in production | JP, or the agent after JP says "go" | `alembic downgrade catalog_01_adopt_002_003` |
| 4. `backfill.py apply`, then `catalog_03_not_null` | Same | `alembic downgrade catalog_02_hierarchy`, then `backfill.py --revert` |
| 5. Merge PR 3a (the ORM now maps the new columns) | JP | Vercel instant rollback **before** any schema downgrade |

Research batches are reverted with `research/revert_batch.py --batch-key X` *(new)*, which files reverse proposals from the stored `old_value`s.

## 5. URLs and redirects

### 5.1 Canonical scheme

| Page | URL | Example |
|---|---|---|
| All makes | `/make` | `/make` |
| Make | `/make/{make}` | `/make/tesla` |
| Model | `/make/{make}/{model}` | `/make/tesla/model-3` |
| Generation | `/make/{make}/{model}/{generation}` | `/make/tesla/model-3/2024` |
| Variant | `/make/{make}/{model}/{generation}/{variant}` | `/make/tesla/model-3/2024/long-range-awd` |
| Compare | `/compare/{a}-vs-{b}` (`models.slug`, alphabetical) | `/compare/bmw-i4-vs-tesla-model-3` |
| Best list | `/best/{criteria}` | unchanged |

A model year inside a generation, such as `/make/tesla/model-3/2025`, gets a 301 to the generation that contains it.

**Slug rules.** All slugs are lowercase ASCII `[a-z0-9-]` with accents transliterated. Once published they never change; a change adds a `url_redirects` row.

| Level | Rule | Examples |
|---|---|---|
| Make | Official brand name, transliterated; exceptions stored in the seed | `citroen`, `mercedes-benz` |
| Model | `slugify(name)`. If the result is all digits, prefix the make. Must not contain `-vs-`. | `model-3`, `id-4`, `polestar-2` |
| Model API key (`models.slug`) | Existing models keep the legacy `make_model_slug`, so API calls and compare URLs keep working. New models use `{make}-{url_slug}`. | `tesla-model-3`, `hummer-ev` |
| Generation | First US model year if sold in the US; else first year of customer deliveries; else the reveal year. If two generations start in the same year, the later one becomes `{year}-{code_name}`, or `{year}-gen{n}`/`{year}-refresh`. | `2017`, `2024` |
| Variant | Trim name with year and generation hints removed. If two variants collide, add the distinguishing spec. | `long-range-awd`, `standard-82kwh` |

### 5.2 Mapping from every existing URL pattern

| Existing URL | Count / examples | New target | Response | How (PR) |
|---|---|---|---|---|
| `/` | 1 | unchanged | 200 | prerender home |
| `/model_detail/{slug}` | 87 in the sitemap, plus `polestar-two` (linked from `src/components/CarDetails.tsx:172`) | `/make/{make}/{model}`, e.g. `/model_detail/polestar-two` → `/make/polestar/polestar-2`, `/model_detail/hummer-ev` → `/make/gmc/hummer-ev` | 301 | rewrite → prerender `page=legacy` → BE `/catalog/resolve` (3b) |
| `/manufacturer/{slug}` | 35, including `citron`, `mercedes`, `vw`; aliases `citroen`, `citroën`, `mercedes-benz`, `volkswagen` | `/make/{make}`, e.g. `/manufacturer/citron` → `/make/citroen` | 301 | same (3b) |
| `/car_detail/{id}` | 212 ids | `/make/{make}/{model}/{generation}/{variant}` | 301 | same, keyed by `cars.id` (3b) |
| Uppercase or trailing-slash forms of the three above | `/model_detail/Tesla-Model-3`, `/manufacturer/hyundai/` | same target | a single 301 | The legacy rewrites also match an optional trailing slash, and the resolver lowercases the key (3b). New `/make/...` URLs with a trailing slash get one redirect rule. |
| Unknown keys on the three above | `/model_detail/nope`, `/car_detail/abc` | – | 404 + `noindex` | resolver miss (3b) |
| `/compare/{a}-vs-{b}` | 10 curated; any pair works | Canonical pair: current `models.slug` values in alphabetical order. 5 of the 10 curated pairs (e.g. `tesla-model-3-vs-bmw-i4`) get a one-time 301. | 200 if already canonical, else 301. 404 if a model is unknown. | prerender (3b) |
| `/best/{criteria}` | 7 keys (`seoPages.ts`) | unchanged; data from BE `/catalog/best/{key}` | 200; unknown key → 404 | prerender (3b) |
| `/insights` | client-side redirect today | `/news` | permanent redirect | `vercel.json` (3b) |
| `/advertize` | client-side redirect today | `/advertise` | permanent redirect | `vercel.json` (3b) |
| `/about`, `/people`, `/privacy`, `/terms`, `/advertise`, `/marketplace`, `/news` | 7 | unchanged | 200, with their own title and canonical (5b) | SPA shell |
| `/admin`, `/dashboard`, `/auth/callback`, `/auth/reset-password`, `/layout_test` | 5 | unchanged | 200 + `noindex` (5b) | SPA shell |
| `/compare-range`, `/compare-range/*` | separate app | unchanged | 307 + proxy | existing rules |
| `/sitemap.xml` | proxied to the BE today | BE `/catalog/sitemap.xml`; becomes a sitemap index in 5a | 200 | rewrite (3b) |
| `/llms.txt`, `/llms-full.txt` | static file / soft 404 | generated by the BE | 200 | rewrite; delete `public/llms.txt`, because static files win over rewrites (5b) |
| `/robots.txt`, `/ads.txt`, `/openapi.json`, `/mcp.json`, `/pub_assets/*`, built assets | static | unchanged paths; content updated in 5b | 200 | files |
| `/api/ev/{all,search,compare,specs,best}?…` | 5 functions | unchanged; new parameters added | 200 JSON | functions (5b) |
| `/api/ev/best/{c}`, `/api/ev/specs/{slug}` | advertised in `public/llms.txt:78-79` | the query-string forms | 200 JSON | rewrites (5b) |
| `/api/openapi.json` | advertised in `public/llms.txt:81` | `/openapi.json` | permanent redirect | `vercel.json` (5b) |
| Any other `/api/*` | – | – | JSON 404 | rewrite → prerender `page=api404` (5b) |
| Anything else | 200 soft 404 today | – | 404 + `noindex` (renders the SPA's NotFoundPage) | catch-all → prerender `page=404`, with an allowlist of SPA routes (5b) |

### 5.3 Implementation

- **The resolver.** Prerender `page=legacy` calls BE `GET /catalog/resolve?kind=model|make|variant&key=…`:
  - A hit returns a 301 with `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`.
  - A miss returns the 404 page.
  - A backend error or timeout returns 503 with `Retry-After`.
  - It is the same function that already serves these paths (`vercel.json` rewrites `/model_detail/:slug` and `/manufacturer/:slug` to it today), so no new function is needed.
- **Why not static `vercel.json` redirects:**
  - The map is data that the API also needs, so it can accept legacy keys.
  - Renames must not need a frontend deploy.
  - Unknown keys need a real 404.
  - About 340 entries and growing. Vercel bulk redirects might be a fallback, but plan availability is UNVERIFIED.
- **Don't set `trailingSlash: false` globally.** `/compare-range/` needs its slash. Use one regex redirect for the catalog prefixes instead. Check the rule syntax on a preview deployment.
- **SPA.**
  - Add the new routes to `src/components/App.tsx`.
  - Old routes render a `<LegacyRedirect>` *(new)* that calls the same resolver and then `navigate(path, {replace: true})`.
  - All internal links come from the API's `path` field via `src/utils/paths.ts` *(new)*. This also fixes the relative links in `CarCard.tsx:216` and `CarTable.tsx:222`.
- **Canonical tags.**
  - Make, model and variant pages point to themselves.
  - The default generation's page points to the model page, since the model page shows it. When a newer generation launches, the old one's canonical switches to itself automatically.
  - Compare pages point to the alphabetical pair.
  - Query strings are stripped.

## 6. Pages

### 6.1 Model page (`/make/{make}/{model}`)

1. **Breadcrumb:** Makes › Tesla › Model 3.
2. **Header:**
   - Name and years ("2017–present").
   - Effective-status badge, plus a "Defunct brand" badge where it applies.
   - Hero photo of the default generation, with its credit line.
   - Headline figures, e.g. "From $X US MSRP (MY2026) · up to Y mi EPA · 0-60 in Z s". Each figure names its variant and links to its source.
   - A "Specs verified {date}" line, or "Not yet verified (legacy data)".
3. **Next-generation teaser,** shown only if an `upcoming` generation exists.
4. **Default generation.** This is the newest `current` generation; if there is none, the newest one not `cancelled`; if there is none, the newest.
   - Market selector, shown only for markets with data. The default is US.
   - Gallery with credits.
   - Variants table: variant, drivetrain, battery (usable/gross), range with its cycle label, 0-60 / 0-100, DC kW with connector, launch and current price (currency, model year), seats. Each row links to its variant page.
5. **"Earlier generations",** newest first. One card per generation with:
   - its own photo, or a neutral "No photo of this generation yet" placeholder (never another generation's photo);
   - years, label and kind;
   - spec ranges (range span, launch price span, battery span);
   - a collapsible variants table;
   - a link to the generation page.
6. **Related:** twins, successor or predecessor, compare pages that include the model, and other models from the make.
7. **Footer:** "Last updated {date}" and the list of sources.

### 6.2 Generation, variant, make and index pages

| Page | Content |
|---|---|
| Generation `/make/{make}/{model}/{gen}` | Same layout as the default-generation block, plus a table of offerings by market and model year, and previous/next generation links |
| Variant `/make/{make}/{model}/{gen}/{variant}` | Replaces `/car_detail/{id}` and reuses `src/components/CarDetails.tsx`. Every spec shows its source and verified date, or "unverified". Market tabs and a model-year selector appear when there is more than one. Fixes the hook-order bug (`CarDetails.tsx:59-67`). |
| Make `/make/{make}` | Header: logo, country, founding year, status with date and `status_details`. Sections: Current, Upcoming, Discontinued and cancelled. A defunct brand gets a banner ("Fisker filed for Chapter 11 on 2024-06-17; models kept for reference") and the page returns 200. Model counts are computed. Market cap, revenue and CEO pay are hidden. |
| All makes `/make` | Makes grouped by displayed status |

### 6.3 Homepage, best lists, sidebar

- **Data source.** The homepage reads BE `/catalog/models?market=US&status=current`. A market selector offers US / EU / China / All, with US as the default. Toggles add upcoming and discontinued models. A "Coming soon" row shows upcoming models.
- **Best lists** are computed once in the backend (`/catalog/best/{key}`). This replaces the three disagreeing copies (audit section 3.4). They:
  - use US offerings only (USD, EPA);
  - name the variant behind each figure;
  - exclude commercial vehicles.

  The Citroën Ami then drops out of US lists, and the Lucid Air and Cybertruck come back.
- **Sidebar.** `src/components/ManufacturerList.tsx` groups makes by their displayed status.
- **PR #8's `DEFUNCT_BRANDS`** copies in `useCars`, `useMakes` and `api/prerender.js` are deleted in 3b, and the ones in `api/ev/*` in 5b. Defunct brands stay off the homepage and best lists through effective status, but their pages stay reachable.
- **Footer.** The `/marketplace` and `/news` footer links (`src/components/Footer.tsx:24-25`) are removed in 3b (question 12).
- **Data fetching.** New hooks use React Query; `useSingleData` currently refetches on every mount.

## 7. Images policy

### 7.1 Sourcing

- **Allowed sources:** only manufacturer press or media sites listed in `ev_backend/research/sources.yaml` *(new)*. Each entry records the domain, the media-terms URL and a credit template. Each domain's terms are checked in PR 4a, so all are UNVERIFIED today.
- **Allowed use:** only images published for press or editorial use.
- **Skip and flag:** unclear terms, accreditation-only access, watermarks, prototypes or camouflage, a wrong market or wrong generation, low resolution.
- **Never:** dealer sites, image search, wallpaper or aggregator sites, AI-generated or upscaled images, hotlinking, or Tesla's site or CDN.
- **Tesla:** JP downloads from the Tesla press kit by hand and runs `research/ingest_images.py --local-file … --source-page …`.

### 7.2 What is stored

```sql
CREATE TABLE images (
  id               serial PRIMARY KEY,
  model_id         int  NOT NULL REFERENCES models(id),
  generation_id    int  REFERENCES generations(id),        -- NULL only for legacy rows of unknown generation
  variant_id       int  REFERENCES cars(id),
  storage_path     text NOT NULL,                          -- car-images/{make}/{model}/{gen}/{id}/orig.{ext}
  width            int  NOT NULL,
  height           int  NOT NULL,
  bytes            int,
  sha256           text UNIQUE,
  view             text CHECK (view IN ('front_3q','rear_3q','side','front','rear','interior','dashboard','detail')),
  color            text,
  model_year       smallint,
  market           text,
  alt_text         text NOT NULL,
  credit           text,                                   -- exact copyright or credit line
  source_page_url  text,                                   -- press release or gallery page
  source_file_url  text,
  terms_url        text,
  license_basis    text NOT NULL CHECK (license_basis IN ('press_editorial','manufacturer_media_terms','legacy_unknown')),
  review_status    text NOT NULL CHECK (review_status IN ('pending','approved','flagged','rejected','legacy')),
  flags            text[] NOT NULL DEFAULT '{}',           -- terms_unclear, registration_required, watermark, ...
  is_primary       boolean NOT NULL DEFAULT false,
  focal_x          real,
  focal_y          real,                                   -- 0..1, drives CSS object-position
  retrieved_at     timestamptz,
  CHECK (review_status = 'legacy' OR (credit IS NOT NULL AND source_page_url IS NOT NULL AND generation_id IS NOT NULL))
);
CREATE UNIQUE INDEX images_primary_uq ON images (generation_id) WHERE is_primary;
```

### 7.3 Storage, sizes, display

- **Storage path:** `car-images/{make}/{model}/{gen}/{image_id}/orig.{ext}` plus `w400.webp`, `w800.webp` and `w1600.webp`.
  - Derivatives are made with Pillow (WebP quality 80); storage-side transforms are not used.
  - Paths never change, so files are cached for a year.
- **Upload flow:** files are uploaded as `pending`. The API serves only `approved` and `legacy` images. A cleanup job deletes `rejected` files.
- **Originals are never cropped, only resized.**
- **`<CatalogImage>`** *(new)* is the single display component:
  - `width`/`height` attributes from the stored dimensions, `srcset` over the three widths, and `sizes`;
  - a CSS `aspect-ratio` box: cards 16:9 with `object-fit: cover` positioned at the focal point; hero 16:9 `contain` on a neutral background; thumbnails 4:3;
  - `loading="lazy" decoding="async"` everywhere except the hero, which uses `loading="eager" fetchpriority="high"`;
  - a "Photo: {credit}" caption on the hero and in the lightbox, linking to `source_page_url`. The API returns `credit` too.

### 7.4 Alt text

- **Template:** `{Make} {Model} ({generation name}, {years}){ variant if specific}, {view}{, colour if the source names it}`. Example: "Tesla Model 3 (Highland, 2024), front three-quarter view in red".
- At most 125 characters; no "image of"; no marketing words.
- Logos next to the make name use `alt=""`. Standalone logos use "{Make} logo".
- Fix the missing alt at `src/components/ModelDetails.tsx:435`.

### 7.5 Legacy images and logos

- **The 208 legacy files** in `public/pub_assets/car_images/` (254 MB) become `images` rows with `license_basis='legacy_unknown'` and `review_status='legacy'`, attached to the generation they show.
  - They stay visible until an approved press image replaces them, top 30 first.
  - They are never shown for a generation they don't depict. Model 3 Highland gets the placeholder, not the 2021 photo.
- **Logos** are self-hosted under `car-images/_logos/{make}/`, taken from press kits, with the source recorded in `makes.sources`.
  - First replace the 13 1000logos.net and 1 greenhouse.io hotlinks.
  - Fix the broken Scout and Slate logos.

## 8. Research and data-freshness process

### 8.1 Pipeline (`ev_backend/research/` *(new)*, Python stdlib + PyYAML)

| Step | Tool | What it does |
|---|---|---|
| 1. Enumerate | `enumerate_us.py`, `enumerate_eu.py`, plus per-region sources in `sources.yaml` | **US:** fueleconomy.gov web services (already used by `epa_range_check.py`), listing every EPA-certified BEV by model year. **EU:** the EEA new-car CO2 dataset, for the model list only. **CN:** CPCA rankings for priority; MIIT and manufacturer pages for facts. **KR:** the ev.or.kr subsidy list (includes certified range). **IN:** Vahan registrations for priority. It diffs the list against BE `/catalog/export.json` and writes `missing.md` and `stale.md`. |
| 2. Rank | `priority.py` | Score = 0.6 × percentile of 90-day English Wikipedia pageviews (Wikimedia REST API, no key) + 0.4 × percentile of US sales rank (latest Cox Automotive / KBB quarterly EV report, kept in `research/us_sales.csv`). Search Console replaces pageviews if JP shares it. Later regions use local-language pageviews and regional sales. |
| 3. Research | Scheduled Claude Code routine; prompt in `research/ROUTINE.md`, schema in `research/batch.schema.json` | Fills the next batch file from allowed sources only. It holds no credentials and never merges. |
| 4. Validate | `validate_batch.py` (CI) | Checks: schema; URL and quote on every value; per-make domain allowlist; unit, cycle and currency present; plausibility bounds (range 30-800 mi, 0-60 1.5-15 s, battery 5-250 kWh, DC 3-1,000 kW) as warnings; duplicates; the section 2.5 consistency checks. Prints a summary table for the PR. |
| 5. File | GitHub Action on merge of `research/batches/**`; `file_batch.py` | Posts the batch as `change_proposals`, one `crawl_run` per batch (`scope='research:{batch}'`), in dependency order: make → model → market → generation → variant → offering → image |
| 6. Review | Data Inbox (`src/components/admin/DataInbox.tsx`, upgraded in 4a) | Groups by batch, then by model. Shows old → new, the quote and the source link. "Approve all for this model" applies in one transaction, writing the value, its `sources` entry and the legacy caches. Rows can be rejected. JP can file a correction by hand, with a source URL. |
| 7. Re-verify | Weekly routine plus fetchers | Values older than 30 days (continuous brands) or 120 days (model-year brands) are re-checked. An unchanged value from the same source domain becomes a `verify` proposal that is applied automatically (`auto_applied`) and only bumps `verified_at`. Changed values always need JP. A monthly lifecycle sweep looks for launches, discontinuations and bankruptcies. |

### 8.2 Sourcing rules

| Value | Allowed sources |
|---|---|
| Range, efficiency | Regulator or the manufacturer's homologation figure only: EPA (US), manufacturer WLTP declaration (EU/UK), MIIT/CLTC (CN), WLTC (JP), ev.or.kr (KR), MIDC (IN) |
| Price | Manufacturer configurator, price list or press release; native currency; dated; with a basis |
| Battery, power, 0-60/0-100, top speed, charging, seats, drivetrain | Manufacturer spec page or press kit |
| Lifecycle (launch, discontinuation, bankruptcy) | Manufacturer or regulator statement, or two independent reputable reports (Reuters, Automotive News, InsideEVs, Electrek, Motor1, Car and Driver) |

- **Discovery only, never cited:** Wikipedia, spec aggregators (e.g. ev-database), forums, YouTube, dealer sites, AI summaries.
- **Never invent, interpolate or convert.** If no source confirms a value, leave the field empty and list it under the batch's `gaps`. Manufacturer targets for upcoming models are allowed only when published, and are marked `is_estimate`.
- **Every value carries:** the exact page URL (not a homepage), the publisher, the retrieval date and a verbatim quote of up to 200 characters that contains the number.
- **Conflicting sources:** write nothing and flag the conflict for JP.

Example batch item. Values are placeholders; real values come from the cited page.

```json
{"op": "update", "key": "tesla/model-3/2024/long-range-awd", "table": "variant_markets",
 "market": "US", "model_year": "<yyyy>", "field": "range_value", "value": "<n>", "unit": "mi", "cycle": "EPA",
 "source_url": "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=<epa id>", "source_name": "EPA fueleconomy.gov",
 "quote": "<text containing the number>", "verified_at": "<date>"}
```

### 8.3 Top-30 candidates (US first)

This is a hypothesis. `priority.py` sets the final order, and its output is committed with batch 1 so the order can be audited.
- **(+)** = not in the catalog today. **(*)** = existing model that needs a new generation.
- Model S, Model X and the F-150 Lightning BEV stay in the list despite being discontinued: people still ask about them.

| Batch | Models |
|---|---|
| R1 | Tesla Model Y · Tesla Model 3 · Chevrolet Equinox EV · Ford Mustang Mach-E · Hyundai Ioniq 5 |
| R2 | Tesla Cybertruck · Chevrolet Bolt (+) · Rivian R1S · Kia EV9 · Honda Prologue (+, new make) |
| R3 | Tesla Model S · Tesla Model X · Ford F-150 Lightning · Rivian R2 · Kia EV6 |
| R4 | Hyundai Ioniq 9 (+) · Nissan Leaf (*, 3rd gen) · Cadillac Lyriq · Chevrolet Blazer EV (+) · Rivian R1T |
| R5 | Lucid Air · Lucid Gravity · Toyota bZ (*, successor of bZ4X) · BMW i4 · VW ID.4 |
| R6 | Chevrolet Silverado EV (+) · GMC Hummer EV · Hyundai Ioniq 6 · Porsche Taycan · Mercedes-Benz CLA (+) |
| Alternates | BMW iX · Nissan Ariya · Porsche Macan Electric · Volvo EX30 · Volvo EX90 (+) · Jeep Wagoneer S (+, new make) · Cadillac Escalade IQ · Kia EV3 (+) · Slate Truck (+) · Subaru Solterra · Polestar 3 · GMC Sierra EV (+) |

**"Verified fully"** for a top-30 model means:

| Level | Required |
|---|---|
| Model | Sourced status (global and US market), years, official URL, Wikidata id, body type |
| Every generation | Slug, kind, years, status. At least one approved press photo; the current generation needs at least three views. |
| Every current US variant | Price (MSRP, model year, basis, launch price where published), EPA range, battery with usable/gross, 0-60, DC kW and connector, drivetrain, seats |
| Earlier generations | Range, launch price and battery wherever a source exists |
| All values | Verified within 30 days of filing. Empty where no source exists. |

Batch R1 also re-verifies the lifecycle corrections carried in the seed.

**After the top 30:** batches of up to 15 models with the basics only (status, generations, variants, price, range, battery), in this order:
1. **US:** every EPA-listed BEV for MY2025-2027 that is missing.
2. **EU,** by registrations: Škoda, Cupra, Peugeot, Fiat, Dacia, Alpine and Leapmotor, plus the Renault 4, Kia EV3/EV4/EV5 and VW ID.3.
3. **China,** the top 50 by CPCA sales: Geely Galaxy, Xiaomi, Zeekr, Leapmotor, Li Auto, Aito, and the full BYD and XPeng lineups.
4. Japan.
5. Korea.
6. India.

New makes are added together with their models.

### 8.4 Fixing the data-freshness Action

- **Cause:** the `EV_ADMIN_KEY` secret is missing. All 61 runs exited with code 2, and the workflow is now disabled (audit section 5).
- **JP:** adds the secret, then runs `gh workflow enable data-freshness`.
- **PR 4a:**
  - Bump `actions/checkout` and `actions/setup-python` to versions that support Node 24.
  - Rewrite `epa_range_check.py` to match each US offering by `external_ids.epa_id` and model year, instead of comparing the rep trim to the best figure in the EPA model line. That bug proposed i7 274 → 321 mi.
  - Variants that don't match go to a "needs EPA id" report, not into value proposals.
  - Coverage becomes every variant with a US offering, instead of 14 rep rows.
  - Move the schedule from daily to weekly; EPA data changes rarely.
  - Add a `file-research-batch` job for step 5.
- **Repo activity:** weekly research PRs keep the repo active, so GitHub doesn't disable the schedule again.

## 9. Agent and SEO surface

| Item | Change | PR |
|---|---|---|
| `/llms.txt` | Generated by the backend from live data. Contains: the real "Data as of" date (newest `applied_at` or `verified_at`); computed counts; the status vocabulary, test cycles and units; the URL scheme; working API shapes; top-30 canonical URLs; the licence; citation guidance ("cite the page URL and its verified date"). Replaces the static file and its false "kept current" claims (audit #10, #11). | 5a + 5b |
| `/llms-full.txt` | One line per model, e.g. "Tesla Model 3 — current — 2024– Highland — from $… US MSRP (MY…) — up to … mi EPA — https://www.evlineup.org/make/tesla/model-3 — verified …" | 5a |
| Sitemap | **3a:** BE `/catalog/sitemap.xml` listing canonical URLs only: static pages that exist (no `/marketplace`, `/news`), all 7 best lists, canonical compare pairs, all makes (defunct ones too, as history), all models, non-default generations and all variants. `lastmod` is `max(updated_at, last_verified_at)` over the entity and its children. Static pages get no `lastmod`. **5a:** becomes a sitemap index with `image:image` entries. | 3a, 5a |
| JSON-LD | See the next table. Every page gets a `BreadcrumbList` and a `WebPage` with `dateModified` and `isBasedOn` (source URLs). Every node has a stable `@id` (`{canonical URL}#model` etc.). | 5b |
| `/api/ev/*` | **Kept:** all current fields and query forms. **Rebuilt on** `/catalog/*`. **New fields:** `key` at every level (`tesla/model-3/2024/long-range-awd`), `path`, `url`, effective `status`, `brandStatus`, `availability` (mapped to the `mcp.json` enum), `generations[] → variants[] → offerings[]` in `specs`, each value as `{value, unit, cycle, market, modelYear, source, verifiedAt}`, `updatedAt`, `meta.dataAsOf` (real, replacing the request date in `all.js:73` and `specs.js:150`), absolute image URLs plus `imageCredit`. **New parameters:** `?status=`, `?market=`. **Also:** `specs` accepts a legacy slug, a key or a legacy path; tokenised search across make, model, aliases and variant; 502 instead of "Model not found" when the backend fails; new `api/ev/makes.js` (7 functions in total; Hobby plan limit UNVERIFIED). | 5b |
| `openapi.json` | New parameters and fields; enums (status, market, cycle, connector); units; the provenance object; error codes; a real licence (question 9) | 5b |
| `mcp.json` | Point `servers` at a URL that returns JSON, fix the availability enum, and describe the file as an API manifest. A real MCP server is out of scope. | 5b |
| `robots.txt` | Put the Disallow lines into every named AI-bot group, or collapse the groups into `*` (audit #24) | 5b |
| Static pages and 404s | Each static page gets its own title and canonical. Unknown paths return a real 404 with `noindex` (audit #13). | 5b |
| Counts and claims | "37 manufacturers" and "87+ EVs" come from `/catalog/meta`. "Verified" wording is shown only where it is true. | 5b |
| "Last updated" | Pages show "Last updated {date}", and every spec shows its verified date. The sitemap `lastmod`, the API's `updatedAt` and JSON-LD `dateModified` all use the same value. | 3b, 5b |

| Page | JSON-LD |
|---|---|
| Make | `Brand` (name, url, self-hosted `logo`, `sameAs`: official site and Wikidata). Adds `Organization` with `dissolutionDate` if defunct. `ItemList` of model URLs. |
| Model | `ProductGroup` (`#model`): `productGroupID` = model key, `brand`, `variesBy` [`vehicleModelDate`, `vehicleConfiguration`], `hasVariant` = current-generation variants. One `ProductModel` per generation with `isVariantOf` → `#model` and `successorOf`/`predecessorOf`. Twins via `isSimilarTo`. The FAQ is carried over, using offering values that name their test cycle. |
| Generation | `ProductModel` + its variants |
| Variant | `Car`: `model` → generation `ProductModel`, `isVariantOf` → `#model`, `vehicleConfiguration`, `vehicleModelDate`, `bodyType`, `driveWheelConfiguration`, `seatingCapacity`, `fuelType` "Electric" (as today), `accelerationTime` (QuantitativeValue, `SEC`, `valueReference` "0-60 mph"), and `additionalProperty` for range (`SMI`/`KMT`, `measurementTechnique` EPA/WLTP/CLTC), battery (`KWH`), DC peak (`KWT`) and connector. Units use the stored unit; there is no conversion. `offers` only for sourced prices (`price`, `priceCurrency`, `eligibleRegion`). `availability` is never `InStock`; `Discontinued`/`PreOrder` only when true. This replaces today's mapping in `api/prerender.js:140-143`. |
| Home | `WebSite` (+ `SearchAction` once `/?q=` exists) and `Dataset` (`dateModified`, `DataDownload` → `/api/ev/all`, licence) |

## 10. PR plan

All PRs are opened by the agent and merged only by JP. Validation is deliberately light.

| PR | Repo | Scope | Light validation | Depends on |
|---|---|---|---|---|
| 0 hotfix (outside the five) — **opened: [ev_backend#7](https://github.com/jpwilson/ev_backend/pull/7)** | ev_backend | Make `CarRead.average_rating` `Optional[float] = None` (`models/pydantic_models.py:316`) and the `SubmodelInfo` fields Optional (`:321-330`). (Adding `ORDER BY id` to `/cars` and `/makes` moves to PR 2, to keep the hotfix minimal.) | Done: saved production payloads validated with a null rating (0/101 trims pass before, 101/101 after). After merge: 87 `model-details`, 212 `/cars/{id}`, `/cars/model-reps` should return 200. | none: ship first |
| 1 design | eeveecars | `docs/catalog-audit.md`, `docs/catalog-design.md` | none (review) | none |
| 2 migration + backfill | ev_backend | Alembic `catalog_01` and `catalog_02` (`catalog_03` later); `scripts/catalog/backfill.py`; `catalog/seed/structure.yaml`; `backfill_report.csv`; slug-listener freeze (`models/orm_models.py:157-184`); `ORDER BY id` on `/cars` and `/makes` (`routers/cars.py:234-240`, `routers/makes.py:31-40`). No runtime reads of the new columns. | Local Postgres at production's major version, loaded from a production dump (or seeded from the public API after PR 0 if access is still pending). Steps: upgrade → `apply` → old endpoints byte-identical (`/cars/cards`, `/makes`, 5 `model-details`) → `--revert` → downgrade → upgrade again. About 6 pytest cases (slug rules, generation-slug rule, status mapping, seed loader, offering uniqueness, redirect seeding). JP skims the seed diff. | PR 0; DB read access; JP's "go" before applying in production |
| 3a catalog read API | ev_backend | ORM for the new tables and columns; `services/catalog_status.py`; `routers/catalog.py` with `/catalog/meta`, `/catalog/makes[/{slug}]`, `/catalog/models` (cards: from-price, max range, quickest 0-60, each naming its variant; `market`, `status` filters), `/catalog/models/{make}/{model}` (full tree), `/catalog/variants/{id}`, `/catalog/resolve`, `/catalog/best/{key}`, `/catalog/compare-pairs`, `/catalog/sitemap.xml`, `/catalog/export.json`. Every response field is Optional unless it is a key. | TestClient smoke test over every model and every `url_redirects` key; 5 manual checks (Model 3, Ioniq 5, Fisker Ocean, Polestar 2, Taycan) | PR 2 applied in production |
| 3b frontend pages | eeveecars | Routes `/make…`; new pages; `CatalogImage`; `hooks/useCatalog.ts` (React Query); `utils/paths.ts`; `LegacyRedirect`; prerender builders (`makes`, `make`, `model`, `generation`, `variant`, `legacy`); `vercel.json` (legacy rewrites, new routes, redirects, sitemap → `/catalog/sitemap.xml`); status-driven `useCars`, `useMakes`, `ManufacturerList` and `BestPage`; `DEFUNCT_BRANDS` removed from hooks and prerender; footer links | `npm run build`; Vercel preview link; before/after screenshots of home, `/make/tesla`, `/make/tesla/model-3` and `/make/fisker`; a script showing every old sitemap URL and all 212 `/car_detail/*` URLs reach a 200 in at most one redirect, and 3 unknown paths return 404 | PR #8 merged and rebased onto; 3a deployed |
| 4a research pipeline | ev_backend, plus a small eeveecars PR for the Inbox | `research/*` (sources.yaml, schema, enumerate, priority, validate, file, ingest_images, revert_batch, ROUTINE.md). `routers/proposals.py`: ops, new entity types, `sources` with `verified_at`, legacy-cache sync, approve per model, admin edits clear sources. EPA checker and workflow rewrite. `DataInbox.tsx` grouping. | Dry run on 3 models; validator rejects one deliberately bad item; Inbox preview link | PR 2; secrets (question 3) |
| 4b–4g data batches, then 4h onward | ev_backend | `research/batches/{date}-{name}.json` + `report.md`: top 30 as R1–R6 (4b–4g), then regional batches (4h onward) | Validator passes; JP spot-checks 5 values per batch | 4a |
| 5a llms + sitemap index | ev_backend | `/llms.txt`, `/llms-full.txt`, sitemap index with images, `meta.dataAsOf` | curl both files and one child sitemap; spot-check 5 sitemap URLs return 200 | 3a |
| 5b agent surface | eeveecars | `api/ev/*` on `/catalog/*` (+ `makes.js`; `DEFUNCT_BRANDS` removed); `specs` tree; path-form rewrites; JSON 404s; 502s; prerender JSON-LD; static-page canonicals; 404 catch-all; computed counts; `robots.txt`, `openapi.json`, `mcp.json`; delete `public/llms.txt` | Build; JSON-parse `openapi.json` and `mcp.json`; curl 6 API calls including the path forms; validator.schema.org on 3 page types; preview link | 3b, 5a |

**Order:** 0 → 1 → 2 → (apply in production) → 3a → PR #8 merges → 3b → then 4a and 5a/5b in parallel → data batches.
- PR #8 only touches the frontend, so nothing before 3b conflicts with it.
- 3b and 5b rebase onto it once JP merges it. Until then they branch from main.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Production DB state is unknown: 002/003, `alembic_version`, constraints, triggers, RLS, Postgres version | Read-only pre-flight; idempotent `catalog_01`; stop if the version isn't at head |
| Deploy order: ORM code that maps the new columns, deployed before the migration, breaks every `cars` query | PR 2 has no runtime reads of the new columns; ORM mapping arrives in 3a after the migration; roll back code before schema |
| Some public tables (possibly `cars`/`makes`, and the 002/003 tables) lack RLS and are exposed through Supabase's Data API with the public anon key (UNVERIFIED) | Pre-flight `relrowsecurity` query. `catalog_01` enables RLS on the 002/003 tables. For `cars`/`makes`, propose a separate one-line fix after confirming nothing reads them through the Data API. |
| Wrong generation or status assignments in the seed | Reviewed YAML with a report of every guess; unclear models default to a single generation; weekly consistency checks |
| Temporary ranking dip from the URL change | One-hop 301 for every legacy URL; sitemap and canonicals switch in the same deploy; watch 404/301 logs and Search Console for 2 weeks |
| The redirect resolver depends on the backend | 1-day edge cache with 7-day stale-while-revalidate; 503 (never 404) on errors |
| Another response-schema 500 like today's | All new response fields Optional; PR 0's smoke script re-run in PR 2, 3a and 3b |
| Image licensing or takedown requests | Domain allowlist, terms URL per image and flags; setting `rejected` hides an image immediately |
| Tesla blocks automated downloads | Manual download from the press kit, flagged as such |
| Review fatigue (top 30 ≈ 1,500 values) | 6 batches of 5; approve per model; unchanged re-verifications applied automatically |
| Admin editor writes values without a source | Edits clear the field's source and show as unverified; a required source box later |
| Vercel function limit (plan UNVERIFIED) | Redirects and 404s reuse prerender; 7 functions in total |
| Old endpoints keep stale statuses until approvals or the `sync-legacy` run | Our own surfaces move to `/catalog/*` in 3b and 5b; `sync-legacy` is available |

## 12. Open questions for JP

Each has a recommended default in **bold**.

1. **Database access.** I don't have it. The claude.ai Supabase connector isn't linked to the EVLineup project. Default: **give a read-only role now for the pre-flight queries. I apply PR 2's migration only after you say "go", or you run it yourself.**
2. **PR 0 hotfix** (outside the five PRs): now open as [ev_backend#7](https://github.com/jpwilson/ev_backend/pull/7). Default: **merge it first. It restores 32 model pages, the manufacturer pages and 6 compare pages.**
3. **GitHub secret `EV_ADMIN_KEY`** for ev_backend Actions, then re-enable the workflow; later a Supabase storage key for image ingest. Default: **yes, when PR 4a lands.**
4. **Page granularity:** refreshes like Highland get their own generation section and URL, and trims get their own indexable pages. Default: **yes to both.**
5. **Scope:** battery-electric only; commercial vehicles kept but out of consumer lists. Default: **yes.**
6. **Old unsourced numbers and photos:** keep showing them, labelled "unverified" or "photo source unknown", until research replaces them. Default: **yes, keep with labels.**
7. **Press photos marked "editorial use":** use them? Default: **yes for publicly downloadable press kits; skip anything behind registration.**
8. **Default market** for the homepage and best lists. Default: **US, with a US / EU / China / All selector.**
9. **Data licence** for the API and `llms.txt`. Default: **CC BY 4.0 for facts, credited as "EV Lineup (evlineup.org)"; manufacturer photos excluded.**
10. **Official make names** (Mercedes-Benz, Volkswagen, Kia). Default: **yes. Slugs in PR 2, display names after PR 3b.**
11. **Make financials** (market cap, revenue, CEO pay). Default: **hide until sourced with units.**
12. **`/news` and `/marketplace`** (routes, plus the footer links PR #8 left). Default: **keep the routes, remove them from the sitemap and footer in 3b.**
13. **Review flow:** review each top-30 batch both as a PR and in the Data Inbox? Default: **yes for R1–R6, then revisit (e.g. merging the PR counts as approval for re-verifications).**
14. **Search Console access** to sharpen the top-30 ranking. Default: **share it if you can; otherwise Wikipedia pageviews plus US sales.**
15. **Stale backend PR #6** (March 2026, merge conflicts). Default: **close it as superseded.**
