import { Fragment } from "react";
import { Box, Grid, Link, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ChangeRow, ChangeSide } from "../../types/catalog";
import { formatMoney, num } from "../../utils/catalogFormat";

const isCurrency = (u: string | null | undefined) => !!u && /^[A-Z]{3}$/.test(u);

/** A value as the backend sent it, in its own unit, currency and test cycle. */
export function changeValueText(side: ChangeSide | null | undefined): string | null {
  if (!side || side.value === null || side.value === undefined) return null;
  const v = side.value;
  if (Array.isArray(v)) return v.length ? v.join(", ") : null;
  if (typeof v === "string") return v;
  const u = side.unit;
  if (isCurrency(u)) return formatMoney(v, u);
  if (u === "mi" || u === "km") return [Math.round(v).toLocaleString("en-US"), u, side.cycle].filter(Boolean).join(" ");
  if (u === "s") return `${num(v, 2)} s`;
  if (u === "trims") return String(v);
  return [num(v, 1), u].filter(Boolean).join(" ");
}

/** "+$1,990", "−0.2 s", "+NACS, −CCS1", "Same". Neutral: no better/worse verdict. */
export function changeText(row: ChangeRow): string | null {
  const c = row.change;
  if (!c?.status) return null;
  switch (c.status) {
    case "increased":
    case "decreased": {
      if (c.delta === null || c.delta === undefined) return c.status === "increased" ? "Up" : "Down";
      const sign = c.delta > 0 ? "+" : "−";
      const mag = Math.abs(c.delta);
      const u = c.unit;
      if (isCurrency(u)) return `${sign}${formatMoney(mag, u)}`;
      if (u === "s") return `${sign}${num(mag, 2)} s`;
      if (u === "trims") return `${sign}${mag}`;
      return `${sign}${num(mag, 1)}${u ? ` ${u}` : ""}`;
    }
    case "unchanged":
      return "Same";
    case "changed": {
      const parts = [...(c.added ?? []).map((a) => `+${a}`), ...(c.removed ?? []).map((r) => `−${r}`)];
      return parts.length ? parts.join(", ") : "Changed";
    }
    case "not_comparable":
      return "Not compared";
    default:
      return null;
  }
}

function SideCell({ side, missing }: { side: ChangeSide | null; missing: boolean }) {
  const sub = useColorModeValue("gray.500", "gray.400");
  const value = changeValueText(side);
  if (!value || missing) {
    return (
      <Text fontSize="sm" color={sub}>
        Not on file
      </Text>
    );
  }
  const notes = [
    side?.model_year ? `${side.model_year} MY` : null,
    side?.price_kind === "launch" ? "launch price" : null,
    side?.is_estimate ? "manufacturer estimate" : null,
  ].filter(Boolean);
  return (
    <Box minW={0}>
      <Text fontSize="sm" fontWeight="600">
        {value}
      </Text>
      {(side?.variant || notes.length > 0) && (
        <Text fontSize="xs" color={sub}>
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

function ChangeChip({ row }: { row: ChangeRow }) {
  const bg = useColorModeValue("gray.100", "gray.700");
  const text = changeText(row);
  if (!text) return null;
  return (
    <Text
      as="span"
      display="inline-block"
      fontSize="xs"
      fontWeight="700"
      bg={bg}
      borderRadius="6px"
      px={2}
      py={0.5}
      whiteSpace="nowrap"
    >
      {text}
    </Text>
  );
}

interface Props {
  rows: ChangeRow[];
  olderName: string;
  newerName: string;
  /** smaller type, no header (a trim's own rows) */
  compact?: boolean;
}

/**
 * Rows of a version comparison. Phone: label line, then the two values side by side.
 * Wider: label | older | newer | change. Each value names its trim and model year.
 */
export default function ChangesTable({ rows, olderName, newerName, compact = false }: Props) {
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const headBg = useColorModeValue("rgba(22, 163, 74, 0.05)", "rgba(22, 163, 74, 0.1)");
  const sub = useColorModeValue("gray.500", "gray.400");
  const cols = { base: "minmax(0, 1fr) minmax(0, 1fr)", md: "minmax(150px, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(96px, 0.5fr)" };
  const shown = rows.filter((r) => r.older || r.newer);
  if (!shown.length) return null;
  return (
    <Box border="1px solid" borderColor={border} borderRadius="12px" overflow="hidden">
      <Grid templateColumns={cols} columnGap={3} px={3} py={2} bg={headBg} fontSize="xs" fontWeight="700" color={sub}>
        <Box display={{ base: "none", md: "block" }}>{compact ? "" : "What"}</Box>
        <Box>{olderName}</Box>
        <Box>{newerName}</Box>
        <Box display={{ base: "none", md: "block" }}>Change</Box>
      </Grid>
      {shown.map((r, i) => {
        const status = r.change?.status;
        const reason = r.change?.reason;
        return (
          <Fragment key={`${r.key}-${i}`}>
            <Grid
              templateColumns={cols}
              columnGap={3}
              rowGap={1}
              px={3}
              py={compact ? 2 : 2.5}
              borderTop="1px solid"
              borderColor={border}
              alignItems="start"
            >
              <Box gridColumn={{ base: "1 / -1", md: "auto" }} display="flex" justifyContent="space-between" gap={2} minW={0}>
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
                  <ChangeChip row={r} />
                </Box>
              </Box>
              <SideCell side={r.older} missing={status === "missing_older"} />
              <SideCell side={r.newer} missing={status === "missing_newer"} />
              <Box display={{ base: "none", md: "block" }}>
                <ChangeChip row={r} />
              </Box>
              {reason && (
                <Text gridColumn="1 / -1" fontSize="xs" color={sub}>
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
