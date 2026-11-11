import { useMemo } from "react";
import { Button, ButtonGroup, HStack, Link, Text, Wrap, WrapItem, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CatalogGeneration, CatalogVariant, Headline } from "../../types/catalog";
import {
  formatMoney,
  formatPriceFigure,
  formatRangeFigure,
  marketLabel,
  num,
  priceBasisLabel,
  sortMarkets,
} from "../../utils/catalogFormat";

/** Markets that have at least one offering among these variants, in display order. */
export function marketsOf(variants: CatalogVariant[] | null | undefined) {
  const s = new Set<string>();
  for (const v of variants ?? []) for (const o of v.offerings ?? []) if (o.market) s.add(o.market);
  return sortMarkets([...s]);
}

/** US when present, else the first market with data. */
export function defaultMarket(markets: string[], preferred?: string | null) {
  if (preferred && markets.includes(preferred)) return preferred;
  if (markets.includes("US")) return "US";
  return markets[0] ?? null;
}

export function MarketPicker({
  markets,
  value,
  onChange,
}: {
  markets: string[];
  value: string | null;
  onChange: (m: string) => void;
}) {
  if (markets.length < 2) {
    return markets.length === 1 ? (
      <Text fontSize="xs" color="gray.500">
        Figures for {marketLabel(markets[0])}
      </Text>
    ) : null;
  }
  return (
    <ButtonGroup size="xs" isAttached={false} spacing={1} flexWrap="wrap" role="group" aria-label="Market">
      {markets.map((m) => (
        <Button
          key={m}
          onClick={() => onChange(m)}
          variant={m === value ? "solid" : "outline"}
          colorScheme="green"
          borderRadius="full"
          title={marketLabel(m) ?? m}
          aria-pressed={m === value}
          mb={1}
        >
          {m}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function span(values: number[], fmt: (n: number) => string | null) {
  if (!values.length) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
}

/** "Range 220–358 mi EPA · Launch price $35,000–$56,990 · Battery 54–82 kWh" for a generation card. */
export function useGenerationSpans(gen: CatalogGeneration) {
  return useMemo(() => {
    const variants = gen.variants ?? [];
    const ranges = new Map<string, number[]>();
    const prices = new Map<string, number[]>();
    const batteries: number[] = [];
    for (const v of variants) {
      if (v.battery_kwh) batteries.push(v.battery_kwh);
      for (const o of v.offerings ?? []) {
        if (o.range && o.range_unit) {
          const k = `${o.range_unit} ${o.range_cycle ?? ""}`.trim();
          ranges.set(k, [...(ranges.get(k) ?? []), o.range]);
        }
        const p = o.launch_price ?? o.price;
        if (p && o.currency) prices.set(o.currency, [...(prices.get(o.currency) ?? []), p]);
      }
    }
    const pick = (m: Map<string, number[]>) => [...m.entries()].sort((a, b) => b[1].length - a[1].length)[0];
    const r = pick(ranges);
    const p = pick(prices);
    return [
      r ? `Range ${span(r[1], (n) => Math.round(n).toLocaleString("en-US"))} ${r[0]}` : null,
      p ? `Price ${span(p[1], (n) => formatMoney(n, p[0]))}` : null,
      batteries.length ? `Battery ${span(batteries, (n) => num(n))} kWh` : null,
    ].filter(Boolean) as string[];
  }, [gen]);
}

/** Headline figures; each names the variant it comes from and its test cycle. */
export function HeadlineFigures({ headline }: { headline: Headline | null | undefined }) {
  const sub = useColorModeValue("gray.500", "gray.400");
  if (!headline) return null;
  const items: { label: string; value: string; note: string | null; path: string | null; variant: string | null }[] = [];
  const p = headline.from_price;
  const pv = formatPriceFigure(p);
  if (p && pv) {
    items.push({
      label: "From",
      value: pv,
      note: [p.market, priceBasisLabel(p.basis), p.model_year ? `MY${p.model_year}` : null, p.is_estimate ? "estimate" : null]
        .filter(Boolean)
        .join(", "),
      path: p.variant?.path ?? null,
      variant: p.variant?.name ?? null,
    });
  }
  const r = headline.max_range;
  const rv = formatRangeFigure(r);
  if (r && rv) {
    items.push({
      label: "Up to",
      value: rv,
      note: [r.market, r.model_year ? `MY${r.model_year}` : null, r.is_estimate ? "estimate" : null].filter(Boolean).join(", "),
      path: r.variant?.path ?? null,
      variant: r.variant?.name ?? null,
    });
  }
  const a = headline.quickest_0_60 ?? null;
  const a100 = headline.quickest_0_100 ?? null;
  if (a?.value) {
    items.push({ label: "0–60 mph", value: `${num(a.value, 2)} s`, note: null, path: a.variant?.path ?? null, variant: a.variant?.name ?? null });
  } else if (a100?.value) {
    items.push({ label: "0–100 km/h", value: `${num(a100.value, 2)} s`, note: null, path: a100.variant?.path ?? null, variant: a100.variant?.name ?? null });
  }
  if (!items.length) return null;
  return (
    <Wrap spacing={3}>
      {items.map((it) => (
        <WrapItem key={it.label} flexDirection="column" minW="140px" maxW="100%">
          <HStack spacing={1} align="baseline">
            <Text fontSize="xs" color={sub}>
              {it.label}
            </Text>
            <Text fontWeight="700" fontSize="lg" color="green.500">
              {it.value}
            </Text>
          </HStack>
          <Text fontSize="xs" color={sub} noOfLines={2}>
            {it.variant && it.path ? (
              <Link as={RouterLink} to={it.path} textDecoration="underline">
                {it.variant}
              </Link>
            ) : (
              it.variant
            )}
            {it.note ? `${it.variant ? " · " : ""}${it.note}` : ""}
          </Text>
        </WrapItem>
      ))}
    </Wrap>
  );
}
