# kingkong-farm
### fork from sushiswap, then use hardhat to rebuild
## contracts modify:
1. MasterChef.sol remove migrate, add updateMultiplier(), now BONUS_MULTIPLIER can be update
2. removed Migrator.sol SushiBar.sol SushiMaker.sol SushiRoll.sol
3. SushiToken rename KingKongToken
4. removed mocks
5. KingKongToken.sol use @dev instead of @notice
6. Timelock.sol line 122 Use "{value: ...}" instead of ".value(...)"

## deploy
1. npm i
2. npx hardhat node
3. npx hardhat run scripts/deploy.js --network localhost
- now you have factory deployed, you can set feeTo your wallet address to receive the 0.3% fee
- TIP: if you modify UniswapV2Pair.sol, the INIT_CODE_PAIR_HASH will be changed, copy the hex into UniswapV2Library.sol of kingkong-swap-periphery
- next step turn to kingkong-swap-periphery

