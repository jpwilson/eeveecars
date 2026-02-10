import { useState } from "react";
import {
  Box,
  Collapse,
  HStack,
  Image,
  List,
  ListItem,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import useMakes, { Make } from "../hooks/useMakes";
import ColorModeSwitch from "./ColorModeSwitch";

interface Props {
  onSelectMake: (make: Make | null) => void;
  selectedMake: Make | null;
  showDarkModeToggle?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  defunct: "red.400",
  acquired: "orange.400",
  "pre-production": "blue.400",
};

const ManufacturerList = ({
  selectedMake,
  onSelectMake,
  showDarkModeToggle = false,
}: Props) => {
  const { data, isLoading, error } = useMakes();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showDefunct, setShowDefunct] = useState(false);

  const textColor = useColorModeValue("gray.700", "gray.200");
  const selectedBg = useColorModeValue(
    "rgba(22, 163, 74, 0.1)",
    "rgba(22, 163, 74, 0.2)"
  );
  const selectedBorder = useColorModeValue(
    "rgba(22, 163, 74, 0.3)",
    "rgba(22, 163, 74, 0.4)"
  );
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const dividerColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const containerBorder = useColorModeValue(
    "rgba(22, 163, 74, 0.08)",
    "rgba(22, 163, 74, 0.15)"
  );
  const dimmedTextColor = useColorModeValue("gray.400", "gray.500");

  if (error) return null;
  if (isLoading) return <Spinner color="green.500" />;

  const sortBrands = (brands: Make[]) =>
    [...brands].sort((a, b) => {
      if (a.name === "Tesla") return -1;
      if (b.name === "Tesla") return 1;
      if (a.name === "Rivian") return -1;
      if (b.name === "Rivian") return 1;
      return a.name.localeCompare(b.name);
    });

  const allBrands = data ?? [];
  const activeBrands = sortBrands(
    allBrands.filter((m) => (m.status ?? "active") === "active")
  );
  const comingSoonBrands = sortBrands(
    allBrands.filter((m) => m.status === "pre-production")
  );
  const defunctBrands = sortBrands(
    allBrands.filter((m) => m.status === "defunct" || m.status === "acquired")
  );

  const renderBrandItem = (make: Make, dimmed = false) => {
    const isSelected = make.id === selectedMake?.id;
    const statusColor = STATUS_COLORS[make.status ?? ""];
    return (
      <ListItem key={make.id}>
        <HStack
          as="button"
          w="full"
          py={1.5}
          px={2}
          spacing={2}
          borderRadius="10px"
          bg={isSelected ? selectedBg : "transparent"}
          border="1px solid"
          borderColor={isSelected ? selectedBorder : "transparent"}
          onClick={() => onSelectMake(make)}
          _hover={{ bg: isSelected ? selectedBg : hoverBg }}
          transition="all 0.2s"
          justify="center"
          opacity={dimmed && !isSelected ? 0.6 : 1}
        >
          <Image
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            width="28px"
            height="28px"
            borderRadius="6px"
            p={0.5}
            src={make.lrg_logo_img_url}
            objectFit="contain"
            flexShrink={0}
            filter={dimmed && !isSelected ? "grayscale(50%)" : "none"}
          />
          <Text
            fontWeight={isSelected ? "600" : "400"}
            fontSize="sm"
            color={isSelected ? "#16a34a" : dimmed ? dimmedTextColor : textColor}
            noOfLines={1}
          >
            {make.name}
          </Text>
          {statusColor && (
            <Box
              boxSize="6px"
              borderRadius="full"
              bg={statusColor}
              flexShrink={0}
              title={make.status}
            />
          )}
        </HStack>
      </ListItem>
    );
  };

  const renderCollapsibleSection = (
    label: string,
    brands: Make[],
    isOpen: boolean,
    toggle: () => void,
    dimmed: boolean
  ) => (
    <Box mt={3} pt={3} borderTop="1px solid" borderColor={dividerColor}>
      <HStack
        as="button"
        w="full"
        py={1.5}
        px={2}
        spacing={2}
        borderRadius="8px"
        _hover={{ bg: hoverBg }}
        transition="all 0.2s"
        onClick={toggle}
        justify="center"
      >
        <Box as={isOpen ? FaChevronDown : FaChevronRight} boxSize={2.5} color={dimmedTextColor} />
        <Text fontSize="xs" fontWeight="500" color={dimmedTextColor}>
          {label} ({brands.length})
        </Text>
      </HStack>
      <Collapse in={isOpen} animateOpacity>
        <List spacing={0.5} mt={1}>
          {brands.map((make) => renderBrandItem(make, dimmed))}
        </List>
      </Collapse>
    </Box>
  );

  return (
    <Box
      borderRight="1px solid"
      borderColor={containerBorder}
      pr={2}
    >
      <List spacing={0.5}>
        <ListItem>
          <Box
            as="button"
            w="full"
            py={2}
            borderRadius="10px"
            bg={!selectedMake ? selectedBg : "transparent"}
            border="1px solid"
            borderColor={!selectedMake ? selectedBorder : "transparent"}
            fontWeight={!selectedMake ? "600" : "500"}
            fontSize="sm"
            color={!selectedMake ? "#16a34a" : textColor}
            onClick={() => onSelectMake(null)}
            _hover={{ bg: !selectedMake ? selectedBg : hoverBg }}
            transition="all 0.2s"
            textAlign="center"
          >
            All EVs
          </Box>
        </ListItem>
        {activeBrands.map((make) => renderBrandItem(make))}
      </List>

      {/* Coming Soon section */}
      {comingSoonBrands.length > 0 &&
        renderCollapsibleSection(
          "Coming Soon",
          comingSoonBrands,
          showComingSoon,
          () => setShowComingSoon(!showComingSoon),
          true
        )}

      {/* Discontinued section */}
      {defunctBrands.length > 0 &&
        renderCollapsibleSection(
          "Discontinued",
          defunctBrands,
          showDefunct,
          () => setShowDefunct(!showDefunct),
          true
        )}

      {showDarkModeToggle && (
        <Box mt={6} pt={4} borderTop="1px solid" borderColor={dividerColor}>
          <ColorModeSwitch />
        </Box>
      )}
    </Box>
  );
};

export default ManufacturerList;
