import { Box, Button, Center, Heading, HStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { FaBolt } from "react-icons/fa";
import { Link as RouterLink, useRouteError } from "react-router-dom";
import NavBar from "../components/NavBar";

/** Branded 404 / route-error page (also used as the router errorElement). */
export default function NotFoundPage() {
  // When used as errorElement this returns the thrown error; harmless otherwise
  const error = useRouteError() as { status?: number } | undefined;
  const subText = useColorModeValue("gray.600", "gray.400");
  const is404 = !error || error.status === 404;

  return (
    <Box>
      <NavBar />
      <Center minH="60vh" px={4}>
        <Box textAlign="center">
          <Icon as={FaBolt} color="green.500" boxSize={10} mb={4} />
          <Heading size="lg" mb={2}>
            {is404 ? "Page not found" : "Something went wrong"}
          </Heading>
          <Text color={subText} mb={8} maxW="md">
            {is404
              ? "That page doesn't exist — but every electric vehicle on the market is one click away."
              : "An unexpected error occurred. The rest of the site is fine — head back home."}
          </Text>
          <HStack justify="center" spacing={4}>
            <Button as={RouterLink} to="/" colorScheme="green" borderRadius="full">
              Browse all EVs
            </Button>
            <Button
              as={RouterLink}
              to="/advertise"
              variant="outline"
              colorScheme="green"
              borderRadius="full"
            >
              Advertise
            </Button>
          </HStack>
        </Box>
      </Center>
    </Box>
  );
}
