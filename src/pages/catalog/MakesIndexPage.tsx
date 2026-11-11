import { Box, Heading, HStack, LinkBox, LinkOverlay, SimpleGrid, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CatalogPage from "../../components/catalog/CatalogPage";
import MakeLogo from "../../components/catalog/MakeLogo";
import CatalogError from "../../components/catalog/CatalogError";
import { CatalogLoading } from "../../components/catalog/PageStates";
import { useCatalogMakes } from "../../hooks/useCatalog";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { CatalogMakeSummary, MakeDisplayStatus } from "../../types/catalog";
import { MAKE_GROUP_LABELS, formatPartialDate } from "../../utils/catalogFormat";

const GROUP_ORDER: MakeDisplayStatus[] = ["current", "upcoming", "discontinued", "defunct"];

function MakeTile({ make }: { make: CatalogMakeSummary }) {
  const bg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(45, 55, 72, 0.85)");
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const sub = useColorModeValue("gray.500", "gray.400");
  const c = make.model_counts;
  const onSale = c?.current ?? 0;
  const earlier = (c?.discontinued ?? 0) + (c?.cancelled ?? 0);
  const coming = c?.upcoming ?? 0;
  const counts = [
    onSale ? `${onSale} on sale` : null,
    coming ? `${coming} coming` : null,
    earlier ? `${earlier} earlier` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const isGone = make.brand_status === "defunct";
  return (
    <LinkBox
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="12px"
      px={3}
      py={2.5}
      _hover={{ borderColor: "green.400" }}
      transition="border-color 0.2s"
      minW={0}
    >
      <HStack spacing={3} minW={0}>
        <MakeLogo name={make.name} url={make.logo_url} size="36px" />
        <VStack align="start" spacing={0} minW={0}>
          <LinkOverlay as={RouterLink} to={make.path}>
            <Text fontWeight="600" fontSize="sm" noOfLines={1}>
              {make.name}
            </Text>
          </LinkOverlay>
          <Text fontSize="xs" color={sub} noOfLines={1}>
            {isGone
              ? `${make.status === "acquired" ? "Acquired" : "Defunct"}${make.status_date ? ` ${formatPartialDate(make.status_date)}` : ""}`
              : counts || (make.country ?? "")}
          </Text>
        </VStack>
      </HStack>
    </LinkBox>
  );
}

/** /make: every make, grouped by what it sells today. */
export default function MakesIndexPage() {
  const { data, error, isLoading } = useCatalogMakes();
  const sub = useColorModeValue("gray.600", "gray.400");
  useDocumentTitle("All electric car makers | EV Lineup");

  if (isLoading) return <CatalogLoading />;
  if (error || !data) return <CatalogError error={error} />;

  const groups = new Map<MakeDisplayStatus, CatalogMakeSummary[]>();
  for (const m of data.makes) {
    const g = (m.display_status ?? "discontinued") as MakeDisplayStatus;
    groups.set(g, [...(groups.get(g) ?? []), m]);
  }

  return (
    <CatalogPage crumbs={[{ label: "Home", to: "/" }, { label: "Makes" }]}>
      <Heading as="h1" size="lg" mb={1}>
        Electric car makers
      </Heading>
      <Text color={sub} mb={6}>
        {data.count} brands, including the ones that have stopped making electric cars or gone out of business.
      </Text>
      <VStack align="stretch" spacing={8}>
        {GROUP_ORDER.filter((g) => groups.get(g)?.length).map((g) => (
          <Box key={g} as="section">
            <Heading as="h2" size="sm" mb={3}>
              {MAKE_GROUP_LABELS[g]} ({groups.get(g)!.length})
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={2.5}>
              {groups.get(g)!.map((m) => (
                <MakeTile key={m.slug} make={m} />
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </VStack>
    </CatalogPage>
  );
}
