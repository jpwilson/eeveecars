import { Box, Skeleton, SimpleGrid } from "@chakra-ui/react";
import CatalogPage from "./CatalogPage";

export function CatalogLoading() {
  return (
    <CatalogPage>
      <Skeleton height="28px" width="260px" mb={4} borderRadius="8px" />
      <Skeleton height="220px" mb={6} borderRadius="16px" />
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Box key={i}>
            <Skeleton height="140px" borderRadius="14px" />
          </Box>
        ))}
      </SimpleGrid>
    </CatalogPage>
  );
}
