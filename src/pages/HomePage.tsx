import {
  Button,
  Grid,
  GridItem,
  Show,
  Hide,
  Wrap,
  WrapItem,
  useBreakpointValue,
  useDisclosure,
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
  const { isOpen: isBrandsOpen, onOpen: onBrandsOpen, onClose: onBrandsClose } = useDisclosure();

  // Responsive values
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
  const toolbarPadding = useBreakpointValue({ base: 2, md: 10 });
  const clearButtonText = useBreakpointValue({
    base: "Clear Filter",
    md: "Clear Feature Selection"
  });

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

  const [selectedPeopleCategory, setSelectedPeopleCategory] = useState<
    string | null
  >(null);

  const handlePeopleCategoryChange = (category: string) => {
    setSelectedPeopleCategory(category);
  };

  // Add a function to handle category changes
  const handleCategoryChange = (category: string) => {
    // Implement the logic for category change here
    console.log("Category changed:", category);
  };

  return (
    <Grid
      templateAreas={{
        base: `"nav" "main"`,
        lg: `"nav nav" "aside main"`,
      }}
      templateColumns={{
        base: "1fr",
        lg: "200px 1fr",
      }}
    >
      <GridItem area="nav" mb={10}>
        <NavBar onSearch={handleSearch} />
      </GridItem>
      <Show above="lg">
        <GridItem
          area="aside"
          paddingX={5}
          maxHeight="calc(100vh - 4rem)"
          overflowY="auto"
        >
          <ManufacturerList
            selectedMake={selectedMake}
            onSelectMake={setSelectedMake}
          />
        </GridItem>
      </Show>
      <GridItem area="main">
        <Wrap spacing={{ base: 2, md: 4 }} pl={toolbarPadding} pr={2} mb={1} mt={2} align="center">
          {/* Brands button - mobile only */}
          <Hide above="lg">
            <WrapItem>
              <Button
                size={buttonSize}
                onClick={onBrandsOpen}
                colorScheme={selectedMake ? "blue" : "gray"}
                variant={selectedMake ? "solid" : "outline"}
              >
                {selectedMake ? selectedMake.name : "Brands"}
                {selectedMake && (
                  <Badge ml={2} colorScheme="green" fontSize="xs">1</Badge>
                )}
              </Button>
            </WrapItem>
          </Hide>
          <WrapItem>
            <SortSelector onSortChange={handleSortChange} />
          </WrapItem>
          <WrapItem>
            <FeatureSelector
              onSelectFeature={handleSelectFeature}
              selectedBucketName={selectedFeature?.bucketName ?? null}
              selectedFeatureName={selectedFeature?.featureName ?? null}
            />
          </WrapItem>
          <WrapItem>
            <Button
              size={buttonSize}
              onClick={() => {
                setSelectedFeature(null);
              }}
              color="yellow.500"
              fontWeight="bold"
            >
              {clearButtonText}
            </Button>
          </WrapItem>
          <WrapItem>
            <PeopleSelector onCategoryChange={handleCategoryChange} />
          </WrapItem>
          <WrapItem>
            <Button
              size={buttonSize}
              onClick={toggleCompareMode}
              colorScheme={isCompareMode ? "green" : "blue"}
              fontWeight="bold"
            >
              {isCompareMode ? "Exit Compare" : "Compare"}
            </Button>
          </WrapItem>
        </Wrap>
        <CarGrid
          selectedFeature={selectedFeature}
          selectedMake={selectedMake}
          sortOption={sortOption}
          searchTerm={searchTerm}
        />
      </GridItem>
      <CompareBar />
      <ComparisonModal />

      {/* Mobile brands drawer */}
      <Drawer isOpen={isBrandsOpen} placement="left" onClose={onBrandsClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Heading size="md">Filter by Brand</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Tap a brand to filter vehicles
            </Text>
          </DrawerHeader>
          <DrawerBody>
            <ManufacturerList
              selectedMake={selectedMake}
              onSelectMake={handleMobileSelectMake}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Grid>
  );
}

export default HomePage;
