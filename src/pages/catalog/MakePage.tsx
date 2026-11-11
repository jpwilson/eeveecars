import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Text,
  VStack,
  Wrap,
  useColorModeValue,
} from "@chakra-ui/react";
import { Navigate, useParams } from "react-router-dom";
import CatalogPage from "../../components/catalog/CatalogPage";
import GlassCard from "../../components/catalog/GlassCard";
import MakeLogo from "../../components/catalog/MakeLogo";
import ModelCard from "../../components/catalog/ModelCard";
import SourcesList from "../../components/catalog/SourcesList";
import CatalogError from "../../components/catalog/CatalogError";
import { CatalogLoading } from "../../components/catalog/PageStates";
import { isNotFound, useCatalogMake, useCatalogResolve } from "../../hooks/useCatalog";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { CatalogMakeDetail, CatalogModelCard } from "../../types/catalog";
import { formatPartialDate } from "../../utils/catalogFormat";

/** Plain-words banner for a brand that went under or was taken over. */
export function DefunctBanner({ make }: { make: Pick<CatalogMakeDetail, "name" | "status" | "status_date" | "status_details"> }) {
  if (make.status !== "defunct" && make.status !== "acquired") return null;
  const when = formatPartialDate(make.status_date);
  const what = make.status === "acquired" ? "was acquired" : "is no longer in business";
  return (
    <Alert status="warning" variant="left-accent" borderRadius="12px" alignItems="flex-start">
      <AlertIcon mt={1} />
      <Box>
        <AlertTitle fontSize="md">
          {make.name} {what}
          {when ? ` (${when})` : ""}
        </AlertTitle>
        <AlertDescription fontSize="sm" display="block">
          {make.status_details ? `${make.status_details} ` : ""}
          Its cars are kept here for reference; none are on sale new.
        </AlertDescription>
      </Box>
    </Alert>
  );
}

function ModelSection({ title, models }: { title: string; models: CatalogModelCard[] }) {
  if (!models.length) return null;
  return (
    <Box as="section">
      <Heading as="h2" size="sm" mb={3}>
        {title} ({models.length})
      </Heading>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
        {models.map((m) => (
          <ModelCard key={m.slug} model={m} hideMake />
        ))}
      </SimpleGrid>
    </Box>
  );
}

/** Legacy make slugs such as /make/mercedes → /make/mercedes-benz. */
function MakeAliasRedirect({ slug, error }: { slug: string; error: unknown }) {
  const { data, isLoading, error: resolveError } = useCatalogResolve("make", slug);
  if (isLoading) return <CatalogLoading />;
  if (data?.path && data.path !== `/make/${slug}`) return <Navigate to={data.path} replace />;
  return <CatalogError error={resolveError ?? error} />;
}

export default function MakePage() {
  const { make: slug } = useParams<{ make: string }>();
  const { data, error, isLoading } = useCatalogMake(slug);
  const sub = useColorModeValue("gray.600", "gray.400");
  useDocumentTitle(data ? `${data.make.name} electric cars: every model | EV Lineup` : null);

  if (isLoading) return <CatalogLoading />;
  if (error && isNotFound(error) && slug) return <MakeAliasRedirect slug={slug} error={error} />;
  if (error || !data) return <CatalogError error={error} />;

  const { make, models } = data;
  const earlier = [...models.discontinued, ...models.cancelled].sort(
    (a, b) => (b.years?.start ?? 0) - (a.years?.start ?? 0)
  );
  const facts = [
    make.country ? `Country: ${make.country}` : null,
    make.headquarters ? `HQ: ${make.headquarters}` : null,
    make.founded ? `Founded ${make.founded}` : null,
    make.parent_group ? `Part of ${make.parent_group}` : null,
  ].filter(Boolean) as string[];
  const total = models.current.length + models.upcoming.length + earlier.length;

  return (
    <CatalogPage crumbs={[{ label: "Makes", to: "/make" }, { label: make.name ?? make.slug }]}>
      <VStack align="stretch" spacing={6}>
        <GlassCard>
          <Flex gap={5} direction={{ base: "column", sm: "row" }} align={{ base: "flex-start", sm: "center" }}>
            <MakeLogo name={make.name} url={make.logo_url} size={{ base: "64px", md: "84px" }} alt={`${make.name} logo`} />
            <Box minW={0}>
              <HStack spacing={3} flexWrap="wrap">
                <Heading as="h1" size="lg">
                  {make.name}
                </Heading>
              </HStack>
              <Wrap spacing={3} mt={1} fontSize="sm" color={sub}>
                {facts.map((f) => (
                  <Text key={f}>{f}</Text>
                ))}
              </Wrap>
              {make.website_url && (
                <Link href={make.website_url} isExternal rel="noopener noreferrer" fontSize="sm" color="green.600">
                  {make.website_url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </Link>
              )}
            </Box>
          </Flex>
          {make.description && (
            <Text mt={4} fontSize="sm" lineHeight="1.7">
              {make.description}
            </Text>
          )}
          {make.status === "pre-production" && (
            <Text mt={3} fontSize="sm" color="blue.500" fontWeight="600">
              Not selling cars yet: first deliveries are still to come.
            </Text>
          )}
        </GlassCard>

        <DefunctBanner make={make} />

        {total === 0 && <Text color={sub}>No electric models recorded for {make.name} yet.</Text>}
        <ModelSection title="On sale now" models={models.current} />
        <ModelSection title="Coming soon" models={models.upcoming} />
        <ModelSection title="Discontinued and cancelled" models={earlier} />

        <GlassCard>
          <SourcesList sources={make.sources ?? []} />
        </GlassCard>
      </VStack>
    </CatalogPage>
  );
}
