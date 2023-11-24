import {
  Button,
  ButtonGroup,
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
import { Features } from "../hooks/useFeatures";
import SortSelector from "../components/SortSelector";
//import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import CarDetails from "./CarDetails";

function HomePage() {
  const [selectedMake, setSelectedMake] = useState<Make | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Features | null>(null);
  const handleSelectFeature = (
    featureName: string,
    bucketName: string,
    carIds: number[]
  ) => {
    setSelectedFeature({ featureName, bucketName, carIds });
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
        <NavBar />
      </GridItem>
      <Show above="lg">
        <GridItem area="aside" paddingX={5}>
          <ManufacturerList
            selectedMake={selectedMake}
            onSelectMake={setSelectedMake}
          />
        </GridItem>
      </Show>
      <GridItem area="main">
        <HStack spacing={5} pl={10} mb={1} mt={2}>
          <FeatureSelector
            onSelectFeature={handleSelectFeature}
            selectedBucketName={selectedFeature?.bucketName}
            selectedFeatureName={selectedFeature?.featureName}
          />
          <Button
            fontSize="lg"
            onClick={() => {
              setSelectedFeature(null);
            }}
          >
            Clear Feature Selection
          </Button>
          <SortSelector />
        </HStack>
        <CarGrid
          selectedFeature={selectedFeature}
          selectedMake={selectedMake}
        />
      </GridItem>
    </Grid>
  );
}

export default HomePage;
