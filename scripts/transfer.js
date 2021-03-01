const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

var accounts = null

async function transfer() {
    var accounts = await hre.ethers.getSigners()

    let ERC20abi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json')
    let tokenAAddress = '0xAc8cD27c2e74DfCCD8B01aeEF84aC47d1629C6b0'
    let toAddress = '0x662546Dcc9f158a9ABb4d1c3B369B07bC67969D6'
    const tokanA = new ethers.Contract(tokenAAddress, ERC20abi, accounts[1])
    await tokanA.transfer(toAddress, m(10000))

    console.log('done')
}


function getAbi(jsonPath) {
    let file = fs.readFileSync(jsonPath)
    let abi = JSON.parse(file.toString()).abi
    return abi
}


function m(num) {
    return BigNumber.from('1000000000000000000').mul(num)
}

function d(bn) {
    return bn.div('1000000000').toNumber() / 1000000000
}


transfer()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })