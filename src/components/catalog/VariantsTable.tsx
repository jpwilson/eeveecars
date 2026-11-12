import { Box, Link, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CatalogVariant } from "../../types/catalog";
import StatusBadge from "./StatusBadge";
import { sortOfferings, formatMoney, formatRange, headlineOffering, num } from "../../utils/catalogFormat";

interface Props {
  variants: CatalogVariant[];
  /** market whose offering is shown (price/range); falls back to the first market a variant has */
  market?: string | null;
}

const dash = "—";

/** Variants of one generation, one row per variant, linking to the variant pages. */
export default function VariantsTable({ variants, market }: Props) {
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const headBg = useColorModeValue("rgba(22, 163, 74, 0.05)", "rgba(22, 163, 74, 0.1)");
  const sub = useColorModeValue("gray.500", "gray.400");

  if (!variants.length) {
    return (
      <Text fontSize="sm" color={sub}>
        No variants recorded for this version yet.
      </Text>
    );
  }

  const mixedStatus = new Set(variants.map((v) => v.status)).size > 1;
  const anyAccel100 = variants.some((v) => v.accel_0_100_s);
  const anyAccel60 = variants.some((v) => v.accel_0_60_s);

  return (
    <Box overflowX="auto" border="1px solid" borderColor={border} borderRadius="12px" sx={{ WebkitOverflowScrolling: "touch" }}>
      <Table size="sm" minW="760px">
        <Thead bg={headBg}>
          <Tr>
            <Th>Variant</Th>
            <Th>Drive</Th>
            <Th isNumeric>Battery</Th>
            <Th isNumeric>Range</Th>
            {(anyAccel60 || !anyAccel100) && <Th isNumeric>0–60 mph</Th>}
            {anyAccel100 && <Th isNumeric>0–100 km/h</Th>}
            <Th isNumeric>Power</Th>
            <Th isNumeric>DC peak</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Seats</Th>
          </Tr>
        </Thead>
        <Tbody>
          {variants.map((v) => {
            const o = headlineOffering(v.offerings, market);
            // The newest model year often has a range before it has a price: show the
            // newest year in the same market that does have one, labelled with its year.
            const po =
              (o &&
                sortOfferings(v.offerings).find(
                  (x) => x.market === o.market && (x.price != null || x.launch_price != null)
                )) ||
              o;
            const price = po ? formatMoney(po.price ?? po.launch_price, po.currency) : null;
            const priceNote = po
              ? [po.market, po.model_year ? `MY${po.model_year}` : null, !po.price && po.launch_price ? "launch" : null, po.is_estimate ? "est." : null]
                  .filter(Boolean)
                  .join(" ")
              : null;
            const range = o ? formatRange(o.range, o.range_unit, o.range_cycle) : null;
            return (
              <Tr key={v.path}>
                <Td>
                  <Link as={RouterLink} to={v.path} color="green.600" fontWeight="600">
                    {v.name ?? v.slug}
                  </Link>
                  {(mixedStatus || v.status === "cancelled") && v.status !== "current" && (
                    <StatusBadge status={v.status} ml={2} fontSize="10px" />
                  )}
                  {(v.year_from || v.year_to) && (
                    <Text fontSize="xs" color={sub}>
                      {v.year_from ?? "?"}
                      {v.year_to === v.year_from ? "" : `–${v.year_to ?? ""}`}
                    </Text>
                  )}
                </Td>
                <Td>{v.drivetrain ?? dash}</Td>
                <Td isNumeric>
                  {v.battery_kwh ? `${num(v.battery_kwh)} kWh` : dash}
                  {v.battery_kwh && v.battery_basis && (
                    <Text as="span" fontSize="xs" color={sub}>
                      {" "}
                      {v.battery_basis}
                    </Text>
                  )}
                </Td>
                <Td isNumeric whiteSpace="nowrap">
                  {range ?? dash}
                </Td>
                {(anyAccel60 || !anyAccel100) && <Td isNumeric>{v.accel_0_60_s ? `${num(v.accel_0_60_s, 2)} s` : dash}</Td>}
                {anyAccel100 && <Td isNumeric>{v.accel_0_100_s ? `${num(v.accel_0_100_s, 2)} s` : dash}</Td>}
                <Td isNumeric>{v.power_hp ? `${num(v.power_hp, 0)} hp` : dash}</Td>
                <Td isNumeric whiteSpace="nowrap">
                  {v.dc_kw ? `${num(v.dc_kw, 0)} kW` : dash}
                  {o?.connector && (
                    <Text fontSize="xs" color={sub}>
                      {o.connector}
                    </Text>
                  )}
                </Td>
                <Td isNumeric whiteSpace="nowrap">
                  {price ?? dash}
                  {price && priceNote && (
                    <Text fontSize="xs" color={sub}>
                      {priceNote}
                    </Text>
                  )}
                </Td>
                <Td isNumeric>{v.seats ?? dash}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
