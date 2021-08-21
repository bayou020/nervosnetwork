import Web3 from 'web3';
import { BayouStorage } from '../../types/BayouStorage';
export declare class BayouStorageWrapper {
    web3: Web3;
    contract: BayouStorage;
    address: string;
    constructor(web3: Web3);
    get isDeployed(): boolean;
    getStoredValue(fromAddress: string): Promise<number>;
    setStoredValue(value: number, fromAddress: string): Promise<import("web3-core").TransactionReceipt>;
    deploy(fromAddress: string): Promise<any>;
    useDeployed(contractAddress: string): void;
}
