
import crypto from 'crypto';
import fs from "fs";
import path from "path";
import { createKeyPair } from "./KeyPairCreationUtil";
require('dotenv').config();

const algorithm = 'aes-256-ctr';
const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
const iv = crypto.randomBytes(16);
const web3 = require("../singleton/Web3Instance");
import { AccountAddressSingleton } from '../singleton/AccountAddessSingleton';

const accountContractJson = require("../../artifacts/src/contracts/Account.sol/Account.json");
const contractAddress = process.env.ACCOUNT_CONTRACT_ADDRESS;
const accountContract = new web3.eth.Contract(accountContractJson.abi, contractAddress);
const ADMIN_PUBLIC_KEY = process.env.PUBLIC_KEY;

let accountAddressSingletonInstance = AccountAddressSingleton.getInstance();

const shaSecret = "Kr!$t!ck$";
export const createAccountKeyAndAddress = (kfNumber: string) => {

    let secrectValue: string = crypto.createHmac('SHA256', shaSecret).update(kfNumber).digest('hex');
    if (accountAddressSingletonInstance.getData(secrectValue)) {
        return getAccountKeyAndAddress(kfNumber).address;
    }
    let keypair = createKeyPair(kfNumber);

    try {
        accountAddressSingletonInstance.setData(secrectValue, keypair);
        console.log("keypair.address", keypair.address);
        return keypair.address;
    } catch (error) {
        throw error;
    }
}

export const isAccountPresent = (kfNumber: string) => {
    let secrectValue: string = crypto.createHmac('SHA256', shaSecret).update(kfNumber).digest('hex');
    if (accountAddressSingletonInstance.getData(secrectValue)) {
        return true;
    }
    return false;
}

export const getAccountKeyAndAddress = (kfNumber: string) => {
    let secrectValue: string = crypto.createHmac('SHA256', shaSecret).update(kfNumber).digest('hex');
    console.log("secrectValue",secrectValue);
    if (accountAddressSingletonInstance.getData(secrectValue)) {
        console.log("address details", JSON.stringify(accountAddressSingletonInstance.getData(secrectValue)));
        return accountAddressSingletonInstance.getData(secrectValue);
    }
}

export const addAccountToContractAndProvideEther = async (recipientAddress: string) => {

    let adminDetails = {
        address: process.env.PUBLIC_KEY,
        privateKey: process.env.PRIVATE_KEY
    };

    let accHash: any;

    try {
        accHash = await activateAccount(adminDetails.address!, adminDetails.privateKey!, recipientAddress);
    }
    catch (error) {
        console.log("error at activate account", error);
    }

    if (!accHash || accHash.status == false) {
        throw new Error("Unable to activate Account")
    }

    let ethTxHash: any = await sendEther(recipientAddress, adminDetails.privateKey!, 1);

    if (!ethTxHash || ethTxHash.status == false) {
        throw new Error("Unable to provide Ether to Customer")
    }
    let etherBalance = await getEtherBalance(recipientAddress);
    console.log("Ether Balance : ", etherBalance)

    console.log("Provided Ether for Account : ", recipientAddress, "with Hash : ", ethTxHash.hash);

    return accHash;

}

export const accountStatus = async (address: string) => {
    try {
        return await accountContract.methods.isAccountPresent(address).call();
    } catch (error) {
        console.log("error", error);
    }
}

const activateAccount = async (adminAddress: string, privateKey: string, recipientAddress: string) => {
    let nonce: any;
    try {
        nonce = await web3.eth.getTransactionCount(ADMIN_PUBLIC_KEY, "latest");
    } catch (error) {
        console.log("Error while getting nonce", error);
    }

    const tx = {
        from: adminAddress,
        to: contractAddress,
        nonce: nonce,
        gas: 500000,
        data: accountContract.methods.activateAccount(recipientAddress).encodeABI(),
    }

    try {
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const result = await sendTransaction(signedTx);
        return result;
    } catch (error) {
        console.log("Unable to activate account");
        throw error;
    }
}

const sendEther = async (recipientAddress: string, privateKey: string, amount: number) => {
    const nonce = await web3.eth.getTransactionCount(ADMIN_PUBLIC_KEY, "latest");

    const tx = {
        nonce: nonce,
        to: recipientAddress,
        gas: 500000,
        value: web3.utils.toHex(web3.utils.toWei(String(amount), "ether"))
    }

    try {
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        return await sendTransaction(signedTx);
    } catch (error) {
        console.log("Unable to activate account");
        throw error;
    }
}

const encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash: any) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

const sendTransaction = async (signedTx: any) => {
    return await new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err: any, hash: any) => {
            if (!err) {
                console.log(
                    "The hash of your transaction is: ",
                    hash
                );
                resolve(waitForMined(hash));
            } else {
                console.log(
                    "Something went wrong when submitting your transaction:",
                    err
                );
                reject(err);
            }
        });
    });
}

const waitForMined = async (hash: any) => {
    const MAX_RETRIES = 250 * 1;
    let bcTx = {
        hash: hash,
        status: false
    }
    await wait(500);
    for (let i = 1; i <= MAX_RETRIES; i++) {
        const receipt: any = await getTxReceipt(hash);
        console.log('Count : ', i);
        if (receipt == null) {
            await wait(100)
        } else {
            console.log(receipt);
            console.log('Block Number : ', receipt.blockNumber);
            if (receipt.status == '0x1') {
                bcTx.status = true;
            }
            return bcTx;
        }
    }
    return bcTx;
}


function wait(interval: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, interval ? interval : 1000)
    })
}

async function getTxReceipt(hash: any) {
    return new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(hash, (err: any, receipt: any) => {
            if (err) {
                reject(err)
            }
            resolve(receipt)
        });
    })
}

const getEtherBalance = async (address: string) => {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address, (err: any, res: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(web3.utils.fromWei(res, "ether"));
            }
        });
    });
}