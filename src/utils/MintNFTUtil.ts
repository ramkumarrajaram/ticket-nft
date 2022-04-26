import { accountStatus, addAccountToContractAndProvideEther, createAccountKeyAndAddress, getAccountKeyAndAddress, isAccountPresent } from "./AccountUtil";

const web3 = require("../singleton/Web3Instance");

const krisTicksContractJson = require("../../artifacts/src/contracts/KrisTicksNFT.sol/KrisTicksNFT.json");
const contractAddress = process.env.KRISTICKS_CONTRACT_ADDRESS;
const krisTicksContract = new web3.eth.Contract(krisTicksContractJson.abi, contractAddress);
const ADMIN_PUBLIC_KEY = process.env.PUBLIC_KEY;

export const mintNFT = async (kfNumber: string, expiryDate: string, origin: string, destination: string, flightNumber: string, dot: string) => {

    let addressOfRecipient: string;
    if (isAccountPresent(kfNumber)) {
        addressOfRecipient = getAccountKeyAndAddress(kfNumber).address;
        console.log();
    } else {
        addressOfRecipient = createAccountKeyAndAddress(kfNumber);
        try {
            await addAccountToContractAndProvideEther(addressOfRecipient);
        } catch (error) {
            throw new Error("CREATE_MEMBER_FAILED");
        }
    }

    const isAccountActive: boolean = await accountStatus(addressOfRecipient);
    if (!isAccountActive) {
        throw new Error("ACCOUNT_INACTIVE");
    }

    try {
        const nonce = await web3.eth.getTransactionCount(ADMIN_PUBLIC_KEY, "latest");

        let adminDetails = {
            address: process.env.PUBLIC_KEY,
            privateKey: process.env.PRIVATE_KEY
        };

        const tx = {
            from: adminDetails.address,
            to: contractAddress,
            nonce: nonce,
            gas: 500000,
            data: krisTicksContract.methods.mint(addressOfRecipient, expiryDate, origin, destination, flightNumber, dot).encodeABI()
        }

        try {
            const signedTx = await web3.eth.accounts.signTransaction(tx, adminDetails.privateKey);
            const result: any = await sendTransaction(signedTx);
            return result;
        } catch (error) {
            console.log("Unable to mint NFT for the address ", addressOfRecipient);
            throw error;
        }
    } catch (error) {
        console.log(error);
        throw new Error("MINT_NFT_FAILED");
    }
}

export const transfer = async (buyerKfNumber: string, sellerKfNumber: string, NToken: number) => {
    const sellerData =  getAccountKeyAndAddress(sellerKfNumber);
    console.log("seller data", JSON.stringify(sellerData));
    const sellerAddress = sellerData.address;
    const sellerPrivateKey = sellerData.privateKey
    
    console.log("Seller address ", sellerAddress);

    let buyerAddress: string;
    if (isAccountPresent(buyerKfNumber)) {
        buyerAddress = getAccountKeyAndAddress(buyerKfNumber).address;
        console.log("buyerAddress ", buyerAddress);
    } else {
        buyerAddress = createAccountKeyAndAddress(buyerKfNumber);
        try {
            await addAccountToContractAndProvideEther(buyerAddress);
        } catch (error) {
            throw new Error("CREATE_MEMBER_FAILED");
        }
    }

    const isAccountActive: boolean = await accountStatus(buyerAddress);
    if (!isAccountActive) {
        throw new Error("ACCOUNT_INACTIVE");
    }

    try {
        const nonce = await web3.eth.getTransactionCount(sellerAddress, "latest");
        console.log("nonce is ", nonce);
        const tx = {
            from: sellerAddress,
            to: contractAddress,
            nonce: nonce,
            gas: 500000,
            data: krisTicksContract.methods.safeTransfer(sellerAddress, buyerAddress, NToken).encodeABI()
        }

        try {
            const signedTx = await web3.eth.accounts.signTransaction(tx, sellerPrivateKey);
            const result: any = await sendTransaction(signedTx);
            return result;
        } catch (error) {
            console.log(`Unable to transfer NFT from the address, ${sellerAddress} to address, ${buyerAddress}`);
            throw error;
        }
    }
    catch (error) {
        throw error;
    }
}

export const getNFTTokens = async (kfNumber: string) => {
    const addressOfRecipient = getAccountKeyAndAddress(kfNumber).address;
    if (!addressOfRecipient) {
        return [];
    }
    const tokens = await krisTicksContract.methods.tokensOfOwner(addressOfRecipient).call();
    console.table(tokens);
    return tokens;
}

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
        status: false,
        tokenId: 0
    }
    await wait(500);
    for (let i = 1; i <= MAX_RETRIES; i++) {
        const receipt: any = await getTxReceipt(hash);
        console.log('Count : ', i);
        if (receipt == null) {
            await wait(100)
        } else {
            console.log("Receipt of NFT", receipt);
            console.log('Block Number : ', receipt.blockNumber);
            if (receipt.status == '0x1') {
                bcTx.status = true;
                if (receipt.logs[0].topics[3]) {
                    bcTx.tokenId = web3.utils.hexToNumber(receipt.logs[0].topics[3]);
                }
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

