import {
  Badge,
  Box,
  Button,
  Collapse,
  Heading,
  HStack,
  Link,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import CatalogPage from "../../components/catalog/CatalogPage";
import CatalogImage from "../../components/catalog/CatalogImage";
import GlassCard from "../../components/catalog/GlassCard";
import StatusBadge from "../../components/catalog/StatusBadge";
import SourcesList from "../../components/catalog/SourcesList";
import CatalogError from "../../components/catalog/CatalogError";
import ChangesTable from "../../components/catalog/ChangesTable";
import { MarketPicker } from "../../components/catalog/GenerationBits";
import { CatalogLoading } from "../../components/catalog/PageStates";
import NotFoundPage from "../NotFoundPage";
import { errorStatus, useCatalogChanges, useCatalogModel } from "../../hooks/useCatalog";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { CatalogChangesResponse, ChangeGeneration, ChangeTrimRef } from "../../types/catalog";
import { formatDate, modelDisplayName } from "../../utils/catalogFormat";

/** The default generation is shown on the model page, so link there instead of its own page. */
const versionPath = (gen: ChangeGeneration, modelPath: string) => (gen.is_default ? modelPath : gen.path);

const genLabel = (g: ChangeGeneration) => g.name ?? g.slug;

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

function VersionPhoto({ gen, modelName, modelPath }: { gen: ChangeGeneration; modelName: string; modelPath: string }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const image = gen.images?.find((i) => i.is_primary) ?? gen.images?.[0] ?? null;
  return (
    <Box minW={0}>
      <CatalogImage
        image={image}
        ratio={4 / 3}
        borderRadius="12px"
        showCredit
        fallbackAlt={`${modelName} ${genLabel(gen)}`}
        placeholder="No photo of this version yet"
        sizes="(max-width: 768px) 50vw, 560px"
      />
      <HStack spacing={2} mt={2} flexWrap="wrap">
        <Link as={RouterLink} to={versionPath(gen, modelPath)} fontWeight="700" color="green.600">
          {genLabel(gen)}
        </Link>
        <StatusBadge status={gen.status} fontSize="10px" />
      </HStack>
      {gen.years_text && (
        <Text fontSize="xs" color={sub}>
          {gen.years_text}
        </Text>
      )}
    </Box>
  );
}

function TrimLink({ t }: { t: ChangeTrimRef }) {
  return t.path ? (
    <Link as={RouterLink} to={t.path} color="green.600">
      {t.name ?? t.slug}
    </Link>
  ) : (
    <>{t.name ?? t.slug}</>
  );
}

const MATCH_LABEL: Record<string, string> = { slug: "same trim", name: "same name", alias: "renamed (alias in the name)" };

function MatchedTrim({
  m,
  olderName,
  newerName,
}: {
  m: NonNullable<NonNullable<CatalogChangesResponse["trims"]>["matched"]>[number];
  olderName: string;
  newerName: string;
}) {
  const { isOpen, onToggle } = useDisclosure();
  const sub = useColorModeValue("gray.500", "gray.400");
  const rows = (m.rows ?? []).filter((r) => r.older || r.newer);
  return (
    <Box>
      <Text fontSize="sm">
        <TrimLink t={m.older} /> → <TrimLink t={m.newer} />
        {m.match && (
          <Text as="span" fontSize="xs" color={sub}>
            {" "}
            ({MATCH_LABEL[m.match] ?? m.match})
          </Text>
        )}
        {rows.length > 0 && (
          <Button size="xs" variant="link" colorScheme="green" ml={2} onClick={onToggle} aria-expanded={isOpen}>
            {isOpen ? "Hide figures" : "Show figures"}
          </Button>
        )}
      </Text>
      <Collapse in={isOpen} animateOpacity unmountOnExit>
        <Box mt={2} mb={1}>
          <ChangesTable rows={rows} olderName={olderName} newerName={newerName} compact />
        </Box>
      </Collapse>
    </Box>
  );
}

/** /make/:make/:model/changes/:older-vs-:newer */
export default function GenerationChangesPage() {
  const { make: makeSlug, model: modelSlug, pair } = useParams<{ make: string; model: string; pair: string }>();
  const location = useLocation();
  const [search, setSearch] = useSearchParams();
  const parts = (pair ?? "").split("-vs-");
  const valid = parts.length === 2 && !!parts[0] && !!parts[1];
  const market = search.get("market");
  const { data, error, isLoading, isFetching } = useCatalogChanges(
    makeSlug,
    modelSlug,
    valid ? parts[0] : undefined,
    valid ? parts[1] : undefined,
    market
  );
  const tree = useCatalogModel(makeSlug, modelSlug);
  const sub = useColorModeValue("gray.600", "gray.400");
  const modelName = data ? modelDisplayName(data.make.name, data.model.name) : "";
  useDocumentTitle(
    data ? `${modelName} ${genLabel(data.newer)} vs ${genLabel(data.older)}: What Changed | EV Lineup` : null
  );

  if (!valid) return <NotFoundPage />;
  if (isLoading) return <CatalogLoading />;
  // An unknown market for this pair (400): drop it and show the default market.
  if (error && errorStatus(error) === 400 && market) return <Navigate to={location.pathname} replace />;
  if (error || !data) return <CatalogError error={error} />;
  // Reversed order (or any non-canonical form) → the canonical older-first URL.
  if (data.path !== location.pathname) return <Navigate to={`${data.path}${location.search}`} replace />;

  const { older, newer } = data;
  const olderName = genLabel(older);
  const newerName = genLabel(newer);
  const rows = (data.rows ?? []).filter((r) => r.older || r.newer);
  const matched = data.trims?.matched ?? [];
  const onlyOlder = data.trims?.only_older ?? [];
  const onlyNewer = data.trims?.only_newer ?? [];
  const faq = data.faq ?? [];
  const showFaq = faq.length > 0 && !faqInPrerenderTail(data.path);
  const otherPairs = (tree.data?.changes ?? []).filter((c) => c.indexable && c.path !== data.path);
  const markets = data.markets ?? [];

  return (
    <CatalogPage
      crumbs={[
        { label: "Makes", to: "/make" },
        { label: data.make.name ?? data.make.slug, to: data.make.path },
        { label: data.model.name ?? data.model.slug, to: data.model.path },
        { label: `${newerName} vs ${olderName}` },
      ]}
    >
      <VStack align="stretch" spacing={6}>
        <GlassCard>
          <Heading as="h1" size="lg" letterSpacing="-0.01em">
            {modelName}: {newerName} vs {olderName}, what changed
          </Heading>
          <HStack spacing={2} mt={2} flexWrap="wrap">
            {data.relation && (
              <Badge variant="outline" colorScheme="purple" borderRadius="6px" textTransform="none">
                {data.relation === "refresh" ? "Refresh" : "New generation"}
              </Badge>
            )}
          </HStack>
          <VStack align="stretch" spacing={2} mt={3}>
            {(data.summary ?? []).map((s, i) => (
              <Text key={i} fontSize={i === 0 ? "md" : "sm"} lineHeight="1.7">
                {s}
              </Text>
            ))}
          </VStack>
          <SimpleGrid columns={2} spacing={{ base: 3, md: 5 }} mt={5}>
            <VersionPhoto gen={older} modelName={modelName} modelPath={data.model.path} />
            <VersionPhoto gen={newer} modelName={modelName} modelPath={data.model.path} />
          </SimpleGrid>
        </GlassCard>

        {rows.length > 0 && (
          <GlassCard as="section">
            <HStack justify="space-between" align="baseline" flexWrap="wrap" gap={2} mb={3}>
              <Heading as="h2" size="md">
                What changed
              </Heading>
              <Box opacity={isFetching ? 0.6 : 1}>
                <MarketPicker
                  markets={markets}
                  value={data.market}
                  onChange={(m) => setSearch(m === data.quality?.default_market ? {} : { market: m }, { replace: true })}
                />
              </Box>
            </HStack>
            <Box opacity={isFetching ? 0.6 : 1} transition="opacity 0.15s">
              <ChangesTable rows={rows} olderName={olderName} newerName={newerName} />
            </Box>
            <Text fontSize="xs" color={sub} mt={2}>
              Each figure is the highest (or lowest) on file across the version's trims, with the trim and model year it
              comes from. Prices, ranges and batteries are compared only on the same market, currency, price basis, test
              cycle and battery basis; nothing is converted.
              {(data.notes ?? []).length ? ` ${(data.notes ?? []).join(" ")}` : ""}
            </Text>
          </GlassCard>
        )}

        {(matched.length > 0 || onlyOlder.length > 0 || onlyNewer.length > 0) && (
          <GlassCard as="section">
            <Heading as="h2" size="md" mb={3}>
              Trims
            </Heading>
            <VStack align="stretch" spacing={2}>
              {matched.length > 0 && (
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                  In both versions
                </Text>
              )}
              {matched.map((m) => (
                <MatchedTrim key={`${m.older.slug}-${m.newer.slug}`} m={m} olderName={olderName} newerName={newerName} />
              ))}
              {onlyOlder.length > 0 && (
                <Text fontSize="sm" pt={matched.length ? 2 : 0}>
                  <Text as="span" fontWeight="700">
                    Only in the {olderName}:
                  </Text>{" "}
                  {onlyOlder.map((t, i) => (
                    <span key={t.slug}>
                      {i > 0 && ", "}
                      <TrimLink t={t} />
                    </span>
                  ))}
                </Text>
              )}
              {onlyNewer.length > 0 && (
                <Text fontSize="sm">
                  <Text as="span" fontWeight="700">
                    Only in the {newerName}:
                  </Text>{" "}
                  {onlyNewer.map((t, i) => (
                    <span key={t.slug}>
                      {i > 0 && ", "}
                      <TrimLink t={t} />
                    </span>
                  ))}
                </Text>
              )}
              {(onlyOlder.length > 0 || onlyNewer.length > 0) && (
                <Text fontSize="xs" color={sub}>
                  A trim listed in only one version may have been renamed rather than dropped or added.
                </Text>
              )}
            </VStack>
          </GlassCard>
        )}

        {(older.description || newer.description) && (
          <GlassCard as="section">
            <Heading as="h2" size="md" mb={3}>
              About each version
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {[older, newer].map((g) => (
                <Box key={g.slug}>
                  <Heading as="h3" size="sm" mb={1}>
                    {genLabel(g)}
                    {g.years_text ? (
                      <Text as="span" fontWeight="400" color={sub} fontSize="sm">
                        {" "}
                        ({g.years_text})
                      </Text>
                    ) : null}
                  </Heading>
                  <Text fontSize="sm" lineHeight="1.7">
                    {g.description ?? "No description on file yet."}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
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

        <GlassCard as="nav" aria-label="Related pages">
          <Heading as="h2" size="sm" mb={2}>
            More on the {modelName}
          </Heading>
          <UnorderedList spacing={1} fontSize="sm" ml={5}>
            {[older, newer].map((g) => (
              <ListItem key={g.slug}>
                <Link as={RouterLink} to={versionPath(g, data.model.path)} color="green.600">
                  {modelName} {genLabel(g)}
                  {g.years_text ? ` (${g.years_text})` : ""}
                </Link>
              </ListItem>
            ))}
            {!older.is_default && !newer.is_default && (
              <ListItem>
                <Link as={RouterLink} to={data.model.path} color="green.600">
                  {modelName}: every version
                </Link>
              </ListItem>
            )}
          </UnorderedList>
          {otherPairs.length > 0 && (
            <>
              <Text fontSize="sm" fontWeight="700" mt={3} mb={1}>
                Other version changes
              </Text>
              <Wrap spacing={2}>
                {otherPairs.map((c) => (
                  <WrapItem key={c.path}>
                    <Link as={RouterLink} to={c.path} color="green.600" fontSize="sm">
                      {c.newer.name ?? c.newer.slug} vs {c.older.name ?? c.older.slug}
                    </Link>
                  </WrapItem>
                ))}
              </Wrap>
            </>
          )}
        </GlassCard>

        <GlassCard>
          <SourcesList sources={data.sources ?? []} updatedAt={formatDate(data.updated_at)} />
        </GlassCard>
      </VStack>
    </CatalogPage>
  );
}
