import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { worker } from "./mocks/browser";
import { seedDatabase } from "./lib/db";

async function prepare() {
  await worker.start({
    onUnhandledRequest: "bypass",
  });
  await seedDatabase();
  console.log(" MSW and Database ready");
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
