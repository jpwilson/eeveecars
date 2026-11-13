import { Box, Heading, Link, SimpleGrid, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CatalogPage from "../components/catalog/CatalogPage";
import GlassCard from "../components/catalog/GlassCard";
import CatalogError from "../components/catalog/CatalogError";
import { CatalogLoading } from "../components/catalog/PageStates";
import { errorStatus, useCatalogLists } from "../hooks/useCatalog";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { CatalogListSummary } from "../types/catalog";
import { BEST_PAGES } from "../data/seoPages";

/** Market groups in display order; `null` = lists that span markets. */
const GROUPS: { market: string | null; title: string }[] = [
  { market: "US", title: "United States" },
  { market: "UK", title: "United Kingdom" },
  { market: "EU", title: "Europe" },
  { market: "CN", title: "China" },
  { market: null, title: "Across markets" },
];

interface Entry {
  key: string;
  path: string;
  title: string;
  blurb: string | null;
}

function Group({ title, entries }: { title: string; entries: Entry[] }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  if (!entries.length) return null;
  return (
    <GlassCard as="section">
      <Heading as="h2" size="md" mb={3}>
        {title}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={3}>
        {entries.map((e) => (
          <Box key={e.key} minW={0}>
            <Link as={RouterLink} to={e.path} color="green.600" fontWeight="700">
              {e.title}
            </Link>
            {e.blurb && (
              <Text fontSize="sm" color={sub} noOfLines={3}>
                {e.blurb}
              </Text>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </GlassCard>
  );
}

const toEntry = (l: CatalogListSummary): Entry => ({ key: l.key, path: l.path, title: l.title ?? l.key, blurb: l.blurb });

/**
 * /best — every indexable list, grouped by market. Lists the backend gates as not
 * indexable (near-duplicates, too few cars) are left out. 503 → the 7 original US lists.
 */
export default function BestIndexPage() {
  const { data, error, isLoading } = useCatalogLists();
  const sub = useColorModeValue("gray.600", "gray.400");
  useDocumentTitle("Electric Car Rankings by Market | EV Lineup");

  if (isLoading) return <CatalogLoading />;
  const s = errorStatus(error);
  const fallback = !!error && (s === 503 || s === 0);
  if (error && !fallback) return <CatalogError error={error} />;

  const lists = (data?.lists ?? []).filter((l) => l.indexable);
  const groups = fallback
    ? [
        {
          title: "United States",
          entries: Object.entries(BEST_PAGES).map(([key, c]) => ({ key, path: `/best/${key}`, title: c.title, blurb: null })),
        },
      ]
    : GROUPS.map((g) => ({ title: g.title, entries: lists.filter((l) => (l.market ?? null) === g.market).map(toEntry) }));

  return (
    <CatalogPage maxW="1000px" crumbs={[{ label: "Home", to: "/" }, { label: "Rankings" }]}>
      <VStack align="stretch" spacing={5}>
        <GlassCard>
          <Heading as="h1" size="lg" letterSpacing="-0.01em">
            Electric car rankings
          </Heading>
          <Text mt={3} lineHeight="1.7">
            Lists generated from the EV Lineup database, one market each: prices in that market's currency, ranges on its
            main test cycle (EPA in the US, WLTP in the UK and Europe, CLTC in China). Nothing is converted, and each list
            says how it is ranked and which cars it leaves out.
          </Text>
          {!fallback && (
            <Text mt={2} fontSize="sm" color={sub}>
              {lists.length} lists. Each car's figures come from the trims of its current version on sale in that market.
            </Text>
          )}
        </GlassCard>
        {groups.map((g) => (
          <Group key={g.title} title={g.title} entries={g.entries} />
        ))}
        <Text fontSize="sm" px={1}>
          <Link as={RouterLink} to="/compare" color="green.600">
            Compare two cars side by side →
          </Link>
        </Text>
      </VStack>
    </CatalogPage>
  );
}
