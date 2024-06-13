import { Ledger, JSON, Crypto } from "@klave/sdk";
import { emit, revert } from "../klave/types"
import { encode as b64encode } from 'as-base64/assembly';

const GroupsTable = "GroupsTable";

@JSON
export class PublicKey {
    keyId: string;
    spkiPubKey: string;

    constructor(id: string, spki: string) {
        this.keyId = id;
        this.spkiPubKey = spki;
    }    
}

@JSON
export class Group {
    id: string;
    publicKeys: Array<PublicKey>;
    contracts: Array<string>;

    constructor(id: string, spkiPubKeys: Array<string>) {
        if (id.length > 0 ) {
            this.id = id;
        }
        else {
            this.id = b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(64)));
        }

        this.publicKeys = new Array<PublicKey>();
        this.contracts = new Array<string>();

        //Try to import all public keys
        for (let i=0; i<spkiPubKeys.length; ++i) {
            let key = Crypto.ECDSA.importKey(                
                b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(64))), 
                "spki", spkiPubKeys[i], "secp256r1", true);

            if (key) {                
                this.publicKeys.push(new PublicKey(key.name, spkiPubKeys[i]));
            }
        }
    }

    static load(groupId: string) : Group | null {
        let groupTable = Ledger.getTable(GroupsTable).get(groupId);
        if (groupTable.length == 0) {
            // revert(`Group ${groupId} does not exists. Create it first`);
            return null;
        }
        let group = JSON.parse<Group>(groupTable);
        // emit(`Group loaded successfully: '${group.id}'`);
        return group;
    }

    save(): void {
        let groupTable = JSON.stringify<Group>(this);
        Ledger.getTable(GroupsTable).set(this.id, groupTable);
        emit(`Group saved successfully: ${this.id}`);
    }

    delete(): void {
        this.id = "";
        this.publicKeys.forEach(element => {
            element.keyId = "";
            element.spkiPubKey = "";
        });
        Ledger.getTable(GroupsTable).unset(this.id);
        emit(`User deleted successfully: ${this.id}`);
    }

    includes(spki: string): string | null {
        for (let i=0; i<this.publicKeys.length; ++i) {
            if (this.publicKeys[i].spkiPubKey == spki) 
            {
                return this.publicKeys[i].keyId;
            }
        }
        return null;
    }

    addContract(contractId: string): boolean {
        if (this.contracts.includes(contractId)) {
            revert(`This contract ${contractId} already exists for this group.`)
            return false;
        }
        this.contracts.push(contractId);
        return true;
    }

    listContracts(): void {
        let contracts: string = "";
        for (let i = 0; i < this.contracts.length; i++) {
            let contract = this.contracts[i];
            if (contracts.length > 0) {
                contracts += ", ";
            }
            contracts += contract;
        }
        if (contracts.length == 0) {
            emit(`No contract found in this groups`);
        }
        emit(`Contracts available: ${contracts}`);
    }

    listPublicKeys(): void {
        let pubKeys: string = "";
        for (let i = 0; i < this.publicKeys.length; i++) {
            let pubKey = this.publicKeys[i];
            if (pubKeys.length > 0) {
                pubKeys += ", ";
            }
            pubKeys += "(" + pubKey.keyId + "," + pubKey.spkiPubKey + ")";
        }
        if (pubKeys.length == 0) {
            emit(`No public key found in this group`);
        }
        emit(`Public keys available: ${pubKeys}`);
    }
}
