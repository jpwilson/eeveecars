import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Image,
  Wrap,
  WrapItem,
  Tag,
  Center,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import NotFoundPage from "./NotFoundPage";
import CarScore from "../components/CarScore";
import useData from "../hooks/useData";
import { Car } from "../hooks/useCars";
import { formatPrice } from "../utils/formatPrice";
import { BEST_PAGES } from "../data/seoPages";

export default function BestPage() {
  const { criteria } = useParams<{ criteria: string }>();
  const { data, isLoading } = useData<Car>("/cars/cards");

  const rowBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const border = useColorModeValue("rgba(34,197,94,0.15)", "rgba(34,197,94,0.3)");
  const subText = useColorModeValue("gray.600", "gray.400");

  const config = criteria ? BEST_PAGES[criteria] : undefined;
  if (!config) return <NotFoundPage />;

  if (isLoading)
    return (
      <Box>
        <NavBar />
        <Center minH="50vh">
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Center>
      </Box>
    );

  const ranked = data.filter(config.filter).sort(config.sort).slice(0, config.limit);

  return (
    <Box>
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Heading as="h1" size="lg" mb={2}>
          {config.title}
        </Heading>
        <Text color={subText} mb={8}>
          {config.blurb}
        </Text>

        <VStack spacing={3} align="stretch">
          {ranked.map((car, i) => (
            <RouterLink key={car.id} to={`/model_detail/${car.make_model_slug}`}>
              <HStack
                p={3}
                bg={rowBg}
                backdropFilter="blur(16px)"
                border="1px solid"
                borderColor={border}
                borderRadius="xl"
                spacing={4}
                _hover={{ borderColor: "green.400", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Text fontWeight="800" fontSize="lg" color="green.500" w="28px" textAlign="center">
                  {i + 1}
                </Text>
                <Image
                  src={car.image_url}
                  alt={`${car.make_name} ${car.model}`}
                  loading="lazy"
                  boxSize="72px"
                  borderRadius="lg"
                  objectFit="cover"
                  flexShrink={0}
                />
                <Box flex={1} minW={0}>
                  <Text fontWeight="600" noOfLines={1}>
                    {car.make_name} {car.model}
                  </Text>
                  <Text fontSize="sm" color={subText}>
                    From {formatPrice(car.current_price)}
                    {car.epa_range ? ` · ${car.epa_range} mi` : ""}
                    {car.acceleration_0_60 ? ` · ${car.acceleration_0_60}s 0–60` : ""}
                  </Text>
                </Box>
                <CarScore score={car.average_rating} />
              </HStack>
            </RouterLink>
          ))}
        </VStack>

        <Box mt={12}>
          <Heading as="h2" size="sm" mb={3}>
            More EV rankings
          </Heading>
          <Wrap>
            {Object.entries(BEST_PAGES)
              .filter(([slug]) => slug !== criteria)
              .map(([slug, cfg]) => (
                <WrapItem key={slug}>
                  <Tag
                    as={RouterLink}
                    to={`/best/${slug}`}
                    colorScheme="green"
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    cursor="pointer"
                  >
                    {cfg.title}
                  </Tag>
                </WrapItem>
              ))}
          </Wrap>
        </Box>
      </Container>
    </Box>
  );
}
