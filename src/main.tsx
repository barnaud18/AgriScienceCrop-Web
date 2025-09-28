import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("App mounted successfully");
  } catch (error) {
    console.error("Error mounting app:", error);
  }
}
