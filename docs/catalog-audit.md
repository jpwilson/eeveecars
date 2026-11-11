# EVLineup catalog audit

This is the Part 1 deliverable of the catalog restructure, and the companion to `docs/catalog-design.md`. The audit ran on 2026-10-20. The P0 failures were re-checked on 2026-10-21 and still reproduce.

| | |
|---|---|
| Code audited | `eeveecars` @ a3ceb7a (= origin/main), `ev_backend` @ a811fc1 (= origin/main) |
| Live systems | SITE = https://www.evlineup.org (pages plus the `/api/*` Vercel functions); BE = https://ev-backend-three.vercel.app (FastAPI backend); GitHub Actions on jpwilson/ev_backend |
| Method | Read-only. I read the code and made public GET requests as a browser and as Googlebot, GPTBot, PerplexityBot and ClaudeBot. I used read-only `gh` commands and web searches for current model facts. I had no database access, used no credentials, and wrote nothing. |
| Paths | `ev_backend/...` and `eeveecars/...` are repo-relative (github.com/jpwilson/ev_backend, github.com/jpwilson/eeveecars) |
| Markers | **UNVERIFIED** means I could not confirm it with read-only access |

## Summary

- **About a third of the catalog is broken in production right now.**
  - 32 of the 87 model pages return 404 to Google and AI crawlers.
  - Every manufacturer page shows an empty model list.
  - 6 of the 10 featured compare pages are dead.
  - The public API answers "Model not found" for the same models.
  - The cause is one backend field: the "average rating" value is required, but since July it can be empty. The fix is one line, opened as [ev_backend#7](https://github.com/jpwilson/ev_backend/pull/7).
- **The data has not been edited since 13 Feb 2026, and it shows.**
  - Model S/X, F-150 Lightning, Jaguar I-Pace, Audi Q8 e-tron and others are listed as current.
  - Rivian R2 has the wrong price.
  - Fisker and Canoo appear as normal brands.
  - Several headline numbers mix different trims, for example the Model 3 "Standard Range" shows the Performance 0-60 time.
- **The catalog is missing many big sellers.**
  - Six likely top-30 US EVs are absent: Chevy Bolt (2027), Blazer EV, Silverado EV, Hyundai Ioniq 9, Honda Prologue and Mercedes CLA.
  - The whole Škoda brand is missing.
  - China's current best sellers are all missing.
- **The structure cannot hold the data.**
  - Everything below a brand is one wide "trim" row.
  - Model, generation, model year and market exist only as free-text labels.
  - Nothing records where a number came from or when it was checked.
  - Range has no test cycle (EPA/WLTP/CLTC), and prices have no currency or market.
- **Status labels are inconsistent.** 31 models have no status, 7 have a year in the status field, and one says "Available" with a capital A. Because of this, the public API's "electric trucks" list returns one truck, and the page markup tells Google that every car not labelled exactly "available" (discontinued ones included) is on "pre-order".
- **The AI-agent layer overstates itself.**
  - `llms.txt` advertises API URLs that return a web page instead of data.
  - Every "last updated" date is just the date of the request.
  - The API's battery, charging, power, drivetrain and year fields are empty for all 87 models.
- **The automated range checker has never worked.** It failed all 61 runs since July because its GitHub secret was never added, and GitHub has now disabled it. Even once the secret is added, it compares the wrong figures and would write a wrong range for the BMW i7.
- **Some things could not be checked.**
  - I could not see the database, so I don't know whether migrations 002/003 were applied. Section 6 lists the queries that would answer this.
  - Draft PR #8 hides Fisker and Canoo and removes the nav links. It does not fix the "$0.0B" market-cap display, which is a unit bug, and it leaves the defunct brands in the sitemap.

## 1. Current data model

### 1.1 Tables

| Table | Defined in | Notes |
|---|---|---|
| `makes` | `ev_backend/models/orm_models.py:199` | 35 rows live (older notes say 37) |
| `cars` | `orm_models.py:48` | One row per trim: 212 rows (ids 1-212). Everything below a make lives here. |
| `people` and 3 association tables | `orm_models.py:250`, `:25-45` | Not catalog data |
| `newsletter_subscribers` | `orm_models.py:187` | Not catalog data |
| `profiles`, `user_favorites`, `user_notes`, `user_cars` | `ev_backend/models/user_models.py`, `ev_backend/migrations/001_auth_profiles_and_user_tables.sql` | Store `car_id` (integer) and `make_model_slug`, so trim ids and model slugs must stay stable |
| `models`, `crawl_runs`, `change_proposals`, `price_snapshots` | `ev_backend/models/pipeline_models.py`, `migrations/002_models_and_provenance.sql`, `migrations/003_change_pipeline.sql` | Exist in code. Whether they exist in production is **UNVERIFIED** (section 6). |

- **Missing tables.** There is no table for generation, model year, market, price record, image, source or redirect.
- **Migration tooling is split.**
  - Alembic (`ev_backend/alembic/versions/`, head `a3f8b2c1d4e5`) covers cars, makes and people.
  - `migrations/001-003` are SQL files meant to be pasted into the Supabase SQL editor (`002:3`). Alembic does not track them.
  - Without `DATABASE_URL`, the backend silently falls back to SQLite (`ev_backend/database.py:26-29`).
  - Old local databases (`eevee.db`, `ev_local.db`, `heroku_dump.sql`) sit in the backend repo root.

### 1.2 `cars` (one row per trim, about 60 columns)

| Group | Columns | Problems |
|---|---|---|
| Identity | `make_id`, `make_name` (copy of `makes.name`), `model`, `submodel` (the trim), `generation`, `full_slug`, `make_model_slug`, `is_model_rep` | All nullable free text. "Model" and "generation" exist only as strings. |
| Status | `availability_desc` (string), `production_availability` (bool) | No fixed vocabulary, and the two fields can contradict each other (1.4) |
| Dates | `carmodel_first_released`, `carmodel_ended`, `trim_first_released`, `trim_ended` | Strings in mixed formats: `2023-06-01`, `2021`, and invalid `2023-23-06` |
| Headline specs | `epa_range`, `current_price`, `acceleration_0_60`, `top_speed`, `power`, `torque`, `battery_capacity`, `battery_max_charging_speed`, `number_of_full_adult_seats` | Units are given only in code comments (mi, USD, s, mph, hp, lb-ft, kWh, kW). No test cycle, currency, market or model year. Non-US cars store non-EPA numbers in `epa_range` (NIO ET7 207, Citroën Ami 47). |
| Model-level text | `model_description`, `model_webpage` | Copied onto every trim |
| Class | `vehicle_class`, `drive_type` | 45 distinct `vehicle_class` strings across 87 models, e.g. "Sucompact Hatchback" and "Luxury Sedan " with a trailing space |
| Images | `image_url`, `images` (JSON list) | All 87 model cards point at relative `/pub_assets/car_images/*` files in the frontend repo. `images` is empty on all 101 rows that can be read. |
| JSON blobs | `available_countries`, `price_history`, `range_details`, `speed_acc`, `color_options`, `customer_and_critic_rating`, `reviews`, and others | Mostly empty. Of the 101 readable rows, `price_history` is filled on 1, `range_details` on 0 and `speed_acc` on 1. `available_countries` keys mix regions and years ("Europe", "2024 onwards"). |
| Provenance | `updated_at` only | No source or verified date. Every `updated_at` I saw falls between 2026-02-10 and 2026-02-13. |

### 1.3 How "model" and "generation" work today

- A model is the set of trims that share a `make_model_slug`.
  - Exactly one trim per slug has `is_model_rep=True`. That "rep" row supplies the model card and the model page (`ev_backend/routers/cars.py:48-53`, `:93-102`).
  - Live: 87 slugs each have exactly one rep. One more slug, `polestar-two` (ids 164-165), has none, so the Polestar 2 page shows only one trim.
- An earlier generation is any trim with `availability_desc == "previous_generation"`. These trims are grouped by the free-text `generation` value, or under "Earlier Generation" when it is empty (`cars.py:154-155`).
- `generation` mixes generation numbers, years and code names: null, "1", "2024", "2021", "Gen 2", "2nd Generation", "2025 (2nd Gen facelift)", "Highland", "Juniper", "1\n". Trim names carry generation hints too, such as "Performance (2021)" and "Turbo S (1st Gen)".
- There is no model-year field anywhere.

Example, tesla-model-3 (live):

| id | submodel | generation | availability_desc | is_model_rep |
|---|---|---|---|---|
| 23 | Standard Range (2021) | 2021 | previous_generation | false |
| 24 | Long Range | 2021 | available | false |
| 4 | Performance | 2021 | null | false |
| 204 | Standard Range | Highland | available | true |

Rows 24 and 4 are pre-Highland cars that still show as current. Row 24's `full_slug` is `tesla-model-3-standard-range`, the same as row 204.

### 1.4 Status fields

| Field | Live values | Notes |
|---|---|---|
| `makes.status` | active 31, defunct 2 (Canoo, Fisker), pre-production 2 (Scout Motors, Slate Auto) | Free text. A code comment also lists "acquired" (`orm_models.py:240`). |
| `cars.availability_desc` (87 model cards) | available 37, null 31, discontinued 10, year strings 7 ("2022" ×4, "2020", "2024", "2025"), "Available" 1, "Not yet released" 1 | Trims also use "previous_generation". Frontend and API code compare it against seven different strings. |
| `cars.production_availability` (87 cards) | true 66, false 11, null 10 | Overlaps `availability_desc` |
| `models.status` (migration 002) | announced / pre_order / in_production / discontinued / cancelled | A third vocabulary. Its backfill (`002:39-44`) maps null and year strings to `in_production`. |

### 1.5 Slugs

- **`full_slug`.** The ORM declares it unique (`orm_models.py:69`), but live data has duplicates and 31 NULLs (ids 136-179). The database constraint is probably missing (UNVERIFIED). The duplicates:
  - `vw-id-4-1st-edition`: id 10 (ID.4) and id 198 (an ID.7)
  - `tesla-model-3-standard-range`: ids 24 and 204
  - `renault-scenic-etech`: ids 187 and 188
- **Slug listeners.** The insert listener always overwrites both slugs (`orm_models.py:157-165`), and the update listener regenerates them whenever make, model or submodel changes (`:169-184`). Renaming a trim or model therefore silently changes its URL. This is the likely origin of `polestar-two`.
- **Make slugs** are computed from the display name on every request (`eeveecars/src/utils/makeSlug.ts`, `ev_backend/routers/seo.py:50-54`).
  - `Citroën` becomes `citron`.
  - `Mercedes` becomes `mercedes`, so `/manufacturer/mercedes-benz` returns 404.
  - Renaming a make breaks its URL, and there is no redirect table.
- **Model slugs** do not always start with the make slug: `citroen-ami`, `citroen-c4`, `citroen-c4x`, `hummer-ev`. Some spell out digits (`polestar-three`, `polestar-four`). The make cannot be parsed out of a model slug.

### 1.6 Other `makes` fields

- `market_cap`, `revenue` and `ceo_pay` are floats with no currency, unit or as-of date.
  - 17 of 35 makes have 0 or null.
  - The rest use mixed units: Tesla market_cap 600, Toyota 200000, Subaru 1300, Nissan revenue 10596.695.
- `num_ev_models` is maintained by hand. Mazda, Scout Motors and Slate Auto have 0 cars.
- Logos: 21 are relative paths, 13 are hotlinked from 1000logos.net and 1 from greenhouse.io. The Scout and Slate logo files don't exist, so their URLs return the SPA HTML.

## 2. How the frontend gets data

### 2.1 Routes (`eeveecars/src/components/App.tsx:33-59`, `eeveecars/vercel.json`)

| URL | Component | Served by | Live status |
|---|---|---|---|
| `/` | HomePage | rewrite to `/api/prerender?page=home` | 200 |
| `/model_detail/:slug` | ModelDetails | prerender `page=model` | 200 for 55 slugs, 404 for 32 |
| `/manufacturer/:make_name` | ManufacturerPage | prerender `page=make` | 200, but the model list is empty (section 4, #2) |
| `/compare/:pair` | ComparePage | prerender `page=compare` | 4 of the 10 sitemap pairs return 200 |
| `/best/:criteria` | BestPage | prerender `page=best` | 200 |
| `/car_detail/:id` | CarDetails | SPA shell `/app.html` (no prerender) | 200 shell with the home title and canonical `/` |
| `/about`, `/people`, `/privacy`, `/terms`, `/advertise`, `/marketplace`, `/news`, `/admin`, `/dashboard`, `/auth/*`, `/layout_test` | own pages (`/news` renders MarketplacePage, `App.tsx:42`) | SPA shell | 200 shell |
| `/insights` to `/news`, `/advertize` to `/advertise` | client-side `<Navigate>` only (`App.tsx:43`, `:52`) | SPA shell | 200, then a client-side redirect |
| `*` | NotFoundPage | SPA shell | 200 (soft 404) |
| `/sitemap.xml` | none | rewrite to BE `/sitemap.xml` | 200 |
| `/compare-range`, `/compare-range/*` | separate app | 307 redirect, then proxy to compare-range.vercel.app | 307, then proxied |

The build renames `dist/index.html` to `app.html` so that the `/` rewrite can reach the prerender function (`eeveecars/package.json:11`).

### 2.2 Hooks and endpoints

| Hook or caller | Backend endpoint | Caching | Used by |
|---|---|---|---|
| `useCars` (`src/hooks/useCars.ts:34`) | `/cars/cards` | React Query, 5 min (`src/main.tsx:11-15`) | HomePage, CarGrid, CarTable, ManufacturerPage, CompareContext |
| `useMakes` | `/makes` | React Query | ManufacturerList, ManufacturerPage, CarDetails, HomePage |
| `useFeatures` | `/car_features` | React Query | FeatureSelector |
| `usePeople` | `/people` | React Query | PeoplePage |
| BestPage, FeaturedRow | `/cars/cards` | React Query | |
| `useModelDetails` (`src/hooks/useModelDetails.ts:53`) | `/cars/model-details/{slug}` | None: `useSingleData` refetches on every mount | ModelDetails |
| `useCarDetail` (`src/hooks/useCarDetails.ts:39`) | `/cars/{id}` | None | CarDetails |
| `useMultipleCarDetails` | N × `/cars/{id}` | None | ComparisonModal |
| ComparePage inline (`src/pages/ComparePage.tsx:55`) | `/cars/model-details/{slug}` | React Query | ComparePage |
| `useManufacturerDetail` | `/makes/{id}` | none | Unused |
| NewsTicker | api.rss2json.com (third party) | none | HomePage |

Logic that depends on the free-text status:
- `src/hooks/useCars.ts:38-56` drops "previous_generation" rows. It also hides discontinued rows (`production_availability === false` or `"discontinued"`) and "Not yet released" rows. The make filter uses `car_id_list` (`:76`).
- `src/pages/ManufacturerPage.tsx:338-345` splits a make's models into current, coming soon and discontinued using `availability_desc`.
- There are three copies of the best-list rules: `src/data/seoPages.ts:30`, `api/ev/best.js:24-59` and `api/prerender.js:549`. A fourth list of paths lives in `ev_backend/routers/seo.py:28`. The copies already disagree:
  - `300-mile-range-evs` has limit 15 in the SPA, 12 in prerender, and is missing from the API and the sitemap.
  - `electric-trucks` sorts on a `coming_soon` value that never occurs (`seoPages.ts:79`).
- Type drift: the `Make` type has `num_ev_model` (`src/hooks/useMakes.ts:13`), but the API sends `num_ev_models`. The "EV models" stat on manufacturer pages therefore never renders (`ManufacturerPage.tsx:301`).
- Code bug (not visible today): `CarDetails.tsx` calls `useCarDetail` (`:67`) after an early return (`:59`), which breaks the rules of hooks.

### 2.3 Images in the UI

- There are 208 image files (254 MB) in `eeveecars/public/pub_assets/car_images/`. The largest is `bmw_i4_ed40.png`. Relative paths work only on evlineup.org; `/api/ev/*` passes them to agents unchanged.
- Every image uses a Chakra `<Image>` with no width/height and no `srcset`.
  - Only cards (`src/components/CarCard.tsx:105`) and best-list thumbnails (`src/pages/BestPage.tsx:79`) lazy-load.
  - The earlier-generation thumbnail has no alt text (`src/components/ModelDetails.tsx:435`).
  - The Model 3 Highland page reuses the 2021 photo (`tes_m3_std_range.png`).
- Admin uploads go to the Supabase Storage bucket `car-images` as `{make}/{model}/{make}_{model}{tag}_{timestamp}.{ext}` (`src/components/admin/sections/ImagesSection.tsx:36-43`). They are stored in `car.images[]`, which no public page renders.

## 3. Public API, llms.txt, sitemap and prerendering (the PR #6 surface)

### 3.1 `/api/ev/*` (Vercel functions in `eeveecars/api/ev/`)

Each file hardcodes `API_BASE` and its own `fetchWithTimeout` (6 s). All allow CORS from `*` and accept GET only.

| Endpoint | Upstream | Live result | Problems |
|---|---|---|---|
| `/api/ev/all` | `/cars/cards` | 200, 87 records | `battery`, `chargingSpeed`, `power`, `driveType` and `year` are null on 87/87 because the cards endpoint lacks those columns. `seats` is null on 32. `image` is a relative path. `updated` is the request date (`all.js:73`). Fisker and Canoo are included. |
| `/api/ev/search` | `/cars/cards` | 200 | Matches a substring against one field at a time (`search.js:57-62`): `q=tesla model y` returns 0 results. `availability=coming_soon` returns 0. |
| `/api/ev/specs?slug=` | `/cars/model-details/{slug}` | 200 for 55 models; 404 "Model not found" for the 32 broken ones (`tesla-model-x` re-checked 2026-10-21) | Builds the manufacturer URL as `/manufacturer/citroën` (`specs.js:76`), which 404s. `lastUpdated` is the request date (`specs.js:150`). "Model" values come from the mixed-trim rep row. |
| `/api/ev/compare?models=a,b` | 2 × model-details | `models=tesla-model-y,hyundai-ioniq-5` returns 404 "Model not found: hyundai-ioniq-5" | A backend failure is reported as "not found" (`compare.js:60-63`). Float noise in differences (`0.8000000000000003`). |
| `/api/ev/best?criteria=` | `/cars/cards` | 200; `electric-trucks` returns 1 truck | Filters on `availability_desc === 'available'` (`best.js:24-59`), which drops the 31 models with a null status |
| `/api/ev/best/{c}`, `/api/ev/specs/{slug}` (path form advertised at `public/llms.txt:78-79`) | none | 200 `text/html` (SPA shell), re-checked 2026-10-21 | Soft 404 from the catch-all rewrite |

### 3.2 Prerendering (`eeveecars/api/prerender.js`, 696 lines)

Every user agent gets the same HTML. Browser, Googlebot, GPTBot, PerplexityBot and ClaudeBot responses were byte-identical, so there is no cloaking. The function caches for `s-maxage=3600` when it built the page and `s-maxage=60` when it didn't (`:693`).

| Page | Upstream | JSON-LD | Live state |
|---|---|---|---|
| home | `/cars/cards` (first 30) | WebSite, ItemList, FAQPage | The page has 34 links (models and best lists). 12 of the model links return 404, including Fisker and Canoo models. "37 manufacturers" is hardcoded (`:356`, `:405`, `:410`, `:421`). |
| model | `/cars/model-details/{slug}` | Car (+Brand, Offer), BreadcrumbList, FAQPage | 404 for 32 models. `Offer.availability` is InStock for "available" and PreOrder for everything else (`:140-143`). Links only to `/` and the make page. |
| make | `/makes` + `/cars/model-reps` (`:252`) | Brand, ItemList | `model-reps` always returns 500, so all 35 make pages list 0 models (meta description: "Every Hyundai electric vehicle:  — specs…") |
| compare | 2 × model-details | ItemList of Car, FAQPage | 404 if either model is broken. Reversed pairs (`/compare/bmw-i4-vs-tesla-model-3`) are separate, self-canonical duplicates. |
| best | `/cars/cards` + its own `BEST_CONFIGS` (`:549`) | ItemList | Cheapest, longest-range and under-$40k lists link to broken models (ioniq-5, kona-electric, renault-r5) |
| anything else | none | WebSite (home meta) | `/about`, `/people`, `/privacy`, `/terms`, `/advertise`, `/marketplace` and `/car_detail/*` get the home title and canonical `/` |

### 3.3 Discovery files

| File | Source | State |
|---|---|---|
| `/robots.txt` | `public/robots.txt` | Allows everything. The named AI-bot groups (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-Web, Google-Extended, Applebot-Extended, anthropic-ai, Omgilibot, Bytespider) contain only `Allow: /`. Those bots therefore don't inherit the `*` group's `Disallow: /admin`, `/auth/`, `/dashboard`, `/layout_test`. |
| `/sitemap.xml` | BE `ev_backend/routers/seo.py:71`, via rewrite | See the bullets after this table. |
| `/llms.txt` | static `public/llms.txt` (107 lines) | Claims "87+ EV models from 37 manufacturers" (`:7`, `:39`) and that "Every vehicle's data is kept current". The path-style endpoints (`:78-79`) and `https://www.evlineup.org/api/openapi.json` (`:81`) return HTML. 4 of its compare links return 404. "Last updated: 2026-10-19" is hand-written (`:107`). |
| `/openapi.json` | `public/openapi.json` | Paths are correct (`/ev/all`, `/ev/search`, `/ev/compare`, `/ev/specs`, `/ev/best`; server `https://www.evlineup.org/api`). It documents no units, status vocabulary or provenance, and `license: {name: "Public API"}` is not a licence. |
| `/mcp.json` | `public/mcp.json` | Not an MCP server: `servers.evlineup.url` (`https://www.evlineup.org/api`) returns HTML. The availability enum (`available, coming_soon, discontinued`) does not match the data. It says "87+ EVs". |
| `/llms-full.txt`, `/.well-known/ai-plugin.json` | none | 200 SPA shell (soft 404) |

Sitemap details:
- It has 144 URLs: 7 static (including `/marketplace`), 5 best, 10 compare, 87 model and 35 make.
- 38 of them return 404 (32 model, 6 compare).
- It is missing `/best/electric-trucks`, `/best/300-mile-range-evs` and every `/car_detail/*`.
- `lastmod` comes from DB `updated_at` (February 2026) for model and make URLs, and is the request date for the other 22 (`seo.py:73`).

### 3.4 Logic duplicated across files

| Logic | Copies |
|---|---|
| Best-list rules | `src/data/seoPages.ts`, `api/ev/best.js`, `api/prerender.js`, plus the path list in `ev_backend/routers/seo.py:28` |
| Compare pairs | `src/data/seoPages.ts:5`, `ev_backend/routers/seo.py:36`, `public/llms.txt` |
| Make slug function | `src/utils/makeSlug.ts`, `api/prerender.js:237`, `ev_backend/routers/seo.py:50`, plus a different rule in `api/ev/specs.js:76` |
| `API_BASE` + `fetchWithTimeout` | All 6 functions |
| Defunct-brand list | PR #8 adds 8 copies (section 4) |

## 4. What is wrong or stale on the live site

Severity levels:
- **P0**: broken now.
- **P1**: wrong facts, or misleading to people and agents.
- **P2**: data quality or consistency.
- **P3**: minor.

The PR #8 column says whether draft PR #8 already fixes the issue. Source IDs [S#] refer to the list below the table.

| # | Sev | Issue | Evidence | PR #8 |
|---|---|---|---|---|
| 1 | P0 | 32 of 87 model pages are broken | **Pages and API:** BE `/cars/model-details/{slug}` returns 500 for 32 slugs (e.g. tesla-model-x, tesla-cybertruck, hyundai-ioniq-5, ford-f150-lightning, chevrolet-equinox-ev, lucid-gravity, rivian-r2, polestar-three, renault-r5, bmw-i5). The SITE returns 404 for the same `/model_detail/*` pages (`/model_detail/hyundai-ioniq-5` re-checked 2026-10-21). `/api/ev/specs` and `/api/ev/compare` answer "Model not found". **Cause:** `CarRead.average_rating: float` is required (`ev_backend/models/pydantic_models.py:316`), but `calculate_average_rating` returns `None` when a car has no ratings (`ev_backend/dependencies.py:44`, `:51`; commit 7c89f36, 2026-07-11). The set of cards with a null rating is exactly the 32 failing slugs, and the Vercel runtime logs (2026-10-21) show every 500 as `ResponseValidationError` `float_type` at `average_rating` with input `None`. Fix: [ev_backend#7](https://github.com/jpwilson/ev_backend/pull/7). `SubmodelInfo` has the same weakness: required `submodel`, `current_price`, `acceleration_0_60`, and `int` `top_speed`/`epa_range` (`pydantic_models.py:321-330`). **SPA:** it calls the same endpoint (`src/hooks/useModelDetails.ts:53`), so browsers fail too (not rendered in a browser; UNVERIFIED). | No |
| 2 | P0 | List endpoints fail, so manufacturer pages are empty and some trims are unreachable | **List endpoints:** BE `/cars` and `/cars/model-reps` return 500 on every call (re-checked 2026-10-21). `/cars/{id}` returns 500 for 111 of 212 trims, and `/cars/submodels/{slug}` for 45 of 87 models. **Effect:** all 35 prerendered manufacturer pages list 0 models (`api/prerender.js:252`). `/car_detail/{id}` and the compare modal fail for those trims. **Unreachable trims:** 37 trims can't be read from any public endpoint (ids 17, 27, 30, 33-35, 40, 50, 51, 82-84, 86, 87, 89-92, 94, 95, 102-112, 121, 122, 124, 168, 170, 196). | No |
| 3 | P0 | 6 of 10 sitemap compare pages return 404 | hyundai-ioniq-5-vs-kia-ev6, rivian-r1s-vs-tesla-model-x, ford-f150-lightning-vs-tesla-cybertruck, chevrolet-equinox-ev-vs-tesla-model-y, tesla-model-y-vs-hyundai-ioniq-5, rivian-r1t-vs-ford-f150-lightning. Each names a broken model. | No |
| 4 | P1 | Discontinued models shown as current (status null or "available") | Tesla Model S (21) and Model X (22): production ended 2026 [S1]. F-150 Lightning BEV (6, 49): ended Dec 2025 [S2]. Jaguar I-Pace (162): ended Dec 2024 [S3]. Audi Q8 e-tron (15, 16, 25, 26, 52): ended Feb 2025 [S4]. Genesis G80 Electrified (139): dropped in the US 2025 [S5]. Renault Zoe (183-185): ended Mar 2024 [S6]. In the US only: Nissan Ariya (no MY2026) [S7], Hyundai Ioniq 6 (only Ioniq 6 N for MY2026) [S8], VW ID.4 (US build ended Apr 2026) [S9], VW ID.Buzz (no US MY2026) [S10], Polestar 2 (pulled from the US) [S11]. | No |
| 5 | P1 | Defunct brands shown like live brands | Fisker (Chapter 11, 2024-06-17) and Canoo (Chapter 7, 2025-01-17) account for 10 models and 16 trims. They appear in `/cars/cards`, `/api/ev/all` (10 of 87) and the sitemap. Fisker Pear, Ronin and Kayak (132-134) were never built, but they are labelled "discontinued" and given MSRPs. | Partly. PR #8 hides them from the homepage, best lists, `/api/ev/{all,best,search}` and make pages. Model pages, `/car_detail`, specs/compare and the sitemap still serve them. |
| 6 | P1 | Upcoming and new models are wrong | Rivian R2 (38): listed at $45,000 with null status. It launched as the R2 Performance at $57,990, with deliveries from Q2 2026 [S13]. Tesla Roadster (36): status "2025", `production_availability=true`, 620 mi and 1.85 s, but it is not in production. Polestar 4 (167): "Not yet released", but on sale in the US since June 2025 [S12]. Polestar is reportedly losing US sales authorisation for MY2027 (single source) [S11]. Scout `status_details` says "expected 2026", but production is planned for 2027 and deliveries for 2028 [S14]. Slate has 0 cars, although preorders opened 2026-06-24 at $24,950 [S15]. | No |
| 7 | P1 | The model card's rep row mixes values from different trims | These values feed the model page, the FAQ JSON-LD and every best list. Model 3 (204) "Standard Range" shows $42,490, 363 mi and 2.9 s; the real Standard is $36,990 and 321 mi [S16]. Lucid Air (8) "Sapphire" shows $69,900 and 512 mi; the Sapphire costs $249,000 and the Pure $70,900 [S17]. Cybertruck (19) "Cyberbeast" shows $79,990. Ioniq 5 (211) "Limited AWD" shows $43,975; the 2026 Limited AWD is $48,975 [S18]. Model 3 Performance (4) still shows generation "2021" at $55,990. | No |
| 8 | P1 | Best lists are wrong | **Filter:** each list requires `availability_desc === 'available'` (`api/ev/best.js:24-59`; same rule in `api/prerender.js:549` and `src/data/seoPages.ts`, except `electric-trucks`, which there only excludes "discontinued"), so the 31 null-status models drop out. **Results:** `/api/ev/best?criteria=electric-trucks` has 1 entry (R1T); the `/best/electric-trucks` page lists 4, two of them broken models (F-150 Lightning, Cybertruck). `3-row-evs` has 2. `longest-range-evs` puts the Escalade IQ first and omits the Lucid Air. `fastest-evs` omits the Model S Plaid, Air and Rimac. `cheapest-evs` and `evs-under-40k` start with the EU-only Citroën Ami ($8,720) and include the discontinued Zoe. | No (only removes defunct brands) |
| 9 | P1 | The status vocabulary is broken | 31 null, 7 year strings, "Available" vs "available" (section 1.4). The `mcp.json` enum value `coming_soon` never matches. JSON-LD maps every status except "available" to `PreOrder` (`api/prerender.js:140-143`); the Nissan Leaf, for example, is marked PreOrder. | No |
| 10 | P1 | Freshness claims are false | `llms.txt` says the data is "kept current" and "Last updated: 2026-10-19" (`:7`, `:107`). Prerender says "All data is kept current and verified" (`:405`). `/api/ev/all` `updated` and `/api/ev/specs` `lastUpdated` are the request date (`all.js:73`, `specs.js:150`). The sitemap `lastmod` is "today" for 22 URLs (`seo.py:73`). The last real edit was 2026-02-13. | No |
| 11 | P1 | Agent docs point to dead URLs | `llms.txt:78-79` path-style endpoints and `:81` `/api/openapi.json` return HTML with status 200. 4 of the llms.txt compare links return 404. The `mcp.json` server URL returns HTML. | No |
| 12 | P1 | The public API is thin | Battery, charging speed, power, drivetrain and year are null for 87/87 in `/api/ev/all` and `/api/ev/search`. Seats are null for 32. Images are relative paths. Search can't match `tesla model y`. | No |
| 13 | P1 | Soft 404s and wrong canonicals | Unknown paths, trailing-slash URLs (`/model_detail/tesla-model-3/`), `/car_detail/*` and `/news` all return 200 with the home shell (`/nonexistent-xyz-123` re-checked 2026-10-21). Static pages are canonicalised to `/` with the home title. | No |
| 14 | P1 | Big coverage gaps | See "Coverage gaps" below | No |
| 15 | P2 | "$0.0B" market cap and revenue | Values are stored in billions or other units (Tesla market_cap 600, Toyota 200000, Nissan revenue 10596.695). `ManufacturerPage.tsx:284`, `:296` divide by 1e9 again, so 600 renders as "$0.0B". 17 makes have 0 or null. | Partly. Its `> 0` guard hides zeros only. Tesla still shows "$0.0B". |
| 16 | P2 | Placeholder and implausible values | Fisker Pear (132): range 0, 0-60 0, top speed 0. Fisker Ronin (133): 600 mi and 2.0 s, never built. Tesla Semi (5, 20): 0-60 of 20.0 s, a loaded-truck figure. | Partly (Fisker hidden from lists) |
| 17 | P2 | Missing key specs | Of the 101 readable trims, battery is null on 33, charging speed on 34, seats on 32, first-release date on 32 (mostly BYD, Genesis, Porsche, Polestar, Citroën). Of the 87 cards, generation is null on 29 and seats on 32. Null seats is why the 3-row list is short. | No |
| 18 | P2 | Bad dates | Invalid YYYY-DD-MM dates: Fisker Ocean (129) `2023-23-06`, Citroën ë-C4 (135) `2021-15-02`, Genesis GV70 (138) `2022-16-03`. Cadillac Optiq (201) has first release "2022-11-01". VW ID.7 and ID.Buzz carry "2021-03-01", copied from the ID.4. | No |
| 19 | P2 | Generations out of date | Nissan Leaf (178, 179) is still the 2nd generation; the 3rd-gen 2026 Leaf costs $29,990 with 303 mi [S19]. Toyota bZ4X (190, 194) was renamed bZ for 2026 with up to 314 mi [S20]. Subaru Solterra is still 2023 at 227 mi. Volvo XC40 Recharge (169) is now the EX40. Taycan id 151 "Turbo S (1st Gen)" has generation "2025 (2nd Gen facelift)". | No |
| 20 | P2 | Typos and whitespace in names | `"Leaf\n"` (178, 179) leaks into the page `<title>`. Also: `"Performance\n"` (140), BYD "Flaship AWD" (14, 149), Lucid "Ground Touring Performance" (44), Taycan submodel `_` (154), generation `"1\n"` (180). | No |
| 21 | P2 | Slug defects | Duplicate and NULL `full_slug` (section 1.5). The orphan `polestar-two` means the Polestar 2 page shows 1 trim. `/manufacturer/citroen`, `/manufacturer/citroën` and `/manufacturer/mercedes-benz` return 404; only `/manufacturer/citron` and `/manufacturer/mercedes` work. Canoo LDV 130 and LDV 190 are separate models but are really trims of one van. | No |
| 22 | P2 | Prices and ranges are not market-scoped | EU-only cars carry unlabelled prices (Citroën Ami $8,720, Renault R5 $27,000, BYD Han $31,400) and rank in US lists. Non-US ranges sit in `epa_range` (BYD Seal 320, NIO ET7 207), with test cycle and unit unknown. | No |
| 23 | P2 | Sitemap has dead and stale URLs and gaps | It lists Fisker and Canoo and `/marketplace` and misses `/best/electric-trucks` and `/best/300-mile-range-evs` (`seo.py:23-46`). | No. It gets worse: after PR #8, `/manufacturer/fisker` and `/manufacturer/canoo` stay in the sitemap but return 404. |
| 24 | P2 | AI bots aren't excluded from admin paths | The robots.txt groups explained in section 3.3 | No |
| 25 | P2 | Image problems | Scout and Slate logos are broken. 14 logos are hotlinked from third parties. Model 3 Highland shows the 2021 photo. The earlier-generation thumbnail has no alt. 254 MB of PNGs with no width/height or `srcset`. `images[]` is unused. | No |
| 26 | P2 | Weak internal linking | Prerendered model pages link only to `/` and the make, and make pages only to `/`. There are no links to trims, compares, best lists or sibling models. | No |
| 27 | P3 | Counts don't match the data | "87+ EVs from 37 manufacturers" (`llms.txt:7`, `:39`; `prerender.js:356`, `:405`, `:410`, `:421`; `mcp.json`) vs 35 makes in the API, 32 of them with cars | No (PR #8 keeps "37") |
| 28 | P3 | Makes with no models | Mazda, Scout Motors and Slate Auto have 0 cars | No |
| 29 | P3 | The nav links to placeholder pages | Marketplace and News are in the nav. `/news` renders the Marketplace page (`App.tsx:42`). | Yes for the nav. The footer still links both (`src/components/Footer.tsx:24-25`). |
| 30 | P3 | Likely broken relative links | `CarCard.tsx:216` and `CarTable.tsx:222` use `` to={`model_detail/${car.make_model_slug}`} `` with no leading slash. On a manufacturer page this resolves to `/manufacturer/{make}/model_detail/{slug}` (UNVERIFIED in a browser). | No |
| 31 | P3 | Two-hop apex redirect | `http://evlineup.org/` → `https://evlineup.org/` → `https://www.evlineup.org/` | No |

**What PR #8 does** (from `gh pr diff 8`; the PR was last updated 2026-10-21):
- It adds `const DEFUNCT_BRANDS = ['Fisker', 'Canoo']` in 8 places across 6 files: `api/ev/all.js`, `api/ev/best.js`, `api/ev/search.js`, three builders in `api/prerender.js`, `src/hooks/useCars.ts` and `src/hooks/useMakes.ts`.
- It removes Marketplace and News from `NavBar` and `AboutPage`.
- It adds `> 0` guards on market cap and revenue.
- It deletes the `pr-screenshots/` folder that is already on main (commit "Remove leftover pr-screenshots folder").

Side effects:
- `/manufacturer/fisker` and `/manufacturer/canoo` start returning 404.
- CarDetails loses the Fisker and Canoo logos, because `useMakes` now filters those makes out.

**Coverage gaps.** These are from 19 web searches on 2026-10-20 [S21-S27]. They are secondary sources: good enough to set research priorities, not to write values.
- **US, on sale and missing:**
  - Chevrolet Bolt (2027 MY), Blazer EV and Silverado EV
  - GMC Sierra EV
  - Cadillac Vistiq
  - Hyundai Ioniq 9
  - Honda Prologue (there is no Honda make at all; ends after MY2026 [S26])
  - Nissan Leaf 3rd generation
  - Toyota bZ (the 2026 bZ4X successor) and C-HR EV
  - Subaru Trailseeker and Uncharted
  - Lexus RZ
  - Volvo EX90
  - Mercedes-Benz CLA (US launch, with EQ orders reopened [S27])
  - BMW iX3 (Neue Klasse)
  - Porsche Cayenne Electric
  - Jeep Wagoneer S
  - Acura RSX
  - Missing trims: Tesla Model 3 and Model Y Standard; Lucid Gravity Touring and Grand Touring
- **US, announced or delayed:** Slate Truck, Scout Traveler and Terra, Kia EV4 (US launch delayed) [S25], Honda 0 Series, Afeela 1.
- **EU:**
  - The whole Škoda make (Elroq and Enyaq are top-10 sellers in Q1 2026 [S23])
  - VW ID.3, Leapmotor T03, Renault 4, Alpine A290
  - Kia EV3, EV4 and EV5; Hyundai Inster
  - BYD Dolphin Surf, Seal U and Atto 2
  - Dacia Spring, Fiat Grande Panda and 500e, Peugeot e-208 and e-3008, Polestar 5
- **China:**
  - None of the 2026 top sellers are in the catalog [S24]: Geely Galaxy/EX2, Leapmotor A10, BYD Atto 2 and Song Ultra, Changan Nevo Q05, Li Auto i6, Xiaomi SU7 and YU7.
  - Zeekr, Xiaomi, Li Auto, Leapmotor, Aito, Avatr and Deepal are all absent.
  - Today's China coverage is BYD (4 models), NIO ET7, XPeng P7 (older generation) and Geely Geometry C (production 2020-2024, partly verified).

**Sources** (cited by the live-data audit; secondary press):

| ID | Topic | URL |
|---|---|---|
| S1 | Tesla Model S/X production end | https://www.fox2detroit.com/news/tesla-ends-production-model-s-model-x-cars-2026 |
| S2 | F-150 Lightning BEV end | https://electrek.co/2025/12/15/ford-reveals-new-f-150-lightning-erev-plans-kills-off-ev-version/ |
| S3 | Jaguar I-Pace end | https://www.topgear.com/car-news/business/jaguar-has-stopped-building-xe-xf-and-f-type-i-pace-and-e-pace-stop-dec |
| S4 | Audi Q8 e-tron end | https://www.motor1.com/news/742076/audi-q8-e-tron-discontinued-february-2025/ |
| S5 | Genesis G80 Electrified, US | https://www.carscoops.com/2025/08/americans-ignored-genesis-electric-sedan-so-hard-its-already-dead/ |
| S6 | Renault Zoe end | https://www.autocar.co.uk/car-news/new-cars/renault-zoe-taken-sale-uk-after-11-years |
| S7 | Nissan Ariya, US | https://www.motor1.com/news/772766/nissan-ariya-dead-discontinued-2026/ |
| S8 | Hyundai Ioniq 6, US | https://www.aol.com/articles/hyundai-killing-ioniq-6-u-164500029.html |
| S9 | VW ID.4 US production | https://www.carscoops.com/2026/04/vw-id4-chattanooga-production-end/ |
| S10 | VW ID.Buzz, US | https://www.electrive.com/2026/09/25/vw-postpones-us-return-of-the-id-buzz-to-2028/ |
| S11 | Polestar, US | https://www.motor1.com/news/803972/polestar-us-sales-ban-owners/ |
| S12 | Polestar 4 on sale in US | https://electrek.co/2025/06/03/2026-polestar-4-officially-on-sale-us-priced-slightly-higher/ |
| S13 | Rivian R2 launch | https://www.electrive.com/2026/03/13/rivian-r2-initially-launches-at-57990/ |
| S14 | Scout delay | https://www.motor1.com/news/792508/scout-truck-suv-delayed-2028-2030/ |
| S15 | Slate preorders | https://insideevs.com/news/797274/slate-ev-truck-preorder-price/ |
| S16 | Tesla Model 3/Y Standard | https://www.foxbusiness.com/lifestyle/tesla-unveils-lower-cost-versions-model-y-model-3-vehicles |
| S17 | Lucid Air 2026 trims | https://www.kbb.com/lucid/air/2026/specs |
| S18 | Ioniq 5 2026 pricing | https://evchargingstations.com/chargingnews/2026-hyundai-ioniq-5-starts-at-35000-msrp/ |
| S19 | Nissan Leaf 2026 | https://insideevs.com/news/769430/nissan-leaf-price-range-2026/ |
| S20 | Toyota bZ 2026 | https://insideevs.com/news/769526/2026-toyota-bz-ev-suv-price-specs/ |
| S21 | Chevrolet Bolt 2027 | https://insideevs.com/news/775172/2027-chevrolet-bolt-range-price-revealed/ |
| S22 | US 2026 launches | https://insideevs.com/news/783999/every-new-electric-car-ev-2026/ |
| S23 | EU top sellers Q1 2026 | https://eleport.com/best-electric-cars-2026-q1/ |
| S24 | China top sellers Aug 2026 | https://carnewschina.com/2026/09/09/top-10-best-selling-cars-in-china-in-august-bev-takes-nine-and-half-spots-gas-cars-disappear/ |
| S25 | Kia EV4 US delay | https://electrek.co/2025/11/26/kia-ev4-delayed-but-another-ev-still-coming-to-the-us/ |
| S26 | Honda Prologue after MY2026 | https://tflcar.com/2026/07/honda-prologue-discontinued-news/ |
| S27 | Mercedes EQ US orders resumed | https://electrek.co/2026/01/15/evs-are-back-on-the-menu-mercedes-re-opens-eq-orders-in-us-with-cla-launch/ |

## 5. Data-freshness pipeline status

| Piece | Where | State |
|---|---|---|
| Change-proposal API (crawl runs, proposals, approve/reject) | `ev_backend/routers/proposals.py`: field whitelist `:32-47`, apply `:270-278` | Deployed: the BE `/openapi.json` lists `/admin/crawl-runs` and `/admin/proposals`. Returns 503 if the 002/003 tables are missing (`_guard_tables`, `:52-59`). The Action never reached it, because every run failed first. Whether anything else has used it is UNVERIFIED. |
| Review UI | `eeveecars/src/components/admin/DataInbox.tsx` | Shows "run migrations 002 and 003" on a 503 (`:60`, `:98-103`) |
| Fetcher | `ev_backend/scripts/fetchers/epa_range_check.py` | The only fetcher. GETs `/cars/cards`, matches against fueleconomy.gov menus, and posts proposals. |
| Schedule | `ev_backend/.github/workflows/data-freshness.yml` (daily 09:00 UTC) | **61 of 61 runs failed** (2026-07-13 to 2026-09-11). The workflow is now `disabled_inactivity`. |
| Price history | `price_snapshots` (migration 003) | Nothing writes to it |

**Why the runs fail:**
- The run log shows `EV_ADMIN_KEY:` empty, then `EV_ADMIN_KEY required (or use --dry-run)` and exit code 2 (`epa_range_check.py:99-101`).
- `gh api repos/jpwilson/ev_backend/actions/secrets` returns `total_count: 0`.
- The logs also warn that `actions/checkout@v4` and `actions/setup-python@v5` are being forced from Node 20 to Node 24.

**Flaws that remain once the secret is added:**
1. **Coverage.** Only rep rows with `availability_desc == "available"` and a 4-digit year in `generation` are checked (`epa_range_check.py:107-108`). That is 14 of 87 models, and trims are never checked.
2. **Wrong comparison.** It compares the rep trim against the best range across the whole EPA model line. A dry run on 2026-10-20 checked 8 cars and proposed 3 changes:
   - BMW i7 274 to 321 mi. 321 mi belongs to a different trim, so approving this would write a wrong value.
   - i4 318 to 307.
   - Lyriq 326 to 312.
3. **Provenance is lost.** The `Car` and `Make` ORM classes don't map `sources` or `last_verified_at`. The `hasattr` checks (`proposals.py:271-273`) are therefore false for cars and makes, and approvals record no source or date.
4. **The model year is parsed out of the free-text `generation`.**

## 6. What we could not check

| Item | Why not | How to settle it |
|---|---|---|
| Whether 002/003 ran in production; the Alembic version; constraints, triggers and RLS | No DB access | SQL below |
| Contents of the 37 trims no public endpoint returns | They return 500 | SQL below |
| Browser behaviour of broken model pages and of the relative card links (#30) | Not rendered in a browser | Open `/manufacturer/tesla` and click a card |
| Google index state | No Search Console access | Search Console |
| Vercel plan limits (function count, bulk redirects); Supabase backups/PITR | No dashboard access | Dashboards |
| Whether the 002/003 tables, if they exist, can be read or written through Supabase's public Data API with the anon key that ships in the frontend bundle | Depends on RLS, which migrations 002/003 never enable | The `relrowsecurity` query below |

The claude.ai Supabase connector used for this audit is signed in to an account that doesn't include the EVLineup project (`mesvpswjkqqogdoscyxx`), so database access has to come from JP.

Read-only SQL to run once access is granted. Run sections 1-3 first. Section 4 only works if section 1 shows that the tables exist.

```sql
-- 1. Server and migration state
SELECT version();
SELECT version_num FROM public.alembic_version;                       -- repo head is a3f8b2c1d4e5
SELECT table_name FROM information_schema.tables
 WHERE table_schema = 'public'
   AND table_name IN ('models','crawl_runs','change_proposals','price_snapshots',
                      'profiles','user_favorites','user_notes','user_cars');
SELECT table_name, column_name, data_type FROM information_schema.columns
 WHERE table_schema = 'public'
   AND ((table_name = 'cars'  AND column_name IN ('model_id','sources','last_verified_at','images','full_slug','make_model_slug'))
     OR (table_name = 'makes' AND column_name IN ('sources','last_verified_at','update_cadence','status')))
 ORDER BY 1, 2;

-- 2. Constraints, indexes, triggers, row-level security, owners
SELECT conrelid::regclass AS tbl, conname, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
 WHERE conrelid IN (to_regclass('public.cars'), to_regclass('public.makes'),
                    to_regclass('public.models'), to_regclass('public.change_proposals'))
 ORDER BY 1, 2;
SELECT tablename, indexname, indexdef FROM pg_indexes
 WHERE schemaname = 'public' AND tablename IN ('cars','makes','models') ORDER BY 1, 2;
SELECT tgrelid::regclass AS tbl, tgname, pg_get_triggerdef(oid) AS def
  FROM pg_trigger
 WHERE NOT tgisinternal
   AND tgrelid IN (to_regclass('public.cars'), to_regclass('public.makes'), to_regclass('public.models'));
SELECT relname, relrowsecurity, pg_get_userbyid(relowner) AS owner
  FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' ORDER BY 1;

-- 3. Catalog counts and data quality
SELECT (SELECT count(*) FROM public.cars)  AS cars,
       (SELECT count(*) FROM public.makes) AS makes,
       (SELECT count(DISTINCT make_model_slug) FROM public.cars) AS model_slugs,
       (SELECT max(updated_at) FROM public.cars)  AS cars_last_edit,
       (SELECT max(updated_at) FROM public.makes) AS makes_last_edit;
SELECT make_model_slug, count(*) FILTER (WHERE is_model_rep) AS reps, count(*) AS trims
  FROM public.cars GROUP BY 1 HAVING count(*) FILTER (WHERE is_model_rep) <> 1 ORDER BY 1;
SELECT full_slug, count(*) FROM public.cars GROUP BY 1 HAVING count(*) > 1 OR full_slug IS NULL;
SELECT availability_desc, production_availability, count(*) FROM public.cars GROUP BY 1, 2 ORDER BY 3 DESC;
SELECT generation, count(*) FROM public.cars GROUP BY 1 ORDER BY 2 DESC;
SELECT status, count(*) FROM public.makes GROUP BY 1;
SELECT count(*) FILTER (WHERE images IS NOT NULL AND images::text NOT IN ('[]', 'null')) AS cars_with_gallery
  FROM public.cars;
SELECT id, make_name, model, submodel, generation, availability_desc, epa_range, current_price, updated_at
  FROM public.cars
 WHERE id IN (17,27,30,33,34,35,40,50,51,82,83,84,86,87,89,90,91,92,94,95,102,103,104,105,106,
              107,108,109,110,111,112,121,122,124,168,170,196)
 ORDER BY id;
SELECT bucket_id, count(*) AS objects, max(created_at) AS newest FROM storage.objects GROUP BY 1;

-- 4. Pipeline tables (only if section 1 shows they exist)
SELECT status, count(*) FROM public.models GROUP BY 1;
SELECT count(*) AS cars, count(model_id) AS linked_to_model FROM public.cars;
SELECT status, count(*) FROM public.change_proposals GROUP BY 1;
SELECT id, scope, status, started_at, finished_at FROM public.crawl_runs ORDER BY id DESC LIMIT 5;
SELECT count(*) FROM public.price_snapshots;
```

## Appendix: inventory numbers (2026-10-20)

| Metric | Value | Source |
|---|---|---|
| Makes | 35. Status: active 31, defunct 2, pre-production 2. 32 have cars; Mazda, Scout Motors and Slate Auto have none. | BE `/makes?limit=100` |
| Trims (`cars` rows) | 212 (ids 1-212). 101 readable via `/cars/{id}`, 175 readable via any endpoint, 37 not readable. | Sum of `car_id_list`; per-id GETs |
| Models | 87 rep models in `/cars/cards`, plus the orphan slug `polestar-two`. The true count is UNVERIFIED until the 37 hidden trims are read. | BE `/cars/cards` |
| Models/trims per make | Tesla 7/20; Mercedes 5/19; Hyundai 3/19; KIA 3/17; Porsche 4/14; Canoo 6/10; BMW 4/10; Rivian 5/9; Cadillac 4/9; Audi 3/9; Ford 2/8; Renault 4/7; Nissan 2/7; BYD 4/6; Fisker 4/6; Polestar 3/6; Lucid 2/6; Genesis 3/5; Volvo 2/4; Citroën 3/3; VW 3/3; Subaru 1/3; GMC 1/2; Toyota 1/2; 1/1 each for Chevrolet, Geely, Jaguar, Mini, NIO, Rimac, Rolls-Royce, XPeng; 0/0 for Mazda, Scout Motors, Slate Auto | `/makes` + `/cars/cards` |
| `availability_desc` (87 cards) | available 37, null 31, discontinued 10, "2022" ×4, "2020", "2024", "2025", "Available", "Not yet released" | `/cars/cards` |
| `availability_desc` (175 readable trims) | null 83, available 56, discontinued 13, "2022" 9, previous_generation 8, other years 4, "Not yet released" 1, "Available" 1 | per-trim GETs |
| Null fields (87 cards) | average_rating 32, seats 32, generation 29 | `/cars/cards` |
| Last catalog edit | 2026-02-13 (max `updated_at` over the readable trims; 81 rows on 2026-02-10) | per-trim GETs |
| Sitemap | 144 URLs: 87 model (55 OK, 32 return 404), 35 make (all 200, all with empty model lists), 10 compare (4 OK, 6 return 404), 5 best, 7 static (6 canonicalised to `/`) | SITE `/sitemap.xml`, fetched as Googlebot |
| Images | 87 of 87 cards use `/pub_assets/car_images/*`. 208 files (254 MB) in the repo. `images[]` is empty on all readable rows. Logos: 21 relative, 13 on 1000logos.net, 1 on greenhouse.io, 2 broken (Scout, Slate). | `/cars/cards`, `/makes`, repo |
| `vehicle_class` | 45 distinct strings across 87 models | `/cars/cards` |
| Public API functions | 6 (`api/prerender.js` + 5 in `api/ev/`) | repo |
| Data-freshness runs | 61 runs, all failed (2026-07-13 to 2026-09-11); workflow disabled | `gh run list` |
| Open backend PRs | #6 "Add backend SEO, newsletter, contact, sitemap, and pagination support" (2026-03-24, merge conflicts); 5 dependabot PRs from Feb 2026 | `gh pr list -R jpwilson/ev_backend` |
