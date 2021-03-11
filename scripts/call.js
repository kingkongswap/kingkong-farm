const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

const kktAAddress = '0x4888097d1B29b439C55C6d3E44031eE658237dE3'
const chefAAddress = '0xE73d4CE78e14B6c65DC8dC25d3fBE20dcfcfF6c3'

async function main() {
    const accounts = await hre.ethers.getSigners()
    const devAddress = accounts[1].address

    let KKTabi = getAbi('./artifacts/contracts/KingKongToken.sol/KingKongToken.json')
    const kkt = new ethers.Contract(kktAAddress, KKTabi, accounts[0])

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    // console.log('MasterChef owner is:', await chef.owner())
	// console.log('MasterChef dev is:', await chef.devaddr())
    console.log('kktPerBlock:', dpow(await chef.kktPerBlock(), 18))
    
    // await addLiquidity(KKT, USDT) //pair 0xc23F883d711846DEd91c4ABC6B6ceC004bE2c77c
    // await addLiquidity(NAS, USDT)  //pair 0x240324f119a8159c9AA6ED107BA7244213524768
    // await addLiquidityETH(KKT) //pair 0xE63d2bc2945689126C514A8497b0c04E5C9f8446
    // await addLiquidityETH(USDT) //pair 0xfeE7E19eDC2D945103e64827cf4A81Ce649d9079
    // await addLiquidityETH(OKB) //pair 0x5c71B198c53E4FF06F2bcE6DeE283b28C014F9b2
    // const OKB = '0xda9d14072ef2262c64240da3a93fea2279253611' //官方
    // const NAS = '0x6FD9dB63dbC6BE452ae7B0Fe9995c81d967870Bb'
    // const DAI = '0x0586e702605d7206edD283D4311B38AEB579d7BC'
    // const USDT = '0xe579156f9decc4134b5e3a30a24ac46bb8b01281' //官方
    // const KKT = '0x4888097d1B29b439C55C6d3E44031eE658237dE3'
    // const WOKT = '0x2219845942d28716c0f7c605765fabdca1a7d9e0' //官方

    await addPool('0xc23F883d711846DEd91c4ABC6B6ceC004bE2c77c', 5)
    await delay(15)
    await addPool('0xE63d2bc2945689126C514A8497b0c04E5C9f8446', 5)
    await delay(15)
    await addPool('0x240324f119a8159c9AA6ED107BA7244213524768', 3)
    await delay(15)
    await addPool('0xfeE7E19eDC2D945103e64827cf4A81Ce649d9079', 3)
    await delay(15)
    await addPool('0x5c71B198c53E4FF06F2bcE6DeE283b28C014F9b2', 2)
    await delay(15)
    await addPool('0x2219845942d28716c0f7c605765fabdca1a7d9e0', 1)
    await delay(15)
    await addPool('0xda9d14072ef2262c64240da3a93fea2279253611', 1)
    await delay(15)
    await addPool('0x6FD9dB63dbC6BE452ae7B0Fe9995c81d967870Bb', 1)

    console.log('done')

    // pool: 0xc23F883d711846DEd91c4ABC6B6ceC004bE2c77c speed: 5 KKT, USDT
    // pool: 0xE63d2bc2945689126C514A8497b0c04E5C9f8446 speed: 5 KKT, WOKT
    // pool: 0x240324f119a8159c9AA6ED107BA7244213524768 speed: 3 NAS, USDT
    // pool: 0xfeE7E19eDC2D945103e64827cf4A81Ce649d9079 speed: 3 USDT, WOKT
    // pool: 0x5c71B198c53E4FF06F2bcE6DeE283b28C014F9b2 speed: 2 OKB, WOKT
    // pool: 0x2219845942d28716c0F7C605765fABDcA1a7d9E0 speed: 1 WOKT
    // pool: 0xDa9d14072Ef2262c64240Da3A93fea2279253611 speed: 1 OKB
    // pool: 0x6FD9dB63dbC6BE452ae7B0Fe9995c81d967870Bb speed: 1 NAS
}


async function setKKTPerBlock() {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    await chef.setKKTPerBlock(pow(30, 18))
    console.log('MasterChef setKKTPerBlock') 
}


async function addPool(tokenAddress, speed) {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    //一种token对应一个池子，不能重复开池子，否则会混乱
    await chef.add(BigNumber.from(speed), tokenAddress, true)
    console.log('addPool', tokenAddress, 'speed:', speed)
}


async function viewPools() {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    let poolLength = (await chef.poolLength()).toNumber()
    console.log('poolLength:', poolLength)

    for (let i = 0; i < poolLength; i++) {
        let pool = await chef.poolInfo(i)
        console.log('pool:', pool.lpToken, 'speed:', pool.allocPoint.toNumber())
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
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })