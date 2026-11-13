import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import CatalogPage from "../components/catalog/CatalogPage";
import GlassCard from "../components/catalog/GlassCard";
import CatalogError from "../components/catalog/CatalogError";
import { CatalogLoading } from "../components/catalog/PageStates";
import { errorStatus, useCatalogComparePairs } from "../hooks/useCatalog";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { ComparePairSummary } from "../types/catalog";
import { COMPARE_PAIRS } from "../data/seoPages";

interface Pair {
  path: string;
  name: string;
  source: string | null;
  makes: { slug: string; name: string }[];
}

const toPair = (p: ComparePairSummary): Pair => ({
  path: p.path,
  name: p.name ?? `${p.a.name} vs ${p.b.name}`,
  source: p.source,
  makes: [p.a.make, p.b.make]
    .filter((m, i, all) => all.findIndex((x) => x.slug === m.slug) === i)
    .map((m) => ({ slug: m.slug, name: m.name ?? m.slug })),
});

/** Accents and case ignored, so "skoda" finds "Škoda". */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function PairList({ pairs, columns = 2 }: { pairs: Pair[]; columns?: number }) {
  return (
    <SimpleGrid as={UnorderedList} columns={{ base: 1, md: columns }} spacingX={6} spacingY={1.5} ml={5} fontSize="sm">
      {pairs.map((p) => (
        <ListItem key={p.path}>
          <Link as={RouterLink} to={p.path} color="green.600">
            {p.name}
          </Link>
        </ListItem>
      ))}
    </SimpleGrid>
  );
}

function Section({ title, note, pairs }: { title: string; note?: string; pairs: Pair[] }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  if (!pairs.length) return null;
  return (
    <GlassCard as="section">
      <Heading as="h2" size="md" mb={note ? 1 : 3}>
        {title}
      </Heading>
      {note && (
        <Text fontSize="sm" color={sub} mb={3}>
          {note}
        </Text>
      )}
      <PairList pairs={pairs} />
    </GlassCard>
  );
}

/**
 * /compare — the comparisons the backend marks indexable, easy to scan: popular pairs,
 * twins, old and new, then every pair grouped by make (a pair shows under both makes),
 * plus a filter. 503 → the curated pairs only.
 */
export default function CompareIndexPage() {
  const { data, error, isLoading } = useCatalogComparePairs({ indexable: true });
  const [q, setQ] = useState("");
  const sub = useColorModeValue("gray.600", "gray.400");
  const panelBorder = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const inputBg = useColorModeValue("white", "gray.700");
  useDocumentTitle("Compare Electric Cars Side by Side | EV Lineup");

  const pairs = useMemo(() => (data?.pairs ?? []).filter((p) => p.indexable).map(toPair), [data]);
  const byMake = useMemo(() => {
    const m = new Map<string, { name: string; pairs: Pair[] }>();
    for (const p of pairs)
      for (const mk of p.makes) {
        const g = m.get(mk.slug) ?? { name: mk.name, pairs: [] };
        g.pairs.push(p);
        m.set(mk.slug, g);
      }
    return [...m.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [pairs]);

  if (isLoading) return <CatalogLoading />;
  const s = errorStatus(error);
  const fallback = !!error && (s === 503 || s === 0);
  if (error && !fallback) return <CatalogError error={error} />;

  const curated: Pair[] = COMPARE_PAIRS.map((p) => ({ path: `/compare/${p.pair}`, name: p.label, source: "pinned", makes: [] }));
  const query = fold(q.trim());
  const matches = query ? pairs.filter((p) => fold(p.name).includes(query)) : [];

  return (
    <CatalogPage maxW="1000px" crumbs={[{ label: "Home", to: "/" }, { label: "Compare" }]}>
      <VStack align="stretch" spacing={5}>
        <GlassCard>
          <Heading as="h1" size="lg" letterSpacing="-0.01em">
            Compare electric cars side by side
          </Heading>
          <Text mt={3} lineHeight="1.7">
            Two current models on the same figures: entry price, range, battery, power, acceleration, DC charging peak,
            connector and seats. Each figure names the trim it comes from, and prices and ranges are compared only within
            one market, currency and test cycle; nothing is converted and there is no overall winner.
          </Text>
          {!fallback && (
            <>
              <Text mt={2} fontSize="sm" color={sub}>
                {pairs.length} comparisons, chosen from twins, old and new versions, same-brand pairs and close rivals by
                price in each market.
              </Text>
              <InputGroup mt={4} maxW="420px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Find a car, e.g. Model Y or Ioniq 5"
                  aria-label="Find a comparison by car name"
                  borderRadius="full"
                  bg={inputBg}
                />
              </InputGroup>
            </>
          )}
        </GlassCard>

        {query ? (
          <GlassCard as="section">
            <Heading as="h2" size="md" mb={3}>
              {matches.length ? `${matches.length} comparison${matches.length === 1 ? "" : "s"} with “${q.trim()}”` : `No comparison with “${q.trim()}” yet`}
            </Heading>
            <PairList pairs={matches} />
          </GlassCard>
        ) : fallback ? (
          <Section title="Popular comparisons" pairs={curated} />
        ) : (
          <>
            <Section title="Popular comparisons" pairs={pairs.filter((p) => p.source === "pinned")} />
            <Section
              title="Same car, two brands"
              note="Twins: closely related models sold under different badges."
              pairs={pairs.filter((p) => p.source === "twin")}
            />
            <Section title="Old and new" note="A model and the one that replaced it." pairs={pairs.filter((p) => p.source === "successor")} />
            <GlassCard as="section">
              <Heading as="h2" size="md" mb={1}>
                By make
              </Heading>
              <Text fontSize="sm" color={sub} mb={3}>
                Every comparison, under both of its makes.
              </Text>
              <Accordion allowMultiple>
                {byMake.map(([slug, g]) => (
                  <AccordionItem key={slug} borderColor={panelBorder}>
                    <AccordionButton px={2} py={2.5}>
                      <Box flex="1" textAlign="left" fontWeight="600">
                        {g.name}{" "}
                        <Text as="span" fontWeight="400" color={sub} fontSize="sm">
                          ({g.pairs.length})
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={2} pb={4}>
                      <PairList pairs={g.pairs} />
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlassCard>
          </>
        )}

        <Text fontSize="sm" px={1}>
          <Link as={RouterLink} to="/best" color="green.600">
            Rankings by market →
          </Link>
        </Text>
      </VStack>
    </CatalogPage>
  );
}
