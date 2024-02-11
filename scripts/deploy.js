async function main() {
    const LiveQnA = await ethers.getContractFactory("LiveQnA");
 
    // Start deployment, returning a promise that resolves to a contract object
    const liveQnA = await LiveQnA.deploy();
    await liveQnA.deployed();
    console.log("Contract deployed to address:", liveQnA.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });
 