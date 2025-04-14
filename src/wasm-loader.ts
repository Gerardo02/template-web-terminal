export const loadWasm = async () => {
  await loadWasmExec()

  const go = new (window as any).Go();
  const wasm = await WebAssembly.instantiateStreaming(
    fetch("/main.wasm"),
    go.importObject
  );
  await go.run(wasm.instance);
};

const loadWasmExec = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = "/wasm_exec.js";
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);

    document.body.appendChild(script);
  });
};
