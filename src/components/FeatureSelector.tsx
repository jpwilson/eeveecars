import useFeatures from "../hooks/useFeatures";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
} from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";

const FeatureSelector = () => {
  const { features, isLoading, error } = useFeatures();

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
                  <MenuItem key={bucketName} as={Button}>
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
