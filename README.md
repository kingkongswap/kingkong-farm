# kingkong-farm
### fork from sushiswap, then use hardhat to rebuild
## contracts modify:
1. MasterChef.sol remove migrate
2. MasterChef.sol remove BONUS_MULTIPLIER and bonusEndBlock, add setKKTPerBlock()
3. MasterChef.sol modify getMultiplier()
4. remove Migrator.sol SushiBar.sol SushiMaker.sol SushiRoll.sol
5. remove mocks
6. SushiToken rename KingKongToken
7. KingKongToken.sol add TOTAL_SUPPLY_LIMIT in mint(), TOTAL_SUPPLY_LIMIT is 100m
8. KingKongToken.sol use @dev instead of @notice
9. Timelock.sol line 122 Use "{value: ...}" instead of ".value(...)"

## contracts added:
1. add Multicall.sol and MultiSigWallet.sol for governance
2. add KingChef.sol, which means launch pool
3. add Deployer.sol to deploy KingChef
4. add KongChef.sol, another lanuch pool, much likely KingChef, but we dont use it

## deploy
1. npm i
2. npx hardhat node
3. npx hardhat run scripts/deploy.js --network localhost
- now you have MasterChef deployed, you can stake LP-token to mint KKT

