import { useRoot } from "./useRoot";
import { useSnapshot } from "valtio/react";
import { Chat } from "./Chat";
import { ChatId } from "./types";
import { Input } from "./Input";

export function Search() {
  const { store } = useRoot();
  const { messages } = useSnapshot(store);

  const inputNode = <Input placeholder={"Write a short story about..."} />;
  return (
    <div
      className="Query"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: "0px",
        paddingTop: 11,
        paddingLeft: 22,
        paddingRight: 0,
        paddingBottom: 22,
        fontFamily: "Inter",
      }}
    >
      <div style={{ width: "100%" }}>{inputNode}</div>
      <div>
        {(Object.keys(messages) as ChatId[]).reverse().map((cid) => (
          <Chat key={cid} cid={cid} />
        ))}
      </div>
    </div>
  );
}
