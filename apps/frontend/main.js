import "@xterm/xterm/css/xterm.css";
import "./style.css";
import { initApp } from "./libs/shell";

window.addEventListener("load", initApp());

document.querySelector(".terminal").innerHTML = `
  <div class="terminal-be"></div>
  <div class="terminal-fe"></div>
`;
