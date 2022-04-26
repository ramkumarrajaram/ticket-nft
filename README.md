# ticket-nft
This application contains the details of creating and storing an NFT to owner who has minted it. Also, the owner can sell NFTs to another user. 
This application uses private blockchain.

The blockchain contracts are written in Solidity language. This application is exposed as APIs using Express framework. 
Typescript is used as the main langauge.

Ganache is used to test the blockchain implementation.

To compile the solidity contracts, run ```npx hardhat compile```
To deploy the contracts use ```npx hardhat --network ganache run src/scripts/<script-file>.js```

To install the dependencies of node.js project, run ```npm install```
To build the project, run, ```npm run build```.
To start the application, run ```npm run start```
