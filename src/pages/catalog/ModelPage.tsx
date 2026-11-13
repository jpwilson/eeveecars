import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Tag,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import CatalogPage from "../../components/catalog/CatalogPage";
import CatalogImage from "../../components/catalog/CatalogImage";
import GlassCard from "../../components/catalog/GlassCard";
import StatusBadge, { BrandStatusBadge } from "../../components/catalog/StatusBadge";
import VariantsTable from "../../components/catalog/VariantsTable";
import SourcesList from "../../components/catalog/SourcesList";
import BuyBlock from "../../components/catalog/BuyBlock";
import AlternativesCard from "../../components/catalog/AlternativesCard";
import CatalogError from "../../components/catalog/CatalogError";
import { CatalogLoading } from "../../components/catalog/PageStates";
import { HeadlineFigures, MarketPicker, defaultMarket, marketsOf, useGenerationSpans } from "../../components/catalog/GenerationBits";
import { DefunctBanner } from "./MakePage";
import { isNotFound, useCatalogModel, useCatalogResolve } from "../../hooks/useCatalog";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { CatalogGeneration, CatalogModelResponse, ModelChangeLink } from "../../types/catalog";
import {
  bodyStyleLabel,
  formatDate,
  formatGenYears,
  formatYears,
  marketLabel,
  modelDisplayName,
  sortMarkets,
  STATUS_LABELS,
} from "../../utils/catalogFormat";

export function generationTitle(gen: Pick<CatalogGeneration, "name" | "start_year" | "end_year" | "status">) {
  const years = formatGenYears(gen.start_year, gen.end_year, gen.status);
  return [gen.name, years ? `(${years})` : null].filter(Boolean).join(" ");
}

export function KindBadge({ kind }: { kind: string | null | undefined }) {
  if (kind !== "refresh") return null;
  return (
    <Badge variant="outline" colorScheme="purple" borderRadius="6px" textTransform="none">
      Refresh
    </Badge>
  );
}

/** The indexable "what changed" pair whose newer side is `genSlug` (the change into that version). */
export function changeInto(data: Pick<CatalogModelResponse, "changes">, genSlug: string | null | undefined) {
  return (data.changes ?? []).find((c) => c.indexable && c.newer.slug === genSlug) ?? null;
}

/** The indexable pair whose older side is `genSlug` (what changed in the next version). */
export function changeFrom(data: Pick<CatalogModelResponse, "changes">, genSlug: string | null | undefined) {
  return (data.changes ?? []).find((c) => c.indexable && c.older.slug === genSlug) ?? null;
}

/** "What changed from the Original →" (links only to pairs the API marks indexable). */
export function ChangeLink({ change, label }: { change: ModelChangeLink | null; label?: string }) {
  if (!change) return null;
  return (
    <Link as={RouterLink} to={change.path} fontSize="sm" color="green.600">
      {label ?? `What changed from the ${change.older.name ?? change.older.slug}`} →
    </Link>
  );
}

/** Variants table of one generation with a market picker. */
export function GenerationVariants({ gen, preferredMarket }: { gen: CatalogGeneration; preferredMarket?: string | null }) {
  const markets = marketsOf(gen.variants);
  const [market, setMarket] = useState<string | null>(() => defaultMarket(markets, preferredMarket));
  return (
    <VStack align="stretch" spacing={2}>
      <MarketPicker markets={markets} value={market} onChange={setMarket} />
      <VariantsTable variants={gen.variants ?? []} market={market} />
    </VStack>
  );
}

