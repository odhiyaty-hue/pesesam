## Packages
@supabase/supabase-js | Required for authentication and user management
date-fns | Formatting dates for tournaments and matches
lucide-react | Icons for the interface

## Notes
- Supabase URL and Anon Key must be provided in environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The application uses Supabase for authentication, but syncs users to the PostgreSQL database via `/api/users/sync`.
- API requests to the backend must include the `Authorization: Bearer <token>` header, which is automatically handled by the `api.ts` utility using the Supabase session token.
- Image uploads use `/api/upload` to proxy ImgBB, expecting `FormData` with a field named `image`.
