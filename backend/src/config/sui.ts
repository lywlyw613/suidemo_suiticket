import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

// 整個 demo 使用 devnet
const network = (process.env.SUI_NETWORK || 'devnet') as 'devnet' | 'mainnet' | 'testnet' | 'localnet';
const rpcUrl = process.env.SUI_RPC_URL || getFullnodeUrl(network);

export const suiClient = new SuiClient({ url: rpcUrl });

export const PACKAGE_ID = process.env.SUI_PACKAGE_ID || '0x0'; // 部署後更新
export const TICKET_MODULE = 'ticket_nft';

// Devnet Faucet API
export const FAUCET_URL = 'https://faucet.devnet.sui.io/gas';

