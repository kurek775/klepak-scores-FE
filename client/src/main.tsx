import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <FluentProvider theme={webLightTheme}>
      <App />
    </FluentProvider>
  </BrowserRouter>
);
