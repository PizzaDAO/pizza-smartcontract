async function main() {
  // We get the contract to deploy
  const RarePizzas = await ethers.getContractFactory("RarePizzas");
  const rarePizzas = await RarePizzas.deploy();

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
