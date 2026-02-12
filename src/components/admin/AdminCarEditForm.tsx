import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Accordion,
  useToast,
  Text,
  Spinner,
  HStack,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { FaSave } from "react-icons/fa";
import adminApiClient from "../../services/admin-api-client";
import AdminFormSection from "./shared/AdminFormSection";
import IdentitySection from "./sections/IdentitySection";
import PricingSection from "./sections/PricingSection";
import PerformanceSection from "./sections/PerformanceSection";
import BatterySection from "./sections/BatterySection";
import AvailabilitySection from "./sections/AvailabilitySection";
import DescriptionSection from "./sections/DescriptionSection";
import SafetySection from "./sections/SafetySection";
import FeaturesSection from "./sections/FeaturesSection";
import DatesSection from "./sections/DatesSection";
import ImagesSection from "./sections/ImagesSection";

interface Props {
  carId: number;
}

export default function AdminCarEditForm({ carId }: Props) {
  const [car, setCar] = useState<Record<string, any> | null>(null);
  const [original, setOriginal] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(26,32,44,0.7)");
  const borderColor = useColorModeValue("rgba(22,163,74,0.15)", "rgba(22,163,74,0.25)");

  const fetchCar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApiClient.get(`/cars/${carId}`);
      setCar(res.data);
      setOriginal(JSON.parse(JSON.stringify(res.data)));
    } catch {
      toast({ title: "Failed to load car", status: "error", duration: 3000 });
    }
    setIsLoading(false);
  }, [carId, toast]);

  useEffect(() => {
    fetchCar();
  }, [fetchCar]);

  const updateField = useCallback((field: string, value: any) => {
    setCar((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const getDirtyFields = (): Record<string, any> => {
    if (!car || !original) return {};
    const dirty: Record<string, any> = {};
    for (const key of Object.keys(car)) {
      if (key === "average_rating" || key === "id") continue;
      if (JSON.stringify(car[key]) !== JSON.stringify(original[key])) {
        dirty[key] = car[key];
      }
    }
    return dirty;
  };

  const handleSave = async () => {
    const dirty = getDirtyFields();
    if (Object.keys(dirty).length === 0) {
      toast({ title: "No changes to save", status: "info", duration: 2000 });
      return;
    }
    // make_id is required by CarUpdate schema
    if (!dirty.make_id && car) {
      dirty.make_id = car.make_id;
    }
    setIsSaving(true);
    try {
      await adminApiClient.patch(`/cars/${carId}`, dirty);
      toast({
        title: "Saved",
        description: `${Object.keys(dirty).length} field(s) updated`,
        status: "success",
        duration: 3000,
      });
      // Refresh to get server state
      await fetchCar();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.response?.data?.detail || err.message,
        status: "error",
        duration: 5000,
      });
    }
    setIsSaving(false);
  };

  if (isLoading || !car) {
    return (
      <Box textAlign="center" py={16}>
        <Spinner color="#16a34a" size="lg" />
        <Text mt={4} fontSize="sm" color="gray.500">
          Loading car #{carId}...
        </Text>
      </Box>
    );
  }

  const dirty = getDirtyFields();
  const dirtyCount = Object.keys(dirty).length;

  return (
    <Box>
      {/* Header */}
      <Box
        bg={cardBg}
        backdropFilter="blur(16px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="16px"
        p={4}
        mb={4}
      >
        <HStack justify="space-between" align="start">
          <Box>
            <Text fontWeight="700" fontSize="lg">
              {car.make_name ?? "?"} {car.model}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {[car.submodel, car.generation].filter(Boolean).join(" - ")} (ID: {carId})
            </Text>
          </Box>
          {car.image_url && (
            <Image
              src={car.image_url}
              alt={car.model}
              maxH="60px"
              objectFit="contain"
              borderRadius="8px"
            />
          )}
        </HStack>
      </Box>

      {/* Form Sections */}
      <Accordion allowMultiple defaultIndex={[0]}>
        <AdminFormSection title="Identity" isDirty={["make_id", "make_name", "model", "submodel", "generation", "vehicle_class", "is_model_rep", "make_model_slug", "full_slug"].some((f) => f in dirty)}>
          <IdentitySection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Pricing" isDirty={["current_price", "price_history", "model_webpage"].some((f) => f in dirty)}>
          <PricingSection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Performance" isDirty={["acceleration_0_60", "top_speed", "power", "torque", "drive_type", "speed_acc"].some((f) => f in dirty)}>
          <PerformanceSection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Battery & Charging" isDirty={["battery_capacity", "epa_range", "battery_max_charging_speed", "chargers", "range_details", "regen_details", "bidirectional_details"].some((f) => f in dirty)}>
          <BatterySection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Availability" isDirty={["production_availability", "availability_desc", "available_countries"].some((f) => f in dirty)}>
          <AvailabilitySection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Images" isDirty={["image_url", "images"].some((f) => f in dirty)}>
          <ImagesSection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Descriptions" isDirty={["car_description", "model_description"].some((f) => f in dirty)}>
          <DescriptionSection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Safety" isDirty={["nhtsa_rating", "euroncap_rating", "sentry_security", "sentry_details"].some((f) => f in dirty)}>
          <SafetySection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Features" isDirty={["frunk_capacity", "number_of_full_adult_seats", "number_of_passenger_doors", "keyless", "has_spare_tire", "towing_details", "camping_features", "dog_mode", "seating_details", "infotainment_details", "interior_ambient_lighting_details", "remote_heating_cooling", "vehicle_sound_details", "drive_assist_features"].some((f) => f in dirty)}>
          <FeaturesSection car={car} onChange={updateField} />
        </AdminFormSection>

        <AdminFormSection title="Dates" isDirty={["carmodel_first_released", "carmodel_ended", "trim_first_released", "trim_ended"].some((f) => f in dirty)}>
          <DatesSection car={car} onChange={updateField} />
        </AdminFormSection>
      </Accordion>

      {/* Save Button */}
      <Box position="sticky" bottom={4} mt={4} zIndex={10}>
        <Button
          w="100%"
          size="lg"
          bg={dirtyCount > 0 ? "#16a34a" : "gray.400"}
          color="white"
          _hover={{ bg: dirtyCount > 0 ? "#15803d" : "gray.400" }}
          leftIcon={<FaSave />}
          isLoading={isSaving}
          isDisabled={dirtyCount === 0}
          onClick={handleSave}
          borderRadius="12px"
          boxShadow={dirtyCount > 0 ? "0 4px 12px rgba(22,163,74,0.3)" : "none"}
        >
          {dirtyCount > 0 ? `Save ${dirtyCount} Change${dirtyCount > 1 ? "s" : ""}` : "No Changes"}
        </Button>
      </Box>
    </Box>
  );
}
