import { CreateGroupInput, CreateContractInput, AddUserInput, RemoveUserInput, KeyInput, GenerateKeyInput, RemoveKeyInput, ImportKeyInput, ApproveContractInput} from "./multisig/inputs/types";
import { Group } from "./multisig/group";
import { Users } from "./multisig/users";
import { Contract } from "./multisig/contract";
import { emit, revert } from "./klave/types";
import { Context, Crypto } from "@klave/sdk";
import { Groups } from "./multisig/groups";
import { Keys } from "./multisig/keys";

/**
 * @transaction generate a key
 * @param input containing the following fields:
 * - keyId: string
 * - key: details of the key to generate (algorithm, extractable)
 * @returns success boolean
 */
export function generateKey(input: GenerateKeyInput): void 
{    
    let keys = Keys.load();
    if (keys.generateKey(input.keyId, input.key)) {
        keys.save();
    }
}

/**
 * @transaction import a key
 * @param input containing the following fields:
 * - keyId: string
 * - key: details of the key to import (format, algorithm, data, extractable, usages)
 * @returns success boolean
 */
export function importKey(input: ImportKeyInput): void 
{    
    let keys = Keys.load();
    if (keys.importKey(input.keyId, input.key)) {
        keys.save();
    }
}

/**
 * @transaction remove a key
 * @param input containing the following fields:
 * - keyId: string
 * @returns success boolean
 */
export function removeKey(input: RemoveKeyInput): void {
    let keys = Keys.load();
    if (keys.removeKey(input.keyId)) {
        keys.save();
    }
}

/**
 * @query 
 */
export function listKeys(input: string): void {
    let keys = Keys.load();
    keys.list();
}
/**
 * @transaction add a user
 * @param input containing the following fields:
 * - userId: string
 * - role: string, "admin" or "user" - so far unused
 * @returns success boolean
 */
export function addUser(input: AddUserInput): void {
    let users = Users.load();    
    if (users.addUser(Context.get('sender'), input.role)) {
        users.save();
    }
}

/**
 * @transaction remove a user from the group
 * @param input containing the following fields:
 * - userId: string
 * @returns success boolean
 */
export function removeUser(input: RemoveUserInput): void {
    let users = Users.load();
    if (users.removeUser(Context.get('sender'))) {
        users.save();
    }
}

/**
 * @query 
 */
export function listUsers(input: string): void {
    let users = Users.load();
    users.list();
}

/**
 * @transaction initialize the group
 * @param input containing the following fields:
 * - name: string
 * - users: string[]
 */
export function createGroup(input: CreateGroupInput): void {
    let groups = Groups.load();
    if (groups.addGroup(input.groupId, input.users)) {
        groups.save();
    }
}

/**
 * @query 
 */
export function listGroups(input: string): void {
    let groups = Groups.load();
    groups.list();
}

/**
 * @query 
 */
export function listGroupPublicKeys(groupId: string): void {
    let group = Group.load(groupId);
    if (!group) {
        revert(`Group ${groupId} does not exist. Create it first.`);
        return;
    }
    group.listPublicKeys();
}

/**
 * @query 
 */
export function listGroupContracts(groupId: string): void {
    let group = Group.load(groupId);
    if (!group) {
        revert(`Group ${groupId} does not exist. Create it first.`);
        return;
    }
    group.listContracts();
}

/**
 * @transaction initialize the contract
 * @param input containing the following fields:
 * - name: string
 * - group: string
 * - threshold: number
 * - description: string
 */
export function createContract(input: CreateContractInput): void {
    let existingContract = Contract.load(input.contractId);
    if (existingContract) {
        revert(`Contract ${input.contractId} does already exists.`);
        return;
    }
    
    let group = Group.load(input.groupId);
    if (!group) {
        revert(`Group ${input.groupId} does not exist. Create it first.`);
        return;
    }

    let key = Crypto.ECDSA.getKey(input.privateKeyId);        
    if (key === null) {
        revert(`Crypto key ${input.privateKeyId} does not exist. Create it first.`);
    }    

    let contract = new Contract(input.contractId, input.groupId, input.threshold, input.message, input.privateKeyId);
    contract.save();

    if (group.addContract(contract.id)) {
        group.save();
    }
}

/**
 * @transaction sign the contract
 * @param input containing the following fields:
 * - name: string
 */
export function approveContract(input: ApproveContractInput): void {
    let existingContract = Contract.load(input.contractId);
    if (!existingContract) {
        revert(`Contract shall be created first.`);
        return;
    }
    if (existingContract.approve(input.message, input.signature, input.spkiPubKey)) {
        existingContract.save();
    }
}

/**
 * @query check if all parties have signed the contract
 * @param input containing the following fields:
 * - name: string
 */
export function verifyContract(contract_name: string): void {
    let existingContract = Contract.load(contract_name);
    if (!existingContract) {
        revert(`Contract shall be created first.`);
        return;
    }
    if (existingContract.ready()) {
        emit("Contract has been confirmed successfully by " + existingContract.confirmed().toString() + " users. Signature for message " + existingContract.message + " is: " + existingContract.signature());
    }
    else {
        let missing = existingContract.threshold - existingContract.confirmed();
        revert("Contract is missing " + missing.toString() + " confirmations");
    }    
}
