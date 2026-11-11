import {
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
import CatalogImage from "../components/catalog/CatalogImage";
import StatusBadge from "../components/catalog/StatusBadge";
import CatalogError from "../components/catalog/CatalogError";
import useData from "../hooks/useData";
import { Car } from "../hooks/useCars";
import { errorStatus, isNotFound, useCatalogBest } from "../hooks/useCatalog";
import { CatalogBestItem, CatalogBestResponse } from "../types/catalog";
import { formatPrice } from "../utils/formatPrice";
import { formatMoney, formatPriceFigure, formatRange, formatRangeFigure, modelDisplayName, num } from "../utils/catalogFormat";
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

/** "More EV rankings" chips, shared by the catalog and legacy versions. */
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

export default function BestPage() {
  const { criteria } = useParams<{ criteria: string }>();
  const config = criteria ? BEST_PAGES[criteria] : undefined;
  const { data, error, isLoading } = useCatalogBest(config ? criteria : undefined, config?.limit);

  if (!config || !criteria) return <NotFoundPage />;
  if (isLoading) return <Spinning />;
  if (data) return <CatalogBestList criteria={criteria} config={config} data={data} />;
  if (isNotFound(error)) return <NotFoundPage />;
  // 503 (catalog not migrated yet) or no answer: the old list, so the page never breaks
  const s = errorStatus(error);
  if (s === 503 || s === 0) return <LegacyBestPage criteria={criteria} config={config} />;
  return <CatalogError error={error} />;
}

const METRIC_CAPTION: Record<string, string> = {
  price: "Lowest price",
  range: "Longest range",
  accel: "Quickest 0–60",
};

/** The ranked figure as the API gives it: currency, unit and test cycle kept, never converted. */
function rankedFigure(item: CatalogBestItem, metric: string | null) {
  const m = item.model;
  if (item.value === null || item.value === undefined) return null;
  if (metric === "price") {
    const est = m.from_price?.is_estimate && m.from_price?.value === item.value ? " (est.)" : "";
    const money = formatMoney(item.value, item.unit);
    return money ? `${money}${est}` : null;
  }
  if (metric === "range") {
    const same = m.max_range && m.max_range.value === item.value && m.max_range.unit === item.unit;
    return formatRange(item.value, item.unit, same ? m.max_range?.cycle : null);
  }
  if (metric === "accel") return `${num(item.value, 2)} ${item.unit ?? "s"}`;
  return `${num(item.value, 2)}${item.unit ? ` ${item.unit}` : ""}`;
}

function CatalogBestList({ criteria, config, data }: { criteria: string; config: BestPageConfig; data: CatalogBestResponse }) {
  const rowBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const border = useColorModeValue("rgba(34,197,94,0.15)", "rgba(34,197,94,0.3)");
  const subText = useColorModeValue("gray.600", "gray.400");
  const metric = data.metric ?? null;

  return (
    <Box>
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Heading as="h1" size="lg" mb={2}>
          {config.title}
        </Heading>
        <Text color={subText} mb={8}>
          {config.blurb}
        </Text>

        <VStack spacing={3} align="stretch">
          {data.items.map((item, i) => {
            const m = item.model;
            const name = modelDisplayName(m.make?.name, m.name);
            const status = m.market_status ?? m.status;
            const price = formatPriceFigure(m.from_price);
            const range = formatRangeFigure(m.max_range);
            const accel = m.quickest_0_60?.value ? `${num(m.quickest_0_60.value, 2)}s 0–60` : null;
            const figures = [price ? `From ${price}${m.from_price?.is_estimate ? " (est.)" : ""}` : null, range, accel].filter(Boolean);
            const ranked = rankedFigure(item, metric);
            return (
              <LinkBox
                as="article"
                key={m.slug}
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
                    {item.rank ?? i + 1}
                  </Text>
                  <Box w="72px" flexShrink={0}>
                    <CatalogImage
                      image={m.image}
                      ratio={1}
                      borderRadius="lg"
                      fallbackAlt={name}
                      placeholder="No photo yet"
                      sizes="72px"
                    />
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
                    <Text fontSize="sm" color={subText}>
                      {figures.length ? figures.join(" · ") : "No figures published yet"}
                    </Text>
                    {item.variant && ranked && (
                      <Text fontSize="xs" color={subText} noOfLines={1}>
                        {METRIC_CAPTION[metric ?? ""] ?? "Figure"}:{" "}
                        <Link
                          as={RouterLink}
                          to={item.variant.path}
                          color="green.500"
                          position="relative"
                          zIndex={1}
                        >
                          {item.variant.name ?? item.variant.slug}
                        </Link>
                      </Text>
                    )}
                  </Box>
                  {ranked && (
                    <Text
                      display={{ base: "none", sm: "block" }}
                      fontWeight="800"
                      color="green.500"
                      whiteSpace="nowrap"
                      flexShrink={0}
                    >
                      {ranked}
                    </Text>
                  )}
                </HStack>
              </LinkBox>
            );
          })}
        </VStack>

        {data.items.length === 0 && (
          <Text color={subText}>No cars match this list yet.</Text>
        )}

        <Text fontSize="xs" color={subText} mt={6}>
          US figures: price is the lowest current US MSRP (some makers include destination, some do not) and range
          is EPA. Each figure comes from one trim; open a car for every version, trim and market.
        </Text>

        <MoreRankings current={criteria} />
      </Container>
    </Box>
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
