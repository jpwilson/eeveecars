import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Show,
  Hide,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useBreakpointValue,
  useDisclosure,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Heading,
  Text,
  Badge,
  Image,
} from "@chakra-ui/react";
import { FaThList, FaTh } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import NavBar from "../components/NavBar";
import CarGrid from "../components/CarGrid";
import CarTable from "../components/CarTable";
import ManufacturerList from "../components/ManufacturerList";
import { useState } from "react";
import { Make } from "../hooks/useMakes";
import FeatureSelector, { formatBucketLabel } from "../components/FeatureSelector";
import SortSelector from "../components/SortSelector";
import { SortOption } from "../types/types";
import { SelectedFeature } from "../hooks/useCars";
import { useCompare } from "../contexts/CompareContext";
import CompareBar from "../components/CompareBar";
import ComparisonModal from "../components/ComparisonModal";
import { makeNameToSlug } from "../utils/makeSlug";

function HomePage() {
  const [selectedMake, setSelectedMake] = useState<Make | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [hideDiscontinued, setHideDiscontinued] = useState(false);

  const [sortOption, setSortOption] = useState<SortOption>({
    field: "current_price",
    direction: "desc",
  });

  const { isCompareMode, toggleCompareMode } = useCompare();

  // Brands drawer for mobile
  const {
    isOpen: isBrandsOpen,
    onOpen: onBrandsOpen,
    onClose: onBrandsClose,
  } = useDisclosure();

  const buttonSize = useBreakpointValue({ base: "sm", md: "sm" });
  const clearButtonText = useBreakpointValue({
    base: "Clear All",
    md: "Clear All",
  });

  // Colors
  const btnBg = useColorModeValue("white", "gray.700");
  const btnBorder = useColorModeValue("rgba(22, 163, 74, 0.25)", "rgba(22, 163, 74, 0.4)");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("rgba(22, 163, 74, 0.06)", "rgba(22, 163, 74, 0.15)");
  const drawerBg = useColorModeValue("white", "gray.800");
  const heroBgOpacity = useColorModeValue(0.04, 0.06);

  const handleMobileSelectMake = (make: Make | null) => {
    setSelectedMake(make);
    onBrandsClose();
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (text: string) => {
    setSearchTerm(text);
  };

  const handleToggleFeature = (
    featureName: string,
    bucketName: string,
    carIds: number[]
  ) => {
    setSelectedFeatures((prev) => {
      const exists = prev.some(
        (f) => f.featureName === featureName && f.bucketName === bucketName
      );
      if (exists) {
        return prev.filter(
          (f) => !(f.featureName === featureName && f.bucketName === bucketName)
        );
      }
      if (prev.length >= 6) return prev;
      return [...prev, { featureName, bucketName, carIds }];
    });
  };

  const handleRemoveFeature = (featureName: string, bucketName: string) => {
    setSelectedFeatures((prev) =>
      prev.filter(
        (f) => !(f.featureName === featureName && f.bucketName === bucketName)
      )
    );
  };

  // Shared button style
  const toolbarBtnStyle = {
    size: buttonSize,
    bg: btnBg,
    color: textColor,
    border: "1px solid",
    borderColor: btnBorder,
    borderRadius: "10px",
    fontWeight: "500" as const,
    _hover: { borderColor: "green.400", bg: hoverBg },
    _active: { borderColor: "green.500" },
  };

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Subtle hero EV background image */}
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
        <NavBar onSearch={handleSearch} />

        <Grid
          templateAreas={{
            base: `"main"`,
            lg: `"aside main"`,
          }}
          templateColumns={{
            base: "1fr",
            lg: "200px 1fr",
          }}
          maxW="1600px"
          mx="auto"
          pt={2}
        >
          <Show above="lg">
            <GridItem
              area="aside"
              px={4}
              pt={2}
              maxHeight="calc(100vh - 60px)"
              overflowY="auto"
              position="sticky"
              top="60px"
              css={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: "4px",
                },
              }}
            >
              <ManufacturerList
                selectedMake={selectedMake}
                onSelectMake={setSelectedMake}
                showDarkModeToggle={true}
              />
            </GridItem>
          </Show>

          <GridItem area="main" minW={0}>
            {/* Toolbar — no background card */}
            <HStack
              spacing={2}
              flexWrap="wrap"
              mx={{ base: 4, md: 10 }}
              mb={5}
              mt={5}
            >
              {/* Brands button - mobile only */}
              <Hide above="lg">
                <Button
                  {...toolbarBtnStyle}
                  bg={selectedMake ? "green.500" : btnBg}
                  color={selectedMake ? "white" : textColor}
                  borderColor={selectedMake ? "green.500" : btnBorder}
                  onClick={onBrandsOpen}
                  _hover={{
                    bg: selectedMake ? "green.600" : hoverBg,
                    borderColor: "green.400",
                  }}
                >
                  {selectedMake ? selectedMake.name : "Brands"}
                  {selectedMake && (
                    <Badge ml={2} colorScheme="whiteAlpha" fontSize="xs">
                      1
                    </Badge>
                  )}
                </Button>
              </Hide>

              {/* Order By only in cards view */}
              {viewMode === "cards" && (
                <SortSelector onSortChange={handleSortChange} />
              )}

              {/* Feature Filter + Compare in both views */}
              <FeatureSelector
                selectedFeatures={selectedFeatures}
                onToggleFeature={handleToggleFeature}
              />

              {selectedFeatures.length > 0 && (
                <Button
                  size={buttonSize}
                  onClick={() => setSelectedFeatures([])}
                  bg="transparent"
                  color="orange.500"
                  border="1px solid"
                  borderColor="orange.200"
                  borderRadius="10px"
                  fontWeight="500"
                  fontSize="sm"
                  _hover={{ bg: "orange.50", borderColor: "orange.300" }}
                >
                  {clearButtonText}
                </Button>
              )}

              <Button
                {...toolbarBtnStyle}
                onClick={toggleCompareMode}
                bg={isCompareMode ? "green.500" : btnBg}
                color={isCompareMode ? "white" : textColor}
                borderColor={isCompareMode ? "green.500" : btnBorder}
                _hover={{
                  bg: isCompareMode ? "green.600" : hoverBg,
                  borderColor: "green.400",
                }}
              >
                {isCompareMode ? "Exit Compare" : "Compare"}
              </Button>

              {/* Hide discontinued toggle */}
              <Button
                {...toolbarBtnStyle}
                onClick={() => setHideDiscontinued(!hideDiscontinued)}
                bg={hideDiscontinued ? "green.500" : btnBg}
                color={hideDiscontinued ? "white" : textColor}
                borderColor={hideDiscontinued ? "green.500" : btnBorder}
                _hover={{
                  bg: hideDiscontinued ? "green.600" : hoverBg,
                  borderColor: "green.400",
                }}
                fontSize="xs"
              >
                {hideDiscontinued ? "Show All" : "Hide Discontinued"}
              </Button>

              {/* View toggle */}
              <Button
                {...toolbarBtnStyle}
                onClick={() =>
                  setViewMode(viewMode === "cards" ? "table" : "cards")
                }
                leftIcon={viewMode === "cards" ? <FaThList /> : <FaTh />}
              >
                {viewMode === "cards" ? "List" : "Cards"}
              </Button>

              {/* Brand page link — shown when a brand is selected (desktop) */}
              <Show above="lg">
                {selectedMake && (
                  <Box ml="auto">
                    <RouterLink to={`/manufacturer/${makeNameToSlug(selectedMake.name)}`} style={{ textDecoration: "none" }}>
                      <HStack
                        spacing={2}
                        px={3}
                        py={1}
                        borderRadius="10px"
                        border="1px solid"
                        borderColor={btnBorder}
                        bg={btnBg}
                        _hover={{ borderColor: "green.400", bg: hoverBg }}
                        transition="all 0.2s"
                        cursor="pointer"
                      >
                        <Image
                          src={selectedMake.lrg_logo_img_url}
                          alt={selectedMake.name}
                          boxSize="20px"
                          objectFit="contain"
                          bg="white"
                          borderRadius="4px"
                        />
                        <Text fontSize="sm" fontWeight="500" color="#16a34a">
                          {selectedMake.name}
                        </Text>
                      </HStack>
                    </RouterLink>
                  </Box>
                )}
              </Show>
            </HStack>

            {/* Active filter tags */}
            {selectedFeatures.length > 0 && (
              <Wrap mx={{ base: 4, md: 10 }} mb={3} spacing={2}>
                {selectedFeatures.map((f) => (
                  <WrapItem key={`${f.featureName}-${f.bucketName}`}>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant="subtle"
                      colorScheme="green"
                      px={3}
                      py={1}
                    >
                      <TagLabel fontSize="xs">
                        {formatBucketLabel(f.featureName, f.bucketName)}
                      </TagLabel>
                      <TagCloseButton
                        onClick={() => handleRemoveFeature(f.featureName, f.bucketName)}
                      />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}

            {viewMode === "cards" ? (
              <CarGrid
                selectedFeatures={selectedFeatures}
                selectedMake={selectedMake}
                sortOption={sortOption}
                searchTerm={searchTerm}
                hideDiscontinued={hideDiscontinued}
              />
            ) : (
              <CarTable
                selectedFeatures={selectedFeatures}
                selectedMake={selectedMake}
                searchTerm={searchTerm}
                hideDiscontinued={hideDiscontinued}
              />
            )}
          </GridItem>
        </Grid>
      </Box>

      <CompareBar />
      <ComparisonModal />

      {/* Mobile brands drawer */}
      <Drawer isOpen={isBrandsOpen} placement="left" onClose={onBrandsClose}>
        <DrawerOverlay bg="blackAlpha.300" />
        <DrawerContent bg={drawerBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Heading size="md" color="#16a34a">
              Brands
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Tap a brand to filter
            </Text>
          </DrawerHeader>
          <DrawerBody>
            <ManufacturerList
              selectedMake={selectedMake}
              onSelectMake={handleMobileSelectMake}
              showDarkModeToggle={true}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default HomePage;
