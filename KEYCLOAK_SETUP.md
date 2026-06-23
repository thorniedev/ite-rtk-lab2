# Keycloak Setup For This Next.js App

This project uses the Keycloak-hosted login page. The Next.js app does not render a username/password form. It redirects users to Keycloak, receives the authorization-code callback, stores tokens in HTTP-only cookies, and uses server route handlers to call the ecommerce API.

## 1. Create The Client In Keycloak

1. Open the Keycloak Admin Console and select your realm.
2. Go to **Clients** -> **Create client**.
3. Set **Client type** to `OpenID Connect`.
4. Set **Client ID** to `lab2-nextjs`.
5. Enable **Standard flow**.
6. Use PKCE with `S256` if your Keycloak version exposes the PKCE setting.
7. For a local classroom/dev setup, client authentication can be **Off** for a public client. If you turn it **On**, copy the generated secret into `KEYCLOAK_CLIENT_SECRET`.
8. Set **Valid redirect URIs**:

```text
http://localhost:3000/api/auth/callback
```

9. Set **Valid post logout redirect URIs**:

```text
http://localhost:3000/*
```

10. Set **Web origins**:

```text
http://localhost:3000
```

## 2. Configure Environment Variables

Create or update `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
SPRINGBOOT_API_URL=http://localhost:7070
ECOMMERCE_API_URL=http://localhost:7070

KEYCLOAK_BASE_URL=http://localhost:9090
KEYCLOAK_REALM=ite
KEYCLOAK_CLIENT_ID=ecommerce-api

# Optional. Only needed when Keycloak client authentication is enabled.
KEYCLOAK_CLIENT_SECRET=

# Optional. Defaults to NEXT_PUBLIC_APP_URL + /api/auth/callback.
# KEYCLOAK_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

Restart `npm run dev` after changing environment variables.

## 3. How Security Works

- `/product-table/*` is protected by `src/proxy.ts`.
- Unauthenticated users are redirected to `/login`.
- `/login` links to `/api/auth/login`, which redirects to the default Keycloak login form.
- `/api/auth/callback` exchanges the authorization code using PKCE.
- Access, refresh, and ID tokens are stored as HTTP-only cookies.
- RTK Query does not read tokens or the Spring Boot host. It calls `/api/ecommerce/products`.
- Next.js route handlers forward requests to the ecommerce API and attach the Keycloak access token on the server.

## 4. Cache Behavior

There are two cache layers:

- **Next.js route handlers:** ecommerce proxy responses use `Cache-Control: no-store` and server `fetch(..., { cache: "no-store" })`, so protected product data is requested fresh and is not persisted in the framework cache.
- **RTK Query client cache:** `getProducts` provides the `Products` tag. `createProduct` invalidates that tag, so the table refetches after product creation. Update/delete buttons are hidden until Spring exposes those product endpoints.

This means list data feels fast in the browser while still refreshing automatically after CRUD operations.

## 5. Error Catch Behavior

Route handlers catch external API/network failures and return JSON errors instead of crashing the app. Client mutations use `toast.promise(...)`, so product creation shows loading, success, and error notifications from the same RTK Query promise.
