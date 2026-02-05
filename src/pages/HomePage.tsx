import {
  Box,
  Button,
  Grid,
  GridItem,
  Show,
  Hide,
  HStack,
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
import NavBar from "../components/NavBar";
import CarGrid from "../components/CarGrid";
import CarTable from "../components/CarTable";
import ManufacturerList from "../components/ManufacturerList";
import { useState } from "react";
import { Make } from "../hooks/useMakes";
import FeatureSelector from "../components/FeatureSelector";
import SortSelector from "../components/SortSelector";
import { SortOption } from "../types/types";
import { useCompare } from "../contexts/CompareContext";
import CompareBar from "../components/CompareBar";
import ComparisonModal from "../components/ComparisonModal";

interface SelectedFeatureBucket {
  featureName: string;
  bucketName: string;
  carIds: number[];
}

function HomePage() {
  const [selectedMake, setSelectedMake] = useState<Make | null>(null);
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedFeatureBucket | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

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
    base: "Clear",
    md: "Clear Filter",
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

  const handleSelectFeature = (
    featureName: string,
    bucketName: string,
    carIds: number[]
  ) => {
    setSelectedFeature({ featureName, bucketName, carIds });
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

          <GridItem area="main">
            {/* Toolbar — no background card */}
            <HStack
              spacing={2}
              flexWrap="wrap"
              mx={{ base: 4, md: 10 }}
              mb={1}
              mt={4}
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
                onSelectFeature={handleSelectFeature}
                selectedBucketName={selectedFeature?.bucketName ?? null}
                selectedFeatureName={selectedFeature?.featureName ?? null}
              />

              {selectedFeature && (
                <Button
                  size={buttonSize}
                  onClick={() => setSelectedFeature(null)}
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
            </HStack>

            {viewMode === "cards" ? (
              <CarGrid
                selectedFeature={selectedFeature}
                selectedMake={selectedMake}
                sortOption={sortOption}
                searchTerm={searchTerm}
              />
            ) : (
              <CarTable
                selectedFeature={selectedFeature}
                selectedMake={selectedMake}
                searchTerm={searchTerm}
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
