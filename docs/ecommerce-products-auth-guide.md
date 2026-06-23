# E-Commerce Frontend Products CRUD And Auth Guide

This guide connects the Next.js frontend to the current Spring Boot e-commerce API.

- Frontend: `http://localhost:3000`
- Spring API: `http://localhost:7070`
- Keycloak: `http://localhost:9090`
- Keycloak realm: `ite`
- Keycloak client: `ecommerce-api`

## 1. Environment

Create or update `.env.local` in the Next.js project:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

SPRINGBOOT_API_URL=http://localhost:7070
ECOMMERCE_API_URL=http://localhost:7070

KEYCLOAK_BASE_URL=http://localhost:9090
KEYCLOAK_REALM=ite
KEYCLOAK_CLIENT_ID=ecommerce-api

# Only set this if the Keycloak client is confidential.
# For browser PKCE, public client without secret is better.
# KEYCLOAK_CLIENT_SECRET=your-client-secret
```

Restart Next.js after changing env:

```bash
npm run dev
```

## 2. Keycloak Client Setup

Recommended client for this frontend:

- Client ID: `ecommerce-api`
- Client type: OpenID Connect
- Client authentication: `Off` for public PKCE frontend
- Standard flow: `On`
- Direct access grants: `Off` for production, optional `On` only for Postman password-grant testing
- Valid redirect URIs:

```txt
http://localhost:3000/api/auth/callback
https://www.keycloak.org/app/
```

- Valid post logout redirect URIs:

```txt
http://localhost:3000/*
```

- Web origins:

```txt
http://localhost:3000
```

Use Authorization Code + PKCE for the frontend. Do not put a client secret in browser code. If you keep a client secret, it must only be used inside Next.js server route handlers.

## 3. Auth Flow In This Frontend

The current frontend already has these route handlers:

- `GET /api/auth/login`
- `GET /api/auth/callback`
- `GET /api/auth/logout`
- `GET /api/auth/session`

Expected flow:

1. User clicks Login.
2. Frontend redirects to `/api/auth/login?returnTo=/product-table`.
3. Next.js creates PKCE `code_verifier`, `code_challenge`, and `state`.
4. Browser goes to Keycloak login.
5. Keycloak redirects back to `/api/auth/callback?code=...&state=...`.
6. Next.js exchanges the code for tokens.
7. Tokens are saved in HTTP-only cookies.
8. Frontend calls Spring through `/api/ecommerce/...`.
9. The proxy adds `Authorization: Bearer <access_token>` to Spring requests.

Login button:

```tsx
<a href="/api/auth/login?returnTo=/product-table">Login</a>
```

Logout button:

```tsx
<a href="/api/auth/logout">Logout</a>
```

Check session from a client component:

```ts
const res = await fetch("/api/auth/session", { cache: "no-store" });
const session = await res.json();
```

After login, call the backend user sync endpoint once:

```ts
await fetch("/api/ecommerce/users/me", { cache: "no-store" });
```

This maps the Keycloak user into the local `users` table.

## 4. Next.js API Proxy Pattern

Browser components should call Next.js routes, not Spring directly:

```txt
Client Component -> /api/ecommerce/products -> Spring /api/v1/products
```

Why:

- Keeps tokens in HTTP-only cookies.
- Avoids exposing Keycloak tokens to client JavaScript.
- Centralizes Spring API error handling.

Existing helper:

```ts
forwardEcommerceRequest("/products")
```

Important: proxy paths should map to Spring's `/api/v1` endpoints.

Proxy routes to add or fix:

```txt
src/app/api/ecommerce/products/route.ts
src/app/api/ecommerce/products/[id]/route.ts
src/app/api/ecommerce/categories/route.ts
src/app/api/ecommerce/users/me/route.ts
src/app/api/ecommerce/images/route.ts
```

The product list proxy should preserve query parameters:

```ts
import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return forwardEcommerceRequest(`/products${url.search}`);
}

