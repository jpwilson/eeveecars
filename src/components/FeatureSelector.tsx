import useFeatures from "../hooks/useFeatures";
import { BsChevronDown } from "react-icons/bs";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { SelectedFeature } from "../hooks/useCars";

const MAX_FILTERS = 6;

/** Format raw bucket names into readable labels */
export function formatBucketLabel(featureName: string, bucketName: string): string {
  const parts = bucketName.split("_");

  if (featureName === "prices") {
    if (parts[0] === "under") return `Under $${parts[1]}`;
    if (parts[0] === "over") return `Over $${parts[1]}`;
    return `$${parts[0]} – $${parts[1]}`;
  }

  if (featureName === "acceleration") {
    // Bucket names already end in "s" (e.g., "under_2s", "2_3s")
    if (parts[0] === "under") return `Under ${parts[1]}`;
    if (parts[0] === "over") return `Over ${parts[1]}`;
    return `${parts[0]} – ${parts[1]}`;
  }

  if (featureName === "top_speed") {
    if (parts[0] === "under") return `Under ${parts[1]} mph`;
    if (parts[0] === "over") return `Over ${parts[1]} mph`;
    return `${parts[0]} – ${parts[1]} mph`;
  }

  return bucketName.replace(/_/g, " ");
}

/** Format feature category names */
function formatFeatureName(name: string): string {
  if (name === "prices") return "Price";
  if (name === "acceleration") return "Acceleration (0-60)";
  if (name === "top_speed") return "Top Speed";
  return name.replace(/_/g, " ");
}

interface Props {
  selectedFeatures: SelectedFeature[];
  onToggleFeature: (featureName: string, bucketName: string, carIds: number[]) => void;
}

const FeatureSelector = ({ selectedFeatures, onToggleFeature }: Props) => {
  const { features, isLoading, error } = useFeatures();

  const btnBg = useColorModeValue("white", "gray.700");
  const btnBorder = useColorModeValue("rgba(22, 163, 74, 0.25)", "rgba(22, 163, 74, 0.4)");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("rgba(22, 163, 74, 0.06)", "rgba(22, 163, 74, 0.15)");
  const popBg = useColorModeValue("white", "gray.700");
  const popBorder = useColorModeValue("gray.200", "gray.600");
  const accordionHoverBg = useColorModeValue("green.50", "rgba(22, 163, 74, 0.15)");
  const accordionExpandedBg = useColorModeValue("green.50", "rgba(22, 163, 74, 0.12)");
  const itemHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  if (isLoading) return null;
  if (error) return null;
  if (!features) return null;

  const isSelected = (featureName: string, bucketName: string) =>
    selectedFeatures.some(
      (f) => f.featureName === featureName && f.bucketName === bucketName
    );

  const atLimit = selectedFeatures.length >= MAX_FILTERS;

  return (
    <Popover placement="bottom-start" closeOnBlur={true}>
      <PopoverTrigger>
        <Button
          rightIcon={<BsChevronDown />}
          size="sm"
          bg={btnBg}
          color={textColor}
          border="1px solid"
          borderColor={selectedFeatures.length > 0 ? "green.400" : btnBorder}
          borderRadius="10px"
          fontWeight="500"
          _hover={{ borderColor: "green.400", bg: hoverBg }}
          _active={{ borderColor: "green.500" }}
        >
          Feature Filter
          {selectedFeatures.length > 0 && (
            <Box
              as="span"
              ml={1.5}
              px={1.5}
              py={0.5}
              bg="#16a34a"
              color="white"
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              lineHeight="1"
            >
              {selectedFeatures.length}
            </Box>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        w="280px"
        borderRadius="14px"
        boxShadow="lg"
        border="1px solid"
        borderColor={popBorder}
        bg={popBg}
      >
        <PopoverBody p={2} maxH="60vh" overflowY="auto">
          <Accordion allowMultiple defaultIndex={[0]}>
            {Object.entries(features).map(([featureName, featureValues]) => (
              <AccordionItem key={featureName} border="none">
                <AccordionButton
                  px={3}
                  py={2}
                  borderRadius="8px"
                  _hover={{ bg: accordionHoverBg }}
                  _expanded={{ bg: accordionExpandedBg }}
                >
                  <Box flex="1" textAlign="left" fontWeight="600" fontSize="sm" color={textColor}>
                    {formatFeatureName(featureName)}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel px={1} py={1}>
                  <VStack spacing={0} align="stretch">
                    {Object.entries(featureValues).map(([bucketName, carIds]) => {
                      const checked = isSelected(featureName, bucketName);
                      const disabled = !checked && atLimit;
                      return (
                        <Box
                          key={bucketName}
                          px={3}
                          py={1.5}
                          borderRadius="6px"
                          _hover={{ bg: disabled ? "transparent" : itemHoverBg }}
                          opacity={disabled ? 0.45 : 1}
                          cursor={disabled ? "not-allowed" : "pointer"}
                          onClick={() => {
                            if (!disabled || checked) {
                              onToggleFeature(featureName, bucketName, carIds);
                            }
                          }}
                        >
                          <Checkbox
                            isChecked={checked}
                            isDisabled={disabled && !checked}
                            colorScheme="green"
                            size="sm"
                            pointerEvents="none"
                          >
                            <Text fontSize="sm" ml={1}>
                              {formatBucketLabel(featureName, bucketName)}
                            </Text>
                          </Checkbox>
                        </Box>
                      );
                    })}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          {atLimit && (
            <Text fontSize="xs" color="orange.500" textAlign="center" mt={1} mb={1}>
              Maximum {MAX_FILTERS} filters reached
            </Text>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default FeatureSelector;
