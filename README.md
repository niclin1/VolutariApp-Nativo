# VoluntariApp Nativo

React Native (Expo) mobile app — the native counterpart of [VoluntariApp](https://github.com/LucasSousaAl/VoluntariApp).

Connects volunteers to social causes (ONGs). Users register as either **volunteer** or **ong**, browse volunteer opportunities (*vagas*), and apply directly from the app.

## Tech Stack

- **React Native** + **Expo SDK 54**
- **React Navigation** (native stack)
- **Expo SecureStore** for JWT token storage
- **TypeScript**

## Screens

| Screen | Description |
|---|---|
| **Welcome** | Landing screen with role selection (Volunteer / ONG) |
| **Login** | Email + password login |
| **Register** | Account creation for volunteers and ONGs |
| **Home** | Browse volunteer opportunities with category filters |
| **VagaDetail** | Full vaga details + apply button |
| **Profile** | User profile + enrolled vagas management |
| **OngHome** | ONG dashboard listing published vagas |

## Setup

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A running instance of the [VoluntariApp](https://github.com/LucasSousaAl/VoluntariApp) backend

### Environment

Create a `.env.local` file at the project root:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Replace `http://localhost:3000` with the URL of your VoluntariApp backend. On Android emulator use `http://10.0.2.2:3000`; on a physical device use your machine's local IP.

### Running

```bash
npm install
npm start          # opens Expo Dev Tools
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
npm run web        # web browser
```

## Project Structure

```
App.tsx                  # Root component + navigation
src/
  context/
    AppContext.tsx        # Global auth state (user, role, selectedVaga)
  services/
    api.ts               # API client (login, register, vagas, apply)
    tokenStorage.ts      # Secure JWT token persistence
  screens/
    WelcomeScreen.tsx
    LoginScreen.tsx
    RegisterScreen.tsx
    HomeScreen.tsx
    VagaDetailScreen.tsx
    ProfileScreen.tsx
    OngHomeScreen.tsx
  components/
    VagaCard.tsx         # Reusable vaga list card
  types/
    index.ts             # Shared TypeScript types
```

## Related

- Web app: [LucasSousaAl/VoluntariApp](https://github.com/LucasSousaAl/VoluntariApp)
