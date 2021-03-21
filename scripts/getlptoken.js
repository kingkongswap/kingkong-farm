const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

var accounts = null

async function main() {
    accounts = await hre.ethers.getSigners()
    
    let chefAbi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    let chefAddress = '0x53a92cD4F3a453799DBE560020EaA5EEdA3C5E46'
    const chef = new ethers.Contract(chefAddress, chefAbi, accounts[0])

    //查看池子
    let poolLength = await chef.poolLength()
    console.log('poolLength:', poolLength.toNumber())
    
    let pairAbi = getAbi('../kingkong-swap-core/artifacts/contracts/UniswapV2Pair.sol/UniswapV2Pair.json')
    let ercAbi = getAbi('../kingkong-swap-core/artifacts/contracts/test/ERC20.sol/ERC20.json')
    for (let i=0; i<poolLength.toNumber(); i++) {
        let userAddress = '0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D'
        let user = await chef.userInfo(i, userAddress)

        let pool = await chef.poolInfo(i)
        // console.log('pool:', pool.lpToken, pool.allocPoint.toNumber())

        let pair = new ethers.Contract(pool.lpToken, pairAbi, accounts[0])

        if (await pair.symbol() == 'KK-LP') {
            let token0Address = await pair.token0()
            let erc0 = new ethers.Contract(token0Address, ercAbi, accounts[0])
    
            let token1Address = await pair.token1()
            let erc1 = new ethers.Contract(token1Address, ercAbi, accounts[0])
    
            console.log('lptoken:', pair.address, await erc0.symbol() + '-' + await erc1.symbol(), user.amount.toString())
            
        } else {
            
            console.log('token:', pair.address, await pair.symbol(), user.amount.toString())

        }

    }

    console.log('done')
}


function getAbi(jsonPath) {
    let file = fs.readFileSync(jsonPath)
    let abi = JSON.parse(file.toString()).abi
    return abi
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })