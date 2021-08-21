import Web3 from 'web3';
import * as NotarizingDocumentJSON from '../../../build/contracts/NotarizingDocument.json';
import { NotarizingDocument } from '../../types/NotarizingDocument';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class NotarizingDocumentWrapper {
    web3: Web3;

    contract: NotarizingDocument;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(NotarizingDocumentJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async checkDocument(document: string ,fromAddress: string) {
        const data = await this.contract.methods.checkDocument(document).call({ from: fromAddress });

        return (data);
    }

    async notarize(doc: string, fromAddress: string) {
        const tx = await this.contract.methods.notarize(doc).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            data:doc,
            
        });
            
      

        return tx;
    }

    async deploy(fromAddress: string) {
        const deployTx = await (this.contract
            .deploy({
                data: NotarizingDocumentJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000',
                

            } as any) as any);

        this.useDeployed(deployTx.contractAddress);

        return deployTx.transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}