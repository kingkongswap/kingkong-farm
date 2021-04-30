const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

// lptoken: 0x695Ef962b4Ee88ED193148E486208D58d184D203 WOKT-USDT 3
// lptoken: 0xAA62cf5bf12D541335AC776eCBFd3BEBBDe5cF21 KKT-USDT 5
// lptoken: 0xa67C92B04d66aB92c587f224b37CCd4E2055aA0d KKT-WOKT 5
// lptoken: 0x2BC09D8f6bEc3C8DdccdbE18d1FdB0E615845dF3 NAS-USDT 3
// lptoken: 0x1e6A2B2701A5423930cF0Da95A7A007D9A26D2f7 OKB-USDT 2
// lptoken: 0xf0858096473087b12634999E43aC14945841bfbA BTCK-USDT 1
// lptoken: 0x8D802439F1f7Cbf93F3384d95857b61DD7FA901b ETHK-USDT 1
// lptoken: 0xF46e0C15c1aEEEB8cFd3000F1EC22Bc2D2d9641e LTCK-USDT 1
// lptoken: 0x0E4780F2462aa5a8B098eC82324352991B45BEb0 DOTK-USDT 1
// lptoken: 0x22B65C78e675083Fe9ECE0d2c5736a84307aE5A1 USDT-FILK 1
// lptoken: 0x396BB9bFe7f39e2BDa4E85C55D3d67014Bb36FFa USDK-USDT 1

const kktAddress = '0x4C8ef89f82E8A773F6B943200fe56d36DDBaF324'
const chefAddress = '0x95De83a7dAEc15FEeb0a0C1F84e47e0E93e66ddA'

async function main() {
    const accounts = await hre.ethers.getSigners()
    const devAddress = accounts[1].address

    let KKTabi = getAbi('./artifacts/contracts/KingKongToken.sol/KingKongToken.json')
    const kkt = new ethers.Contract(kktAddress, KKTabi, accounts[0])

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAddress, chefabi, accounts[0])

    // console.log('MasterChef owner is:', await chef.owner())
	// console.log('MasterChef dev is:', await chef.devaddr())
    // console.log('kktPerBlock:', dpow(await chef.kktPerBlock(), 18))

    await addPool('0xbca246ce4d0E77C003906AEc334195d3c65EEdb4', 3)
    await delay(10)
    await addPool('0x540B0c6135fD87AdA631F920F3dc57CaE6890B5d', 5)
    await delay(10)
    await addPool('0xB3B6c403587436DC173Af4157113953f7402Be6B', 5)
    await delay(10)
    await addPool('0x1B402F170F6118B795Faf9fd579fb278b26b1DDC', 3)
    await delay(10)
    await addPool('0x3e044c5FF422f71E2aB54834A6Fee1Db28AD0ea0', 2)
    await delay(10)
    await addPool('0x2585672b565FbF9b6E84679dcDD1E7040d2c980d', 1)
    await delay(10)
    await addPool('0x5aC84595fB01aAF9FC59e0592Fa37ed3186Aa15D', 1)
    await delay(10)
    await addPool('0xC9d64b05a4bDa8f5f3A711ADc1649d7585d5463d', 1)
    await delay(10)
    await addPool('0x9cbdc11EF091CAF7C1592B11463b6Edd0936bc3A', 1)
    await delay(10)
    await addPool('0x51F8Ef3D11f53ceAFB574Cf1D85bdfB40BEd856D', 1)
    await delay(10)
    await addPool('0x0b57170d20dA8b9faA8a5728aa4769D0a31d9A6a', 1)
    await delay(10)

    console.log('done')
}


async function setKKTPerBlock() {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAddress, chefabi, accounts[0])

    await chef.setKKTPerBlock(pow(30, 18), {gasLimit:BigNumber.from('8000000')})
    console.log('MasterChef setKKTPerBlock') 
}


async function addPool(tokenAddress, speed) {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAddress, chefabi, accounts[0])

    //一种token对应一个池子，不能重复开池子，否则会混乱
    await chef.add(BigNumber.from(speed), tokenAddress, true, {gasLimit:BigNumber.from('8000000')})
    console.log('addPool', tokenAddress, 'speed:', speed)
}


async function viewPools() {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAddress, chefabi, accounts[0])

    let pairAbi = getAbi('../kingkong-swap-periphery/artifacts/@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json')

    let ercAbi = getAbi('../kingkong-swap-periphery/artifacts/contracts/test/ERC20.sol/ERC20.json')

    let poolLength = (await chef.poolLength()).toNumber()
    console.log('poolLength:', poolLength)

    for (let i = 0; i < poolLength; i++) {
        let pool = await chef.poolInfo(i)

        let pair = new ethers.Contract(pool.lpToken, pairAbi, accounts[0])

        if (await pair.symbol() == 'KK-LP') {
            let token0Address = await pair.token0()
            let erc0 = new ethers.Contract(token0Address, ercAbi, accounts[0])
    
            let token1Address = await pair.token1()
            let erc1 = new ethers.Contract(token1Address, ercAbi, accounts[0])
    
            console.log('farm pool ' + i + ':', pair.address, await erc0.symbol() + '-' + await erc1.symbol(), 'speed:', pool.allocPoint.toNumber())
            
        } else {
            
            console.log('farm pool ' + i + ':', pair.address, await pair.symbol(), 'speed:', pool.allocPoint.toNumber())
        }
    }
}


function getAbi(jsonPath) {
    let file = fs.readFileSync(jsonPath)
    let abi = JSON.parse(file.toString()).abi
    return abi
}


function pow(num, decimals) {
    return BigNumber.from(10).pow(decimals).mul(num)
}


function dpow(bn, decimals) {
    return bn.div(BigNumber.from(10).pow(decimals)).toString()
}

async function delay(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, sec * 1000);
    })
}

viewPools()
// main().then(viewPools)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })