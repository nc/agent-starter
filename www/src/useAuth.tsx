import { useRoot } from "./useRoot";
import { useSnapshot } from "valtio/react";
import { useCallback, useEffect } from "react";
import { client } from "./App";

export function useAuth() {
  const { store } = useRoot();
  const { session, user } = useSnapshot(store);

  useEffect(() => {
    client.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "USER_UPDATED":
          store.user = session?.user ?? null;
          break;
        case "TOKEN_REFRESHED":
        case "INITIAL_SESSION":
        case "SIGNED_IN":
          client.auth.startAutoRefresh();
          store.session = session;
          store.user = session?.user ?? null;
          break;
        case "SIGNED_OUT":
          store.user = null;
          store.session = null;
          break;
      }
    });
  }, []);
  useEffect(() => {
    if (user) {
      client.auth.startAutoRefresh();
    }
  }, [user]);

  const signInAnon = useCallback(async () => {
    const { data, error } = await client.auth.signInAnonymously();
    if (data) {
      store.session = data.session;
      store.user = data.user;
    } else {
      console.error("anon sign in error", error);
    }
  }, []);

  useEffect(() => {
    signInAnon();
  }, []);

  return { session, user };
}
