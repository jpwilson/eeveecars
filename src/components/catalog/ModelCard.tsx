import { memo } from "react";
import { Box, LinkBox, LinkOverlay, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CatalogModelCard } from "../../types/catalog";
import CatalogImage from "./CatalogImage";
import StatusBadge from "./StatusBadge";
import { formatPriceFigure, formatRangeFigure, formatYears, modelDisplayName } from "../../utils/catalogFormat";

interface Props {
  model: CatalogModelCard;
  /** hide the make name (on a make's own page) */
  hideMake?: boolean;
}

/** Compact photo card for dense grids (/cars, make pages). */
function ModelCard({ model, hideMake = false }: Props) {
  const bg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(45, 55, 72, 0.85)");
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  const hoverBorder = useColorModeValue("rgba(22, 163, 74, 0.4)", "rgba(22, 163, 74, 0.55)");
  const sub = useColorModeValue("gray.500", "gray.400");
  const text = useColorModeValue("gray.800", "gray.100");

  const status = model.market_status ?? model.status;
  const price = formatPriceFigure(model.from_price);
  const range = formatRangeFigure(model.max_range);
  const years = formatYears(model.years, model.status);
  const title = hideMake ? model.name ?? "" : modelDisplayName(model.make?.name, model.name);

  return (
    <LinkBox
      as="article"
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="14px"
      overflow="hidden"
      transition="border-color 0.2s, box-shadow 0.2s, transform 0.2s"
      _hover={{ borderColor: hoverBorder, boxShadow: "0 8px 28px rgba(22, 163, 74, 0.12)", transform: "translateY(-2px)" }}
      minW={0}
    >
      <Box position="relative">
        <CatalogImage image={model.image} fallbackAlt={title} placeholder="No photo yet" />
        {status && status !== "current" && (
          <StatusBadge status={status} position="absolute" top={2} left={2} boxShadow="sm" />
        )}
      </Box>
      <Box px={3} py={2.5}>
        <LinkOverlay as={RouterLink} to={model.path}>
          <Text fontWeight="600" fontSize="sm" color={text} noOfLines={1} title={title}>
            {title}
          </Text>
        </LinkOverlay>
        <Text fontSize="xs" color={sub} noOfLines={1}>
          {[years, model.make?.brand_status === "defunct" ? "defunct brand" : null].filter(Boolean).join(" · ") || " "}
        </Text>
        <Box mt={1.5} fontSize="xs" minW={0}>
          <Text fontWeight="700" color={price ? "green.500" : sub} noOfLines={1}>
            {price ? `${status === "discontinued" || status === "cancelled" ? "Was from" : "From"} ${price}` : "Price n/a"}
          </Text>
          <Text color={sub} noOfLines={1}>
            {range ? `Up to ${range}` : "\u00a0"}
          </Text>
        </Box>
      </Box>
    </LinkBox>
  );
}

export default memo(ModelCard);
