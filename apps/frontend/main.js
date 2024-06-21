import { WebContainer } from "@webcontainer/api";
// import { files } from "./files";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import axios from "axios";
import "@xterm/xterm/css/xterm.css";
import "./style.css";

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;
window.addEventListener("load", async () => {
  const response = await axios.get("http://localhost:3000/mounted-data");
  const files = response.data;
  textareaEl.value = files["package.json"].file.contents;
  textareaEl.addEventListener("input", (e) => {
    writeIndexJS(e.currentTarget.value);
  });

  const fitAddon = new FitAddon();

  const terminalBe = new Terminal({
    convertEol: true,
  });

  terminalBe.loadAddon(fitAddon);
  terminalBe.open(beTerminalEl);

  const terminalFe = new Terminal({
    convertEol: true,
  });

  terminalFe.loadAddon(fitAddon);
  terminalFe.open(feTerminalEl);

  fitAddon.fit();

  // Call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  // Wait for `server-ready` event
  webcontainerInstance.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });

  const shellProcess = await startShell(terminalBe);
  window.addEventListener("resize", () => {
    fitAddon.fit();
    shellProcess.resize({
      cols: terminalBe.cols,
      rows: terminalBe.rows,
    });
  });

  const shellProcessFe = await startShell(terminalFe);
  window.addEventListener("resize", () => {
    fitAddon.fit();
    shellProcessFe.resize({
      cols: terminalFe.cols,
      rows: terminalFe.rows,
    });
  });
});

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

async function startShell(terminal) {
  const shellProcess = await webcontainerInstance.spawn("jsh", {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  });
  // await webcontainerInstance.spawn("git", ["--version"]);
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );
  const input = shellProcess.input.getWriter();
  terminal.onData((data) => {
    input.write(data);
  });
  return shellProcess;
}

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector("iframe");

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector("textarea");

/** @type {HTMLTextAreaElement | null} */
const beTerminalEl = document.querySelector(".terminal-be");
const feTerminalEl = document.querySelector(".terminal-fe");
