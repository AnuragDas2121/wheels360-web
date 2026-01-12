import { createRoot } from "react-dom/client";
import { Helmet } from "react-helmet";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <title>Wheels360 | Premium Car Marketplace</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
      <meta name="description" content="Find your perfect car with Wheels360 - connecting car buyers with trusted dealers and providing tools to make informed automotive decisions." />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </Helmet>
    <App />
  </>
);
