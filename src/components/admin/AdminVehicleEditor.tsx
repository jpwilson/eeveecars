import { useState, useEffect } from "react";
import { Grid, GridItem, Text, Box, useColorModeValue } from "@chakra-ui/react";
import AdminCarPicker, { CarListItem } from "./AdminCarPicker";
import AdminCarEditForm from "./AdminCarEditForm";
import adminApiClient from "../../services/admin-api-client";

export default function AdminVehicleEditor() {
  const [cars, setCars] = useState<CarListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(26,32,44,0.7)");
  const borderColor = useColorModeValue("rgba(22,163,74,0.15)", "rgba(22,163,74,0.25)");

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      try {
        const res = await adminApiClient.get("/cars/admin-list");
        setCars(res.data);
      } catch {
        // Auth issue or network error — will be handled by auth gate
      }
      setIsLoading(false);
    };
    fetchCars();
  }, []);

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "300px 1fr" }}
      gap={4}
      alignItems="start"
    >
      <GridItem>
        <AdminCarPicker
          cars={cars}
          isLoading={isLoading}
          selectedCarId={selectedCarId}
          onSelect={setSelectedCarId}
        />
      </GridItem>
      <GridItem>
        {selectedCarId ? (
          <AdminCarEditForm key={selectedCarId} carId={selectedCarId} />
        ) : (
          <Box
            bg={cardBg}
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="16px"
            p={8}
            textAlign="center"
          >
            <Text fontSize="lg" fontWeight="500" color="gray.500">
              Select a vehicle to edit
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Use the picker on the left to search and select a car
            </Text>
          </Box>
        )}
      </GridItem>
    </Grid>
  );
}
