# AUTHORIZED Security Workflow Studio

Production-focused Next.js 14 security workflow dashboard that enforces ownership verification before any higher-risk actions and ships only safe posture modules by default.

## Stack
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS (local build)
- Zod
- Lucide React

## Security posture
- **Ownership Verification Gate** via DNS TXT (`_verify-studio.{domain}={token}`) before verified workflows.
- **No built-in exploit commands** in catalog; every tool has an empty template slot.
- **Per-route rate limiting** and salted **domain hash audit logging**.
- Strict response headers via middleware: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Server-only secret usage for optional OSINT proxy routes.

## Routes
### Pages
- `/`
- `/app`
- `/app/tools`
- `/app/workflows`
- `/app/reports`
- `/terms`
- `/privacy`

### APIs
- `POST /api/verify/start`
- `POST /api/verify/check`
- `GET /api/dns?name=...&type=...`
- `POST /api/posture/email-auth`
- `POST /api/posture/http`
- `POST /api/posture/tls`
- Optional (if keys configured + domain verified):
  - `/api/osint/shodan`
  - `/api/osint/censys`
  - `/api/osint/virustotal`
  - `/api/osint/securitytrails`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

## Build & Run
```bash
npm run build
npm run start
```

## Usage flow
1. Open `/app`.
2. Enter domain and click **Generate token**.
3. Add TXT record `_verify-studio.<domain> = <token>`.
4. Click **Check verification**.
5. Run safe posture modules (DNS, email auth, HTTP headers, TLS expiry).

## Notes
- Tool seed is in `data/tools.seed.ts` and includes all required names exactly with blank templates.
- `public/robots.txt` disallows `/app`.
- In-memory stores are used for verification/rate-limit/audit in this implementation. Swap with Redis/DB for multi-instance production.
