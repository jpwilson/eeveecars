import { Button, Center, Heading, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { FaBolt } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import CatalogPage from "./CatalogPage";
import NotFoundPage from "../../pages/NotFoundPage";
import { isCatalogUnavailable, isNotFound } from "../../hooks/useCatalog";

/** 404 → the site's 404 page; 503 → "not available yet"; anything else → retry message. */
export default function CatalogError({ error }: { error: unknown }) {
  const sub = useColorModeValue("gray.600", "gray.400");
  if (isNotFound(error)) return <NotFoundPage />;
  const unavailable = isCatalogUnavailable(error);
  return (
    <CatalogPage>
      <Center minH="50vh">
        <VStack spacing={3} textAlign="center" maxW="md">
          <Icon as={FaBolt} color="green.500" boxSize={8} />
          <Heading size="md">{unavailable ? "This page is not available yet" : "Could not load this page"}</Heading>
          <Text color={sub}>
            {unavailable
              ? "The new car catalog is still being switched on. The rest of the site works as usual."
              : "The server did not answer. Please try again in a moment."}
          </Text>
          <Button as={RouterLink} to="/" colorScheme="green" borderRadius="full">
            Browse all EVs
          </Button>
        </VStack>
      </Center>
    </CatalogPage>
  );
}
