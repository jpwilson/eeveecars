import {
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
import { Link as RouterLink, Navigate, useLocation, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import NotFoundPage from "./NotFoundPage";
import CatalogImage from "../components/catalog/CatalogImage";
import CatalogError from "../components/catalog/CatalogError";
import StatusBadge from "../components/catalog/StatusBadge";
import apiClient from "../services/api-client";
import { errorStatus, useCatalogModelBySlug } from "../hooks/useCatalog";
import { CatalogGeneration, CatalogModelResponse, CatalogVariant } from "../types/catalog";
import { formatPrice } from "../utils/formatPrice";
import { formatGenYears, formatMoney, formatRange, marketLabel, modelDisplayName, num } from "../utils/catalogFormat";
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

export default function ComparePage() {
  const { pair } = useParams<{ pair: string }>();
  const { search, hash } = useLocation();
  const [slugA, slugB] = (pair ?? "").split("-vs-");
  const a = useCatalogModelBySlug(slugA || undefined);
  const b = useCatalogModelBySlug(slugB || undefined);

  if (!pair || !slugA || !slugB) return <NotFoundPage />;
  if (a.isLoading || b.isLoading) return <Spinning />;
  if (a.notFound || b.notFound) return <NotFoundPage />;
  if (a.data && b.data) {
    // Canonical pair: the two catalog model slugs in alphabetical order (legacy slugs map to current ones)
    const canonical = [a.data.model.slug, b.data.model.slug].sort().join("-vs-");
    if (canonical !== pair) return <Navigate to={`/compare/${canonical}${search}${hash}`} replace />;
    return <CatalogCompare pair={pair} A={a.data} B={b.data} />;
  }
  const error = a.error ?? b.error;
  // 503 (catalog not migrated yet) or no answer: the old comparison, so the page never breaks
  const s = errorStatus(error);
  if (s === 503 || s === 0) return <LegacyComparePage pair={pair} slugA={slugA} slugB={slugB} />;
  return <CatalogError error={error} />;
}

// ---------- catalog comparison ----------

interface Fig {
  text: string | null;
  /** number used to pick the better side */
  value: number | null;
  /** figures are only compared within one group (same currency / unit + cycle / battery basis) */
  group?: string;
  variant?: { name: string | null; path: string } | null;
}

interface Side {
  data: CatalogModelResponse;
  name: string;
  gen: CatalogGeneration | null;
  market: string | null;
  variants: CatalogVariant[];
}

/**
 * The current version (default generation) and the market its headline uses:
 * US where the version is sold there, else its main market (the backend's
 * headline picks it the same way).
 */
function sideOf(data: CatalogModelResponse): Side {
  const gen = data.generations.find((g) => g.is_default) ?? data.generations.find((g) => g.slug === data.default_generation) ?? data.generations[0] ?? null;
  const market = data.headline?.market ?? data.model.markets?.[0]?.market ?? null;
  const all = (gen?.variants ?? []).filter((v) => v.status !== "cancelled");
  const inMarket = market ? all.filter((v) => (v.offerings ?? []).some((o) => o.market === market)) : [];
  return {
    data,
    name: modelDisplayName(data.make?.name, data.model.name),
    gen,
    market,
    variants: inMarket.length ? inMarket : all,
  };
}

/** Highest value of a variant spec across the version's trims, naming the trim. */
function best(side: Side, pick: (v: CatalogVariant) => number | null, fmt: (n: number, v: CatalogVariant) => string, group?: (v: CatalogVariant) => string): Fig {
  let top: CatalogVariant | null = null;
  for (const v of side.variants) {
    const n = pick(v);
    if (n !== null && n !== undefined && (top === null || n > (pick(top) as number))) top = v;
  }
  if (!top) return { text: null, value: null };
  const n = pick(top) as number;
  return { text: fmt(n, top), value: n, group: group?.(top), variant: { name: top.name ?? top.slug, path: top.path } };
}

interface Row {
  label: string;
  better: "high" | "low" | "none";
  get: (s: Side) => Fig;
}

const ROWS: Row[] = [
  {
    label: "Starting price",
    better: "low",
    get: (s) => {
      const p = s.data.headline?.from_price;
      if (!p?.value) return { text: null, value: null };
      return {
        text: `${formatMoney(p.value, p.currency)}${p.is_estimate ? " (est.)" : ""}`,
        value: p.value,
        group: p.currency ?? "",
        variant: p.variant,
      };
    },
  },
  {
    label: "Range",
    better: "high",
    get: (s) => {
      const r = s.data.headline?.max_range;
      if (!r?.value) return { text: null, value: null };
      return {
        text: `${formatRange(r.value, r.unit, r.cycle)}${r.is_estimate ? " (est.)" : ""}`,
        value: r.value,
        group: `${r.unit}|${r.cycle}`,
        variant: r.variant,
      };
    },
  },
  {
    label: "0–60 mph",
    better: "low",
    get: (s) => {
      const q = s.data.headline?.quickest_0_60;
      return q?.value ? { text: `${num(q.value, 2)} s`, value: q.value, variant: q.variant } : { text: null, value: null };
    },
  },
  {
    label: "0–100 km/h",
    better: "low",
    get: (s) => {
      const q = s.data.headline?.quickest_0_100;
      return q?.value ? { text: `${num(q.value, 2)} s`, value: q.value, variant: q.variant } : { text: null, value: null };
    },
  },
  { label: "Top speed", better: "high", get: (s) => best(s, (v) => v.top_speed_mph, (n) => `${num(n)} mph`) },
  { label: "Power", better: "high", get: (s) => best(s, (v) => v.power_hp, (n) => `${num(n, 0)} hp`) },
  {
    label: "Battery",
    better: "high",
    get: (s) =>
      best(
        s,
        (v) => v.battery_kwh,
        (n, v) => `${num(n)} kWh${v.battery_basis ? ` (${v.battery_basis})` : ""}`,
        (v) => v.battery_basis ?? ""
      ),
  },
  { label: "Max DC charging", better: "high", get: (s) => best(s, (v) => v.dc_kw, (n) => `${num(n, 0)} kW`) },
  {
    label: "Seats",
    better: "none",
    get: (s) => {
      const seats = Array.from(new Set(s.variants.map((v) => v.seats).filter((n): n is number => !!n))).sort((x, y) => x - y);
      return { text: seats.length ? seats.join(" / ") : null, value: null };
    },
  },
  {
    label: "Drive",
    better: "none",
    get: (s) => {
      const drives = Array.from(new Set(s.variants.map((v) => v.drivetrain).filter((d): d is string => !!d)));
      return { text: drives.length ? drives.join(", ") : null, value: null };
    },
  },
];

function winner(row: Row, fa: Fig, fb: Fig): 0 | 1 | -1 {
  if (row.better === "none") return -1;
  if (!fa.value || !fb.value || fa.value === fb.value) return -1;
  if ((fa.group ?? "") !== (fb.group ?? "")) return -1; // different currency / cycle / basis: not comparable
  if (row.better === "high") return fa.value > fb.value ? 0 : 1;
  return fa.value < fb.value ? 0 : 1;
}

function CatalogCompare({ pair, A, B }: { pair: string; A: CatalogModelResponse; B: CatalogModelResponse }) {
  const headerBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const winBg = useColorModeValue("green.50", "rgba(34,197,94,0.15)");
  const subText = useColorModeValue("gray.600", "gray.400");

  const sides = [sideOf(A), sideOf(B)];
  const rows = ROWS.map((row) => ({ row, figs: sides.map((s) => row.get(s)) })).filter(
    ({ figs }) => figs[0].text || figs[1].text
  );
  const markets = Array.from(new Set(sides.map((s) => s.market).filter(Boolean)));

  return (
    <Box>
      <NavBar />
      <Container maxW="4xl" py={8} px={{ base: 2, sm: 4 }}>
        <Heading as="h1" size="lg" textAlign="center" mb={1} px={2}>
          {sides[0].name} vs {sides[1].name}
        </Heading>
        <Text textAlign="center" color={subText} mb={2} px={2}>
          Side-by-side specs from our live EV database — the better value in each row is highlighted.
        </Text>
        <Text textAlign="center" color={subText} fontSize="sm" mb={8} px={2}>
          {markets.length === 1 && markets[0] === "US"
            ? "US figures for the current version of each car."
            : `Figures for the current version of each car, in the US where it is sold there, else its main market — prices in different currencies and ranges on different test cycles are not compared.`}{" "}
          Each figure names the trim it comes from.
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
              <Th w={{ base: "24%", md: "28%" }} px={{ base: 2, md: 4 }}></Th>
              {sides.map((s, i) => {
                const years = s.gen ? formatGenYears(s.gen.start_year, s.gen.end_year, s.gen.status) : null;
                const status = s.data.model.status;
                const img = s.gen?.images?.find((im) => im.is_primary) ?? s.gen?.images?.[0] ?? null;
                return (
                  <Th key={i} textAlign="center" py={4} px={{ base: 2, md: 4 }} textTransform="none" letterSpacing="normal" verticalAlign="top">
                    <VStack spacing={1}>
                      <Box w="100%" maxW="220px" mx="auto">
                        <RouterLink to={s.data.model.path} aria-label={s.name}>
                          <CatalogImage
                            image={img}
                            ratio={16 / 9}
                            borderRadius="8px"
                            fallbackAlt={s.name}
                            sizes="(max-width: 480px) 40vw, 220px"
                          />
                        </RouterLink>
                        {img && (img.credit || img.license) && (
                          <Text fontSize="2xs" color={subText} fontWeight="400" mt={0.5} noOfLines={2}>
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
                      </Box>
                      <Link as={RouterLink} to={s.data.model.path} fontSize="sm" fontWeight="600" color="green.500">
                        {s.name}
                      </Link>
                      {s.gen && (
                        <Link as={RouterLink} to={s.gen.path} fontSize="xs" fontWeight="400" color={subText}>
                          {[s.gen.name, years].filter(Boolean).join(" · ")}
                        </Link>
                      )}
                      <HStack spacing={1} justify="center" flexWrap="wrap">
                        {status && status !== "current" && <StatusBadge status={status} fontSize="2xs" />}
                        {s.market && (
                          <Text fontSize="2xs" fontWeight="500" color={subText}>
                            {marketLabel(s.market)} figures
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map(({ row, figs }) => {
              const w = winner(row, figs[0], figs[1]);
              return (
                <Tr key={row.label}>
                  <Td fontWeight="600" fontSize="xs" px={{ base: 2, md: 4 }}>
                    {row.label}
                  </Td>
                  {figs.map((f, i) => (
                    <Td
                      key={i}
                      textAlign="center"
                      px={{ base: 1, md: 4 }}
                      bg={w === i ? winBg : undefined}
                      fontWeight={w === i ? "700" : "400"}
                    >
                      <HStack justify="center" spacing={1}>
                        <Text fontSize="sm">{f.text ?? "—"}</Text>
                        {w === i && <Icon as={FaCheckCircle} color="green.500" boxSize={3} flexShrink={0} />}
                      </HStack>
                      {f.text && f.variant && (
                        <Link
                          as={RouterLink}
                          to={f.variant.path}
                          display="block"
                          fontSize="2xs"
                          fontWeight="400"
                          color={subText}
                          noOfLines={2}
                        >
                          {f.variant.name}
                        </Link>
                      )}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        <Wrap justify="center" mt={8} spacing={4}>
          {sides.map((s) => (
            <WrapItem key={s.data.model.slug}>
              <Button as={RouterLink} to={s.data.model.path} size="sm" variant="outline" colorScheme="green" borderRadius="full">
                {s.name} details
              </Button>
            </WrapItem>
          ))}
        </Wrap>

        <Box px={2}>
          <MoreComparisons current={pair} />
        </Box>
      </Container>
    </Box>
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
