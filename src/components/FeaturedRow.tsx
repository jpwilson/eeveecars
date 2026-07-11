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
import useData from "../hooks/useData";
import { Car } from "../hooks/useCars";
import CarCard from "./CarCard";

/**
 * "Top Picks" — the homepage's featured slot. Currently editorial (top-rated
 * available models); designed to become the paid Featured Vehicle placement
 * sold on /advertise. The "Sponsor this spot" link is the storefront hook.
 */
export default function FeaturedRow() {
  const { data, isLoading } = useData<Car>("/cars/cards");
  const subText = useColorModeValue("gray.600", "gray.400");

  if (isLoading) return null;

  const picks = data
    .filter(
      (c) =>
        c.average_rating &&
        c.image_url &&
        c.availability_desc !== "previous_generation" &&
        c.availability_desc !== "discontinued" &&
        c.availability_desc !== "Not yet released"
    )
    .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
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
            highest-rated EVs right now
          </Text>
        </HStack>
        <ChakraLink
          as={RouterLink}
          to="/advertise"
          fontSize="xs"
          color={subText}
          _hover={{ color: "green.500" }}
        >
          Sponsor this spot →
        </ChakraLink>
      </HStack>
      <SimpleGrid columns={3} spacing={4} display={{ base: "none", md: "grid" }}>
        {picks.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
