const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

//测试可能出错的情况，把stakeToken添加到矿池
describe('KingKongChef-error', function () {
	let accounts
	let erc
	let erc2
	let kkt
	let chef
	let startBlock
	let rewardPerBlock = 100

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20');
		erc = await ERC.deploy('OKB', b(0), 18);
		await erc.deployed();

		const KKT = await ethers.getContractFactory('KingKongToken');
		kkt = await KKT.deploy();
		await kkt.deployed();

		const KingKongChef = await ethers.getContractFactory('KingKongChef');
		chef = await KingKongChef.deploy(kkt.address);
		await chef.deployed();

		await kkt.mint(accounts[0].address, b(10000))
		await kkt.mint(accounts[1].address, b(20))
	})

	it('deposit', async function () {
		await print()

		await kkt.connect(accounts[1]).approve(chef.address, b(10))
		await chef.connect(accounts[1]).deposit(b(10))
		console.log('account1 deposit 10')

		await print()
	})

	it('addPool', async function () {
		await print()

		await kkt.transfer(chef.address, b(10000))
		let blockNum = await ethers.provider.getBlockNumber()
		startBlock = blockNum + 2
		await chef.addPool(kkt.address, b(rewardPerBlock), b(startBlock), b(startBlock+100), accounts[0].address)
		console.log('account0 addPool')

		await print()
	})

	it('harvestAll', async function () {
		await print()
		
		await chef.connect(accounts[1]).harvestAll(accounts[1].address)
		console.log('account1 harvestAll')
		
		await print()
	})

	it('withdraw', async function () {
		await print()

		await chef.connect(accounts[1]).withdraw(b(5))
		console.log('account1 withdraw 5')

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		await print()
		
		await chef.connect(accounts[1]).harvestAll(accounts[1].address)
		console.log('account1 harvestAll')
		
		await print()
	})

	it('removePool', async function () {
		await print()

		await chef.removePool(kkt.address)
		console.log('account0 removePool erc')
		
		await print()
	})

	it('addPool', async function () {
		await print()

		await kkt.transfer(chef.address, b(1000))
		let blockNum = await ethers.provider.getBlockNumber()
		startBlock = blockNum + 2
		await chef.addPool(kkt.address, b(rewardPerBlock), b(startBlock), b(startBlock+10), accounts[0].address)
		console.log('account0 addPool')

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		await print()
		
		await chef.connect(accounts[1]).harvestAll(accounts[1].address)
		console.log('account1 harvestAll')
		
		assert(n(await kkt.balanceOf(accounts[0].address)) == 7700, 'account0 kkt error')
		assert(n(await chef.balanceOf(accounts[0].address)) == 0, 'account0 balance_in_chef error')
		assert(n(await kkt.balanceOf(accounts[1].address)) == 1315, 'account1 kkt error')
		assert(n(await chef.balanceOf(accounts[1].address)) == 5, 'account1 balance_in_chef error')
		assert(n(await kkt.balanceOf(chef.address)) == 1005, 'chef kkt error')

		await print()
	})

	

	async function print() {
		let pool = await chef.poolMap(kkt.address)
		
		console.log('')
		console.log('blockNum:', await ethers.provider.getBlockNumber(), 'start:', n(pool.bonusStartBlock), 'end:', n(pool.bonusEndBlock))
		console.log(
			'account0 kkt:', n(await kkt.balanceOf(accounts[0].address)), 
			'balance_in_chef:', n(await chef.balanceOf(accounts[0].address)), 
			'erc(kkt):', n(await kkt.balanceOf(accounts[0].address)),
			'pending:', n(await chef.pendingReward(accounts[0].address, kkt.address)),
			)
		console.log(
			'account1 kkt:', n(await kkt.balanceOf(accounts[1].address)), 
			'balance_in_chef:', n(await chef.balanceOf(accounts[1].address)), 
			'erc(kkt):', n(await kkt.balanceOf(accounts[1].address)),
			'pending:', n(await chef.pendingReward(accounts[1].address, kkt.address)),
			)
		console.log(
			'chef kkt:', n(await kkt.balanceOf(chef.address)), 
			'erc:', n(await kkt.balanceOf(chef.address)),
			)

		console.log(
			'pool accPerShare:', pool.accPerShare.toNumber(), 
			'lastRewardBlock:', pool.lastRewardBlock.toNumber(),
			'balance:', n(pool.balance), 'amount:', n(pool.amount)
			)
		console.log(
			'account0 rewardDebt:', n(await chef.getRewardDebt(accounts[0].address, kkt.address)), 
			'pendingReward', n(await chef.pendingReward(accounts[0].address, kkt.address))
			)
		console.log(
			'account1 rewardDebt:', n(await chef.getRewardDebt(accounts[1].address, kkt.address)), 
			'pendingReward', n(await chef.pendingReward(accounts[1].address, kkt.address))
			)
		console.log('')
	}

	function b(num) {
		return BigNumber.from(num)
	}

	function n(bn) {
		return bn.toNumber()
	}
})
