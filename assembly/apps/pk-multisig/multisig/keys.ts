import { Ledger, JSON, Crypto } from "@klave/sdk";
import { emit, revert } from "../klave/types";
import { KeyInput } from "./inputs/types";
import { encode as b64encode } from 'as-base64/assembly';

const KeysTable = "KeysTable";

/**
 * An Keys is associated with a list of keys and holds keys.
 */
@JSON
export class Keys {
    keys: Array<string>;

    constructor() {
        this.keys = new Array<string>();
    }

    /**
     * load the keys from the ledger.
     * @returns true if the keys was loaded successfully, false otherwise.
     */
    static load(): Keys {
        let keysTable = Ledger.getTable(KeysTable).get("ALL");
        if (keysTable.length == 0) {            
            // emit(`New Keys Table created successfully`);
            return new Keys;
        }
        let wlt = JSON.parse<Keys>(keysTable);
        // emit(`Keys loaded successfully: ${keysTable}`);
        return wlt;
    }

    /**
     * save the keys to the ledger.
     */
    save(): void {
        let keysTable = JSON.stringify<Keys>(this);
        Ledger.getTable(KeysTable).set("ALL", keysTable);
        // emit(`Keys saved successfully: ${keysTable}`);
    }

    /**
     * Add a key to the list of keys.
     * @param keyId The id of the key to add.
     * @param keyInput The details (algorithm, extractable) of the key to add.
     */
    generateKey(keyId: string, keyInput: KeyInput): boolean {
        if (keyId.length > 0 ) {
            if (this.keys.includes(keyId)) {
                revert(`Key already exists: ${keyId}`);
                return false;
            }    
        }
        else {
            keyId = b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(64)));
        }
        let key = Crypto.ECDSA.generateKey(keyId, keyInput.algorithm, keyInput.extractable);
        if (key === null) {
            emit(`Key could not be created.`);
            return false;
        }
        this.keys.push(key.name);
        emit(`Key added successfully: ${key.name} `);
        return true;    
    }

    /**
     * Add a key to the list of keys.
     * @param keyId The id of the key to add.
     * @param keyInput The details (algorithm, extractable) of the key to add.
     */
    importKey(keyId: string, keyInput: KeyInput): boolean {
        if (keyId.length > 0 ) {
            if (this.keys.includes(keyId)) {
                revert(`Key already exists: ${keyId}`);
                return false;
            }    
        }
        else {
            keyId = b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(64)));
        }

        // emit("keyId(" + keyId + "), " + "format(" + keyInput.format + "), " + "algorithm(" + keyInput.algorithm + "), " + "keyData(" + keyInput.keyData + "), " + "extractable(" + ((keyInput.extractable)?"true":"false") + ")");

        let key = Crypto.ECDSA.importKey(keyId, keyInput.format, keyInput.keyData, keyInput.algorithm, keyInput.extractable);
        if (key === null) {
            emit(`Key could not be created.`);
            return false;
        }
        this.keys.push(key.name);
        emit(`Key added successfully: ${key.name} `);
        return true;    
    }
    
    /**
     * Remove a key from the list of keys.
     * @param keyId The id of the key to remove.
     */
    removeKey(keyId: string): boolean {
        let key = Crypto.ECDSA.getKey(keyId);
        if (!key) {
            revert("Key not found: " + keyId);
            return false;
        }

        let index = this.keys.indexOf(keyId);
        this.keys.splice(index, 1);
        emit("Key removed successfully: " + keyId);
        return true;
    }

    /**
     * list all the keys in the keys.
     * @returns
     */
    list(): void {
        let keys: string = "";
        for (let i = 0; i < this.keys.length; i++) {
            let key = this.keys[i];
            if (keys.length > 0) {
                keys += ", ";
            }
            keys += key;
        }
        if (keys.length == 0) {
            emit(`No key found in the list of keys`);
        }
        emit(`Keys available: ${keys}`);
    }

}