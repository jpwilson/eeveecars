import useFeatures from "../hooks/useFeatures";
import { Features } from "../hooks/useFeatures";
import { BsChevronDown } from "react-icons/bs";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  useColorMode,
} from "@chakra-ui/react";

interface Props {
  onSelectFeature: (
    featureName: string,
    bucketName: string,
    carIds: number[]
  ) => void;
  selectedFeatureName: string | null;
  selectedBucketName: string | null; // Add this
}

const FeatureSelector = ({
  onSelectFeature,
  selectedFeatureName,
  selectedBucketName,
}: Props) => {
  const { features, isLoading, error } = useFeatures();
  const { colorMode } = useColorMode(); // Use color mode for styling

  if (isLoading) return "Loading...";
  if (error) return null; // rather show nothing `Error: ${error}`;
  if (!features) return null;

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        Features
      </MenuButton>
      <MenuList>
        <VStack>
          {Object.entries(features).map(([featureName, featureValues]) => (
            <Menu key={featureName}>
              <MenuButton as={Button} rightIcon={<BsChevronDown />}>
                {featureName}
              </MenuButton>
              <MenuList>
                {Object.entries(featureValues).map(([bucketName, carIds]) => (
                  <MenuItem
                    onClick={() =>
                      onSelectFeature(featureName, bucketName, carIds)
                    }
                    key={bucketName}
                    as={Button}
                    backgroundColor={
                      featureName === selectedFeatureName &&
                      bucketName === selectedBucketName
                        ? colorMode === "light"
                          ? "blue.200"
                          : "blue.500"
                        : colorMode === "light"
                        ? "gray.100"
                        : "gray.700"
                    }
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
