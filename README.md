# Fork : streaming de Server Components et moteur DSFR

Ce fork de [garronej/react-dsfr-next-appdir-demo](https://github.com/garronej/react-dsfr-next-appdir-demo) mesure les divergences d'hydratation que produit le moteur JS du DSFR quand le contenu arrive par streaming. Il sert de banc d'essai à `moroine/react-dsfr#2`.

La démo est conservée telle quelle (layout, Header, Footer, consentement, MUI). Ce qui s'y ajoute :

- **`src/streaming/`** : les familles de composants que le moteur instrumente. `display` est exclue, car le `Header` du layout rend déjà `<Display />`.
- **Routes de test**, qui montent toutes `<StartDsfrOnHydration />` comme les autres pages de la démo, sauf mention contraire :

  | Route | Contenu |
  |---|---|
  | `/no-streaming` | toutes les familles, sans `<Suspense>` propre à la page |
  | `/streaming` | les mêmes, derrière un Server Component asynchrone (1,5 s) |
  | `/streaming-client` | les mêmes, rendues par un Client Component |
  | `/streaming-without-start` | comme `/streaming`, sans `<StartDsfrOnHydration />` |
  | `/{no-streaming,streaming,streaming-client}/family/<nom>` | une seule famille, car React tronque son diff d'hydratation quand il y en a beaucoup |

- **`e2e/`** : un test fonctionnel Playwright (`streaming.spec.ts`) et un relevé (`sweep.spec.ts`) qui ne fait jamais échouer et écrit un tableau dans `e2e/results/summary.md`.

React ne signale les divergences d'hydratation qu'en développement : les mesures se font contre `next dev`.

## Mesurer en local

Il faut Chrome installé. Le dépôt est en yarn 1 : utilisez `npx --yes yarn@1.22.22`, car corepack peut résoudre `yarn` en yarn 4.

```bash
npx --yes yarn@1.22.22 install
cd e2e && npx --yes yarn@1.22.22 install

# Version publiée de react-dsfr
npx playwright test sweep.spec.ts     # relevé
npx playwright test streaming.spec.ts # test fonctionnel

# Un build local de react-dsfr
(cd ../../react-dsfr && npx --yes yarn@1.22.22 install && npx --yes yarn@1.22.22 build)
./use-react-dsfr.sh ../../react-dsfr/dist
npx playwright test sweep.spec.ts

# Retour à la version publiée
(cd .. && npx --yes yarn@1.22.22 install --force)
```

`use-react-dsfr.sh` remplace le paquet dans `node_modules` sans toucher à `package.json`, et supprime `.next`. Le cache de Next servirait sinon l'ancienne version, qui porte le même numéro.

## CI

`.github/workflows/streaming-e2e.yml` mesure trois versions : la version publiée, et les branches de `moroine/react-dsfr` des PR #1 et #2, construites dans le job. Chaque job ajoute son relevé au résumé de l'exécution. Seule la PR #2 doit passer le test fonctionnel.

La colonne « éléments instrumentés » du relevé compte les éléments qui portent un marqueur `data-fr-js-*`. La PR #1 supprime presque tous ces marqueurs : pour elle, la colonne ne dit rien du travail du moteur.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
