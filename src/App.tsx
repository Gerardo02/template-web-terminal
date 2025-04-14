import { Terminal } from "@xterm/xterm"
import { useEffect, useRef } from "react"
import { loadWasm } from "./wasm-loader";


const App = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const commandBuffer = useRef("")

  let inputBuffer = "";
  let promptPrefix = ">> ";
  let promptStart = 0;

  useEffect(() => {
    loadWasm().then(() => {
      console.log("WASM ready");
    });
  }, [])

  useEffect(() => {
    if (termInstance.current) return;

    const terminal = new Terminal({
      convertEol: true,
      cursorBlink: true,
    });

    terminal.onCursorMove(() => console.log("moveee"))

    terminal.open(terminalRef.current!);
    termInstance.current = terminal;
    terminal.write("Hello user! This is the cera programming language!\n")
    terminal.write("Feel free to type in commands!\n\n")

    const prompt = () => {
      terminal.write(`${promptPrefix}`);
      inputBuffer = "";
      promptStart = terminal.buffer.active.cursorX;
    }


    const evaluateCommand = (command: string) => {
      const output = (window as any).interpret(command)
      terminal.write(`\r\n${output}`);
      prompt();
    };

    prompt();

    terminal.onKey(({ key, domEvent }) => {

      const char = key;
      const k = domEvent.key;

      // ENTER
      if (k === "Enter") {
        evaluateCommand(inputBuffer);
        return;
      }

      // BACKSPACE
      if (k === "Backspace") {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          terminal.write("\b \b");
        }
        return;
      }

      // Prevent cursor from moving around with arrows
      if (
        k === "ArrowLeft" ||
        k === "ArrowRight" ||
        k === "ArrowUp" ||
        k === "ArrowDown"
      ) {
        domEvent.preventDefault();
        return;
      }

      // Ignore control/meta/alt key combos (Ctrl+C, etc)
      if (domEvent.ctrlKey || domEvent.metaKey || domEvent.altKey) {
        return;
      }

      // Regular character input
      if (char.length === 1) {
        inputBuffer += char;
        terminal.write(char);
      }
    })

  }, []);

  return (
    <div>
      <div ref={terminalRef} id="terminal"></div>
    </div>
  )
}

export default App
