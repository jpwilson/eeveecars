import {
  Box,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useHomeCatalog } from "../hooks/useHomeCars";
import { popularityRank } from "../data/popularity";
import CarCard from "./CarCard";
import { track } from "../utils/analytics";

/**
 * "Top Picks": the homepage's featured slot. Editorial (the most popular
 * models on sale in the selected market, with a photo); designed to become the
 * paid Featured Vehicle placement sold on /advertise.
 */
export default function FeaturedRow({ market }: { market: string }) {
  const { cars, isLoading } = useHomeCatalog(market);
  const subText = useColorModeValue("gray.600", "gray.400");

  if (isLoading) return null;

  const picks = cars
    .filter(
      (c) =>
        c.catalog?.image?.url &&
        (c.catalog.market_status ?? c.catalog.status) === "current" &&
        !c.catalog.is_commercial &&
        c.current_price
    )
    .sort(
      (a, b) =>
        popularityRank(a.make_model_slug, a.catalog?.make?.slug) -
        popularityRank(b.make_model_slug, b.catalog?.make?.slug)
    )
    .slice(0, 3);

  if (picks.length < 3) return null;

  return (
    <Box mx={{ base: 4, md: 10 }} mb={2}>
      <HStack justify="space-between" align="baseline" mb={3}>
        <HStack spacing={2}>
          <Icon as={FaStar} color="yellow.400" boxSize={4} />
          <Heading as="h2" size="sm" letterSpacing="-0.01em">
            Top Picks
          </Heading>
          <Text fontSize="xs" color={subText}>
            popular EVs on sale now
          </Text>
        </HStack>
        <ChakraLink
          as={RouterLink}
          to="/advertise"
          fontSize="xs"
          color={subText}
          _hover={{ color: "green.500" }}
          onClick={() => track("sponsor_spot_click", { location: "home_featured" })}
        >
          Sponsor this spot →
        </ChakraLink>
      </HStack>
      <SimpleGrid columns={3} spacing={4} display={{ base: "none", md: "grid" }}>
        {picks.map((car) => (
          <Box
            key={car.make_model_slug}
            onClickCapture={() =>
              track("featured_card_click", { slug: car.make_model_slug })
            }
          >
            <CarCard car={car} />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
