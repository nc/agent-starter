import { useState, useCallback, CSSProperties } from "react";
import { Composer } from "./Composer";
import { useRoot } from "./useRoot";
import { ChatId } from "./types";

export function Input({
  cid,
  placeholder,
  style,
}: {
  placeholder: string;
  cid?: ChatId | null;
  style?: CSSProperties;
}) {
  const { actions } = useRoot();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(false);

  const inputFocus = useCallback(() => {
    setSelected(true);
  }, []);

  const inputBlur = useCallback(() => {
    setSelected(false);
  }, []);

  const handleEnter = useCallback(
    (text: string) => {
      console.log({ text, cid });
      actions.query(text, cid);
    },
    [cid]
  );

  const handleSendClick = useCallback(() => {
    actions.query(query, cid);
  }, [query, cid]);

  return (
    <div
      className="Input"
      style={{
        width: "calc(100% - 22px)",
        display: "flex",
        maxWidth: 506,
        position: "relative",
        ...style,
      }}
    >
      <Composer
        // don't set this to disabled as it
        // will prevent the user from typing
        disabled={false}
        onChange={setQuery}
        onEnter={handleEnter}
        placeholder={placeholder}
        onFocus={inputFocus}
        onBlur={inputBlur}
      />
      <button
        style={{
          zIndex: 9999,
          background:
            selected && query.length > 0
              ? "lightgreen"
              : "rgba(255,255,255,0.0)",
          color:
            selected && query.length > 0 ? "black" : "rgba(255,255,255,0.0)",
          border: "none",
          fontSize: 13,
          height: 22,
          borderRadius: 6,
          transform: "translateZ(0)",
          padding: "0px 11px",
          fontWeight: 600,
          position: "absolute",
          bottom: 6,
          right: 6,
          cursor: "pointer",
        }}
        onClick={handleSendClick}
      >
        ok
      </button>
    </div>
  );
}
