import { Ledger, Crypto, JSON, Context } from '@klave/sdk'
import { emit, revert } from "../klave/types"
import { encode as b64encode, decode as b64decode } from 'as-base64/assembly';
import { Group } from './group';

const ContractsTable = "ContractsTable";

@JSON
export class Contract {
    id: string;
    group: string;
    threshold: number;
    message: string;        
    privateKeyId: string;
    owner: string;

    confirmed_pkeys: Array<string>;

    constructor(id: string, group: string, threshold: number, message: string, privateKeyId: string) {
        if (id.length > 0 ) {
            this.id = id;
        }
        else {
            this.id = b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(64)));
        }
        this.group = group;
        this.threshold = threshold;
        this.message = message;        
        this.privateKeyId = privateKeyId;
        this.owner = Context.get('sender');
        this.confirmed_pkeys = new Array<string>(); 
    }

    static load(contractId: string) : Contract | null {
        let contractTable = Ledger.getTable(ContractsTable).get(contractId);
        if (contractTable.length == 0) {
            // revert("Contract does not exists. Create it first");
            return null;
        }
        let contract = JSON.parse<Contract>(contractTable);
        // emit(`Contract loaded successfully: '${contract.id}'`);
        return contract;
    }

    save(): void {
        let contractTable = JSON.stringify<Contract>(this);
        Ledger.getTable(ContractsTable).set(this.id, contractTable);
        emit(`Contract saved successfully: ${this.id}`);
    }

    create(message: string, type: string): boolean {
        
        this.message = message;
        this.owner = Context.get('sender');
        return true;
    }

    delete(): void {
        Ledger.getTable(ContractsTable).unset(this.id);
        emit(`Contract deleted successfully: ${this.id}`);
    }

    approve(message: string, signature: string, spkiPubKey: string): boolean {
        if (this.confirmed_pkeys.includes(spkiPubKey)) {
            revert("This public key already confirmed the contract");
            return false;
        }
        let group = Group.load(this.group);
        if (!group) {
            revert("This group does not exist");
            return false;
        }
        let keyId = group.includes(spkiPubKey);
        if (keyId === null) {
            revert(spkiPubKey + " does not belong to group " + this.group);
            return false;
        }
        
        //Check signature is valid
        let key = Crypto.ECDSA.getKey(keyId);
        if (!key) {
            revert("Issue retrieving the key" + keyId);
            return false;
        }
    
        let verified = key.verify(message, Crypto.Utils.convertToU8Array(b64decode(signature)));            
        if(verified) {
            this.confirmed_pkeys.push(spkiPubKey);
            emit(spkiPubKey + " successfully approved the contract " + this.id);            
        }
        else {
            emit("Verification for " + spkiPubKey +  " failed for contract " + this.id);            
        }
        return verified;
    }

    ready(): boolean {
        if (this.confirmed_pkeys.length >= this.threshold) {
            return true;
        }
        return false;
    }

    confirmed(): number {
        return this.confirmed_pkeys.length;
    }

    signature(): string {
        let key = Crypto.ECDSA.getKey(this.privateKeyId);
        if (key === null) {
            return "";
        }
        return b64encode(Crypto.Utils.convertToUint8Array(key.sign(this.message)));
    }
}