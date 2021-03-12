const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

//测试可能出错的情况
describe('Pool-test', function () {
	let accounts
	let erc
	let chef

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20');
		erc = await ERC.deploy('OKB', b(10000), 18);
		await erc.deployed();

		const PoolTest = await ethers.getContractFactory('PoolTest');
		chef = await PoolTest.deploy();
		await chef.deployed();
	})

	it('addPool', async function () {
		await chef.addPool(erc.address, b(100))
		await print()
	})

    it('setRewardDebt', async function () {
		await chef.setRewardDebt(erc.address, b(123))
		await print()
	})

	it('removePool', async function () {
		await chef.removePool(erc.address)
		await print()
	})

	it('addPool', async function () {
		await chef.addPool(erc.address, b(200))
		await print()
	})

	async function print() {
		let pool = await chef.poolMap(erc.address)
		
		console.log('')
		// console.log('pool rewardToken:', pool.rewardToken, n(pool.rewardPerBlock))
		console.log('rewardDebt:', n(await chef.rewardDebt(accounts[0].address, erc.address)))
		console.log('')
	}

	function b(num) {
		return BigNumber.from(num)
	}

	function n(bn) {
		return bn.toNumber()
	}
})