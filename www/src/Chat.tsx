import { useRoot } from "./useRoot";
import { useSnapshot } from "valtio/react";
import { ChatId, ThreadId } from "./types";
import { Thread } from "./Thread";

export function Chat({ cid }: { cid: ChatId }) {
  const { store } = useRoot();
  const { messages } = useSnapshot(store);
  const tids = Object.keys(messages[cid]);
  return (
    <div
      style={{
        maxWidth: 506,
        borderRadius: 9,
      }}
    >
      {tids.map((tid) => (
        <div key={tid}>
          <Thread
            key={tid}
            cid={cid}
            tid={tid as ThreadId}
            messages={messages[cid]}
          />
        </div>
      ))}
    </div>
  );
}
