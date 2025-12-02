import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as RNLinking from "react-native/Libraries/Linking/Linking";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { useAppNavigation } from "../navigation/useAppNavigation";

const parseTokensFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const hash = parsed.hash?.startsWith("#") ? parsed.hash.slice(1) : "";
    const search = parsed.search?.startsWith("?") ? parsed.search.slice(1) : "";
    const params = new URLSearchParams(hash || search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const error_description = params.get("error_description");
    return { access_token, refresh_token, error_description };
  } catch {
    return { access_token: null, refresh_token: null, error_description: "Invalid callback URL" };
  }
};

const AuthCallbackScreen = () => {
  const navigation = useAppNavigation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let mounted = true;
    const handleUrl = async (url: string | null) => {
      if (!mounted) return;
      if (!url) {
        setStatus("error");
        setMessage("No callback URL provided.");
        return;
      }
      const { access_token, refresh_token, error_description } = parseTokensFromUrl(url);
      if (error_description) {
        setStatus("error");
        setMessage(error_description);
        return;
      }
      if (!access_token || !refresh_token) {
        setStatus("error");
        setMessage("Missing access tokens in callback.");
        return;
      }
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      setStatus("success");
      setMessage("Signed in! Redirecting...");
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" as never }] });
    };

    RNLinking.getInitialURL().then(handleUrl);
    const sub = RNLinking.addEventListener("url", (event) => handleUrl(event.url));
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4dabf7" />
      <Text style={styles.text}>{message}</Text>
      {status === "error" ? <Text style={styles.error}>Please reopen the link from your email.</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030610",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    color: "#ff6b6b",
    textAlign: "center",
  },
});

export default AuthCallbackScreen;
