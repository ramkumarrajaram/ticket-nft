async function main() {
    const MyNFT = await ethers.getContractFactory("KrisTicksNFT")
  
    // Start deployment, returning a promise that resolves to a contract object
    const myNFT = await MyNFT.deploy("0xE377540DA9A8f5BCEc61d7d08eCbCC69c36b587c", "0xfcf80d944E0CF1d096B53Bf2a03FeE39B62bD179")
    await myNFT.deployed()
    console.log("Contract deployed to address:", myNFT.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  