// SPDX-License-Identifier: UNLICENSED

// Usage: source .env && forge script ./script/Deploy.s.sol --rpc-url=$SEPOLIA_RPC_URL --broadcast --etherscan-api-key=$ETHERSCAN_API_KEY --verify

// Usage: source .env && forge script ./script/Deploy.s.sol --rpc-url=$FHENIX_RPC_URL --broadcast

pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import { MockERC20 } from "test/mocks/MockERC20.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        MockERC20 aave = new MockERC20("AAVE", "AAVE");
        aave.mint(deployerAddress, 1_000_000e18);

        MockERC20 usdc = new MockERC20("USDC", "USDC");
        usdc.mint(deployerAddress, 1_000_000e18);

        vm.stopBroadcast();
    }
}
