import { useState } from "react";
import {
  Box,
  Heading,
  HStack,
  Link,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Tag,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import GlassCard from "./GlassCard";
import CatalogImage from "./CatalogImage";
import { MarketPicker } from "./GenerationBits";
import { errorStatus, useCatalogAlternatives } from "../../hooks/useCatalog";
import { CatalogAlternativesResponse } from "../../types/catalog";
import { formatPriceFigure, formatRangeFigure, marketLabel, modelDisplayName, priceBasisLabel } from "../../utils/catalogFormat";

const RELATION_LABEL: Record<string, string> = {
  twin: "Twin",
  successor: "Replaced it",
  predecessor: "It replaced",
  same_make: "Same brand",
};

type Alt = CatalogAlternativesResponse["alternatives"][number];

/** "the US", "the UK", "Europe", "China" — for "Similar EVs in …". */
const inMarket = (m: string | null | undefined) =>
  m === "US" || m === "UK" ? `the ${m}` : marketLabel(m) ?? "this market";

function AltCard({ alt }: { alt: Alt }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const border = useColorModeValue("rgba(22, 163, 74, 0.15)", "rgba(22, 163, 74, 0.3)");
  const bg = useColorModeValue("whiteAlpha.700", "whiteAlpha.50");
  const c = alt.card;
  const name = modelDisplayName(c.make?.name, c.name);
  const price = formatPriceFigure(alt.price);
  const basis = priceBasisLabel(alt.price?.basis);
  const range = formatRangeFigure(alt.range);
  return (
    <LinkBox
      as="article"
      border="1px solid"
      borderColor={border}
      borderRadius="12px"
      overflow="hidden"
      bg={bg}
      _hover={{ borderColor: "green.400" }}
      transition="border-color 0.2s"
      minW={0}
    >
      <CatalogImage image={c.image} ratio={16 / 9} fallbackAlt={name} placeholder="No photo yet" sizes="(max-width: 768px) 50vw, 260px" />
      <Box p={2.5}>
        <LinkOverlay as={RouterLink} to={c.path}>
          <Text fontWeight="700" fontSize="sm" noOfLines={2} lineHeight="1.3">
            {name}
          </Text>
        </LinkOverlay>
        {alt.relation && RELATION_LABEL[alt.relation] && (
          <Tag size="sm" mt={1} borderRadius="6px" colorScheme="purple" variant="subtle">
            {RELATION_LABEL[alt.relation]}
          </Tag>
        )}
        {price && (
          <Text fontSize="xs" mt={1}>
            From <b>{price}</b>
            {alt.price?.is_estimate ? " (est.)" : ""}
            {basis ? <Text as="span" color={sub}>{` · ${basis}`}</Text> : null}
          </Text>
        )}
        {range && (
          <Text fontSize="xs">
            Up to <b>{range}</b>
            {alt.range?.is_estimate ? " (est.)" : ""}
          </Text>
        )}
        {alt.compare_path && (
          <Link as={RouterLink} to={alt.compare_path} fontSize="xs" color="green.600" position="relative" zIndex={1} display="inline-block" mt={1}>
            Compare side by side →
          </Link>
        )}
      </Box>
    </LinkBox>
  );
}

/**
 * Model page links (`/catalog/models/{make}/{model}/alternatives`): indexable
 * comparisons, similar cars on sale in one market with the backend's stated rule, and
 * the lists the model is ranked in. Renders nothing on error or when there is nothing.
 */
export default function AlternativesCard({ make, model, name }: { make: string; model: string; name: string }) {
  const [market, setMarket] = useState<string | null>(null);
  const { data, error, isFetching } = useCatalogAlternatives(make, model, market);
  const sub = useColorModeValue("gray.600", "gray.400");
  // An unknown market (400) can only come from a stale picker value: go back to the default.
  if (error && errorStatus(error) === 400 && market) {
    setMarket(null);
    return null;
  }
  if (error || !data) return null;
  const compare = data.compare ?? [];
  const alts = data.alternatives ?? [];
  const lists = data.lists ?? [];
  const markets = data.markets ?? [];
  if (!compare.length && !alts.length && !lists.length && markets.length < 2) return null;

  return (
    <GlassCard as="section" aria-label={`Alternatives to the ${name}`}>
      <VStack align="stretch" spacing={5}>
        {compare.length > 0 && (
          <Box>
            <Heading as="h2" size="md" mb={3}>
              Compare the {name} with
            </Heading>
            <Wrap spacing={2}>
              {compare.map((c) => (
                <WrapItem key={c.path}>
                  <Tag
                    as={RouterLink}
                    to={c.path}
                    colorScheme="green"
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    cursor="pointer"
                  >
                    vs {c.other.name ?? c.other.slug}
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}

        {(alts.length > 0 || markets.length > 1) && (
          <Box opacity={isFetching ? 0.6 : 1} transition="opacity 0.15s">
            <HStack justify="space-between" align="baseline" flexWrap="wrap" gap={2} mb={1}>
              <Heading as="h2" size="md">
                Similar EVs in {inMarket(data.market)}
              </Heading>
              {markets.length > 1 && <MarketPicker markets={markets} value={data.market} onChange={setMarket} />}
            </HStack>
            {data.rule && (
              <Text fontSize="xs" color={sub} mb={3}>
                {data.rule}
              </Text>
            )}
            {alts.length > 0 ? (
              <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={3}>
                {alts.map((a) => (
                  <AltCard key={a.card.slug} alt={a} />
                ))}
              </SimpleGrid>
            ) : (
              <Text fontSize="sm" color={sub}>
                No similar car on file in {inMarket(data.market)} yet.
              </Text>
            )}
          </Box>
        )}

        {lists.length > 0 && (
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Ranked in
            </Heading>
            <VStack align="stretch" spacing={1} fontSize="sm">
              {lists.map((l) => (
                <Text key={l.key}>
                  <Text as="span" fontWeight="800" color="green.500">
                    #{l.rank}
                  </Text>{" "}
                  in{" "}
                  <Link as={RouterLink} to={l.path} color="green.600" fontWeight="600">
                    {l.title ?? l.key}
                  </Link>
                </Text>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </GlassCard>
  );
}
