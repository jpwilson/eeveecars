import { Fragment } from "react";
import { Box, Grid, Icon, Link, Text, useColorModeValue } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { ChangeSide, CompareRow } from "../../types/catalog";
import { formatMoney, num } from "../../utils/catalogFormat";
import { changeValueText } from "./ChangesTable";

const isCurrency = (u: string | null | undefined) => !!u && /^[A-Z]{3}$/.test(u);

/** What a highlight means on each row the backend highlights (a fact, never a verdict). */
const HIGHLIGHT_LABEL: Record<string, string> = {
  entry_price: "Lower price",
  longest_range: "Longer range",
  fastest_dc: "Higher DC peak",
  quickest_0_60: "Quicker",
  quickest_0_100: "Quicker",
};

/** "$3,000 apart", "8 mi apart", "Same", "Not compared". Neutral: no better/worse. */
export function compareText(row: CompareRow): string | null {
  const c = row.compare;
  if (!c?.status) return null;
  switch (c.status) {
    case "a_higher":
    case "b_higher": {
      if (c.delta === null || c.delta === undefined) return null;
      const mag = Math.abs(c.delta);
      const u = c.unit;
      if (isCurrency(u)) return `${formatMoney(mag, u)} apart`;
      if (u === "s") return `${num(mag, 2)} s apart`;
      if (u === "trims") return `${mag} apart`;
      return `${num(mag, 1)}${u ? ` ${u}` : ""} apart`;
    }
    case "equal":
      return "Same";
    case "different":
      return "Different";
    case "not_comparable":
      return "Not compared";
    default:
      return null;
  }
}

function Chip({ row }: { row: CompareRow }) {
  const bg = useColorModeValue("gray.100", "gray.700");
  const text = compareText(row);
  if (!text) return null;
  return (
    <Text as="span" display="inline-block" fontSize="xs" fontWeight="700" bg={bg} borderRadius="6px" px={2} py={0.5} whiteSpace="nowrap">
      {text}
    </Text>
  );
}

function Cell({
  side,
  missing,
  highlight,
  label,
}: {
  side: ChangeSide | null;
  missing: boolean;
  highlight: boolean;
  label: string | null;
}) {
  const sub = useColorModeValue("gray.500", "gray.400");
  const winBg = useColorModeValue("green.50", "rgba(34, 197, 94, 0.15)");
  const value = changeValueText(side);
  if (!value || missing) {
    return (
      <Box px={2} py={1.5} minW={0}>
        <Text fontSize="sm" color={sub}>
          Not on file
        </Text>
      </Box>
    );
  }
  const notes = [
    side?.model_year ? `${side.model_year} MY` : null,
    side?.price_kind === "launch" ? "launch price" : null,
    side?.is_estimate ? "manufacturer estimate" : null,
  ].filter(Boolean);
  return (
    <Box px={2} py={1.5} minW={0} borderRadius="8px" bg={highlight ? winBg : undefined}>
      <Text fontSize="sm" fontWeight={highlight ? "800" : "600"} wordBreak="break-word">
        {value}
        {highlight && <Icon as={FaCheckCircle} color="green.500" boxSize={3} ml={1.5} verticalAlign="-1px" aria-hidden />}
      </Text>
      {highlight && label && (
        <Text fontSize="2xs" fontWeight="700" color="green.600" textTransform="uppercase" letterSpacing="0.04em">
          {label}
        </Text>
      )}
      {(side?.variant || notes.length > 0) && (
        <Text fontSize="xs" color={sub} wordBreak="break-word">
          {side?.variant?.path ? (
            <Link as={RouterLink} to={side.variant.path} textDecoration="underline">
              {side.variant.name ?? side.variant.slug}
            </Link>
          ) : (
            side?.variant?.name
          )}
          {notes.length ? `${side?.variant ? ", " : ""}${notes.join(", ")}` : ""}
        </Text>
      )}
    </Box>
  );
}

interface Props {
  rows: CompareRow[];
  nameA: string;
  nameB: string;
}

/**
 * Model vs model rows, as the backend computed them. Phone: label line (with the
 * difference chip), then the two cars side by side. Wider: label | A | B | difference.
 * A highlight marks the lower price / longer range / higher DC peak / quicker time on
 * comparable rows only; there is no overall winner.
 */
export default function CompareTable({ rows, nameA, nameB }: Props) {
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const headBg = useColorModeValue("rgba(22, 163, 74, 0.05)", "rgba(22, 163, 74, 0.1)");
  const sub = useColorModeValue("gray.500", "gray.400");
  const cols = {
    base: "minmax(0, 1fr) minmax(0, 1fr)",
    md: "minmax(150px, 1fr) minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(104px, 0.5fr)",
  };
  const shown = rows.filter((r) => r.a || r.b);
  if (!shown.length) return null;
  return (
    <Box border="1px solid" borderColor={border} borderRadius="12px" overflow="hidden">
      <Grid templateColumns={cols} columnGap={2} px={{ base: 1, md: 2 }} py={2} bg={headBg} fontSize="xs" fontWeight="700" color={sub}>
        <Box display={{ base: "none", md: "block" }} px={2}>
          What
        </Box>
        <Box px={2}>{nameA}</Box>
        <Box px={2}>{nameB}</Box>
        <Box display={{ base: "none", md: "block" }} px={2}>
          Difference
        </Box>
      </Grid>
      {shown.map((r, i) => {
        const status = r.compare?.status;
        const reason = r.compare?.reason;
        const label = HIGHLIGHT_LABEL[r.key] ?? null;
        return (
          <Fragment key={`${r.key}-${i}`}>
            <Grid
              templateColumns={cols}
              columnGap={2}
              rowGap={0.5}
              px={{ base: 1, md: 2 }}
              py={1.5}
              borderTop="1px solid"
              borderColor={border}
              alignItems="start"
            >
              <Box
                gridColumn={{ base: "1 / -1", md: "auto" }}
                display="flex"
                justifyContent="space-between"
                alignItems="baseline"
                gap={2}
                px={2}
                pt={{ base: 1, md: 1.5 }}
                minW={0}
              >
                <Box minW={0}>
                  <Text fontSize="sm" fontWeight="600">
                    {r.label ?? r.key}
                  </Text>
                  {r.qualifier && (
                    <Text fontSize="xs" color={sub}>
                      {r.qualifier}
                    </Text>
                  )}
                </Box>
                <Box display={{ base: "block", md: "none" }} flexShrink={0}>
                  <Chip row={r} />
                </Box>
              </Box>
              <Cell side={r.a} missing={status === "missing_a"} highlight={r.highlight === "a"} label={label} />
              <Cell side={r.b} missing={status === "missing_b"} highlight={r.highlight === "b"} label={label} />
              <Box display={{ base: "none", md: "block" }} px={2} pt={1.5}>
                <Chip row={r} />
              </Box>
              {reason && (
                <Text gridColumn="1 / -1" fontSize="xs" color={sub} px={2} pb={1}>
                  {reason}
                </Text>
              )}
            </Grid>
          </Fragment>
        );
      })}
    </Box>
  );
}
