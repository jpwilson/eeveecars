import {
  Button,
  Grid,
  GridItem,
  HStack,
  Show,
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
        <HStack spacing={5} pl={10} mb={1} mt={2}>
          <SortSelector onSortChange={handleSortChange} />
          <FeatureSelector
            onSelectFeature={handleSelectFeature}
            selectedBucketName={selectedFeature?.bucketName ?? null}
            selectedFeatureName={selectedFeature?.featureName ?? null}
          />
          <Button
            fontSize="lg"
            onClick={() => {
              setSelectedFeature(null);
            }}
            color="yellow.500"
            fontWeight="bold"
          >
            Clear Feature Selection
          </Button>
          <PeopleSelector onCategoryChange={handleCategoryChange} />
          <Button
            fontSize="lg"
            onClick={toggleCompareMode}
            colorScheme={isCompareMode ? "green" : "blue"}
            fontWeight="bold"
          >
            {isCompareMode ? "Exit Compare" : "Compare"}
          </Button>
        </HStack>
        <CarGrid
          selectedFeature={selectedFeature}
          selectedMake={selectedMake}
          sortOption={sortOption}
          searchTerm={searchTerm}
        />
      </GridItem>
      <CompareBar />
      <ComparisonModal />
    </Grid>
  );
}

export default HomePage;
