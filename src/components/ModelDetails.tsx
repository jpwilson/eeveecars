import React, { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Collapse,
  Image,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Button,
  Link,
  useBreakpointValue,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
} from "@chakra-ui/react";
import useModelDetails, {
  ModelDetailsResponse as ModelDetailsType,
} from "../hooks/useModelDetails";
import { formatPrice } from "../utils/formatPrice";
import NavBar from "./NavBar";

const ModelDetails: React.FC = () => {
  const { make_model_slug } = useParams<{ make_model_slug: string }>();
  const safeMakeModelSlug = make_model_slug ?? "";
  const { modelDetails, error, isLoading } =
    useModelDetails(safeMakeModelSlug);

  const [showMore, setShowMore] = useState(false);
  const handleToggle = () => setShowMore(!showMore);

  const imageSize = useBreakpointValue({
    base: "100%",
    md: "400px",
    lg: "600px",
    xl: "800px",
  });

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
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");
  const tableHeaderBg = useColorModeValue(
    "rgba(22, 163, 74, 0.04)",
    "rgba(22, 163, 74, 0.1)"
  );
  const rowHoverBg = useColorModeValue(
    "rgba(22, 163, 74, 0.04)",
    "rgba(22, 163, 74, 0.08)"
  );
  const linkColor = useColorModeValue("#16a34a", "#4ec77f");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!modelDetails) return <div>Model not found.</div>;

  const {
    representative_model: {
      make_name,
      model,
      model_description,
      image_url,
      model_webpage,
    },
    submodels,
    make_details,
  } = modelDetails;

  submodels.sort((a, b) => a.current_price - b.current_price);

  return (
    <Box minH="100vh">
      <NavBar />
      <Box maxW="1200px" mx="auto" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <HStack>
              {make_details?.lrg_logo_img_url && model_webpage && (
                <a
                  href={model_webpage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={make_details.lrg_logo_img_url}
                    alt={`${make_name} logo`}
                    boxSize="50px"
                    objectFit="contain"
                    mr={4}
                  />
                </a>
              )}
              <Heading fontSize={{ base: "2xl", md: "4xl" }} color={textColor}>
                {make_name} {model}
              </Heading>
            </HStack>
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

          <Grid
            templateColumns={{ md: "1fr 2fr", base: "1fr" }}
            gap={6}
            alignItems="start"
          >
            <GridItem>
              <Box
                borderRadius="16px"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
                backdropFilter="blur(16px)"
              >
                <Image
                  src={image_url}
                  alt={`${make_name} ${model}`}
                  maxW={imageSize}
                  maxH={{ base: "auto", md: "500px" }}
                  objectFit="contain"
                  w="100%"
                />
              </Box>
            </GridItem>
            <GridItem>
              <VStack spacing={6} align="start">
                <Heading size="lg" color={textColor}>
                  Model Overview
                </Heading>
                <Collapse startingHeight={50} in={showMore}>
                  <Text color={subTextColor} lineHeight="1.7">
                    {model_description}
                  </Text>
                </Collapse>
                <Text
                  color={linkColor}
                  mt="-4"
                  fontWeight="500"
                  cursor="pointer"
                  onClick={handleToggle}
                  fontSize="sm"
                >
                  {showMore ? "Read Less" : "Read More..."}
                </Text>

                <HStack spacing={4} justify="space-between" width="full">
                  <Heading size="md" color={textColor}>
                    Variants
                  </Heading>
                  <Link
                    href={model_webpage}
                    isExternal
                    color={linkColor}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    Official {model} Site
                  </Link>
                </HStack>
                <Text fontSize="sm" color={subTextColor}>
                  <Text as="span" fontWeight="600">
                    Note:{" "}
                  </Text>
                  Click on submodels for detailed info
                </Text>

                {/* Variants table with glassmorphism container */}
                <Box
                  w="full"
                  bg={cardBg}
                  backdropFilter="blur(16px)"
                  borderRadius="16px"
                  border="1px solid"
                  borderColor={borderColor}
                  overflow="hidden"
                  boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
                >
                  <Table size="sm">
                    <Thead>
                      <Tr bg={tableHeaderBg}>
                        <Th borderColor={tableBorderColor} fontSize="xs">
                          Submodel
                        </Th>
                        <Th borderColor={tableBorderColor} fontSize="xs" isNumeric>
                          Price
                        </Th>
                        <Th borderColor={tableBorderColor} fontSize="xs" isNumeric>
                          0-60
                        </Th>
                        <Th borderColor={tableBorderColor} fontSize="xs" isNumeric>
                          Top Speed
                        </Th>
                        <Th borderColor={tableBorderColor} fontSize="xs" isNumeric>
                          Range
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {submodels.map(
                        (submodel: ModelDetailsType["submodels"][number]) => (
                          <Tr
                            key={submodel.id}
                            _hover={{ bg: rowHoverBg }}
                            transition="background 0.15s"
                          >
                            <Td borderColor={tableBorderColor}>
                              <Link
                                as={RouterLink}
                                to={`/car_detail/${submodel.id}`}
                                color={linkColor}
                                fontWeight="500"
                                fontSize="sm"
                                _hover={{ textDecoration: "underline" }}
                              >
                                {submodel.submodel}
                              </Link>
                            </Td>
                            <Td borderColor={tableBorderColor} isNumeric fontSize="sm">
                              {formatPrice(submodel.current_price)}
                            </Td>
                            <Td borderColor={tableBorderColor} isNumeric fontSize="sm">
                              {submodel.acceleration_0_60}s
                            </Td>
                            <Td borderColor={tableBorderColor} isNumeric fontSize="sm">
                              {submodel.top_speed} mph
                            </Td>
                            <Td borderColor={tableBorderColor} isNumeric fontSize="sm">
                              {submodel.epa_range} mi
                            </Td>
                          </Tr>
                        )
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
};

export default ModelDetails;
