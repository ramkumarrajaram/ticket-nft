import keythereum from "keythereum";

export const createKeyPair = (kfNumber: string) => {
    let keypair = {
        privateKey: "",
        address: "",
        id: ""
    };

    const password = Buffer.from(kfNumber, "utf-8");

    let params = { keyBytes: 32, ivBytes: 16 };

    const deriveKey = keythereum.create(params);

    const keythereumOptions = {
        cipher: "aes-128-ctr",
        kdfparams: {
            c: 262144,
            dklen: 32,
            prf: "hmac-sha256",
            hash: ""
        }
    };

    let keyObject = keythereum.dump(
        password,
        deriveKey.privateKey,
        deriveKey.salt,
        deriveKey.iv,
        keythereumOptions
    );

    keypair.address = '0x' + keyObject.address;
    keypair.id = password.toString();
    if (Buffer.isBuffer(deriveKey.privateKey)) {
        let buffer = deriveKey.privateKey;
        keypair.privateKey = buffer.toString('hex');
    }
    return keypair;
}