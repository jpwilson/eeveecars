import { ReactNode } from "react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Image, useColorModeValue } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import NavBar from "../NavBar";

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs?: Crumb[];
  maxW?: string;
  children: ReactNode;
}

/** Shared chrome for catalog pages: nav, faint hero background, breadcrumb, container. */
export default function CatalogPage({ crumbs, maxW = "1200px", children }: Props) {
  const heroBgOpacity = useColorModeValue(0.04, 0.06);
  const crumbColor = useColorModeValue("gray.500", "gray.400");
  return (
    <Box minH="100vh" position="relative" overflowX="hidden">
      <Box
        position="fixed"
        top="50%"
        left="50%"
        width="120%"
        height="120%"
        transform="translate(-50%, -50%)"
        pointerEvents="none"
        zIndex={0}
        opacity={heroBgOpacity}
      >
        <Image src="/pub_assets/hero-ev.png" alt="" width="100%" height="100%" objectFit="contain" />
      </Box>
      <Box position="relative" zIndex={1}>
        <NavBar />
        <Box maxW={maxW} mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
          {crumbs && crumbs.length > 0 && (
            <Breadcrumb
              fontSize="sm"
              color={crumbColor}
              mb={4}
              separator={<ChevronRightIcon color="gray.400" />}
              sx={{ "& ol": { flexWrap: "wrap" } }}
            >
              {crumbs.map((c, i) => (
                <BreadcrumbItem key={`${c.label}-${i}`} isCurrentPage={!c.to}>
                  {c.to ? (
                    <BreadcrumbLink as={RouterLink} to={c.to} _hover={{ color: "#16a34a" }}>
                      {c.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbLink as="span" fontWeight="600" cursor="default" _hover={{ textDecoration: "none" }}>
                      {c.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
}
