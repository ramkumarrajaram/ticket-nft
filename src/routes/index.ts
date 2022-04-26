import express from "express";
import { getNFTTokens, mintNFT, transfer } from '../utils/MintNFTUtil';
const router = express.Router();

router.get('/', function (req, res) {
    res.json({ message: "Welcome to KrisTicks" });
})

router.post('/token/create', async function (req, res) {
    const { kfNumber, expiryDate, origin, destination, flightNumber, dot } = req.body;

    console.log(req.body);

    try {
        const result = await mintNFT(
            kfNumber,
            expiryDate,
            origin,
            destination,
            flightNumber,
            dot
        );
        res.status(200).send({ status: "SUCCESS", code: 200, message: "NFT created", NToken: result.tokenId });
    } catch (error) {
        console.log("Error is", error);
        res.status(500).send({ status: "FAILURE", code: 500, message: "NFT not created" });
    }
})

router.get("/tokens/get", async function (req, res) {
    const result = await getNFTTokens("8987001234");
    res.status(200).send({ status: "SUCCESS", code: 200, result });
});

router.post("/token/transfer", async function (req, res) {
    const { buyerKfNumber, sellerKfNumber, NToken } = req.body;
    console.log("buyerKfNumber ", buyerKfNumber);
    console.log("sellerKfNumber ", sellerKfNumber);
    console.log("NToken ", NToken);
    try {
        const result = await transfer(buyerKfNumber, sellerKfNumber, NToken);
        res.status(200).send({ status: "SUCCESS", code: 200, message: "NFT transferred", NToken });
    } catch (error) {
        console.log("Error is", error);
        res.status(500).send({ status: "FAILURE", code: 500, message: "NFT not transferred" });
    }
});

export = router;



