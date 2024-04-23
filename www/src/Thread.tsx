import { useRoot } from "./useRoot";
import { useSnapshot } from "valtio/react";
import { CSSProperties, ReactNode } from "react";
// import { Markdown } from "./Markdown";
import { Brain } from "@phosphor-icons/react";
import { CircularProgress } from "@chakra-ui/react";
import { INTERNAL_Snapshot } from "valtio";
import { ChatId, ThreadId, Message } from "./types";

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const DEBUG = false;

export function Thread({
  tid,
  cid,
  messages,
}: {
  cid: ChatId;
  tid: ThreadId;
  messages: INTERNAL_Snapshot<Record<ThreadId, Message[]>>;
}) {
  const { store } = useRoot();
  const { searching } = useSnapshot(store);
  const mx = messages[tid];
  const query = mx.find((m) => m.role == "user")?.content;
  const progress = mx.filter(
    (m) => m.role == "assistant" && m.type != "answerToken"
  ).length;
  const progressValue = Math.max((progress / 6) * 100, 0.1);
  const shouldSpin = progressValue < 0.15;
  const streamedAnswer = mx
    .filter((m) => m.role == "assistant" && m.type == "answerToken")
    .map((m) => m.content)
    .join("");
  const answer = mx.find(
    (m) => m.role == "assistant" && m.type == "answer"
  )?.content;
  const hasContent = searching || streamedAnswer || answer;
  const statusStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.08)",
    padding: "6px 11px",
    fontWeight: 600,
    borderRadius: 9,
    marginLeft: 6,
  };

  let transformedAnswer: string | null = null;
  if (streamedAnswer.length > 0) {
    transformedAnswer = `${streamedAnswer} •`;
    if (answer) {
      transformedAnswer = answer;
    }
  }

  let status: ReactNode = (
    <div style={statusStyle}>
      <Brain />
      Thinking
    </div>
  );

  if (answer) {
    status = null;
  }

  const answerNode = (
    <div
      style={{
        maxWidth: 506,
        marginTop: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {streamedAnswer.length > 0 ? (
        <span style={{ fontSize: 15 }}>{transformedAnswer}</span>
      ) : status ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "rgba(255,255,255,0.38)",
            position: "relative",
          }}
        >
          <div style={{ width: 22, height: 22 }}>
            <CircularProgress
              color="lightgreen"
              style={{
                width: 22,
                height: 22,
                position: "absolute",
                top: -8,
              }}
              capIsRound={true}
              isIndeterminate={shouldSpin}
              trackColor="rgba(255,255,255, 0.1)"
              value={progressValue}
              thickness={11}
            ></CircularProgress>
          </div>
          {status}
        </span>
      ) : null}
    </div>
  );

  return (
    <div
      className="Thread"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        maxWidth: 506,
        width: "100%",
        justifyContent: "flex-start",
        gap: "0px",
        paddingRight: 0,
        fontFamily: "Inter",
      }}
    >
      {DEBUG ? (
        <span
          style={{
            color: "rgba(255,255,255,0.77)",
            display: "flex",
            marginTop: 44,
            flexDirection: "column",
          }}
        >
          <code>{cid}</code>
          <code>{tid}</code>
        </span>
      ) : null}
      <h4 style={{ marginTop: 22, color: "white" }}>
        {capitalizeFirstLetter(query ?? "")}
      </h4>
      {hasContent ? (
        <div
          style={{
            border: "none",
            maxWidth: 600,
            display: "flex",
            flexDirection: "column",
            width: "calc(100%)",
            boxShadow: "none",
            outline: "none",
            color: "rgba(255,255,255,0.77)",
            lineHeight: "22px",
          }}
        >
          {answerNode}
        </div>
      ) : null}
    </div>
  );
}
