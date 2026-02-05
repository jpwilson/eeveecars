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
} from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import CarGrid from "../components/CarGrid";
import ManufacturerList from "../components/ManufacturerList";
import { useState } from "react";
import { Make } from "../hooks/useMakes";
import FeatureSelector from "../components/FeatureSelector";
import SortSelector from "../components/SortSelector";
import { SortOption } from "../types/types";
import PeopleSelector from "../components/PeopleSelector";
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

  // Responsive values
  const buttonSize = useBreakpointValue({ base: "sm", md: "sm" });
  const clearButtonText = useBreakpointValue({
    base: "Clear",
    md: "Clear Filter",
  });

  // Colors
  const toolbarBg = useColorModeValue(
    "rgba(255, 255, 255, 0.6)",
    "rgba(45, 55, 72, 0.6)"
  );
  const toolbarBorder = useColorModeValue("gray.200", "gray.600");
  const btnBg = useColorModeValue("white", "gray.700");
  const btnBorder = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const drawerBg = useColorModeValue("white", "gray.800");

  // Handle brand selection from drawer
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

  const handleCategoryChange = (category: string) => {
    console.log("Category changed:", category);
  };

  return (
    <Box minH="100vh">
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
          {/* Toolbar */}
          <Box
            mx={{ base: 2, md: 4 }}
            mb={3}
            mt={2}
            p={3}
            bg={toolbarBg}
            backdropFilter="blur(12px)"
            borderRadius="14px"
            border="1px solid"
            borderColor={toolbarBorder}
          >
            <HStack spacing={2} flexWrap="wrap">
              {/* Brands button - mobile only */}
              <Hide above="lg">
                <Button
                  size={buttonSize}
                  onClick={onBrandsOpen}
                  bg={selectedMake ? "green.500" : btnBg}
                  color={selectedMake ? "white" : textColor}
                  border="1px solid"
                  borderColor={selectedMake ? "green.500" : btnBorder}
                  borderRadius="10px"
                  fontWeight="500"
                  _hover={{
                    borderColor: "green.300",
                    bg: selectedMake ? "green.600" : hoverBg,
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

              <SortSelector onSortChange={handleSortChange} />
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

              <PeopleSelector onCategoryChange={handleCategoryChange} />

              <Button
                size={buttonSize}
                onClick={toggleCompareMode}
                bg={isCompareMode ? "green.500" : btnBg}
                color={isCompareMode ? "white" : textColor}
                border="1px solid"
                borderColor={isCompareMode ? "green.500" : btnBorder}
                borderRadius="10px"
                fontWeight="500"
                _hover={{
                  borderColor: "green.300",
                  bg: isCompareMode ? "green.600" : hoverBg,
                }}
              >
                {isCompareMode ? "Exit Compare" : "Compare"}
              </Button>
            </HStack>
          </Box>

          <CarGrid
            selectedFeature={selectedFeature}
            selectedMake={selectedMake}
            sortOption={sortOption}
            searchTerm={searchTerm}
          />
        </GridItem>
      </Grid>

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
