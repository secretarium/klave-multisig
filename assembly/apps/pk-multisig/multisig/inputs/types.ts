import { JSON } from "@klave/sdk";

@JSON
export class CreateGroupInput {
    groupId: string;
    users: Array<string>;
}

@JSON
export class CreateContractInput {
    contractId: string;
    groupId: string;
    threshold: number;
    message: string;
    privateKeyId: string;
}

@JSON
export class ApproveContractInput {
    contractId: string;
    message: string;
    signature: string;
    spkiPubKey: string;
}

@JSON
export class RemoveKeyInput {
    keyId: string;
}

@JSON
export class KeyInput {
    format: string;         // raw, spki, pkcs8, jwk, sec1, 
    keyData: string;        // base64 encoded
    algorithm: string;      // ECDSA, AES-GCM, RSA-PSS,
    extractable: boolean;
    usages: string[];
}

@JSON
export class GenerateKeyInput {
    keyId: string;
    key: KeyInput;
}

@JSON
export class ImportKeyInput {
    keyId: string;
    key: KeyInput;
}

@JSON
export class AddUserInput {
    userId: string;
    role: string;
}

@JSON
export class RemoveUserInput {
    userId: string;
}
