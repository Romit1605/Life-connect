import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

console.log("main.tsx is loading...");

const rootElement = document.getElementById("root");

if (rootElement) {
    console.log("Creating React root and rendering App...");
    createRoot(rootElement).render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
    console.log("Render initiated!");
} else {
    console.error("Root element not found!");
    document.body.innerHTML = "<h1>ERROR: Root element not found</h1>";
}
