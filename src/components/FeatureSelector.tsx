import useFeatures from "../hooks/useFeatures";
import { BsChevronDown } from "react-icons/bs";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

interface Props {
  onSelectFeature: (
    featureName: string,
    bucketName: string,
    carIds: number[]
  ) => void;
  selectedFeatureName: string | null;
  selectedBucketName: string | null;
}

const FeatureSelector = ({
  onSelectFeature,
  selectedFeatureName,
  selectedBucketName,
}: Props) => {
  const { features, isLoading, error } = useFeatures();

  const btnBg = useColorModeValue("white", "gray.700");
  const btnBorder = useColorModeValue("rgba(22, 163, 74, 0.25)", "rgba(22, 163, 74, 0.4)");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("rgba(22, 163, 74, 0.06)", "rgba(22, 163, 74, 0.15)");
  const menuBorder = useColorModeValue("gray.200", "gray.600");
  const selectedItemBg = useColorModeValue("green.50", "green.900");
  const defaultItemBg = useColorModeValue("white", "gray.700");

  if (isLoading) return null;
  if (error) return null;
  if (!features) return null;

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<BsChevronDown />}
        size="sm"
        bg={btnBg}
        color={textColor}
        border="1px solid"
        borderColor={btnBorder}
        borderRadius="10px"
        fontWeight="500"
        _hover={{ borderColor: "green.400", bg: hoverBg }}
        _active={{ borderColor: "green.500" }}
      >
        Feature Filter
      </MenuButton>
      <MenuList borderRadius="12px" boxShadow="lg" border="1px solid" borderColor={menuBorder}>
        <VStack spacing={1} p={1}>
          {Object.entries(features).map(([featureName, featureValues]) => (
            <Menu key={featureName}>
              <MenuButton
                as={Button}
                rightIcon={<BsChevronDown />}
                size="sm"
                variant="ghost"
                w="full"
                justifyContent="space-between"
                fontWeight="500"
                fontSize="sm"
                _hover={{ bg: "green.50", color: "green.700" }}
              >
                {featureName}
              </MenuButton>
              <MenuList borderRadius="12px" boxShadow="lg">
                {Object.entries(featureValues).map(([bucketName, carIds]) => (
                  <MenuItem
                    onClick={() =>
                      onSelectFeature(featureName, bucketName, carIds)
                    }
                    key={bucketName}
                    fontSize="sm"
                    bg={
                      featureName === selectedFeatureName &&
                      bucketName === selectedBucketName
                        ? selectedItemBg
                        : defaultItemBg
                    }
                    fontWeight={
                      featureName === selectedFeatureName &&
                      bucketName === selectedBucketName
                        ? "600"
                        : "400"
                    }
                    color={
                      featureName === selectedFeatureName &&
                      bucketName === selectedBucketName
                        ? "green.600"
                        : textColor
                    }
                    _hover={{ bg: "green.50", color: "green.700" }}
                  >
                    {bucketName}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          ))}
        </VStack>
      </MenuList>
    </Menu>
  );
};

export default FeatureSelector;
