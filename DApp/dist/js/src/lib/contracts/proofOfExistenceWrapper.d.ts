import Web3 from 'web3';
import { ProofOfExistence } from '../../types/ProofOfExistence';
export declare class ProofOfExistenceWrapper {
    web3: Web3;
    contract: ProofOfExistence;
    address: string;
    constructor(web3: Web3);
    get isDeployed(): boolean;
    getStoredValue(document: string, fromAddress: string): Promise<boolean>;
    setStoredValue(value: string, fromAddress: string): Promise<import("web3-core").TransactionReceipt>;
    deploy(fromAddress: string): Promise<any>;
    useDeployed(contractAddress: string): void;
}
