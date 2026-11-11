import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useSearchParams } from "react-router-dom";
import CatalogPage from "../components/catalog/CatalogPage";
import ModelCard from "../components/catalog/ModelCard";
import CatalogError from "../components/catalog/CatalogError";
import { useCatalogMakes, useCatalogModels } from "../hooks/useCatalog";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { CatalogModelCard, CatalogStatus } from "../types/catalog";
import { BODY_STYLE_LABELS, MARKET_LABELS, MARKET_ORDER, modelDisplayName } from "../utils/catalogFormat";
import { popularityRank } from "../data/popularity";

type StatusGroup = "current" | "upcoming" | "discontinued";
type SortKey = "popular" | "name" | "price" | "range" | "newest";

const STATUS_GROUPS: { key: StatusGroup; label: string; includes: CatalogStatus[] }[] = [
  { key: "current", label: "On sale", includes: ["current"] },
  { key: "upcoming", label: "Coming soon", includes: ["upcoming"] },
  { key: "discontinued", label: "Discontinued or cancelled", includes: ["discontinued", "cancelled"] },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular first" },
  { key: "name", label: "Name (A–Z)" },
  { key: "newest", label: "Newest first" },
  { key: "price", label: "Price (lowest first)" },
  { key: "range", label: "Range (longest first)" },
];

const PAGE = 60;
// Currencies / test cycles are never converted, so sorts compare like with like:
// first by currency (or range unit + cycle) in this order, then by value.
const CURRENCY_ORDER = ["USD", "CAD", "EUR", "GBP", "CNY", "JPY", "KRW", "AUD", "INR"];
const CYCLE_ORDER = ["mi EPA", "km WLTP", "km CLTC", "km WLTC", "km KR", "km MIDC"];
const rank = (order: string[], v: string) => (order.indexOf(v) === -1 ? 99 : order.indexOf(v));

function matchesQuery(m: CatalogModelCard, words: string[]) {
  if (!words.length) return true;
  const hay = [m.make?.name, m.make?.slug, m.name, m.slug, ...(m.aliases ?? [])].join(" ").toLowerCase();
  return words.every((w) => hay.includes(w));
}

function sortModels(list: CatalogModelCard[], sort: SortKey) {
  const byName = (a: CatalogModelCard, b: CatalogModelCard) =>
    modelDisplayName(a.make?.name, a.name).localeCompare(modelDisplayName(b.make?.name, b.name));
  const out = [...list];
  if (sort === "name") return out.sort(byName);
  if (sort === "popular") {
    // On-sale models first, then by the editorial popularity order, then name
    const live = (m: CatalogModelCard) => {
      const s = m.market_status ?? m.status;
      return s === "current" ? 0 : s === "upcoming" ? 1 : 2;
    };
    return out.sort(
      (a, b) =>
        live(a) - live(b) ||
        popularityRank(a.slug, a.make?.slug) - popularityRank(b.slug, b.make?.slug) ||
        byName(a, b)
    );
  }
  if (sort === "newest")
    return out.sort((a, b) => (b.years?.start ?? 0) - (a.years?.start ?? 0) || byName(a, b));
  if (sort === "price")
    return out.sort((a, b) => {
      const pa = a.from_price?.value ? a.from_price : null;
      const pb = b.from_price?.value ? b.from_price : null;
      if (!pa || !pb) return pa ? -1 : pb ? 1 : byName(a, b);
      return rank(CURRENCY_ORDER, pa.currency ?? "") - rank(CURRENCY_ORDER, pb.currency ?? "") || pa.value! - pb.value!;
    });
  return out.sort((a, b) => {
    const ra = a.max_range?.value ? a.max_range : null;
    const rb = b.max_range?.value ? b.max_range : null;
    if (!ra || !rb) return ra ? -1 : rb ? 1 : byName(a, b);
    return (
      rank(CYCLE_ORDER, `${ra.unit} ${ra.cycle}`) - rank(CYCLE_ORDER, `${rb.unit} ${rb.cycle}`) || rb.value! - ra.value!
    );
  });
}

