# Alephium desktop wallet

The official Alephium desktop wallet.

![Wallet preview](https://user-images.githubusercontent.com/1579899/236201682-4e0b0c45-65d3-42c0-b187-d8d6387426d7.png)

## Development

Install depedencies from the root of the monorepo with:

```shell
pnpm install
```

To launch it as an electron app, run:

```shell
turbo start:electron
```

> :info: Using `turbo` instead of `bun` ensures that the appropriate tasks will be run beforehand (for example the `compile` task so that the shared library gets compiled). See the `turbo.json` config of this workspace for more details.

## Test

```shell
turbo test
```

## Packaging

The command below will detect your OS and build the corresponding package:

```shell
turbo build:electron
```

To build for ARM64 Linux, run:

```shell
turbo build:electron:linux:arm64
```

## Release

Refer to the [monorepo README](../../README.md).

> When testing the auto-update system with RC's, keep this in mind: https://github.com/alephium/alephium-frontend/issues/271

## Adding new translation

1. Copy `locales/fr-FR/translation.json` into `locales/[xx-YY]/translation.json` and add your translations.
2. Import new translation file and add it to the resources in `src/i18n.ts`

   ```ts
   import en from '../locales/en-US/translation.json'
   import fr from '../locales/fr-FR/translation.json'

   i18next.use(initReactI18next).init({
     resources: {
       'en-US': { translation: en },
       'fr-FR': { translation: fr }
     }
   })
   ```

3. Add new language option in `src/utils/settings.ts`

   ```ts
   const languageOptions = [
     { label: 'English', value: 'en-US' },
     { label: 'Français', value: 'fr-FR' }
   ]
   ```

4. Import `dayjs` translation file in `src/storage/settings/settingsSlice.ts`

   ```ts
   import 'dayjs/locale/fr'
   ```
