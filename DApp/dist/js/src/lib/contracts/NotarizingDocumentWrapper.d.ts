import Web3 from 'web3';
import { NotarizingDocument } from '../../types/NotarizingDocument';
export declare class NotarizingDocumentWrapper {
    web3: Web3;
    contract: NotarizingDocument;
    address: string;
    constructor(web3: Web3);
    get isDeployed(): boolean;
    checkDocument(document: string, fromAddress: string): Promise<boolean>;
    notarize(doc: string, fromAddress: string): Promise<import("web3-core").TransactionReceipt>;
    deploy(fromAddress: string): Promise<any>;
    useDeployed(contractAddress: string): void;
}
