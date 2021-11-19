# zk-group-sigs-server

```
npm i
cp node_modules/snarkjs/build/snarkjs.min.js public/.
npm run dev
```

You also want to add two (sorry) env files both containing

```
DATABASE_URL="file:/path/to/repo/database.sqlite"
```

in `.env.local` AND `prisma/.env`.

Lastly initialize an empty database with

```
npx prisma generate
npx prisma db push
```
