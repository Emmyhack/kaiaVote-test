# Project Vote Assignment

A full-stack dApp for creating and participating in company voting events, deployable on the Kaia Kairos Testnet.

## Backend (Hardhat)

### 1. Install dependencies
```bash
npm install --save-dev hardhat hardhat-toolbox dotenv @klaytn/hardhat-utils ethers @openzeppelin/contracts
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in your private key and RPC URL:
```bash
cp .env.example .env
```

### 3. Compile contracts
```bash
npx hardhat compile
```

### 4. Deploy to Kaia Kairos Testnet
```bash
npx hardhat run scripts/deploy.js --network kairos
```

---

## Frontend (React + Tailwind CSS)

### 1. Create React app and install dependencies
```bash
npx create-react-app frontend
cd frontend
npm install ethers tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind
Add the following to your `tailwind.config.js`:
```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

In `src/index.css`, add:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Start the frontend
```bash
npm start
```

---

## Usage
- Use MetaMask to connect to the Kaia Kairos Testnet.
- The frontend allows you to create voting events (owner), vote, and view results.

---

## Environment Variables
- `PRIVATE_KEY`: deployer wallet private key (never share this publicly!)
- `KAIROS_RPC_URL`: The Kaia Kairos Testnet RPC URL (e.g., https://rpc.ankr.com/kaia)

---

## Notes
- Make sure MetaMask is set to the Kaia Kairos Testnet (Chain ID: 8217).
- After deploying, copy the contract address to the frontend config. 
