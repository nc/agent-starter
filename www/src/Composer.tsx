import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import {
  EditorState,
  $getRoot,
  LexicalEditor,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import {
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { cx } from "./cx";

import "./Composer.css";

export function KeyPlugin(props: {
  onKeyDown: (
    event: KeyboardEvent,
    editor: LexicalEditor,
    state: EditorState
  ) => void;
}) {
  const [editor] = useLexicalComposerContext();

  mergeRegister(
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (event == null) {
          return false;
        }
        props.onKeyDown(event, editor, editor.getEditorState());
        return true;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event) => {
        if (event == null) {
          return false;
        }
        props.onKeyDown(event, editor, editor.getEditorState());
        return true;
      },
      COMMAND_PRIORITY_LOW
    )
  );
  return null;
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
export function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => editor.focus(), [editor]);
  return null;
}

// Focus Plugin
const useEditorFocus = () => {
  const [editor] = useLexicalComposerContext();
  // Possibly use useRef for synchronous updates but no re-rendering effect
  const [hasFocus, setFocus] = useState(false);

  useEffect(
    () =>
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setFocus(false);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
    []
  );

  useEffect(
    () =>
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setFocus(true);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
    []
  );

  return hasFocus;
};

type Props = {
  onFocus?: () => void;
  onBlur?: () => void;
};

export function FocusPlugin({ onFocus, onBlur }: Props): null {
  const focus = useEditorFocus();

  useEffect(() => {
    focus ? onFocus?.() : onBlur?.();
  }, [focus]);

  return null;
}

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "editor-paragraph",
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any) {
  console.error(error);
}

function EditorPlugin(props: {
  onMount: (editorState: EditorState, editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    props.onMount(editor.getEditorState(), editor);
  }, [editor]);
  return null;
}

function populateEditorState() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode(" "));
    root.append(paragraph);
  }
}
export function Composer({
  className,
  style,
  placeholder,
  onFocus,
  onBlur,
  onEnter,
  onHeightChange,
  onChange,
  disabled,
}: {
  className?: string;
  placeholder?: string;
  style?: CSSProperties;
  disabled: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onHeightChange?: (height: number) => void;
  onEnter?: (text: string) => void;
  onChange?: (text: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<LexicalEditor | null>(null);

  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    editorState: populateEditorState,
  };

  useEffect(() => {
    editorRef.current?.setEditable(!disabled);
  }, [disabled]);

  const handleChange = useCallback(
    (state: EditorState, editor: LexicalEditor) => {
      let initial = false;
      state.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        if (text === " ") {
          initial = true;
        }
        onChange?.(text.trim());
      });
      if (initial) {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
        });
      }

      window.requestAnimationFrame(() => {
        const height = ref.current?.getBoundingClientRect().height;
        if (height) onHeightChange?.(height);
      });
    },
    []
  );

  const hitEnterToSendCallback = useCallback(
    (e: KeyboardEvent, editor: LexicalEditor, state: EditorState) => {
      if (e.key == "Enter") {
        if (e.shiftKey) return;
        if (e.altKey) return;
        if (e.ctrlKey) return;
        if (e.metaKey) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        let text = "";
        state.read(() => {
          const root = $getRoot();
          text = root.getTextContent();
        });
        editor.update(() => {
          $getRoot().clear();
        });
        onEnter?.(text);
      }
    },
    []
  );
  return (
    <div
      ref={ref}
      className={cx(
        "Composer",
        "editor",
        className,
        disabled ? "disabled" : null
      )}
      style={style}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <EditorPlugin onMount={handleChange} />
        <KeyPlugin onKeyDown={hitEnterToSendCallback} />
        <FocusPlugin onFocus={onFocus} onBlur={onBlur} />
        <PlainTextPlugin
          contentEditable={
            <ContentEditable className={"editor-content-editable"} />
          }
          placeholder={
            <div className="editor-placeholder">
              {placeholder ?? "Ask a question"}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={handleChange} />
        <EditorRefPlugin editorRef={editorRef} />
        <HistoryPlugin />
        <AutoFocusPlugin />
      </LexicalComposer>
    </div>
  );
}