export async function POST(request: Request) {
  return forwardEcommerceRequest("/products", {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
}
```

Add user sync proxy:

```ts
import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET() {
  return forwardEcommerceRequest("/users/me");
}
```

Add categories proxy:

```ts
import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET() {
  return forwardEcommerceRequest("/categories");
}

export async function POST(request: Request) {
  return forwardEcommerceRequest("/categories", {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
}
```

## 5. Product Data Model

Replace old Fake Store fields with Spring fields.

Frontend request type:

```ts
export type CreateProductRequest = {
  name: string;
  thumbnail?: string;
  unitPrice: number;
  qty: number;
  description?: string;
  isAvailable?: boolean;
  categoryId: number;
};
```

Frontend response type:

```ts
export type ProductResponse = {
  id: number;
  code: string;
  slug: string;
  name: string;
  thumbnail?: string;
  unitPrice: number;
  qty: number;
  description?: string;
  isAvailable: boolean;
  categoryId?: number;
  categoryName?: string;
};
```

Do not send `code` or `slug` when creating a product. Spring generates both.

## 6. Product API Endpoints

Available now in Spring:

### List Products

```http
GET http://localhost:7070/api/v1/products?pageNumber=0&pageSize=25
Authorization: Bearer <access_token>
```

Via frontend:

```ts
fetch("/api/ecommerce/products?pageNumber=0&pageSize=25");
```

### Search Products

```http
GET http://localhost:7070/api/v1/products/spec?keyword=iphone&categoryId=1&page=0&size=25
Authorization: Bearer <access_token>
```

or:

```http
POST http://localhost:7070/api/v1/products/search
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "keyword": "iphone",
  "categoryId": 1,
  "isAvailable": true
}
```

### Create Product

```http
POST http://localhost:7070/api/v1/products
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "name": "iPhone 15 Pro",
  "thumbnail": "https://example.com/images/iphone-15-pro.png",
  "unitPrice": 999.99,
  "qty": 10,
  "description": "Apple iPhone 15 Pro with 256GB storage",
  "isAvailable": true,
  "categoryId": 1
}
```

### Update And Delete Products

The frontend currently has proxy routes for:

- `PUT /api/ecommerce/products/[id]`
- `DELETE /api/ecommerce/products/[id]`

But the current Spring `ProductController` does not expose:

- `GET /api/v1/products/{id}`
- `PUT /api/v1/products/{id}`
- `DELETE /api/v1/products/{id}`

So full product CRUD needs one backend follow-up: add product detail, update, and delete endpoints similar to `CategoryController`.

Until then, implement frontend create, list, search, and image upload first.

## 7. RTK Query Product API

Recommended `productApi` shape:

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/ecommerce/" }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<PageResponse<ProductResponse>, { pageNumber?: number; pageSize?: number }>({
      query: ({ pageNumber = 0, pageSize = 25 } = {}) =>
        `products?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
      query: (body) => ({
        url: "products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
    searchProducts: builder.mutation<PageResponse<ProductResponse>, ProductFilterRequest>({
      query: (body) => ({
        url: "products/search",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});
```

Spring page response shape is usually:

```ts
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
```

## 8. Categories For Product Form

Product create needs `categoryId`, so the form should load categories:

```http
GET http://localhost:7070/api/v1/categories
Authorization: Bearer <access_token>
```

Create category:

```http
POST http://localhost:7070/api/v1/categories
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "name": "Smartwatches & Watches",
  "description": "Premium smartwatches, fitness trackers, and luxury timepieces",
  "icon": "https://gstatic.com"
}
```

Category `code` is generated by Spring.

## 9. Image Upload

Use this before product create when the user selects a thumbnail file.

Spring endpoint:

```http
POST http://localhost:7070/api/v1/images
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file=<selected image>
```

In Postman:

- Body: `form-data`
- Key: `file`
- Type: `File`
- Do not manually set `Content-Type`

Frontend route to add:

```txt
src/app/api/ecommerce/images/route.ts
```

It should forward `FormData` without forcing JSON content type:

```ts
import { getAccessToken } from "@/lib/auth/keycloak";
import { ecommerceApiUrl } from "@/lib/ecommerce/server-api";

export async function POST(request: Request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(ecommerceApiUrl("/images"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: await request.formData(),
    cache: "no-store",
  });

  const body = await response.json();

  return Response.json(body, { status: response.status });
}
```

Client usage:

```ts
const formData = new FormData();
formData.append("file", file);

const uploadRes = await fetch("/api/ecommerce/images", {
  method: "POST",
  body: formData,
});

const uploaded = await uploadRes.json();
```

Then use the returned image URL as product `thumbnail`.

## 10. Recommended Pages

Use the existing `/product-table` route as the product admin screen.

Suggested routes:

- `/login`: login page with Keycloak button
- `/product-table`: product list, search, pagination
- `/product-table/create`: create product form
- `/product-table/[slug]`: product details
- `/admin/users/create`: admin creates Keycloak + local user

Recommended product table controls:

- Search by keyword
- Filter by category
- Filter by availability
- Page size selector
- Create product button
- View details button

Hide update/delete buttons until Spring product update/delete endpoints exist.

## 11. User Create From Frontend

Admin endpoint:

```http
POST http://localhost:7070/api/v1/users
Content-Type: application/json
Authorization: Bearer <admin_access_token>

{
  "userName": "seller01",
  "password": "123456",
  "email": "seller01@example.com",
  "firstName": "Seller",
  "lastName": "One",
  "phone": "012345678",
  "address": "Phnom Penh",
  "enabled": true,
  "emailVerified": true,
  "temporaryPassword": false,
  "roles": ["USER"]
}
```

Only users with `ADMIN` role should see this UI.

## 12. Testing Checklist

1. Start Keycloak on `9090`.
2. Start Spring Boot on `7070`.
3. Start Next.js on `3000`.
4. Open `http://localhost:3000/api/auth/login?returnTo=/product-table`.
5. Login with a user in realm `ite`.
6. Open `/api/auth/session` and confirm `authenticated: true`.
7. Call `/api/ecommerce/users/me` and confirm local sync works.
8. Open `/product-table` and confirm products load.
9. Create a category if no categories exist.
10. Upload an image with form-data key `file`.
11. Create a product with the uploaded image URL as `thumbnail`.

## 13. Common Problems

### Cookie not found on Keycloak test page

This happens when using the Keycloak demo redirect URL inside an API client preview. For the real frontend, use:

```txt
http://localhost:3000/api/auth/callback
```

### 401 From Spring

Check:

- User is logged in.
- `/api/auth/session` returns authenticated.
- Next.js proxy sends `Authorization: Bearer ...`.
- Spring issuer URI points to `http://localhost:9090/realms/ite`.

### 415 On Image Upload

Use `multipart/form-data` with field name `file`. Do not send raw binary for the current Spring endpoint.

### Product Create Fails

Check:

- `name` is not blank.
- `unitPrice` is positive.
- `qty` is zero or positive.
- `categoryId` exists.
- Do not send `slug` or `code`.
