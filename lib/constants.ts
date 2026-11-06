// Plain values that are safe to use anywhere, including the browser.
export const NETWORK = "stellar:testnet";
export const MENTOR_REVIEW_PRICE = "0.50";

export const explorer = {
  tx: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
  account: (address: string) => `https://stellar.expert/explorer/testnet/account/${address}`,
};
