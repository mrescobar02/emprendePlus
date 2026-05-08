/** @format */

// src/main.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "preline/dist/preline.js";
import "./styles.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import { Auth0Provider } from "@auth0/auth0-react";

const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI as string;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: redirectUri,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      scope: "openid profile email",
    }}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>
);
