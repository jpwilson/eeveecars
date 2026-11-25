import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../services/supabase-client";
import { trackSignup } from "../utils/analytics";

const TRACKED_SIGNUP_PREFIX = "oauth_signup_tracked";

const OAUTH_METHODS: Record<string, "google" | "twitter" | "linkedin"> = {
  google: "google",
  twitter: "twitter",
  linkedin_oidc: "linkedin",
};

function getOauthSignupMethod(user: User): "google" | "twitter" | "linkedin" | null {
  const provider = user.app_metadata?.provider;
  if (typeof provider !== "string") return null;
  return OAUTH_METHODS[provider] ?? null;
}

function isFirstSignIn(user: User): boolean {
  if (!user.created_at || !user.last_sign_in_at) return false;

  const createdAt = Date.parse(user.created_at);
  const lastSignInAt = Date.parse(user.last_sign_in_at);
  if (Number.isNaN(createdAt) || Number.isNaN(lastSignInAt)) return false;

  // Supabase timestamps can differ by a few seconds for first-login OAuth flows.
  return Math.abs(lastSignInAt - createdAt) <= 60_000;
}

function getTrackedSignupStorageKey(userId: string, method: string): string {
  return `${TRACKED_SIGNUP_PREFIX}:${userId}:${method}`;
}

/**
 * Handles OAuth and magic link redirects.
 * Supabase SDK automatically processes the URL hash fragment.
 * This page shows a loading spinner, then redirects home.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const maybeTrackOauthSignup = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      if (!authUser) return;

      const method = getOauthSignupMethod(authUser);
      if (!method || !isFirstSignIn(authUser)) return;

      const storageKey = getTrackedSignupStorageKey(authUser.id, method);
      try {
        if (window.sessionStorage.getItem(storageKey) === "1") return;
      } catch {
        // Ignore storage access failures (e.g. strict browser privacy settings).
      }

      trackSignup(authUser.id, method);
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // Ignore storage access failures (e.g. strict browser privacy settings).
      }
    };

    void maybeTrackOauthSignup();

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
