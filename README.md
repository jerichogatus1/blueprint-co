# Blueprint Co.

Blueprint Co. is a React + Vite storefront for safety equipment, protective gear, and PPE.
It is built to support workplace safety across construction, manufacturing, engineering,
maintenance, and healthcare by making products easier to browse, order, and manage.

The system includes:
- Product catalog
- Online ordering
- Inventory management
- Customer accounts
- Order history and tracking

Blueprint Co. aims to provide reliable, affordable, and industry-standard safety products
that help reduce workplace risks and support safer operations.

## Scripts

- `npm run dev` - start the web app locally
- `npm run build` - build the web app
- `npm run lint` - run ESLint
- `npm run admin:create` - create or refresh the admin account from env vars
- `npm run emulators:functions` - run the local Functions emulator for checkout
- `npm run seed:products` - seed products with admin credentials from env vars or ADC

## Admin bootstrap

The admin bootstrap is now environment-backed. Set these before running `npm run admin:create`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME` optional
- `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_JSON`

The script sets a Firebase custom claim of `admin: true` and writes a basic profile document.

## Notes

- Customer roles are no longer trusted from Firestore. Admin access uses custom claims.
- Orders are created directly in Firestore from the app, and the order workflow is validated
  against the current product data.
- Use `npm run migrate:prices` to backfill `price` from the older `priceMin` / `priceMax` data.
- Use `npm run cleanup:quotes` to remove any old `quotes` collection documents.