/** /cars: every model in the catalog as a dense photo grid, with search, filters and sort. */
export default function AllCarsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const statusParam = params.get("status");
  const statuses = new Set<StatusGroup>(
    statusParam ? (statusParam.split(",").filter((s) => STATUS_GROUPS.some((g) => g.key === s)) as StatusGroup[]) : ["current", "upcoming", "discontinued"]
  );
  const make = params.get("make") ?? "";
  const body = params.get("body") ?? "";
  const market = params.get("market") ?? "";
  const sort = (SORTS.some((s) => s.key === params.get("sort")) ? params.get("sort") : "popular") as SortKey;
  const hideCommercial = params.get("commercial") === "hide";

  const [qInput, setQInput] = useState(q);
  const [shown, setShown] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const sub = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("white", "gray.700");
  useDocumentTitle("All electric cars: every EV, current and past | EV Lineup");

  // With a market, the API gives that market's status and headline figures.
  const { data, error, isLoading } = useCatalogModels(market ? { market } : {});
  const { data: makes } = useCatalogMakes();

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  // Debounce the search box into the URL.
  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== q) update({ q: qInput.trim() || null });
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  const filtered = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const allowed = new Set<CatalogStatus>(STATUS_GROUPS.filter((g) => statuses.has(g.key)).flatMap((g) => g.includes));
    const list = (data?.models ?? []).filter((m) => {
      const st = (market ? m.market_status : m.status) ?? m.status;
      if (st && !allowed.has(st)) return false;
      if (make && m.make?.slug !== make) return false;
      if (body && m.body_style !== body) return false;
      if (hideCommercial && m.is_commercial) return false;
      return matchesQuery(m, words);
    });
    return sortModels(list, sort);
    // statuses is derived from statusParam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, statusParam, make, body, market, sort, hideCommercial]);

  useEffect(() => setShown(PAGE), [q, statusParam, make, body, market, sort, hideCommercial]);

  // Render more cards as the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShown((n) => n + PAGE);
      },
      { rootMargin: "800px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, shown]);

  const toggleStatus = (key: StatusGroup) => {
    const next = new Set(statuses);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    const all = next.size === STATUS_GROUPS.length;
    update({ status: all ? null : [...next].join(",") || "none" });
  };

  const bodyStyles = useMemo(
    () => Object.keys(BODY_STYLE_LABELS).filter((b) => (data?.models ?? []).some((m) => m.body_style === b)),
    [data]
  );

  if (error) return <CatalogError error={error} />;

  const visible = filtered.slice(0, shown);
  const mixed = !market && (sort === "price" || sort === "range");

  return (
    <CatalogPage maxW="1500px" crumbs={[{ label: "Home", to: "/" }, { label: "All electric cars" }]}>
      <Heading as="h1" size="lg" mb={1}>
        All electric cars
      </Heading>
      <Text color={sub} mb={4} fontSize="sm">
        Every battery-electric model we track, on sale or not: {data ? `${data.count} models` : "loading"}
        {makes ? ` from ${makes.count} makes` : ""}.
      </Text>

      <Flex gap={2} flexWrap="wrap" mb={3} align="center">
        <InputGroup size="sm" flex={{ base: "1 1 100%", md: "1 1 260px" }} maxW={{ md: "340px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search make or model"
            aria-label="Search make or model"
            borderRadius="10px"
            bg={inputBg}
          />
        </InputGroup>
        <Select
          size="sm"
          value={make}
          onChange={(e) => update({ make: e.target.value || null })}
          aria-label="Make"
          borderRadius="10px"
          bg={inputBg}
          flex={{ base: "1 1 45%", md: "0 0 170px" }}
        >
          <option value="">All makes</option>
          {(makes?.makes ?? []).map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          value={body}
          onChange={(e) => update({ body: e.target.value || null })}
          aria-label="Body style"
          borderRadius="10px"
          bg={inputBg}
          flex={{ base: "1 1 45%", md: "0 0 150px" }}
        >
          <option value="">All body styles</option>
          {bodyStyles.map((b) => (
            <option key={b} value={b}>
              {BODY_STYLE_LABELS[b]}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          value={market}
          onChange={(e) => update({ market: e.target.value || null })}
          aria-label="Market"
          borderRadius="10px"
          bg={inputBg}
          flex={{ base: "1 1 45%", md: "0 0 170px" }}
        >
          <option value="">All markets</option>
          {MARKET_ORDER.map((m) => (
            <option key={m} value={m}>
              {MARKET_LABELS[m]}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          value={sort}
          onChange={(e) => update({ sort: e.target.value === "popular" ? null : e.target.value })}
          aria-label="Sort"
          borderRadius="10px"
          bg={inputBg}
          flex={{ base: "1 1 45%", md: "0 0 190px" }}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </Select>
      </Flex>

      <Wrap spacing={2} mb={4} align="center">
        {STATUS_GROUPS.map((g) => (
          <WrapItem key={g.key}>
            <Button
              size="xs"
              borderRadius="full"
              colorScheme="green"
              variant={statuses.has(g.key) ? "solid" : "outline"}
              onClick={() => toggleStatus(g.key)}
              aria-pressed={statuses.has(g.key)}
            >
              {g.label}
            </Button>
          </WrapItem>
        ))}
        <WrapItem>
          <Checkbox
            size="sm"
            colorScheme="green"
            isChecked={hideCommercial}
            onChange={(e) => update({ commercial: e.target.checked ? "hide" : null })}
          >
            Hide commercial vehicles
          </Checkbox>
        </WrapItem>
      </Wrap>

      <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Text fontSize="sm" color={sub}>
          {isLoading ? "Loading…" : `${filtered.length} model${filtered.length === 1 ? "" : "s"}`}
          {market ? ` in ${MARKET_LABELS[market]}` : ""}
        </Text>
        {mixed && (
          <Text fontSize="xs" color={sub}>
            Prices and ranges are never converted, so they are sorted within each currency or test cycle. Pick a market to
            compare like for like.
          </Text>
        )}
      </HStack>

      <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={{ base: 2, md: 3 }}>
        {isLoading
          ? Array.from({ length: 18 }).map((_, i) => <Skeleton key={i} height="190px" borderRadius="14px" />)
          : visible.map((m) => <ModelCard key={m.slug} model={m} />)}
      </SimpleGrid>

      {!isLoading && filtered.length === 0 && (
        <Box textAlign="center" py={12} color={sub}>
          No models match these filters.
        </Box>
      )}
      {shown < filtered.length && (
        <Flex ref={sentinel} justify="center" py={6}>
          <Button size="sm" variant="outline" colorScheme="green" onClick={() => setShown((n) => n + PAGE)}>
            Show more ({filtered.length - shown} left)
          </Button>
        </Flex>
      )}
    </CatalogPage>
  );
}
