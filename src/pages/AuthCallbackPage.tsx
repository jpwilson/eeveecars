import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

/**
 * Handles OAuth and magic link redirects.
 * Supabase SDK automatically processes the URL hash fragment.
 * This page shows a loading spinner, then redirects home.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Give the Supabase SDK a moment to process the hash
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="green.500" thickness="4px" />
        <Text color="gray.500">Signing you in...</Text>
      </VStack>
    </Center>
  );
}
