import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  HStack,
  Show,
} from "@chakra-ui/react";
import NavBar from "./NavBar";
import CarGrid from "./CarGrid";
import ManufacturerList from "./ManufacturerList";
import { useState } from "react";
import { Make } from "../hooks/useMakes";
import FeatureSelector from "./FeatureSelector";
import { Features } from "../hooks/useFeatures";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CarDetails from "./CarDetails";

function App() {
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
    <Router>
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
        <GridItem area="nav">
          <NavBar />
        </GridItem>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Show above="lg">
                  <GridItem area="aside" paddingX={5}>
                    <ManufacturerList
                      selectedMake={selectedMake}
                      onSelectMake={setSelectedMake}
                    />
                  </GridItem>
                </Show>
                <GridItem area="main">
                  <HStack>
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
                  </HStack>
                  <CarGrid
                    selectedFeature={selectedFeature}
                    selectedMake={selectedMake}
                  />
                </GridItem>
              </>
            }
          />
          <Route
            path="/car_detail/:id"
            element={
              <>
                <CarDetails />
              </>
            }
          />
        </Routes>
      </Grid>
    </Router>
  );
}

export default App;
