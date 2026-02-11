import React, { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import useCarDetail from "../hooks/useCarDetails";
import useMakes from "../hooks/useMakes";
import { formatPrice } from "../utils/formatPrice";
import { makeNameToSlug } from "../utils/makeSlug";
import {
  Box,
  Collapse,
  Flex,
  Image,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Button,
  Icon,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Heading,
  SimpleGrid,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaYoutube,
  FaGlobe,
  FaSearchPlus,
  FaTachometerAlt,
  FaShieldAlt,
  FaStar,
  FaBatteryFull,
  FaPlug,
  FaCar,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import NavBar from "./NavBar";

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;

  const [showMore, setShowMore] = useState(false);
  const {
    isOpen: isLightboxOpen,
    onOpen: onLightboxOpen,
    onClose: onLightboxClose,
  } = useDisclosure();

  const { data: makes } = useMakes();

  if (numericId === null) {
    return (
      <Box minH="100vh" p={8}>
        <Text>No car ID was provided in the URL.</Text>
      </Box>
    );
  }

  const { car, error, isLoading } = useCarDetail(numericId);

  // Glassmorphism color tokens
  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.7)",
    "rgba(45, 55, 72, 0.8)"
  );
  const borderColor = useColorModeValue(
    "rgba(22, 163, 74, 0.12)",
    "rgba(22, 163, 74, 0.25)"
  );
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const linkColor = useColorModeValue("#16a34a", "#4ec77f");
  const specLabelColor = useColorModeValue("gray.500", "gray.400");
  const specValueColor = useColorModeValue("gray.800", "gray.100");
  const sectionIconColor = useColorModeValue("#16a34a", "#4ec77f");
  const reviewCardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.5)",
    "rgba(45, 55, 72, 0.6)"
  );

  if (isLoading)
    return (
      <Box minH="100vh" p={8}>
        <Text>Loading...</Text>
      </Box>
    );
  if (error)
    return (
      <Box minH="100vh" p={8}>
        <Text>Error: {error}</Text>
      </Box>
    );
  if (!car)
    return (
      <Box minH="100vh" p={8}>
        <Text>Car not found.</Text>
      </Box>
    );

  const make = makes.find((m) => m.id === car.make_id);
  const logoUrl = make?.lrg_logo_img_url;
  const makeSlug = makeNameToSlug(car.make_name);

  return (
    <Box minH="100vh">
      <NavBar />
      <Box maxW="1200px" mx="auto" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={6}>
          {/* Header: Logo + Name + Navigation */}
          <HStack
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
          >
            <HStack spacing={3}>
              {logoUrl && (
                <Link
                  as={RouterLink}
                  to={`/manufacturer/${makeSlug}`}
                  _hover={{ textDecoration: "none" }}
                >
                  <Image
                    src={logoUrl}
                    alt={`${car.make_name} logo`}
                    boxSize="50px"
                    objectFit="contain"
                    cursor="pointer"
                    _hover={{ opacity: 0.8 }}
                    transition="opacity 0.2s"
                  />
                </Link>
              )}
              <VStack align="start" spacing={0}>
                <Heading
                  fontSize={{ base: "xl", md: "3xl" }}
                  color={textColor}
                >
                  {car.make_name} {car.model} {car.submodel}
                </Heading>
                {car.generation && (
                  <Text fontSize="sm" color={subTextColor}>
                    {car.generation}
                    {car.vehicle_class ? ` · ${car.vehicle_class}` : ""}
                  </Text>
                )}
              </VStack>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              <Link
                as={RouterLink}
                to={`/model_detail/${car.make_model_slug}`}
                _hover={{ textDecoration: "none" }}
              >
                <Button
                  size="sm"
                  bg="white"
                  color="#16a34a"
                  border="1px solid"
                  borderColor="rgba(22, 163, 74, 0.25)"
                  borderRadius="10px"
                  fontWeight="500"
                  _hover={{
                    bg: "rgba(22, 163, 74, 0.06)",
                    borderColor: "green.400",
                  }}
                >
                  All {car.model} variants
                </Button>
              </Link>
              <Link
                as={RouterLink}
                to={`/manufacturer/${makeSlug}`}
                _hover={{ textDecoration: "none" }}
              >
                <Button
                  size="sm"
                  bg="white"
                  color="#16a34a"
                  border="1px solid"
                  borderColor="rgba(22, 163, 74, 0.25)"
                  borderRadius="10px"
                  fontWeight="500"
                  _hover={{
                    bg: "rgba(22, 163, 74, 0.06)",
                    borderColor: "green.400",
                  }}
                >
                  {car.make_name}
                </Button>
              </Link>
              <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
                <Button
                  size="sm"
                  bg="white"
                  color="#16a34a"
                  border="1px solid"
                  borderColor="rgba(22, 163, 74, 0.25)"
                  borderRadius="10px"
                  fontWeight="500"
                  _hover={{
                    bg: "rgba(22, 163, 74, 0.06)",
                    borderColor: "green.400",
                  }}
                >
                  Back to results
                </Button>
              </Link>
            </HStack>
          </HStack>

          {/* Hero: Image + Overview */}
          <Grid
            templateColumns={{ md: "1fr 2fr", base: "1fr" }}
            gap={6}
            alignItems="start"
          >
            {/* Car image with lightbox */}
            <GridItem>
              <Box
                borderRadius="16px"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
                backdropFilter="blur(16px)"
                cursor="pointer"
                position="relative"
                role="group"
                onClick={onLightboxOpen}
              >
                <Image
                  src={car.image_url}
                  alt={`${car.make_name} ${car.model} ${car.submodel}`}
                  maxH={{ base: "auto", md: "400px" }}
                  objectFit="contain"
                  w="100%"
                />
                <Flex
                  position="absolute"
                  bottom={3}
                  right={3}
                  bg="blackAlpha.600"
                  borderRadius="full"
                  p={2}
                  opacity={0}
                  _groupHover={{ opacity: 0.8 }}
                  transition="opacity 0.2s"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaSearchPlus} color="white" boxSize={4} />
                </Flex>
              </Box>
            </GridItem>

            {/* Overview + Key Specs */}
            <GridItem>
              <VStack spacing={5} align="stretch">
                {/* Price highlight */}
                <Box
                  bg={cardBg}
                  backdropFilter="blur(16px)"
                  borderRadius="16px"
                  border="1px solid"
                  borderColor={borderColor}
                  p={5}
                  boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
                >
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color={specLabelColor} fontWeight="500">
                        Starting Price
                      </Text>
                      <Text
                        fontSize="3xl"
                        fontWeight="700"
                        color={textColor}
                        letterSpacing="-0.02em"
                      >
                        {formatPrice(car.current_price)}
                      </Text>
                    </VStack>
                    <SimpleGrid columns={3} spacing={6}>
                      <VStack spacing={0} align="center">
                        <Text
                          fontSize="xl"
                          fontWeight="700"
                          color={textColor}
                        >
                          {car.epa_range}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={specLabelColor}
                          fontWeight="500"
                        >
                          mi range
                        </Text>
                      </VStack>
                      <VStack spacing={0} align="center">
                        <Text
                          fontSize="xl"
                          fontWeight="700"
                          color={textColor}
                        >
                          {car.acceleration_0_60}s
                        </Text>
                        <Text
                          fontSize="xs"
                          color={specLabelColor}
                          fontWeight="500"
                        >
                          0-60 mph
                        </Text>
                      </VStack>
                      <VStack spacing={0} align="center">
                        <Text
                          fontSize="xl"
                          fontWeight="700"
                          color={textColor}
                        >
                          {car.top_speed}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={specLabelColor}
                          fontWeight="500"
                        >
                          mph top
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </HStack>
                </Box>

                {/* Description */}
                {car.car_description && (
                  <Box>
                    <Heading size="sm" color={textColor} mb={2}>
                      About this variant
                    </Heading>
                    <Collapse startingHeight={48} in={showMore}>
                      <Text color={subTextColor} lineHeight="1.7" fontSize="sm">
                        {car.car_description}
                      </Text>
                    </Collapse>
                    <Text
                      color={linkColor}
                      mt={1}
                      fontWeight="500"
                      cursor="pointer"
                      onClick={() => setShowMore(!showMore)}
                      fontSize="sm"
                    >
                      {showMore ? "Read Less" : "Read More..."}
                    </Text>
                  </Box>
                )}
              </VStack>
            </GridItem>
          </Grid>

          {/* Spec Cards Grid */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {/* Performance Card */}
            <SpecCard
              title="Performance"
              icon={FaTachometerAlt}
              bg={cardBg}
              borderColor={borderColor}
              iconColor={sectionIconColor}
              titleColor={textColor}
            >
              <SpecRow label="0-60 mph" value={car.acceleration_0_60 ? `${car.acceleration_0_60}s` : "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
              <SpecRow label="Top Speed" value={car.top_speed ? `${car.top_speed} mph` : "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
              <SpecRow label="Power" value={car.power ? `${car.power} hp` : "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
              <SpecRow label="Torque" value={car.torque ? `${car.torque} lb-ft` : "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
              <SpecRow label="Drive Type" value={car.drive_type || "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
            </SpecCard>

            {/* Battery & Charging Card */}
            <SpecCard
              title="Battery & Charging"
              icon={FaBatteryFull}
              bg={cardBg}
              borderColor={borderColor}
              iconColor={sectionIconColor}
              titleColor={textColor}
            >
              <SpecRow label="Battery" value={car.battery_capacity ? `${car.battery_capacity} kWh` : "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
              <SpecRow label="Max Charge Rate" value={car.battery_max_charging_speed ? `${car.battery_max_charging_speed} kW` : "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
              <SpecRow label="EPA Range" value={car.epa_range ? `${car.epa_range} mi` : "N/A"} labelColor={specLabelColor} valueColor={specValueColor} />
              {car.chargers && car.chargers.length > 0 && (
                <HStack justify="space-between" w="full" py={1}>
                  <HStack spacing={2}>
                    <Icon as={FaPlug} boxSize={3} color={specLabelColor} />
                    <Text fontSize="sm" color={specLabelColor} fontWeight="500">
                      Connectors
                    </Text>
                  </HStack>
                  <HStack spacing={1} flexWrap="wrap" justify="flex-end">
                    {car.chargers.map((c: string, i: number) => (
                      <Badge
                        key={i}
                        fontSize="xs"
                        colorScheme="green"
                        variant="subtle"
                        borderRadius="6px"
                        px={2}
                      >
                        {c}
                      </Badge>
                    ))}
                  </HStack>
                </HStack>
              )}
            </SpecCard>

            {/* Safety Card */}
            <SpecCard
              title="Safety"
              icon={FaShieldAlt}
              bg={cardBg}
              borderColor={borderColor}
              iconColor={sectionIconColor}
              titleColor={textColor}
            >
              <SpecRow
                label="NHTSA Rating"
                value={car.nhtsa_rating ? `${car.nhtsa_rating} / 5 Stars` : "Not rated"}
                labelColor={specLabelColor}
                valueColor={specValueColor}
              />
              <SpecRow
                label="Euro NCAP"
                value={car.euroncap_rating ? `${car.euroncap_rating} / 5 Stars` : "Not rated"}
                labelColor={specLabelColor}
                valueColor={specValueColor}
              />
            </SpecCard>

            {/* Features Card */}
            <SpecCard
              title="Features"
              icon={FaCar}
              bg={cardBg}
              borderColor={borderColor}
              iconColor={sectionIconColor}
              titleColor={textColor}
            >
              <SpecRow
                label="Vehicle Class"
                value={car.vehicle_class || "N/A"}
                labelColor={specLabelColor}
                valueColor={specValueColor}
              />
              <SpecRow
                label="Frunk"
                value={car.frunk_capacity ? `${car.frunk_capacity} cu-ft` : "No frunk"}
                labelColor={specLabelColor}
                valueColor={specValueColor}
              />
              <SpecRow
                label="Spare Tire"
                value={car.has_spare_tire ? "Yes" : "No"}
                labelColor={specLabelColor}
                valueColor={specValueColor}
              />
              {car.towing_details &&
                typeof car.towing_details === "object" &&
                Object.keys(car.towing_details).length > 0 ? (
                <>
                  {Object.entries(car.towing_details).map(([key, value]) => (
                    <SpecRow
                      key={key}
                      label={`Towing (${key})`}
                      value={String(value)}
                      labelColor={specLabelColor}
                      valueColor={specValueColor}
                    />
                  ))}
                </>
              ) : (
                <SpecRow
                  label="Towing"
                  value="Not available"
                  labelColor={specLabelColor}
                  valueColor={specValueColor}
                />
              )}
            </SpecCard>
          </SimpleGrid>

          {/* Reviews Section */}
          {car.reviews && car.reviews.length > 0 && (
            <Box>
              <HStack mb={3} spacing={2}>
                <Icon as={FaStar} color={sectionIconColor} boxSize={4} />
                <Heading size="md" color={textColor}>
                  Reviews
                </Heading>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {car.reviews.map(
                  (
                    review: { description: string; url: string },
                    index: number
                  ) => (
                    <Link
                      key={index}
                      href={review.url}
                      isExternal
                      _hover={{ textDecoration: "none" }}
                    >
                      <HStack
                        p={4}
                        bg={reviewCardBg}
                        backdropFilter="blur(16px)"
                        borderRadius="12px"
                        border="1px solid"
                        borderColor={borderColor}
                        spacing={3}
                        transition="all 0.2s"
                        _hover={{
                          borderColor: "rgba(22, 163, 74, 0.35)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Icon
                          as={getReviewIcon(review.url)}
                          color={getReviewIconColor(review.url)}
                          boxSize={5}
                          flexShrink={0}
                        />
                        <Text fontSize="sm" color={subTextColor} noOfLines={2}>
                          {review.description}
                        </Text>
                      </HStack>
                    </Link>
                  )
                )}
              </SimpleGrid>
            </Box>
          )}

          {/* Ratings Section */}
          {car.customer_and_critic_rating &&
            typeof car.customer_and_critic_rating === "object" &&
            Object.keys(car.customer_and_critic_rating).length > 0 && (
              <Box
                bg={cardBg}
                backdropFilter="blur(16px)"
                borderRadius="16px"
                border="1px solid"
                borderColor={borderColor}
                p={5}
                boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
              >
                <HStack mb={3} spacing={2}>
                  <Icon as={FaStar} color={sectionIconColor} boxSize={4} />
                  <Heading size="sm" color={textColor}>
                    Critic & Customer Ratings
                  </Heading>
                </HStack>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  {Object.entries(car.customer_and_critic_rating).map(
                    ([source, rating]) => (
                      <VStack key={source} spacing={0}>
                        <Text
                          fontSize="2xl"
                          fontWeight="700"
                          color={textColor}
                        >
                          {String(rating)}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={specLabelColor}
                          fontWeight="500"
                          textAlign="center"
                        >
                          {source}
                        </Text>
                      </VStack>
                    )
                  )}
                </SimpleGrid>
              </Box>
            )}
        </VStack>
      </Box>

      {/* Image Lightbox */}
      <Modal
        isOpen={isLightboxOpen}
        onClose={onLightboxClose}
        size="6xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none" maxW="90vw">
          <ModalCloseButton
            color="white"
            size="lg"
            top={2}
            right={2}
            zIndex={2}
          />
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              src={car.image_url}
              alt={`${car.make_name} ${car.model} ${car.submodel}`}
              maxH="85vh"
              maxW="100%"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

/* Reusable spec card wrapper */
const SpecCard = ({
  title,
  icon,
  children,
  bg,
  borderColor,
  iconColor,
  titleColor,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  bg: string;
  borderColor: string;
  iconColor: string;
  titleColor: string;
}) => (
  <Box
    bg={bg}
    backdropFilter="blur(16px)"
    borderRadius="16px"
    border="1px solid"
    borderColor={borderColor}
    p={5}
    boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
  >
    <HStack mb={4} spacing={2}>
      <Icon as={icon} color={iconColor} boxSize={4} />
      <Heading size="sm" color={titleColor}>
        {title}
      </Heading>
    </HStack>
    <VStack spacing={2} align="stretch">
      {children}
    </VStack>
  </Box>
);

/* Reusable spec row */
const SpecRow = ({
  label,
  value,
  labelColor,
  valueColor,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
}) => (
  <HStack justify="space-between" w="full" py={1}>
    <Text fontSize="sm" color={labelColor} fontWeight="500">
      {label}
    </Text>
    <Text fontSize="sm" fontWeight="600" color={valueColor}>
      {value}
    </Text>
  </HStack>
);

/* Review icon helpers */
function getReviewIcon(url: string) {
  if (url.includes("youtu.be") || url.includes("youtube.com")) return FaYoutube;
  if (url.includes("x.com") || url.includes("twitter.com")) return FaXTwitter;
  return FaGlobe;
}

function getReviewIconColor(url: string) {
  if (url.includes("youtu.be") || url.includes("youtube.com")) return "red.500";
  if (url.includes("x.com") || url.includes("twitter.com")) return "gray.600";
  return "blue.500";
}

export default CarDetails;
