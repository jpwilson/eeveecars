import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Badge,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Link,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaArrowLeft, FaGlobe, FaMapMarkerAlt, FaCalendarAlt, FaIndustry } from "react-icons/fa";
import NavBar from "../components/NavBar";
import CarCard from "../components/CarCard";
import CarCardContainer from "../components/CarCardContainer";
import useMakes from "../hooks/useMakes";
import useCars from "../hooks/useCars";
import { makeNameMatchesSlug } from "../utils/makeSlug";

const statusColors: Record<string, string> = {
  active: "green",
  defunct: "red",
  acquired: "orange",
  "pre-production": "blue",
};

function ManufacturerPage() {
  const { make_name } = useParams<{ make_name: string }>();
  const { data: allMakes, isLoading, error } = useMakes();

  const make = allMakes?.find((m) =>
    makeNameMatchesSlug(m.name, make_name ?? "")
  ) ?? null;

  const { data: cars, isLoading: carsLoading } = useCars(make);

  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.75)",
    "rgba(45, 55, 72, 0.8)"
  );
  const borderColor = useColorModeValue(
    "rgba(22, 163, 74, 0.12)",
    "rgba(22, 163, 74, 0.25)"
  );
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const heroBgOpacity = useColorModeValue(0.04, 0.06);
  const infoBg = useColorModeValue("gray.50", "gray.700");

  if (isLoading) {
    return (
      <Box minH="100vh">
        <NavBar />
        <Box maxW="1200px" mx="auto" p={{ base: 4, md: 6 }}>
          <Skeleton height="40px" width="300px" mb={4} />
          <Skeleton height="200px" mb={4} />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="280px" borderRadius="16px" />
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh">
        <NavBar />
        <Box maxW="1200px" mx="auto" p={6}>
          <Text>Error: {error}</Text>
        </Box>
      </Box>
    );
  }

  if (!make) {
    return (
      <Box minH="100vh">
        <NavBar />
        <Box maxW="1200px" mx="auto" p={6}>
          <Text>Manufacturer not found.</Text>
        </Box>
      </Box>
    );
  }

  const statusColor = statusColors[make.status ?? "active"] ?? "gray";

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Subtle background */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        width="120%"
        height="120%"
        transform="translate(-50%, -50%)"
        pointerEvents="none"
        zIndex={0}
        opacity={heroBgOpacity}
      >
        <Image
          src="/pub_assets/hero-ev.png"
          alt=""
          width="100%"
          height="100%"
          objectFit="contain"
          objectPosition="center"
        />
      </Box>

      <Box position="relative" zIndex={1}>
        <NavBar />

        <Box maxW="1200px" mx="auto" p={{ base: 4, md: 6 }}>
          {/* Back button */}
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FaArrowLeft />}
              color={subTextColor}
              mb={4}
              _hover={{ color: "#16a34a" }}
            >
              Back to all EVs
            </Button>
          </Link>

          {/* Header card */}
          <Box
            bg={cardBg}
            backdropFilter="blur(16px)"
            borderRadius="16px"
            border="1px solid"
            borderColor={borderColor}
            p={{ base: 4, md: 6 }}
            mb={6}
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "flex-start" }}
              gap={5}
            >
              {/* Logo — links to company website if available */}
              {make.website_url ? (
                <Link href={make.website_url} isExternal>
                  <Image
                    src={make.lrg_logo_img_url}
                    alt={make.name}
                    boxSize={{ base: "80px", md: "100px" }}
                    objectFit="contain"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="12px"
                    p={2}
                    cursor="pointer"
                    _hover={{ borderColor: "#16a34a" }}
                    transition="border-color 0.2s"
                  />
                </Link>
              ) : (
                <Image
                  src={make.lrg_logo_img_url}
                  alt={make.name}
                  boxSize={{ base: "80px", md: "100px" }}
                  objectFit="contain"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="12px"
                  p={2}
                />
              )}

              {/* Info */}
              <VStack align={{ base: "center", md: "flex-start" }} spacing={2} flex={1}>
                <HStack spacing={3}>
                  <Heading size="lg" color={textColor}>
                    {make.name}
                  </Heading>
                  <Badge
                    colorScheme={statusColor}
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {make.status ?? "active"}
                  </Badge>
                </HStack>

                {make.status_details && (
                  <Text fontSize="sm" color="orange.500" fontStyle="italic">
                    {make.status_details}
                  </Text>
                )}

                {make.description && (
                  <Text fontSize="sm" color={subTextColor} maxW="700px">
                    {make.description}
                  </Text>
                )}

                {/* Quick facts */}
                <HStack spacing={4} flexWrap="wrap" pt={1}>
                  {make.headquarters && (
                    <HStack spacing={1} fontSize="sm" color={subTextColor}>
                      <FaMapMarkerAlt />
                      <Text>{make.headquarters}</Text>
                    </HStack>
                  )}
                  {make.founding_date && (
                    <HStack spacing={1} fontSize="sm" color={subTextColor}>
                      <FaCalendarAlt />
                      <Text>Founded {make.founding_date}</Text>
                    </HStack>
                  )}
                  {make.country && (
                    <HStack spacing={1} fontSize="sm" color={subTextColor}>
                      <FaIndustry />
                      <Text>{make.country}</Text>
                    </HStack>
                  )}
                  {make.website_url && (
                    <Link href={make.website_url} isExternal>
                      <HStack spacing={1} fontSize="sm" color="#16a34a" _hover={{ textDecoration: "underline" }}>
                        <FaGlobe />
                        <Text>Website</Text>
                      </HStack>
                    </Link>
                  )}
                </HStack>
              </VStack>
            </Flex>

            {/* Stats row */}
            {(make.market_cap || make.revenue || make.num_ev_model) && (
              <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                gap={3}
                mt={5}
                pt={4}
                borderTop="1px solid"
                borderColor={borderColor}
              >
                {make.market_cap && (
                  <GridItem>
                    <Box bg={infoBg} borderRadius="10px" p={3} textAlign="center">
                      <Text fontSize="xs" color={subTextColor} fontWeight="500">
                        Market Cap
                      </Text>
                      <Text fontSize="md" fontWeight="700" color={textColor}>
                        ${(make.market_cap / 1e9).toFixed(1)}B
                      </Text>
                    </Box>
                  </GridItem>
                )}
                {make.revenue && (
                  <GridItem>
                    <Box bg={infoBg} borderRadius="10px" p={3} textAlign="center">
                      <Text fontSize="xs" color={subTextColor} fontWeight="500">
                        Revenue
                      </Text>
                      <Text fontSize="md" fontWeight="700" color={textColor}>
                        ${(make.revenue / 1e9).toFixed(1)}B
                      </Text>
                    </Box>
                  </GridItem>
                )}
                {make.num_ev_model && (
                  <GridItem>
                    <Box bg={infoBg} borderRadius="10px" p={3} textAlign="center">
                      <Text fontSize="xs" color={subTextColor} fontWeight="500">
                        EV Models
                      </Text>
                      <Text fontSize="md" fontWeight="700" color={textColor}>
                        {make.num_ev_model}
                      </Text>
                    </Box>
                  </GridItem>
                )}
                {make.first_ev_model_date && (
                  <GridItem>
                    <Box bg={infoBg} borderRadius="10px" p={3} textAlign="center">
                      <Text fontSize="xs" color={subTextColor} fontWeight="500">
                        First EV
                      </Text>
                      <Text fontSize="md" fontWeight="700" color={textColor}>
                        {make.first_ev_model_date}
                      </Text>
                    </Box>
                  </GridItem>
                )}
              </Grid>
            )}
          </Box>

          {/* Cars section */}
          <Heading size="md" color={textColor} mb={4}>
            {make.name} Electric Vehicles
          </Heading>

          {carsLoading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="280px" borderRadius="16px" />
              ))}
            </SimpleGrid>
          ) : cars && cars.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={3}>
              {cars.map((car) => (
                <CarCardContainer key={car.id}>
                  <CarCard car={car} />
                </CarCardContainer>
              ))}
            </SimpleGrid>
          ) : (
            <Text color={subTextColor}>
              No electric vehicles found for {make.name}.
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ManufacturerPage;
