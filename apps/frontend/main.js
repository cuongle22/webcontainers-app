import { WebContainer } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import axios from "axios";
import "@xterm/xterm/css/xterm.css";
import "./style.css";

let webcontainerInstance;

/** Initialize and return a Terminal instance */
function initTerminal(terminalElement, fitAddon) {
  const terminal = new Terminal({ convertEol: true });
  terminal.loadAddon(fitAddon);
  terminal.open(terminalElement);
  return terminal;
}

/** Resize terminal on window resize */
function setupWindowResizeListener(terminal, shellProcess) {
  window.addEventListener("resize", () => {
    shellProcess.resize({
      cols: terminal.cols,
      rows: terminal.rows,
    });
  });
}

/** Main application initialization */
async function initApp() {
  const response = await axios.get("http://localhost:8080/mounted-data");
  const files = response.data;

  const textareaEl = document.querySelector("textarea");
  textareaEl.value = files["package.json"].file.contents;
  textareaEl.addEventListener("input", (e) => {
    writeIndexJS(e.currentTarget.value);
  });

  const fitAddon = new FitAddon();
  const beTerminalEl = document.querySelector(".terminal-be");
  const feTerminalEl = document.querySelector(".terminal-fe");

  const terminalBe = initTerminal(beTerminalEl, fitAddon);
  const terminalFe = initTerminal(feTerminalEl, fitAddon);
  fitAddon.fit();

  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  webcontainerInstance.on("server-ready", (port, url) => {
    document.querySelector("iframe").src = url;
  });

  const shellProcessBe = await startShell(terminalBe, true);
  setupWindowResizeListener(terminalBe, shellProcessBe);

  const shellProcessFe = await startShell(terminalFe);
  setupWindowResizeListener(terminalFe, shellProcessFe);
}

window.addEventListener("load", initApp);

document.querySelector("#app").innerHTML = `
 <h2> Welcome to WebContainers</h2>
  <div class="container">
    <div class="editor">
      <textarea>Your repo:</textarea>
    </div>
    <div class="preview">
      <iframe src="loading.html"></iframe>
    </div>
  </div>
  <h3>Terminal</h3>
  <div class="terminal"> 
    <div class="terminal-be"></div>
    <div class="terminal-fe"></div>
  </div>
`;

async function startShell(terminal, isBackend = false) {
  const shellProcess = await webcontainerInstance.spawn("jsh", {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  });
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );
  const input = shellProcess.input.getWriter();

  // await webcontainerInstance.spawn("pnpm", ["install"]);
  if (isBackend) {
    await input.write("pnpm install\n");
  } else {
    await input.write("cd apps/web\n");
  }

  terminal.onData((data) => {
    input.write(data);
  });
  return shellProcess;
}
