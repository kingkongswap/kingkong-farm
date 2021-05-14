require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
	const accounts = await ethers.getSigners();

	for (const account of accounts) {
		console.log(account.address);
	}
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {

		},
		okex_testnet: {
			url: 'https://exchaintestrpc.okex.org',
			chainId: 65,
			from: process.env.ETH_ADDRESS_0,
			accounts: [
				process.env.ETH_PK_0,
				process.env.ETH_PK_1,
				process.env.ETH_PK_2
			]
		},
		kk_testnet: {
			// url: 'http://39.103.147.63:26659',
			url: 'https://test-node.kkt.one',
			chainId: 65,
			from: process.env.ETH_ADDRESS_0,
			accounts: [
				process.env.ETH_PK_0,
				process.env.ETH_PK_1,
				process.env.ETH_PK_2
			]
		},
		heco_testnet: {
			url: 'https://http-testnet.hecochain.com',
			chainId: 256,
			from: process.env.ETH_ADDRESS_0,
			accounts: [
				process.env.ETH_PK_0,
				process.env.ETH_PK_1,
				process.env.ETH_PK_2
			]
		},
		bsc_testnet: {
			url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
			chainId: 97,
			from: process.env.ETH_ADDRESS_0,
			accounts: [
				process.env.ETH_PK_0,
				process.env.ETH_PK_1,
				process.env.ETH_PK_2
			]
		},
		bsc_mainnet: {
			url: 'https://bsc-dataseed2.binance.org/',
			chainId: 56,
			from: process.env.ETH_ADDRESS_0,
			accounts: [
				process.env.ETH_PK_0,
				process.env.ETH_PK_1,
				process.env.ETH_PK_2
			]
		}
	},
	// solidity: {
	// 	compilers: [
	// 		{
	// 		  version: "0.6.12",
	// 		}
	// 	  ]
	// }
	solidity: {
		version: "0.6.12",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	}
};