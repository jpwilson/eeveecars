import {
  Badge,
  Box,
  Container,
  Heading,
  Text,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  Thead,
  Image,
  HStack,
  VStack,
  Link,
  ListItem,
  SimpleGrid,
  UnorderedList,
  Wrap,
  WrapItem,
  Tag,
  Center,
  Spinner,
  Button,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import NotFoundPage from "./NotFoundPage";
import CatalogPage from "../components/catalog/CatalogPage";
import CatalogImage from "../components/catalog/CatalogImage";
import CatalogError from "../components/catalog/CatalogError";
import CompareTable from "../components/catalog/CompareTable";
import GlassCard from "../components/catalog/GlassCard";
import SourcesList from "../components/catalog/SourcesList";
import StatusBadge from "../components/catalog/StatusBadge";
import { MarketPicker } from "../components/catalog/GenerationBits";
import { CatalogLoading } from "../components/catalog/PageStates";
import apiClient from "../services/api-client";
import { errorStatus, useCatalogCompare } from "../hooks/useCatalog";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { CatalogCompareResponse, CompareModelSide, ComparePairRef } from "../types/catalog";
import { formatPrice } from "../utils/formatPrice";
import { bodyStyleLabel, formatDate, marketLabel } from "../utils/catalogFormat";
import { COMPARE_PAIRS } from "../data/seoPages";

function Spinning() {
  return (
    <Box>
      <NavBar />
      <Center minH="50vh">
        <Spinner size="xl" color="green.500" thickness="4px" />
      </Center>
    </Box>
  );
}

/** Curated pairs, shown only by the legacy fallback (the catalog page uses the API's `more`). */
function MoreComparisons({ current }: { current: string }) {
  return (
    <Box mt={12}>
      <Heading as="h2" size="sm" mb={3}>
        More comparisons
      </Heading>
      <Wrap>
        {COMPARE_PAIRS.filter((p) => p.pair !== current).slice(0, 6).map((p) => (
          <WrapItem key={p.pair}>
            <Tag
              as={RouterLink}
              to={`/compare/${p.pair}`}
              colorScheme="green"
              variant="subtle"
              borderRadius="full"
              px={3}
              py={1.5}
              cursor="pointer"
            >
              {p.label}
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
}

/**
 * /compare/:a-vs-:b. The backend computes every row, sentence and FAQ entry in one
 * market; this page only displays them. Any order or legacy slug redirects to the
 * canonical `data.path`. 503 (catalog not migrated) → the legacy comparison.
 */
export default function ComparePage() {
  const { pair } = useParams<{ pair: string }>();
  const location = useLocation();
  const [search, setSearch] = useSearchParams();
  const parts = (pair ?? "").split("-vs-");
  const valid = parts.length === 2 && !!parts[0] && !!parts[1];
  const market = search.get("market");
  const { data, error, isLoading, isFetching } = useCatalogCompare(
    valid ? parts[0].toLowerCase() : undefined,
    valid ? parts[1].toLowerCase() : undefined,
    market
  );
  useDocumentTitle(data ? `${data.a.name} vs ${data.b.name}: Specs Compared | EV Lineup` : null);

  if (!pair || !valid) return <NotFoundPage />;
  if (isLoading) return <CatalogLoading />;
  const s = errorStatus(error);
  // An unknown market for this pair (400): drop it and show the default market.
  if (s === 400 && market) return <Navigate to={location.pathname} replace />;
  // 503 (catalog not migrated yet) or no answer: the old comparison, so the page never breaks
  if (error && (s === 503 || s === 0)) return <LegacyComparePage pair={pair} slugA={parts[0]} slugB={parts[1]} />;
  if (error || !data) return <CatalogError error={error} />;
  // Reversed order, legacy slug or other non-canonical form → the canonical URL.
  if (data.path !== location.pathname) return <Navigate to={`${data.path}${location.search}${location.hash}`} replace />;
  return (
    <CatalogCompare
      data={data}
      isFetching={isFetching}
      onMarket={(m) => setSearch(m === data.quality?.default_market ? {} : { market: m }, { replace: true })}
    />
  );
}

// ---------- catalog comparison ----------

/**
 * True when the prerendered page already shows this FAQ in #seo-content (outside #root,
 * kept after React mounts), so the React page does not show it a second time.
 */
function faqInPrerenderTail(path: string) {
  if (typeof document === "undefined") return false;
  return Array.from(document.querySelectorAll("#seo-content [data-faq-for]")).some(
    (el) => el.getAttribute("data-faq-for") === path
  );
}

const RELATION_LABEL: Record<string, string> = {
  twin: "Twins: same car, two brands",
  successor: "One replaced the other",
  same_make: "Same brand",
};

function CarSide({ side, market }: { side: CompareModelSide; market: string | null }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const name = side.name ?? side.model.name ?? side.model.slug;
  const gen = side.generation;
  const img = gen?.image ?? null;
  const status = side.model.status;
  return (
    <Box minW={0}>
      <RouterLink to={side.model.path} aria-label={name}>
        <CatalogImage
          image={gen?.image ?? null}
          ratio={16 / 10}
          borderRadius="12px"
          fallbackAlt={name}
          placeholder="No photo yet"
          sizes="(max-width: 768px) 50vw, 560px"
        />
      </RouterLink>
      <Link as={RouterLink} to={side.model.path} display="block" mt={2} fontWeight="700" color="green.600" lineHeight="1.3">
        {name}
      </Link>
      <Text fontSize="xs" color={sub}>
        {[gen?.name, gen?.years, bodyStyleLabel(side.model.body_style)].filter(Boolean).join(" · ")}
      </Text>
      {img && (img.credit || img.license) && (
        <Text fontSize="2xs" color={sub} mt={0.5} noOfLines={2}>
          Photo:{" "}
          {img.page_url ? (
            <Link href={img.page_url} isExternal rel="noopener noreferrer" textDecoration="underline">
              {[img.credit, img.license].filter(Boolean).join(" · ")}
            </Link>
          ) : (
            [img.credit, img.license].filter(Boolean).join(" · ")
          )}
        </Text>
      )}
      <HStack spacing={1} mt={1} flexWrap="wrap">
        {status && status !== "current" && <StatusBadge status={status} fontSize="10px" />}
        {market && status === "current" && side.market_status !== "current" && (
          <Badge variant="outline" colorScheme="gray" borderRadius="6px" textTransform="none" fontSize="10px">
            Not on sale in {marketLabel(market)} in our data
          </Badge>
        )}
      </HStack>
    </Box>
  );
}

function PairLinks({ title, pairs }: { title: string; pairs: ComparePairRef[] }) {
  if (!pairs.length) return null;
  return (
    <Box>
      <Text fontSize="sm" fontWeight="700" mb={1}>
        {title}
      </Text>
      <UnorderedList spacing={1} fontSize="sm" ml={5}>
        {pairs.map((p) => (
          <ListItem key={p.path}>
            <Link as={RouterLink} to={p.path} color="green.600">
              {p.name ?? p.key}
            </Link>
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
}

function CatalogCompare({
  data,
  isFetching,
  onMarket,
}: {
  data: CatalogCompareResponse;
  isFetching: boolean;
  onMarket: (m: string) => void;
}) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const nameA = data.a.name ?? data.a.model.slug;
  const nameB = data.b.name ?? data.b.model.slug;
  const rows = (data.rows ?? []).filter((r) => r.a || r.b);
  const faq = data.faq ?? [];
  const showFaq = faq.length > 0 && !faqInPrerenderTail(data.path);
  const lists = data.lists ?? [];
  const moreA = data.more?.a ?? [];
  const moreB = data.more?.b ?? [];
  const relation = data.relation?.kind ? RELATION_LABEL[data.relation.kind] : null;

  return (
    <CatalogPage
      maxW="1100px"
      crumbs={[
        { label: "Compare", to: "/compare" },
        { label: `${nameA} vs ${nameB}` },
      ]}
    >
      <VStack align="stretch" spacing={6}>
        <GlassCard>
          <Heading as="h1" size="lg" letterSpacing="-0.01em">
            {nameA} vs {nameB}
          </Heading>
          {relation && (
            <Badge mt={2} variant="outline" colorScheme="purple" borderRadius="6px" textTransform="none">
              {relation}
            </Badge>
          )}
          <VStack align="stretch" spacing={2} mt={3}>
            {(data.summary ?? []).map((s, i) => (
              <Text key={i} fontSize={i === 0 ? "md" : "sm"} lineHeight="1.7">
                {s}
              </Text>
            ))}
          </VStack>
          <SimpleGrid columns={2} spacing={{ base: 3, md: 5 }} mt={5} maxW="860px" mx="auto">
            <CarSide side={data.a} market={data.market} />
            <CarSide side={data.b} market={data.market} />
          </SimpleGrid>
        </GlassCard>

        {rows.length > 0 && (
          <GlassCard as="section" p={{ base: 3, md: 6 }}>
            <HStack justify="space-between" align="baseline" flexWrap="wrap" gap={2} mb={3} px={{ base: 1, md: 0 }}>
              <Heading as="h2" size="md">
                Side by side
              </Heading>
              <Box opacity={isFetching ? 0.6 : 1}>
                <MarketPicker markets={data.markets ?? []} value={data.market} onChange={onMarket} />
              </Box>
            </HStack>
            <Box opacity={isFetching ? 0.6 : 1} transition="opacity 0.15s">
              <CompareTable rows={rows} nameA={nameA} nameB={nameB} />
            </Box>
            <Text fontSize="xs" color={sub} mt={2} px={{ base: 1, md: 0 }}>
              Each figure is the highest (or lowest) on file across the current version's trims, with the trim it comes
              from. Prices, ranges and batteries are compared only on the same market, currency, price basis, test cycle
              and battery basis; nothing is converted.
              {(data.notes ?? []).length ? ` ${(data.notes ?? []).join(" ")}` : ""}
            </Text>
          </GlassCard>
        )}

        {showFaq && (
          <GlassCard as="section">
            <Heading as="h2" size="md" mb={3}>
              Questions and answers
            </Heading>
            <VStack align="stretch" spacing={3}>
              {faq.map((f) => (
                <Box key={f.q}>
                  <Heading as="h3" size="sm" mb={1}>
                    {f.q}
                  </Heading>
                  <Text fontSize="sm" lineHeight="1.7">
                    {f.a}
                  </Text>
                </Box>
              ))}
            </VStack>
          </GlassCard>
        )}

        {lists.length > 0 && (
          <GlassCard as="section">
            <Heading as="h2" size="md" mb={3}>
              Where they rank
            </Heading>
            <VStack align="stretch" spacing={2}>
              {lists.map((l) => (
                <Box key={l.key} fontSize="sm">
                  <Link as={RouterLink} to={l.path} color="green.600" fontWeight="600">
                    {l.title ?? l.key}
                  </Link>
                  <Text as="span" color={sub}>
                    {" "}
                    {[
                      l.a_rank ? `${nameA} #${l.a_rank}` : null,
                      l.b_rank ? `${nameB} #${l.b_rank}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </Box>
              ))}
            </VStack>
          </GlassCard>
        )}

        <GlassCard as="nav" aria-label="Related pages">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <PairLinks title={`More ${nameA} comparisons`} pairs={moreA} />
            <PairLinks title={`More ${nameB} comparisons`} pairs={moreB} />
          </SimpleGrid>
          <Wrap spacing={4} mt={moreA.length || moreB.length ? 4 : 0} fontSize="sm">
            <WrapItem>
              <Link as={RouterLink} to={data.a.model.path} color="green.600">
                Everything on the {nameA} →
              </Link>
            </WrapItem>
            <WrapItem>
              <Link as={RouterLink} to={data.b.model.path} color="green.600">
                Everything on the {nameB} →
              </Link>
            </WrapItem>
            <WrapItem>
              <Link as={RouterLink} to="/compare" color="green.600">
                All comparisons →
              </Link>
            </WrapItem>
          </Wrap>
        </GlassCard>

        <GlassCard>
          <SourcesList sources={data.sources ?? []} updatedAt={formatDate(data.updated_at)} />
        </GlassCard>
      </VStack>
    </CatalogPage>
  );
}

// ---------- legacy comparison (shown only while the catalog is not available) ----------

interface RepModel {
  make_name: string;
  model: string;
  image_url: string;
  current_price: number | null;
  epa_range: number | null;
  acceleration_0_60: number | null;
  top_speed: number | null;
  power: number | null;
  battery_capacity: number | null;
  battery_max_charging_speed: number | null;
  number_of_full_adult_seats: number | null;
  drive_type: string | null;
  vehicle_class: string | null;
  average_rating: number | null;
  make_model_slug: string;
}

const useModel = (slug: string | undefined) =>
  useQuery({
    queryKey: ["model-details", slug],
    enabled: !!slug,
    queryFn: async ({ signal }) => {
      const res = await apiClient.get(`/cars/model-details/${slug}`, { signal });
      return res.data.representative_model as RepModel;
    },
  });

interface SpecRow {
  label: string;
  key: keyof RepModel;
  better: "high" | "low" | "none";
  fmt?: (v: unknown) => string;
}

const LEGACY_ROWS: SpecRow[] = [
  { label: "Starting price", key: "current_price", better: "low", fmt: (v) => formatPrice(v as number) },
  { label: "EPA range", key: "epa_range", better: "high", fmt: (v) => (v ? `${v} mi` : "—") },
  { label: "0–60 mph", key: "acceleration_0_60", better: "low", fmt: (v) => (v ? `${v} s` : "—") },
  { label: "Top speed", key: "top_speed", better: "high", fmt: (v) => (v ? `${v} mph` : "—") },
  { label: "Power", key: "power", better: "high", fmt: (v) => (v ? `${v} hp` : "—") },
  { label: "Battery", key: "battery_capacity", better: "high", fmt: (v) => (v ? `${v} kWh` : "—") },
  { label: "Max DC charging", key: "battery_max_charging_speed", better: "high", fmt: (v) => (v ? `${v} kW` : "—") },
  { label: "Seats", key: "number_of_full_adult_seats", better: "high", fmt: (v) => (v ? `${v}` : "—") },
  { label: "Drive", key: "drive_type", better: "none", fmt: (v) => (v ? `${v}` : "—") },
  { label: "Review score", key: "average_rating", better: "high", fmt: (v) => (v ? `${v}/10` : "—") },
];

function LegacyComparePage({ pair, slugA, slugB }: { pair: string; slugA: string; slugB: string }) {
  const a = useModel(slugA);
  const b = useModel(slugB);

  const headerBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const winBg = useColorModeValue("green.50", "rgba(34,197,94,0.15)");
  const subText = useColorModeValue("gray.600", "gray.400");

  if (a.isLoading || b.isLoading) return <Spinning />;
  if (!a.data || !b.data) return <NotFoundPage />;

  const A = a.data;
  const B = b.data;
  const nameA = `${A.make_name} ${A.model}`;
  const nameB = `${B.make_name} ${B.model}`;

  const winnerOf = (row: SpecRow): 0 | 1 | -1 => {
    if (row.better === "none") return -1;
    const va = A[row.key] as number | null;
    const vb = B[row.key] as number | null;
    if (!va || !vb || va === vb) return -1;
    if (row.better === "high") return va > vb ? 0 : 1;
    return va < vb ? 0 : 1;
  };

  return (
    <Box>
      <NavBar />
      <Container maxW="4xl" py={8}>
        <Heading as="h1" size="lg" textAlign="center" mb={1}>
          {nameA} vs {nameB}
        </Heading>
        <Text textAlign="center" color={subText} mb={8}>
          Side-by-side specs from our live EV database — the better value in
          each row is highlighted.
        </Text>

        <Table
          size="sm"
          bg={headerBg}
          backdropFilter="blur(16px)"
          borderRadius="xl"
          overflow="hidden"
          sx={{ tableLayout: "fixed" }}
        >
          <Thead>
            <Tr>
              <Th w="28%"></Th>
              {[A, B].map((m, i) => (
                <Th key={i} textAlign="center" py={4}>
                  <RouterLink to={`/model_detail/${m.make_model_slug}`}>
                    <Image
                      src={m.image_url}
                      alt={`${m.make_name} ${m.model}`}
                      height="90px"
                      mx="auto"
                      objectFit="contain"
                      mb={2}
                    />
                    <Text fontSize="sm" textTransform="none" color="green.500">
                      {m.make_name} {m.model}
                    </Text>
                  </RouterLink>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {LEGACY_ROWS.map((row) => {
              const w = winnerOf(row);
              return (
                <Tr key={row.label}>
                  <Td fontWeight="600" fontSize="xs">
                    {row.label}
                  </Td>
                  {[A, B].map((m, i) => (
                    <Td
                      key={i}
                      textAlign="center"
                      bg={w === i ? winBg : undefined}
                      fontWeight={w === i ? "700" : "400"}
                    >
                      <HStack justify="center" spacing={1}>
                        <Text fontSize="sm">
                          {row.fmt ? row.fmt(m[row.key]) : String(m[row.key] ?? "—")}
                        </Text>
                        {w === i && <Icon as={FaCheckCircle} color="green.500" boxSize={3} />}
                      </HStack>
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        <HStack justify="center" mt={8} spacing={4}>
          <Button as={RouterLink} to={`/model_detail/${A.make_model_slug}`} size="sm" variant="outline" colorScheme="green" borderRadius="full">
            {nameA} details
          </Button>
          <Button as={RouterLink} to={`/model_detail/${B.make_model_slug}`} size="sm" variant="outline" colorScheme="green" borderRadius="full">
            {nameB} details
          </Button>
        </HStack>

        <MoreComparisons current={pair} />
      </Container>
    </Box>
  );
}
