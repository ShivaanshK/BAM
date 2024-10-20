// SPDX-License-Identifier: UNLICENSED

// Usage: source .env && forge script ./script/Deploy.s.sol --rpc-url=$SEPOLIA_RPC_URL --broadcast --etherscan-api-key=$ETHERSCAN_API_KEY --verify

// Usage: source .env && forge script ./script/Deploy.s.sol --rpc-url=$FHENIX_RPC_URL --broadcast

pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import { WrappedVault } from "../src/WrappedVault.sol";
import { WrappedVaultFactory } from "../src/WrappedVaultFactory.sol";
import { Points } from "../src/Points.sol";
import { PointsFactory } from "../src/PointsFactory.sol";
import { VaultMarketHub } from "../src/VaultMarketHub.sol";
import { RecipeMarketHub } from "../src/RecipeMarketHub.sol";
import { WeirollWallet } from "../src/WeirollWallet.sol";

import { OffchainActionMarketHub } from "../src/OffchainActionMarketHub.sol";

import { MockERC20 } from "test/mocks/MockERC20.sol";
import { MockERC4626 } from "test/mocks/MockERC4626.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        PointsFactory pointsFactory = new PointsFactory(deployerAddress);
        OffchainActionMarketHub offchainActionMarketHub = new OffchainActionMarketHub(
            0.01e18, // 1% protocol fee
            0.001e18, // 0.1% minimum frontend fee
            deployerAddress,
            address(pointsFactory)
        );

        MockERC20 aave = new MockERC20("AAVE", "AAVE");
        aave.mint(deployerAddress, 1_000_000_000e18);
        aave.approve(address(offchainActionMarketHub), 1_000_000_000e18);

        MockERC20 usdc = new MockERC20("USDC", "USDC");
        usdc.mint(deployerAddress, 1_000_000_000e18);
        usdc.approve(address(offchainActionMarketHub), 1_000_000_000e18);

        vm.stopBroadcast();
    }
}
