import { useState } from "react";
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaBolt } from "react-icons/fa";
import apiClient from "../services/api-client";
import { track } from "../utils/analytics";

/** Email capture for the EV Radar digest. Used in the footer (and reusable elsewhere). */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const border = useColorModeValue("rgba(34,197,94,0.3)", "rgba(34,197,94,0.4)");
  const subText = useColorModeValue("gray.600", "gray.400");

  const submit = async () => {
    if (!email.trim()) return;
    setState("loading");
    try {
      await apiClient.post("/newsletter/subscribe", { email, website: "" });
      setState("done");
      track("newsletter_subscribe", { location: "footer" });
    } catch (err: any) {
      setState("error");
      setMessage(
        err?.response?.data?.detail || "Something went wrong — please try again."
      );
    }
  };

  if (state === "done") {
    return (
      <HStack spacing={2}>
        <Icon as={FaBolt} color="green.500" />
        <Text fontSize="sm" fontWeight="600" color="green.500">
          You're in! Watch your inbox for EV Radar.
        </Text>
      </HStack>
    );
  }

  return (
    <Box>
      <Text fontWeight="600" fontSize="sm" mb={2}>
        ⚡ EV Radar — price drops & new EVs, weekly
      </Text>
      <HStack maxW="360px">
        <Input
          size="sm"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          borderColor={border}
          borderRadius="full"
          aria-label="Email address"
        />
        <Button
          size="sm"
          colorScheme="green"
          borderRadius="full"
          px={5}
          onClick={submit}
          isLoading={state === "loading"}
          flexShrink={0}
        >
          Subscribe
        </Button>
      </HStack>
      {state === "error" && (
        <Text fontSize="xs" color="red.400" mt={1}>
          {message}
        </Text>
      )}
      <Text fontSize="xs" color={subText} mt={1}>
        No spam. Unsubscribe anytime.
      </Text>
    </Box>
  );
}
