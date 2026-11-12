import {
  Badge,
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Image,
  Link,
  LinkBox,
  LinkOverlay,
  Wrap,
  WrapItem,
  Tag,
  Center,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import NotFoundPage from "./NotFoundPage";
import CarScore from "../components/CarScore";
import CatalogPage from "../components/catalog/CatalogPage";
import CatalogImage from "../components/catalog/CatalogImage";
import GlassCard from "../components/catalog/GlassCard";
import StatusBadge from "../components/catalog/StatusBadge";
import CatalogError from "../components/catalog/CatalogError";
import { CatalogLoading } from "../components/catalog/PageStates";
import useData from "../hooks/useData";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { Car } from "../hooks/useCars";
import { errorStatus, isNotFound, useCatalogBest } from "../hooks/useCatalog";
import { CatalogBestItem, CatalogBestResponse } from "../types/catalog";
import { formatPrice } from "../utils/formatPrice";
import { formatPriceFigure, formatRangeFigure, marketLabel, modelDisplayName, num } from "../utils/catalogFormat";
import { BEST_PAGES, BestPageConfig } from "../data/seoPages";

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

/** "More EV rankings" chips for the legacy fallback (the catalog page uses the API's `related`). */
function MoreRankings({ current }: { current: string }) {
  return (
    <Box mt={12}>
      <Heading as="h2" size="sm" mb={3}>
        More EV rankings
      </Heading>
      <Wrap>
        {Object.entries(BEST_PAGES)
          .filter(([slug]) => slug !== current)
          .map(([slug, cfg]) => (
            <WrapItem key={slug}>
              <Tag
                as={RouterLink}
                to={`/best/${slug}`}
                colorScheme="green"
                variant="subtle"
                borderRadius="full"
                px={3}
                py={1.5}
                cursor="pointer"
              >
                {cfg.title}
              </Tag>
            </WrapItem>
          ))}
      </Wrap>
    </Box>
  );
}

/**
 * /best/:key — any list in the backend's registry (`/catalog/best/{key}`). The backend
 * ranks, filters and words everything; this page only displays it. 503 (catalog not
 * migrated) → the legacy list, for the 7 original keys only.
 */
export default function BestPage() {
  const { criteria } = useParams<{ criteria: string }>();
  const key = criteria?.toLowerCase();
  const { data, error, isLoading } = useCatalogBest(key);
  useDocumentTitle(data?.title ? `${data.title} | EV Lineup` : null);

  if (!key) return <NotFoundPage />;
  if (isLoading) return <CatalogLoading />;
  if (data) return <CatalogBestList data={data} />;
  if (isNotFound(error)) return <NotFoundPage />;
  // 503 (catalog not migrated yet) or no answer: the old list, so the page never breaks
  const s = errorStatus(error);
  const config = BEST_PAGES[key];
  if ((s === 503 || s === 0) && config) return <LegacyBestPage criteria={key} config={config} />;
  return <CatalogError error={error} />;
}

/** Other figures on the row, from the model card (its headline market is the list's market). */
function otherFigures(item: CatalogBestItem, metric: string | null) {
  const m = item.model;
  const price = metric === "price" ? null : formatPriceFigure(m.from_price);
  const range = metric === "range" ? null : formatRangeFigure(m.max_range);
  const accel =
    metric === "accel"
      ? null
      : m.quickest_0_60?.value
      ? `${num(m.quickest_0_60.value, 2)} s 0–60`
      : m.quickest_0_100?.value
      ? `${num(m.quickest_0_100.value, 2)} s 0–100`
      : null;
  return [price ? `From ${price}${m.from_price?.is_estimate ? " (est.)" : ""}` : null, range, accel].filter(Boolean) as string[];
}

function ListRow({ item, index, metric }: { item: CatalogBestItem; index: number; metric: string | null }) {
  const rowBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const border = useColorModeValue("rgba(34,197,94,0.15)", "rgba(34,197,94,0.3)");
  const sub = useColorModeValue("gray.600", "gray.400");
  const m = item.model;
  const name = item.name ?? modelDisplayName(m.make?.name, m.name);
  const status = item.status ?? m.market_status ?? m.status;
  const display = item.display ?? null;
  const qualifier = [item.label, item.qualifier].filter(Boolean).join(", ");
  const others = otherFigures(item, metric);
  const figure = (
    <>
      <Text fontWeight={display ? "800" : "500"} color={display ? "green.500" : sub} fontSize={display ? "md" : "sm"} whiteSpace="nowrap" lineHeight="1.3">
        {display ?? "No figure published"}
      </Text>
      {qualifier && (
        <Text fontSize="xs" color={sub} lineHeight="1.3">
          {qualifier}
        </Text>
      )}
    </>
  );
  return (
    <LinkBox
      as="article"
      p={3}
      bg={rowBg}
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      _hover={{ borderColor: "green.400", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <HStack spacing={{ base: 3, sm: 4 }} align="center">
        <Text fontWeight="800" fontSize="lg" color="green.500" w="28px" textAlign="center" flexShrink={0}>
          {item.rank ?? index + 1}
        </Text>
        <Box w={{ base: "64px", sm: "96px" }} flexShrink={0}>
          <CatalogImage image={m.image} ratio={4 / 3} borderRadius="lg" fallbackAlt={name} placeholder="No photo yet" sizes="96px" />
        </Box>
        <Box flex={1} minW={0}>
          <HStack spacing={2} rowGap={0.5} minW={0} flexWrap="wrap">
            <LinkOverlay as={RouterLink} to={m.path} minW={0}>
              <Text fontWeight="600" noOfLines={2}>
                {name}
              </Text>
            </LinkOverlay>
            {status && status !== "current" && <StatusBadge status={status} flexShrink={0} />}
          </HStack>
          <Box display={{ base: "block", sm: "none" }} mt={0.5}>
            {figure}
          </Box>
          {item.variant && display && (
            <Text fontSize="xs" color={sub} noOfLines={1}>
              Trim:{" "}
              <Link as={RouterLink} to={item.variant.path} color="green.500" position="relative" zIndex={1}>
                {item.variant.name ?? item.variant.slug}
              </Link>
            </Text>
          )}
          {item.markets && item.markets.length > 0 && (
            <Text fontSize="xs" color={sub}>
              On sale in {item.markets.map((x) => marketLabel(x) ?? x).join(", ")}
            </Text>
          )}
          {others.length > 0 && (
            <Text fontSize="xs" color={sub} noOfLines={2}>
              {others.join(" · ")}
            </Text>
          )}
        </Box>
        <Box display={{ base: "none", sm: "block" }} textAlign="right" flexShrink={0} maxW="40%">
          {figure}
        </Box>
      </HStack>
    </LinkBox>
  );
}

function CatalogBestList({ data }: { data: CatalogBestResponse }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const metric = data.metric ?? null;
  const items = data.items ?? [];
  const ranked = data.ranked ?? items.length;
  // Lists that add cars not on sale yet after the ranked ones (electric-trucks).
  const firstUpcoming = items.findIndex((it, i) => i >= ranked && (it.status ?? it.model.market_status) === "upcoming");
  const excluded = data.excluded;
  const related = data.related ?? [];
  const market = data.market ? marketLabel(data.market) : null;

  return (
    <CatalogPage
      maxW="900px"
      crumbs={[{ label: "Rankings", to: "/best" }, { label: data.title ?? data.key }]}
    >
      <VStack align="stretch" spacing={5}>
        <GlassCard>
          <Heading as="h1" size="lg" letterSpacing="-0.01em">
            {data.h1 ?? data.title}
          </Heading>
          {market && (
            <Badge mt={2} colorScheme="green" variant="subtle" borderRadius="6px" textTransform="none">
              {market} figures
            </Badge>
          )}
          {data.blurb && (
            <Text mt={3} lineHeight="1.7">
              {data.blurb}
            </Text>
          )}
          {data.rule && (
            <Text mt={2} fontSize="sm" color={sub}>
              <Text as="span" fontWeight="700">
                How it is ranked:
              </Text>{" "}
              {data.rule}
            </Text>
          )}
        </GlassCard>

        <VStack spacing={3} align="stretch">
          {items.map((item, i) => (
            <Box key={item.model.slug}>
              {i === firstUpcoming && (
                <Heading as="h2" size="sm" mt={3} mb={3}>
                  Not on sale yet
                </Heading>
              )}
              <ListRow item={item} index={i} metric={metric} />
            </Box>
          ))}
          {items.length === 0 && <Text color={sub}>No cars match this list yet.</Text>}
        </VStack>

        {(excluded?.reason || (excluded?.unknown ?? []).length > 0 || (data.notes ?? []).length > 0) && (
          <Box fontSize="xs" color={sub} px={1}>
            {[excluded?.reason, ...(excluded?.unknown ?? []), ...(data.notes ?? [])]
              .filter(Boolean)
              .map((line, i) => (
                <Text key={i} mb={1}>
                  {line}
                </Text>
              ))}
          </Box>
        )}

        <GlassCard as="nav" aria-label="Related lists">
          {related.length > 0 && (
            <>
              <Heading as="h2" size="sm" mb={3}>
                Related lists
              </Heading>
              <Wrap spacing={2} mb={3}>
                {related.map((r) => (
                  <WrapItem key={r.key}>
                    <Tag
                      as={RouterLink}
                      to={r.path}
                      colorScheme="green"
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1.5}
                      cursor="pointer"
                    >
                      {r.title ?? r.key}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </>
          )}
          <Wrap spacing={4} fontSize="sm">
            <WrapItem>
              <Link as={RouterLink} to="/best" color="green.600">
                Every ranking, by market →
              </Link>
            </WrapItem>
            <WrapItem>
              <Link as={RouterLink} to="/compare" color="green.600">
                Compare two cars →
              </Link>
            </WrapItem>
          </Wrap>
        </GlassCard>
      </VStack>
    </CatalogPage>
  );
}

/** The pre-catalog list from /cars/cards, shown only while the catalog is not available. */
function LegacyBestPage({ criteria, config }: { criteria: string; config: BestPageConfig }) {
  const { data, isLoading } = useData<Car>("/cars/cards");

  const rowBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const border = useColorModeValue("rgba(34,197,94,0.15)", "rgba(34,197,94,0.3)");
  const subText = useColorModeValue("gray.600", "gray.400");

  if (isLoading) return <Spinning />;

  const ranked = data.filter(config.filter).sort(config.sort).slice(0, config.limit);

  return (
    <Box>
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Heading as="h1" size="lg" mb={2}>
          {config.title}
        </Heading>
        <Text color={subText} mb={8}>
          {config.legacyBlurb ?? config.blurb}
        </Text>

        <VStack spacing={3} align="stretch">
          {ranked.map((car, i) => (
            <RouterLink key={car.id} to={`/model_detail/${car.make_model_slug}`}>
              <HStack
                p={3}
                bg={rowBg}
                backdropFilter="blur(16px)"
                border="1px solid"
                borderColor={border}
                borderRadius="xl"
                spacing={4}
                _hover={{ borderColor: "green.400", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Text fontWeight="800" fontSize="lg" color="green.500" w="28px" textAlign="center">
                  {i + 1}
                </Text>
                <Image
                  src={car.image_url}
                  alt={`${car.make_name} ${car.model}`}
                  loading="lazy"
                  boxSize="72px"
                  borderRadius="lg"
                  objectFit="cover"
                  flexShrink={0}
                />
                <Box flex={1} minW={0}>
                  <Text fontWeight="600" noOfLines={1}>
                    {car.make_name} {car.model}
                  </Text>
                  <Text fontSize="sm" color={subText}>
                    From {formatPrice(car.current_price)}
                    {car.epa_range ? ` · ${car.epa_range} mi` : ""}
                    {car.acceleration_0_60 ? ` · ${car.acceleration_0_60}s 0–60` : ""}
                  </Text>
                </Box>
                <CarScore score={car.average_rating} />
              </HStack>
            </RouterLink>
          ))}
        </VStack>

        <MoreRankings current={criteria} />
      </Container>
    </Box>
  );
}
