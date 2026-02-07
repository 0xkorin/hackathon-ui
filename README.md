# Hackathon UI

Minimal Next.js UI to connect a wallet, approve YFI, and deposit into stYFI on Sepolia.

## Quickstart
```bash
npm install
npm run dev
```

## Environment
Create `.env.local`:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Usage
1. Connect a wallet.
2. Switch to Sepolia (chain id 11155111).
3. Enter YFI amount.
4. Approve YFI if allowance is insufficient.
5. Deposit into stYFI once allowance is sufficient.

## Contracts (Sepolia)
- YFI: `0xD4c188F035793EEcaa53808Cc067099100b653Ba`
- stYFI (spender + deposit): `0x4FeC571e38EB31ae8c8C51B8b6Bcb404514dC822`

## Reference Transaction
Successful Sepolia test tx:
```
https://sepolia.etherscan.io/tx/0x43f9d50160e98104eade0a47da8166630a6198954651426c581e5de4e7c89a8e#eventlog
```

## Tests
```bash
npm test
```

## Notes
- Allowance is polled every 5 seconds.
- Amounts assume 18 decimals.
- UI currently uses injected `window.ethereum` transport only.
