import { createContext, useCallback, useEffect } from "react";
import { proxy, ref, useSnapshot } from "valtio";
import { uuidv7 } from "uuidv7";
import { Session, User } from "@supabase/supabase-js";
import { ChatId, ThreadId, Message, MessageZod } from "./types";

const store = proxy<{
  messages: Record<ChatId, Record<ThreadId, Message[]>>;
  ws: WebSocket | null;
  timeoutID: NodeJS.Timeout | null;
  searching: boolean;
  session: Session | null;
  user: User | null;
  cid: ChatId | null;
}>({
  messages: {},
  cid: null,
  ws: null,
  timeoutID: null,
  searching: false,
  user: null,
  session: null,
});

function query(q: string, cid?: ChatId | null) {
  console.log("query", q);
  let isNewChat = !cid;
  console.log("[query] isNewChat", isNewChat);
  let _cid: ChatId = isNewChat ? `cid-${uuidv7()}` : cid!;
  if (q.length == 0) {
    console.log("[query] empty");
    return;
  }
  const tid: ThreadId = `tid-${uuidv7()}`;
  const userMessage = MessageZod.parse({
    role: "user",
    content: q,
    tid,
    cid: _cid,
    isNewChat,
  });
  store.messages[_cid] ||= {};
  store.messages[_cid][tid] = [userMessage];
  store.searching = true;
  store.ws!.send(JSON.stringify(userMessage));
}

const SERVER = import.meta.env.DEV
  ? "ws://localhost:8787/ws"
  : "wss://jupiter-q.teamspace.workers.dev/ws";

export function useWS() {
  const { store } = useRoot();
  const { session } = useSnapshot(store);

  const handleOpen = useCallback(() => {
    clearTimeout(store.timeoutID!);
    store.timeoutID = null;
    console.log("Opened websocket");
  }, [session]);

  const handleClose = useCallback(() => {
    console.log("Closed websocket");
  }, [session]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      console.log("Received message", event.data);
      const message = MessageZod.parse(JSON.parse(event.data));
      store.messages[message.cid as ChatId] ||= {};
      store.messages[message.cid as ChatId][message.tid as ThreadId].push(
        message
      );
      if (message.role == "assistant" && message.type == "answerToken") {
        store.searching = false;
      }
    },
    [session]
  );

  const connect = useCallback(() => {
    if (store.ws && store.ws.readyState === WebSocket.OPEN) {
      return store.ws;
    }
    const url = new URL(SERVER);
    store.ws = ref(new WebSocket(url));
    if (!store.ws) {
      console.error("Failed to open websocket");
      return null;
    }

    store.ws.addEventListener("open", handleOpen);
    store.ws.addEventListener("close", handleClose);
    store.ws.addEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    window.addEventListener("focus", connect);
    const socket = connect();
    if (socket) {
      store.ws = ref(socket);
    } else {
      console.log("Failed to open websocket, retrying in 1s");
      store.timeoutID = setTimeout(() => connect(), 1000);
    }
    return () => {
      console.log("Closing websocket");
      window.removeEventListener("focus", connect);
      store.ws?.close();
    };
  }, [session]);
}

export function useRoot() {
  return {
    store,
    actions: {
      query,
    },
  };
}

const StoreContext = createContext(store);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
