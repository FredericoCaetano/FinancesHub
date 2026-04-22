# FinancesHub

App mobile para controle financeiro pessoal, com dashboard, transacoes, categorias, gastos fixos e relatorios.

## Visao geral

- Dashboard com resumo mensal e ultimas transacoes
- Transacoes com filtros por data e categoria
- Categorias personalizadas
- Gastos fixos com frequencia e status
- Relatorios com tendencias e top categorias
- Navegacao por abas com swipe
- Armazenamento local (offline) via AsyncStorage

## Stack

- React Native 0.84 + React 19
- TypeScript
- React Navigation (native-stack, material-top-tabs)
- AsyncStorage
- Gifted Charts
- DateTimePicker
- Vector Icons
- Linear Gradient
- Shadow

## Requisitos

- Node >= 22.11.0
- Yarn
- Android Studio com SDK configurado
- Xcode + CocoaPods (para iOS)

## Instalacao

```sh
yarn install
```

### iOS

```sh
bundle install
bundle exec pod install
```

## Executar

Inicie o Metro:

```sh
yarn start
```

Em outro terminal:

```sh
yarn android
# ou
yarn ios
```

## Scripts

```sh
yarn start
yarn android
yarn ios
yarn test
yarn lint
yarn reinstall
```

## Estrutura

- src/screens: telas principais
- src/components: componentes reutilizaveis
- src/services: acesso a dados (AsyncStorage)
- src/theme: cores e estilos base

## Dados

Os dados sao armazenados localmente usando AsyncStorage. Nao ha sincronizacao remota.
