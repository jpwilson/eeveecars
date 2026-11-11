import { Box, Flex, Heading, Link, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import CatalogPage from "../../components/catalog/CatalogPage";
import GlassCard from "../../components/catalog/GlassCard";
import SourcesList from "../../components/catalog/SourcesList";
import CatalogError from "../../components/catalog/CatalogError";
import { CatalogLoading } from "../../components/catalog/PageStates";
import NotFoundPage from "../NotFoundPage";
import { DefunctBanner } from "./MakePage";
import { GenerationVariants, ModelHeader, generationTitle } from "./ModelPage";
import { useCatalogModel } from "../../hooks/useCatalog";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { CatalogGeneration } from "../../types/catalog";
import { formatDate, formatMoney, formatRange, marketLabel, modelDisplayName, priceBasisLabel, sortOfferings } from "../../utils/catalogFormat";

/** Every offering of a generation: market × model year × variant. */
function OfferingsTable({ gen }: { gen: CatalogGeneration }) {
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const headBg = useColorModeValue("rgba(22, 163, 74, 0.05)", "rgba(22, 163, 74, 0.1)");
  const sub = useColorModeValue("gray.500", "gray.400");
  const rows = (gen.variants ?? []).flatMap((v) => sortOfferings(v.offerings).map((o) => ({ v, o })));
  rows.sort((a, b) => {
    const m = (a.o.market ?? "").localeCompare(b.o.market ?? "");
    if (a.o.market !== b.o.market) {
      const order = ["US", "CA", "EU", "UK", "CN", "JP", "KR", "AU", "IN"];
      return order.indexOf(a.o.market ?? "") - order.indexOf(b.o.market ?? "") || m;
    }
    return (b.o.model_year ?? 0) - (a.o.model_year ?? 0);
  });
  if (!rows.length) return <Text fontSize="sm" color={sub}>No prices or ranges recorded for this version yet.</Text>;
  return (
    <Box overflowX="auto" border="1px solid" borderColor={border} borderRadius="12px">
      <Table size="sm" minW="680px">
        <Thead bg={headBg}>
          <Tr>
            <Th>Market</Th>
            <Th>Model year</Th>
            <Th>Variant</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Launch price</Th>
            <Th isNumeric>Range</Th>
            <Th>Connector</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map(({ v, o }, i) => (
            <Tr key={`${v.path}-${o.market}-${o.model_year}-${i}`}>
              <Td title={marketLabel(o.market) ?? undefined}>{o.market ?? "—"}</Td>
              <Td>{o.model_year ?? <Text as="span" color={sub}>current</Text>}</Td>
              <Td>
                <Link as={RouterLink} to={v.path} color="green.600">
                  {v.name ?? v.slug}
                </Link>
              </Td>
              <Td isNumeric whiteSpace="nowrap">
                {formatMoney(o.price, o.currency) ?? "—"}
                {o.price && o.price_basis && (
                  <Text fontSize="xs" color={sub}>
                    {priceBasisLabel(o.price_basis)}
                    {o.is_estimate ? ", estimate" : ""}
                  </Text>
                )}
              </Td>
              <Td isNumeric whiteSpace="nowrap">{formatMoney(o.launch_price, o.currency) ?? "—"}</Td>
              <Td isNumeric whiteSpace="nowrap">{formatRange(o.range, o.range_unit, o.range_cycle) ?? "—"}</Td>
              <Td>{o.connector ?? "—"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

/** /make/:make/:model/:generation */
export default function GenerationPage() {
  const { make: makeSlug, model: modelSlug, generation: genSlug } = useParams<{ make: string; model: string; generation: string }>();
  const { data, error, isLoading } = useCatalogModel(makeSlug, modelSlug);
  const sub = useColorModeValue("gray.600", "gray.400");
  const gens = data?.generations ?? [];
  const idx = gens.findIndex((g) => g.slug === genSlug);
  const gen = idx >= 0 ? gens[idx] : null;
  const modelName = data ? modelDisplayName(data.make.name, data.model.name) : "";
  useDocumentTitle(gen ? `${modelName} ${generationTitle(gen)}: specs and prices | EV Lineup` : null);

  if (isLoading) return <CatalogLoading />;
  if (error || !data) return <CatalogError error={error} />;

  if (!gen) {
    // A model year inside a generation (/make/tesla/model-3/2025) goes to the generation that contains it.
    const year = /^\d{4}$/.test(genSlug ?? "") ? Number(genSlug) : null;
    const containing =
      year !== null
        ? [...gens]
            .filter((g) => g.status !== "cancelled" && g.start_year && g.start_year <= year && (g.end_year ?? 9999) >= year)
            .sort((a, b) => (b.start_year ?? 0) - (a.start_year ?? 0))[0]
        : null;
    if (containing) return <Navigate to={containing.path} replace />;
    return <NotFoundPage />;
  }

  // gens are newest first
  const newer = idx > 0 ? gens[idx - 1] : null;
  const older = idx < gens.length - 1 ? gens[idx + 1] : null;
  const sources = [...(gen.sources ?? []), ...(gen.variants ?? []).flatMap((v) => v.sources ?? [])];

  return (
    <CatalogPage
      crumbs={[
        { label: "Makes", to: "/make" },
        { label: data.make.name ?? data.make.slug, to: data.make.path },
        { label: data.model.name ?? data.model.slug, to: data.model.path },
        { label: gen.name ?? gen.slug },
      ]}
    >
      <VStack align="stretch" spacing={6}>
        <ModelHeader data={data} gen={gen} h1={`${modelName} ${generationTitle(gen)}`} generationMode />
        <DefunctBanner make={data.make} />
        {gen.is_default && (
          <Text fontSize="sm" color={sub}>
            This is the version shown on the{" "}
            <Link as={RouterLink} to={data.model.path} color="green.600">
              {modelName} page
            </Link>
            .
          </Text>
        )}

        <GlassCard as="section">
          <Heading as="h2" size="md" mb={3}>
            Variants
          </Heading>
          <GenerationVariants gen={gen} preferredMarket={data.headline?.market} />
        </GlassCard>

        <GlassCard as="section">
          <Heading as="h2" size="md" mb={3}>
            Prices and ranges by market and model year
          </Heading>
          <OfferingsTable gen={gen} />
        </GlassCard>

        {(newer || older) && (
          <Flex justify="space-between" gap={4} flexWrap="wrap" fontSize="sm">
            {older ? (
              <Link as={RouterLink} to={older.path} color="green.600">
                ← Previous: {generationTitle(older)}
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link as={RouterLink} to={newer.path} color="green.600">
                Next: {generationTitle(newer)} →
              </Link>
            )}
          </Flex>
        )}

        <GlassCard>
          <SourcesList sources={sources} updatedAt={formatDate(gen.updated_at)} />
        </GlassCard>
      </VStack>
    </CatalogPage>
  );
}
