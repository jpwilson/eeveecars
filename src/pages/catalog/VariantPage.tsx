import {
  Box,
  Grid,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
  WrapItem,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import CatalogPage from "../../components/catalog/CatalogPage";
import CatalogImage from "../../components/catalog/CatalogImage";
import GlassCard from "../../components/catalog/GlassCard";
import StatusBadge, { BrandStatusBadge } from "../../components/catalog/StatusBadge";
import SourcesList from "../../components/catalog/SourcesList";
import CatalogError from "../../components/catalog/CatalogError";
import { CatalogLoading } from "../../components/catalog/PageStates";
import { DefunctBanner } from "./MakePage";
import { generationTitle } from "./ModelPage";
import { useCatalogVariant } from "../../hooks/useCatalog";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { CatalogVariant } from "../../types/catalog";
import {
  bodyStyleLabel,
  formatDate,
  formatGenYears,
  formatMoney,
  formatRange,
  marketLabel,
  modelDisplayName,
  num,
  priceBasisLabel,
  sortOfferings,
} from "../../utils/catalogFormat";

function specRows(v: CatalogVariant, bodyStyle: string | null): [string, string | null][] {
  return [
    ["Drivetrain", v.drivetrain],
    ["Body", bodyStyleLabel(v.body_type ?? bodyStyle)],
    ["Seats", v.seats ? String(v.seats) : null],
    ["Battery", v.battery_kwh ? `${num(v.battery_kwh)} kWh${v.battery_basis ? ` (${v.battery_basis})` : ""}` : null],
    ["Power", v.power_hp ? `${num(v.power_hp, 0)} hp` : null],
    ["Torque", v.torque_lbft ? `${num(v.torque_lbft, 0)} lb-ft` : null],
    ["0–60 mph", v.accel_0_60_s ? `${num(v.accel_0_60_s, 2)} s` : null],
    ["0–100 km/h", v.accel_0_100_s ? `${num(v.accel_0_100_s, 2)} s` : null],
    ["Top speed", v.top_speed_mph ? `${num(v.top_speed_mph, 0)} mph` : null],
    ["Peak DC charging", v.dc_kw ? `${num(v.dc_kw, 0)} kW` : null],
    [
      "Built",
      v.year_from || v.year_to
        ? `${v.year_from ?? "?"}${v.year_to === v.year_from ? "" : `–${v.year_to ?? "present"}`}`
        : null,
    ],
  ];
}

/** /make/:make/:model/:generation/:variant */
export default function VariantPage() {
  const p = useParams<{ make: string; model: string; generation: string; variant: string }>();
  const { data, error, isLoading } = useCatalogVariant(p.make, p.model, p.generation, p.variant);
  const sub = useColorModeValue("gray.600", "gray.400");
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const headBg = useColorModeValue("rgba(22, 163, 74, 0.05)", "rgba(22, 163, 74, 0.1)");
  const modelName = data ? modelDisplayName(data.make.name, data.model.name) : "";
  const title = data ? `${modelName} ${data.variant.name ?? ""}`.trim() : null;
  useDocumentTitle(title ? `${title} (${data!.generation.name ?? ""}): full specs | EV Lineup` : null);

  if (isLoading) return <CatalogLoading />;
  if (error || !data) return <CatalogError error={error} />;

  const { make, model, generation: gen, variant: v } = data;
  const image = gen.images?.find((i) => i.is_primary) ?? gen.images?.[0] ?? null;
  const rows = specRows(v, model.body_style);
  const known = rows.filter(([, val]) => val);
  const unknown = rows.filter(([, val]) => !val).map(([k]) => k);
  const offerings = sortOfferings(v.offerings);
  const genYears = formatGenYears(gen.start_year, gen.end_year, gen.status);

  return (
    <CatalogPage
      crumbs={[
        { label: "Makes", to: "/make" },
        { label: make.name ?? make.slug, to: make.path },
        { label: model.name ?? model.slug, to: model.path },
        { label: gen.name ?? gen.slug, to: gen.path },
        { label: v.name ?? v.slug },
      ]}
    >
      <VStack align="stretch" spacing={6}>
        <GlassCard>
          <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1.2fr) minmax(0, 1fr)" }} gap={{ base: 4, md: 6 }}>
            <CatalogImage image={image} fit="contain" eager showCredit borderRadius="12px" fallbackAlt={title ?? ""} />
            <VStack align="stretch" spacing={3} minW={0}>
              <Box>
                <Heading as="h1" size="lg">
                  {title}
                </Heading>
                <Text color={sub} fontSize="sm" mt={1}>
                  <Link as={RouterLink} to={gen.path} color="green.600">
                    {gen.name}
                  </Link>
                  {genYears ? ` · ${genYears}` : ""}
                </Text>
                <HStack spacing={2} mt={2} flexWrap="wrap">
                  <StatusBadge status={v.status} />
                  <BrandStatusBadge status={make.status} />
                </HStack>
              </Box>
              <Table size="sm">
                <Tbody>
                  {known.map(([k, val]) => (
                    <Tr key={k}>
                      <Th pl={0} textTransform="none" fontSize="sm" fontWeight="500" color={sub} letterSpacing="normal">
                        {k}
                      </Th>
                      <Td pr={0} fontWeight="600">
                        {val}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {unknown.length > 0 && (
                <Text fontSize="xs" color={sub}>
                  Not yet sourced: {unknown.join(", ")}.
                </Text>
              )}
            </VStack>
          </Grid>
        </GlassCard>

        <DefunctBanner make={make} />

        <GlassCard as="section">
          <Heading as="h2" size="md" mb={3}>
            Prices and range by market
          </Heading>
          {offerings.length === 0 ? (
            <Text fontSize="sm" color={sub}>
              No prices or ranges recorded for this variant yet.
            </Text>
          ) : (
            <Box overflowX="auto" border="1px solid" borderColor={border} borderRadius="12px">
              <Table size="sm" minW="620px">
                <Thead bg={headBg}>
                  <Tr>
                    <Th>Market</Th>
                    <Th>Model year</Th>
                    <Th isNumeric>Price</Th>
                    <Th isNumeric>Launch price</Th>
                    <Th isNumeric>Range</Th>
                    <Th>Connector</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {offerings.map((o, i) => (
                    <Tr key={`${o.market}-${o.model_year}-${i}`}>
                      <Td>{marketLabel(o.market) ?? "—"}</Td>
                      <Td>{o.model_year ?? <Text as="span" color={sub}>current</Text>}</Td>
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
          )}
          <Text fontSize="xs" color={sub} mt={2}>
            Figures are shown in the unit, test cycle and currency they were published in; nothing is converted.
          </Text>
        </GlassCard>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {data.siblings && data.siblings.length > 0 && (
            <GlassCard>
              <Heading as="h2" size="sm" mb={2}>
                Other {gen.name} variants
              </Heading>
              <Wrap spacing={2}>
                {data.siblings.map((s) => (
                  <WrapItem key={s.path}>
                    <Tag as={RouterLink} to={s.path} size="md" borderRadius="full" variant="outline" colorScheme="green">
                      {s.name ?? s.slug}
                      {s.status && s.status !== "current" ? ` · ${s.status}` : ""}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </GlassCard>
          )}
          {data.generations && data.generations.length > 1 && (
            <GlassCard>
              <Heading as="h2" size="sm" mb={2}>
                Every version of the {modelName}
              </Heading>
              <VStack align="stretch" spacing={1} fontSize="sm">
                {data.generations.map((g) => (
                  <HStack key={g.path} spacing={2}>
                    {g.slug === gen.slug ? (
                      <Text fontWeight="700">{generationTitle(g)}</Text>
                    ) : (
                      <Link as={RouterLink} to={g.path} color="green.600">
                        {generationTitle(g)}
                      </Link>
                    )}
                    <StatusBadge status={g.status} fontSize="10px" />
                  </HStack>
                ))}
              </VStack>
            </GlassCard>
          )}
        </SimpleGrid>

        <GlassCard>
          <SourcesList sources={v.sources ?? []} updatedAt={formatDate(v.updated_at)} />
        </GlassCard>
      </VStack>
    </CatalogPage>
  );
}
