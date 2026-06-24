import hre from "hardhat";

async function main() {
  const TrustPayEscrow = await hre.ethers.getContractFactory("TrustPayEscrow");
  const escrow = await TrustPayEscrow.deploy();
  await escrow.waitForDeployment();

  console.log(`TrustPayEscrow deployed to ${await escrow.getAddress()}`);
  console.log("Set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS to this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
