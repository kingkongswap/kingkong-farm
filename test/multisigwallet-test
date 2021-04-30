const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

describe('multisigwallet-test', function () {
	let accounts
	let erc
	let multisig

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20')
		erc = await ERC.deploy('KKT', b(100000), 18)
		await erc.deployed()

		const MultiSig = await ethers.getContractFactory('MultiSigWallet')
		multisig = await MultiSig.deploy([accounts[0].address, accounts[1].address, accounts[2].address], b(2))
		await multisig.deployed()

        let owners = await multisig.getOwners()
        for (let owner of owners) {
            console.log('owner', owner)
        }

        await erc.transfer(multisig.address, b(10000))
	})
	
	it('account0 submit addOwner', async function () {
        const MultiSig = await ethers.getContractFactory('MultiSigWallet')
        let data = MultiSig.interface.encodeFunctionData('addOwner(address)', [accounts[3].address])
        await multisig.connect(accounts[0]).submitTransaction(multisig.address, b(0), data)
		await print()
	})

	it('account1 confirm addOwner', async function () {
        await multisig.connect(accounts[1]).confirmTransaction(b(0))
		await print()
	})

	it('account0 submit replaceOwner', async function () {
        const MultiSig = await ethers.getContractFactory('MultiSigWallet')
        let data = MultiSig.interface.encodeFunctionData('replaceOwner(address,address)', [accounts[3].address, accounts[4].address])
        await multisig.connect(accounts[0]).submitTransaction(multisig.address, b(0), data)
		await print()
	})

	it('account1 confirm replaceOwner', async function () {
        await multisig.connect(accounts[1]).confirmTransaction(b(1))
		await print()
	})

	it('account0 submit changeRequirement', async function () {
        const MultiSig = await ethers.getContractFactory('MultiSigWallet')
        let data = MultiSig.interface.encodeFunctionData('changeRequirement(uint256)', [b(3)])
        await multisig.connect(accounts[0]).submitTransaction(multisig.address, b(0), data)
		await print()
	})

	it('account1 confirm changeRequirement', async function () {
        await multisig.connect(accounts[1]).confirmTransaction(b(2))
		await print()
	})

	it('account0 submit transfer', async function () {
        const ERC = await ethers.getContractFactory('MockERC20')
        let data = ERC.interface.encodeFunctionData('transfer(address,uint256)', [accounts[1].address, b(100)])
        await multisig.connect(accounts[0]).submitTransaction(erc.address, b(0), data)
		await print()
	})

    it('account0 revoke transfer', async function () {
        await multisig.connect(accounts[0]).revokeConfirmation(b(3))
		await print()
	})
 
    it('account1 confirm transfer', async function () {
        await multisig.connect(accounts[1]).confirmTransaction(b(3))
		await print()
	})

    it('account2 confirm transfer', async function () {
        await multisig.connect(accounts[2]).confirmTransaction(b(3))
		await print()
	})

    it('account4 confirm transfer', async function () {
        await multisig.connect(accounts[4]).confirmTransaction(b(3))
		await print()

		console.log('erc multisig', n(await erc.balanceOf(multisig.address)))
		console.log('erc account 1', n(await erc.balanceOf(accounts[1].address)))
	})


    async function print() {
        console.log('')
        let transactionCount = await multisig.transactionCount()
        for (let i=0; i<transactionCount; i++) {
            let tx = await multisig.transactions(i)
            console.log(i, tx.destination, tx.data, tx.executed)
        }
        console.log('')
	}

	function m(num) {
		return BigNumber.from('1000000000000000000').mul(num)
	}

	function d(bn) {
		return bn.div('1000000000').toNumber() / 1000000000
	}

	function b(num) {
		return BigNumber.from(num)
	}

	function n(bn) {
		return bn.toNumber()
	}
})