function EarlierGeneration({ gen, modelName, change }: { gen: CatalogGeneration; modelName: string; change: ModelChangeLink | null }) {
  const { isOpen, onToggle } = useDisclosure();
  const spans = useGenerationSpans(gen);
  const sub = useColorModeValue("gray.600", "gray.400");
  const image = gen.images?.find((i) => i.is_primary) ?? gen.images?.[0] ?? null;
  const count = gen.variants?.length ?? 0;
  return (
    <GlassCard p={{ base: 3, md: 4 }}>
      <Grid templateColumns={{ base: "1fr", sm: "200px 1fr" }} gap={4}>
        <CatalogImage
          image={image}
          ratio={4 / 3}
          borderRadius="10px"
          fallbackAlt={`${modelName} ${gen.name ?? ""}`}
          placeholder="No photo of this version yet"
        />
        <Box minW={0}>
          <HStack spacing={2} flexWrap="wrap">
            <Heading as="h3" size="sm">
              <Link as={RouterLink} to={gen.path} _hover={{ color: "green.500" }}>
                {generationTitle(gen)}
              </Link>
            </Heading>
            <StatusBadge status={gen.status} />
            <KindBadge kind={gen.kind} />
          </HStack>
          {gen.description && (
            <Text fontSize="sm" color={sub} mt={1}>
              {gen.description}
            </Text>
          )}
          {spans.length > 0 && (
            <Text fontSize="xs" color={sub} mt={2}>
              {spans.join(" · ")}
            </Text>
          )}
          <HStack mt={2} spacing={3} flexWrap="wrap">
            {count > 0 && (
              <Button size="xs" variant="outline" colorScheme="green" onClick={onToggle} aria-expanded={isOpen}>
                {isOpen ? "Hide" : "Show"} {count} variant{count === 1 ? "" : "s"}
              </Button>
            )}
            <Link as={RouterLink} to={gen.path} fontSize="xs" color="green.600">
              Full details →
            </Link>
            {change && (
              <Link as={RouterLink} to={change.path} fontSize="xs" color="green.600">
                What changed from the {change.older.name ?? change.older.slug} →
              </Link>
            )}
          </HStack>
        </Box>
      </Grid>
      <Collapse in={isOpen} animateOpacity unmountOnExit>
        <Box mt={3}>
          <GenerationVariants gen={gen} />
        </Box>
      </Collapse>
    </GlassCard>
  );
}

/**
 * Model header: hero photo of `gen`, name, status, years, headline figures.
 * With `generationMode` (generation pages) it shows that generation's status,
 * years and description instead of the model's, and no model-wide figures.
 */
export function ModelHeader({
  data,
  gen,
  h1,
  generationMode = false,
}: {
  data: CatalogModelResponse;
  gen: CatalogGeneration | null;
  h1?: string;
  generationMode?: boolean;
}) {
  const { make, model } = data;
  const sub = useColorModeValue("gray.600", "gray.400");
  const title = h1 ?? modelDisplayName(make.name, model.name);
  const image = gen?.images?.find((i) => i.is_primary) ?? gen?.images?.[0] ?? null;
  const status = generationMode && gen ? gen.status : model.status;
  const years =
    generationMode && gen ? formatGenYears(gen.start_year, gen.end_year, gen.status) : formatYears(model.years, model.status);
  const description = generationMode ? gen?.description : model.description;
  return (
    <GlassCard>
      <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1.2fr) minmax(0, 1fr)" }} gap={{ base: 4, md: 6 }}>
        <CatalogImage
          image={image}
          fit="contain"
          eager
          showCredit
          borderRadius="12px"
          fallbackAlt={title}
          placeholder="No photo of this version yet"
        />
        <VStack align="stretch" spacing={3} minW={0}>
          <Box>
            <Heading as="h1" size="lg" letterSpacing="-0.01em">
              {title}
            </Heading>
            <HStack spacing={2} mt={2} flexWrap="wrap">
              <StatusBadge status={status} />
              {generationMode && <KindBadge kind={gen?.kind} />}
              <BrandStatusBadge status={make.status} />
              {years && (
                <Text fontSize="sm" color={sub}>
                  {years}
                </Text>
              )}
              {model.body_style && (
                <Tag size="sm" borderRadius="6px">
                  {bodyStyleLabel(model.body_style)}
                </Tag>
              )}
              {model.is_commercial && (
                <Tag size="sm" borderRadius="6px" colorScheme="orange">
                  Commercial
                </Tag>
              )}
            </HStack>
            {model.aliases && model.aliases.length > 0 && (
              <Text fontSize="xs" color={sub} mt={1}>
                Also known as {model.aliases.join(", ")}
              </Text>
            )}
          </Box>
          {!generationMode && <HeadlineFigures headline={data.headline} />}
          {description && (
            <Text fontSize="sm" lineHeight="1.7">
              {description}
            </Text>
          )}
          {generationMode && gen && (gen.code_name || gen.platform) && (
            <Text fontSize="xs" color={sub}>
              {[gen.code_name ? `Code name ${gen.code_name}` : null, gen.platform ? `Platform ${gen.platform}` : null]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
          {!generationMode && model.markets && model.markets.length > 0 && (
            <Wrap spacing={1.5}>
              {sortMarkets(model.markets.map((m) => m.market)).map((code) => {
                const m = model.markets!.find((x) => x.market === code)!;
                return (
                  <WrapItem key={code}>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={m.status === "current" ? "solid" : "subtle"}
                      colorScheme={m.status === "current" ? "green" : "gray"}
                      title={`${marketLabel(code)}: ${m.status ? STATUS_LABELS[m.status] : "unknown"}${m.local_name ? ` (sold as ${m.local_name})` : ""}`}
                    >
                      {code}
                      {m.status && m.status !== "current" ? ` · ${STATUS_LABELS[m.status].toLowerCase()}` : ""}
                    </Tag>
                  </WrapItem>
                );
              })}
            </Wrap>
          )}
          {/* On the model page the buy block carries the official link. */}
          {generationMode && model.official_url && (
            <Link href={model.official_url} isExternal rel="noopener noreferrer" fontSize="sm" color="green.600">
              Official {make.name} page →
            </Link>
          )}
        </VStack>
      </Grid>
    </GlassCard>
  );
}

export function ModelFooter({ data }: { data: CatalogModelResponse }) {
  const sources = [
    ...(data.model.sources ?? []),
    ...data.generations.flatMap((g) => [...(g.sources ?? []), ...(g.variants ?? []).flatMap((v) => v.sources ?? [])]),
  ];
  return (
    <GlassCard>
      <SourcesList sources={sources} updatedAt={formatDate(data.updated_at)} />
    </GlassCard>
  );
}

function Related({ data }: { data: CatalogModelResponse }) {
  const rel = data.relations ?? [];
  const label: Record<string, string> = {
    twin: "Twin (same car, other brand)",
    successor: "Replaced by",
    predecessor: "Replaces",
  };
  return (
    <GlassCard>
      <Heading as="h2" size="sm" mb={3}>
        Related
      </Heading>
      <VStack align="stretch" spacing={1.5} fontSize="sm">
        {rel.map((r) => (
          <HStack key={`${r.relation}-${r.model.path}`} spacing={2} flexWrap="wrap">
            <Text color="gray.500">{label[r.relation] ?? r.relation}:</Text>
            <Link as={RouterLink} to={r.model.path} color="green.600" fontWeight="600">
              {modelDisplayName(r.model.make?.name, r.model.name)}
            </Link>
            <StatusBadge status={r.model.status} fontSize="10px" />
          </HStack>
        ))}
        <Link as={RouterLink} to={data.make.path} color="green.600">
          All {data.make.name} models →
        </Link>
      </VStack>
    </GlassCard>
  );
}

/** Old model slugs (e.g. /make/polestar/polestar-two) → canonical path. */
function ModelAliasRedirect({ slug, error }: { slug: string; error: unknown }) {
  const { data, isLoading, error: e2 } = useCatalogResolve("model", slug);
  if (isLoading) return <CatalogLoading />;
  if (data?.path && data.path !== window.location.pathname) return <Navigate to={data.path} replace />;
  return <CatalogError error={e2 ?? error} />;
}

/** /make/:make/:model (design 6.1). */
export default function ModelPage() {
  const { make: makeSlug, model: modelSlug } = useParams<{ make: string; model: string }>();
  const { data, error, isLoading } = useCatalogModel(makeSlug, modelSlug);
  const sub = useColorModeValue("gray.600", "gray.400");
  const title = data ? modelDisplayName(data.make.name, data.model.name) : null;
  useDocumentTitle(title ? `${title}: specs, range, price and every version | EV Lineup` : null);

  if (isLoading) return <CatalogLoading />;
  if (error && isNotFound(error) && makeSlug && modelSlug)
    return (
      <ModelAliasRedirect
        slug={modelSlug.startsWith(`${makeSlug}-`) ? modelSlug : `${makeSlug}-${modelSlug}`}
        error={error}
      />
    );
  if (error || !data) return <CatalogError error={error} />;

  const gens = data.generations;
  const defIdx = Math.max(
    0,
    gens.findIndex((g) => g.slug === data.default_generation)
  );
  const def = gens[defIdx] ?? null;
  const newer = gens.slice(0, defIdx).filter((g) => g.status === "upcoming");
  const earlier = gens.slice(defIdx + 1);
  const name = title ?? "";

  return (
    <CatalogPage
      crumbs={[
        { label: "Makes", to: "/make" },
        { label: data.make.name ?? data.make.slug, to: data.make.path },
        { label: data.model.name ?? data.model.slug },
      ]}
    >
      <VStack align="stretch" spacing={6}>
        <ModelHeader data={data} gen={def} />
        <DefunctBanner make={data.make} />
        <BuyBlock
          page="model"
          displayName={name}
          model={data.model}
          make={data.make}
          trims={def?.variants ?? []}
          preferredMarket={data.headline?.market}
          preferredTrim={data.headline?.from_price?.variant?.slug}
        />

        {newer.map((g) => (
          <GlassCard key={g.path} borderColor="blue.200">
            <HStack spacing={2} flexWrap="wrap">
              <Text fontWeight="700">Next version:</Text>
              <Link as={RouterLink} to={g.path} color="green.600" fontWeight="600">
                {generationTitle(g)}
              </Link>
              <StatusBadge status={g.status} />
            </HStack>
            <ChangeLink change={changeInto(data, g.slug)} label={`What changed in the ${g.name ?? g.slug}`} />
            {g.description && (
              <Text fontSize="sm" color={sub} mt={1}>
                {g.description}
              </Text>
            )}
          </GlassCard>
        ))}

        {def && (
          <GlassCard as="section">
            <Flex justify="space-between" align="baseline" gap={2} flexWrap="wrap" mb={1}>
              <HStack spacing={2} flexWrap="wrap">
                <Heading as="h2" size="md">
                  {gens.length > 1 ? generationTitle(def) : "Variants"}
                </Heading>
                {gens.length > 1 && <StatusBadge status={def.status} />}
                <KindBadge kind={def.kind} />
              </HStack>
              {gens.length > 1 && (
                <Link as={RouterLink} to={def.path} fontSize="sm" color="green.600">
                  This version only →
                </Link>
              )}
            </Flex>
            {def.description && (
              <Text fontSize="sm" color={sub} mb={changeInto(data, def.slug) ? 1 : 3}>
                {def.description}
              </Text>
            )}
            {changeInto(data, def.slug) && (
              <Box mb={3}>
                <ChangeLink change={changeInto(data, def.slug)} />
              </Box>
            )}
            <GenerationVariants gen={def} preferredMarket={data.headline?.market} />
          </GlassCard>
        )}

        {/* Comparisons, similar cars in one market and the lists it is ranked in. */}
        <AlternativesCard make={data.make.slug} model={data.model.url_slug ?? modelSlug ?? ""} name={name} />

        {earlier.length > 0 && (
          <Box as="section">
            <Heading as="h2" size="md" mb={3}>
              Earlier versions
            </Heading>
            <SimpleGrid columns={1} spacing={3}>
              {earlier.map((g) => (
                <EarlierGeneration key={g.path} gen={g} modelName={name} change={changeInto(data, g.slug)} />
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Related data={data} />
        <ModelFooter data={data} />
      </VStack>
    </CatalogPage>
  );
}
