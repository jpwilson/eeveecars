import { ReactNode, useMemo, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Select,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import GlassCard from "./GlassCard";
import { MarketPicker } from "./GenerationBits";
import { BUY_ASSUMPTIONS } from "../../data/buyAssumptions";
import {
  BuyBlockModel,
  BuyInput,
  ChargingBasis,
  PaymentBasis,
  chargingEstimate,
  deriveBuyBlock,
  loanEstimate,
  parseNum,
} from "../../utils/buyMath";
import { formatPartialDate, marketLabel, num, priceBasisLabel } from "../../utils/catalogFormat";
import { track } from "../../utils/analytics";

type Props = Omit<BuyInput, "market" | "trim"> & {
  /** label for analytics: "model" or "variant" page */
  page: "model" | "variant";
};

/** Money with a fixed number of decimals, in the value's own currency. */
function money(value: number | null | undefined, currency: string | null | undefined, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  if (!currency) return value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${value.toFixed(digits)} ${currency}`;
  }
}

function currencySymbol(currency: string | null) {
  if (!currency) return "";
  try {
    const part = new Intl.NumberFormat("en-US", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <FormControl>
      <FormLabel fontSize="xs" mb={1} color="gray.500">
        {label}
      </FormLabel>
      {children}
    </FormControl>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <Field label={label}>
      <InputGroup size="sm">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          borderRadius="8px"
          aria-label={label}
        />
        {suffix && <InputRightAddon borderRadius="8px">{suffix}</InputRightAddon>}
      </InputGroup>
      {hint && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {hint}
        </Text>
      )}
    </Field>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  const border = useColorModeValue("rgba(22, 163, 74, 0.15)", "rgba(22, 163, 74, 0.3)");
  const bg = useColorModeValue("rgba(22, 163, 74, 0.03)", "rgba(22, 163, 74, 0.06)");
  return (
    <Box border="1px solid" borderColor={border} bg={bg} borderRadius="12px" p={{ base: 3, md: 4 }} minW={0}>
      <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" color="gray.500" mb={1}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

function PaymentPanel({ basis }: { basis: PaymentBasis }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const { isOpen, onToggle } = useDisclosure();
  const L = BUY_ASSUMPTIONS.loan;
  const [price, setPrice] = useState(String(basis.price));
  const [down, setDown] = useState(String(Math.round((basis.price * L.downPct) / 100)));
  const [downTouched, setDownTouched] = useState(false);
  const [apr, setApr] = useState(L.aprPct.toFixed(1));
  const [term, setTerm] = useState(L.termMonths);

  const priceN = parseNum(price);
  const downN = downTouched ? parseNum(down) ?? 0 : priceN !== null ? Math.round((priceN * L.downPct) / 100) : null;
  const est = loanEstimate(priceN, downN, parseNum(apr), term);
  const c = basis.currency;
  const sym = currencySymbol(c);

  const priceLine = [
    `${money(basis.price, c)}`,
    priceBasisLabel(basis.basis),
    basis.modelYear ? `${basis.modelYear} model year` : null,
    basis.isLaunchPrice ? "launch price" : null,
    basis.isEstimate ? "manufacturer estimate" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Panel title="Monthly payment estimate">
      {est ? (
        <>
          <HStack spacing={1} align="baseline">
            <Text fontSize="2xl" fontWeight="800" color="green.500" lineHeight="1.2">
              {money(est.monthly, c)}
            </Text>
            <Text fontSize="sm" color={sub}>
              /month
            </Text>
          </HStack>
          <Text fontSize="sm" color={sub}>
            {term} months at {num(parseNum(apr), 2)}% APR, {money(downN, c)} down · total interest {money(est.totalInterest, c)}
          </Text>
        </>
      ) : (
        <Text fontSize="sm" color={sub}>
          Enter a price, down payment, rate and term to see an estimate.
        </Text>
      )}
      <Button size="xs" variant="link" colorScheme="green" mt={2} onClick={onToggle} aria-expanded={isOpen}>
        {isOpen ? "Hide the numbers" : "Change the numbers"}
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <SimpleGrid columns={2} spacing={2} mt={2}>
          <NumberField label={`Price (${sym})`} value={price} onChange={setPrice} />
          <NumberField
            label={`Down payment (${sym})`}
            value={downTouched ? down : downN !== null ? String(downN) : ""}
            onChange={(v) => {
              setDownTouched(true);
              setDown(v);
            }}
          />
          <NumberField label="APR" value={apr} onChange={setApr} suffix="%" hint="Example rate; enter your own." />
          <Field label="Term">
            <Select size="sm" borderRadius="8px" value={term} onChange={(e) => setTerm(Number(e.target.value))} aria-label="Term">
              {L.terms.map((t) => (
                <option key={t} value={t}>
                  {t} months
                </option>
              ))}
            </Select>
          </Field>
        </SimpleGrid>
      </Collapse>
      <Text fontSize="xs" color={sub} mt={2}>
        Price used: {priceLine}. {L.aprPct.toFixed(1)}% APR is an example rate, not a quote. Excludes taxes, registration, fees and
        incentives. Estimate only, not a credit offer.
      </Text>
    </Panel>
  );
}

function ChargingPanel({
  basis,
  market,
  currency,
  prefilled,
}: {
  basis: ChargingBasis;
  market: string | null;
  currency: string | null;
  prefilled: BuyBlockModel["electricity"];
}) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const { isOpen, onToggle } = useDisclosure();
  const unit = basis.unit;
  const [loss, setLoss] = useState(String(BUY_ASSUMPTIONS.chargingLossPct));
  const [distance, setDistance] = useState(String(BUY_ASSUMPTIONS.yearlyDistance[unit]));
  const [elec, setElec] = useState(prefilled ? String(prefilled.pricePerKwh) : "");
  const elecN = parseNum(elec);
  const est = chargingEstimate({
    batteryKwh: basis.batteryKwh,
    range: basis.range,
    lossPct: parseNum(loss),
    pricePerKwh: elecN,
    yearlyDistance: parseNum(distance),
  });
  const sym = currencySymbol(currency);
  const elecLabel = currency ? `Electricity (${sym} per kWh)` : "Electricity (price per kWh)";
  const usingPrefilled = !!prefilled && elecN === prefilled.pricePerKwh;
  const distN = parseNum(distance);

  const batteryNote =
    basis.batteryBasis === "gross"
      ? "The battery figure is gross capacity, so this overstates energy use a little."
      : basis.batteryBasis === "usable"
      ? null
      : "The source doesn't say whether the battery figure is gross or usable; a gross figure overstates energy use.";

  const elecInput = (
    <NumberField label={elecLabel} value={elec} onChange={setElec} />
  );

  return (
    <Panel title="Charging cost estimate">
      {est && est.costPer100 !== null ? (
        <>
          <HStack spacing={1} align="baseline">
            <Text fontSize="2xl" fontWeight="800" color="green.500" lineHeight="1.2">
              {money(est.costPer100, currency, 2)}
            </Text>
            <Text fontSize="sm" color={sub}>
              per 100 {unit}
            </Text>
          </HStack>
          <Text fontSize="sm" color={sub}>
            {num(est.kwhPer100, 1)} kWh per 100 {unit}
            {est.yearlyCost !== null && distN ? ` · about ${money(est.yearlyCost, currency)} a year at ${distN.toLocaleString("en-US")} ${unit} (assumed)` : ""}
          </Text>
        </>
      ) : est ? (
        <>
          <HStack spacing={1} align="baseline">
            <Text fontSize="2xl" fontWeight="800" color="green.500" lineHeight="1.2">
              {num(est.kwhPer100, 1)} kWh
            </Text>
            <Text fontSize="sm" color={sub}>
              per 100 {unit}
            </Text>
          </HStack>
          <Text fontSize="sm" color={sub} mb={2}>
            Enter your electricity price to see the cost.
          </Text>
          {elecInput}
        </>
      ) : (
        <Text fontSize="sm" color={sub}>
          Enter a charging loss between 0 and 100%.
        </Text>
      )}
      {usingPrefilled && prefilled && (
        <Text fontSize="xs" color={sub} mt={1}>
          At {money(prefilled.pricePerKwh, prefilled.currency, 4)} per kWh, the {prefilled.label} ({prefilled.period},{" "}
          <Link href={prefilled.url} isExternal rel="noopener noreferrer" textDecoration="underline">
            {prefilled.source}
          </Link>
          ).
        </Text>
      )}
      <Button size="xs" variant="link" colorScheme="green" mt={2} onClick={onToggle} aria-expanded={isOpen}>
        {isOpen ? "Hide the numbers" : "Change the numbers"}
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <SimpleGrid columns={2} spacing={2} mt={2}>
          {!(est && est.costPer100 === null) && elecInput}
          <NumberField label="Charging loss" value={loss} onChange={setLoss} suffix="%" />
          <NumberField label={`Distance a year (assumed)`} value={distance} onChange={setDistance} suffix={unit} />
        </SimpleGrid>
      </Collapse>
      <Text fontSize="xs" color={sub} mt={2}>
        From the {num(basis.batteryKwh)} kWh battery and {basis.range.toLocaleString("en-US")} {unit} {basis.cycle} range
        {market ? ` (${market}${basis.modelYear ? `, ${basis.modelYear} model year` : ""}${basis.isEstimate ? ", manufacturer estimate" : ""})` : ""}, plus{" "}
        {num(parseNum(loss)) ?? "—"}% charging loss. Rated range overstates real-world use, especially in cold weather and at
        highway speed. {batteryNote}
      </Text>
    </Panel>
  );
}

/**
 * "Before you buy": official link, monthly payment estimate, charging cost and, for the
 * US, the dated federal-credit sentence. `deriveBuyBlock` decides what shows; nothing
 * usable → nothing rendered. No figures here go into crawler HTML or JSON-LD.
 */
export default function BuyBlock(props: Props) {
  const sub = useColorModeValue("gray.600", "gray.400");
  const [market, setMarket] = useState<string | null>(null);
  const [trim, setTrim] = useState<string | null>(null);
  const block = useMemo(
    () => deriveBuyBlock({ ...props, market, trim }, BUY_ASSUMPTIONS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.trims, props.model, props.make, props.displayName, props.preferredMarket, props.preferredTrim, market, trim]
  );
  if (!block) return null;
  const { link } = block;
  const hasFigures = !!(block.payment || block.charging || block.chargingNote);
  const panelKey = `${block.market}-${block.trim}`;
  const trimName = block.trims.find((t) => t.slug === block.trim)?.name;

  return (
    <GlassCard as="section" aria-label="Before you buy" p={{ base: 4, md: 5 }}>
      <VStack align="stretch" spacing={3}>
        <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={3} direction={{ base: "column", md: "row" }}>
          <Heading as="h2" size="md">
            Before you buy
          </Heading>
          {link && (
            <Box textAlign={{ base: "left", md: "right" }}>
              <Button
                as="a"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="green"
                borderRadius="full"
                size="md"
                w={{ base: "100%", md: "auto" }}
                rightIcon={<ExternalLinkIcon />}
                onClick={() =>
                  track("external_link_clicked", {
                    link_type: link.kind === "make" ? "make_site" : "model_page",
                    placement: `buy_block_${props.page}`,
                    model: props.displayName,
                    destination: link.href,
                  })
                }
              >
                {link.label}
              </Button>
              <Text fontSize="xs" color={sub} mt={1}>
                {link.kind === "make" ? "The maker's website" : `on ${link.domain}`}
                {link.note ? ` · ${link.note}` : ""}
              </Text>
            </Box>
          )}
        </Flex>

        {hasFigures && (block.markets.length > 1 || block.trims.length > 1) && (
          <Flex gap={2} align="center" flexWrap="wrap">
            <MarketPicker markets={block.markets} value={block.market} onChange={(m) => { setMarket(m); setTrim(null); }} />
            {block.trims.length > 1 && (
              <Select
                size="sm"
                borderRadius="8px"
                maxW={{ base: "100%", sm: "280px" }}
                value={block.trim ?? ""}
                onChange={(e) => setTrim(e.target.value)}
                aria-label="Trim"
              >
                {block.trims.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name ?? t.slug}
                  </option>
                ))}
              </Select>
            )}
          </Flex>
        )}
        {hasFigures && block.trims.length <= 1 && block.markets.length <= 1 && trimName && (
          <Text fontSize="xs" color={sub}>
            {trimName}
            {block.market ? `, ${marketLabel(block.market)}` : ""}
          </Text>
        )}

        {(block.payment || block.charging) && (
          <SimpleGrid columns={{ base: 1, md: block.payment && block.charging ? 2 : 1 }} spacing={3}>
            {block.payment && <PaymentPanel key={`p-${panelKey}`} basis={block.payment} />}
            {block.charging && (
              <ChargingPanel
                key={`c-${panelKey}`}
                basis={block.charging}
                market={block.market}
                currency={block.energyCurrency}
                prefilled={block.electricity}
              />
            )}
          </SimpleGrid>
        )}
        {block.chargingNote && (
          <Text fontSize="xs" color={sub}>
            {block.chargingNote}
          </Text>
        )}
        {block.credit && (
          <Text fontSize="xs" color={sub}>
            US federal tax credit: {block.credit.text} {block.credit.incentives} Source:{" "}
            <Link href={block.credit.url} isExternal rel="noopener noreferrer" textDecoration="underline">
              IRS
            </Link>{" "}
            (checked {formatPartialDate(block.credit.checked)}).
          </Text>
        )}
      </VStack>
    </GlassCard>
  );
}
