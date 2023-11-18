import { Button, ButtonGroup, Grid, GridItem, Show } from "@chakra-ui/react";
import NavBar from "./NavBar";
import CarGrid from "./CarGrid";
import ManufacturerList from "./ManufacturerList";
import { useState } from "react";
import { Make } from "../hooks/useMakes";
import FeatureSelector from "./FeatureSelector";
import { Features } from "../hooks/useFeatures";

function App() {
  const [selectedMake, setSelectedMake] = useState<Make | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Features | null>(null);
  const handleSelectFeature = (
    featureName: string,
    bucketName: string,
    carIds: number[]
  ) => {
    // Handle the selected feature here
    // setSelectedFeature({
    //   // console.log(`Feature selected: ${featureName}`);
    //   // console.log(`Bucket selected: ${bucketName}`);
    //   // console.log(`Car IDs: ${carIds}`);
    //   feature: featureName,
    //   bucket: bucketName,
    //   carIds: carIds,
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
      <GridItem area="nav">
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
        <FeatureSelector onSelectFeature={handleSelectFeature} />
        <CarGrid
          selectedFeature={selectedFeature}
          selectedMake={selectedMake}
        />
      </GridItem>
    </Grid>
  );
}

export default App;
