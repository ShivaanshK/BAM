// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { ERC20 } from "lib/solmate/src/tokens/ERC20.sol";
import { ERC4626 } from "lib/solmate/src/tokens/ERC4626.sol";
import { SafeTransferLib } from "lib/solmate/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "lib/solmate/src/utils/FixedPointMathLib.sol";
import { ReentrancyGuard } from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import { Points } from "src/Points.sol";
import { PointsFactory } from "src/PointsFactory.sol";
import { Owned } from "lib/solmate/src/auth/Owned.sol";

/// @title OffchainActionMarketHub
/// @author ShivaanshK
/// @notice OffchainActionMarketHub contract for IPs to incentivize APs to participate in "offchain action markets" to perform arbitrary offchain actions
contract OffchainActionMarketHub is Owned, ReentrancyGuard {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;

    /// @notice The address of the PointsFactory contract
    address public immutable POINTS_FACTORY;

    /// @notice The number of AP offers that have been created
    uint256 public numAPOffers;
    /// @notice The number of IP offers that have been created
    uint256 public numIPOffers;
    /// @notice The number of unique offchain action markets created
    uint256 public numMarkets;

    /// @notice whether offer fills are paused
    bool offersPaused;

    /// @notice The percent deducted from the IP's incentive amount and claimable by protocolFeeClaimant
    uint256 public protocolFee; // 1e18 == 100% fee
    address public protocolFeeClaimant;

    /// @notice Markets can opt into a higher frontend fee to incentivize quick discovery but cannot go below this minimum
    uint256 public minimumFrontendFee; // 1e18 == 100% fee

    /// @notice Holds all OffchainActionMarket structs
    mapping(bytes32 => OffchainActionMarket) public marketHashToOffchainActionMarket;

    /// @notice Holds all IPOffer structs
    mapping(bytes32 => IPOffer) public offerHashToIPOffer;

    /// @notice Holds all APOffer structs
    mapping(bytes32 => APOffer) public offerHashToAPOffer;

    // Structure to store each fee claimant's accrued fees for a particular incentive token (claimant => incentive token => feesAccrued)
    mapping(address => mapping(address => uint256)) public feeClaimantToTokenToAmount;

    struct OffchainActionMarket {
        ERC20 stakingToken;
        uint256 marketID;
        uint256 frontendFee;
        bytes32 ipfsContentID;
        address oanSigningAddress; // Address of the offchain attestation network to verify signatures against
    }

    struct IPOffer {
        uint256 offerID;
        bytes32 targetMarketHash;
        address ip;
        address apFiller; // address(0) if unfilled
        uint256 stakeAmount;
        bytes verificationScriptParams;
        uint256 expiry;
        uint256 timeToAct;
        uint256 dueDate;
        address frontendFeeRecipient;
        address[] incentivesOffered;
        mapping(address => uint256) incentiveAmountsOffered; // amounts to be allocated to APs (per incentive)
        mapping(address => uint256) incentiveToProtocolFeeAmount; // amounts to be allocated to protocolFeeClaimant (per incentive)
        mapping(address => uint256) incentiveToFrontendFeeAmount; // amounts to be allocated to frontend provider (per incentive)
    }

    struct APOffer {
        uint256 offerID;
        bytes32 targetMarketHash;
        address fundingVault;
        address ap;
        address ipFiller; // address(0) if unfilled
        uint256 stakeAmount;
        bytes verificationScriptParams;
        uint256 expiry;
        uint256 timeToAct;
        uint256 dueDate;
        address frontendFeeRecipient;
        address[] incentivesRequested;
        uint256[] incentiveAmountsRequested;
    }

    event MarketCreated(uint256 indexed marketID, bytes32 indexed marketHash, uint256 frontendFee, bytes32 ipfsContentID, address oanSigningAddress);

    event APOfferCreated(
        uint256 indexed offerID,
        bytes32 indexed offerHash,
        bytes32 indexed marketHash,
        address fundingVault,
        bytes verificationScriptParams,
        uint256 stakeAmount,
        uint256 timeToAct,
        address[] incentiveAddresses,
        uint256[] incentiveAmounts,
        uint256 expiry
    );

    event IPOfferCreated(
        uint256 indexed offerID,
        bytes32 indexed offerHash,
        bytes32 indexed marketHash,
        bytes verificationScriptParams,
        uint256 stakeAmount,
        uint256 timeToAct,
        address[] incentivesOffered,
        uint256[] incentiveAmounts,
        uint256[] protocolFeeAmounts,
        uint256[] frontendFeeAmounts,
        uint256 expiry
    );

    event IPOfferFilled(bytes32 indexed offerHash, address indexed ap, uint256 dueDate);

    event APOfferFilled(
        uint256 indexed offerID, address indexed ip, uint256 dueDate, uint256[] incentiveAmounts, uint256[] protocolFeeAmounts, uint256[] frontendFeeAmounts
    );

    /// @param offerHash The hash of the IP offer that was cancelled
    event IPOfferCancelled(bytes32 indexed offerHash);

    /// @param offerID The ID of the AP offer that was cancelled
    event APOfferCancelled(uint256 indexed offerID);

    /// @param claimant The address that claimed the fees
    /// @param incentive The address of the incentive claimed as a fee
    /// @param amount The amount of fees claimed
    event FeesClaimed(address indexed claimant, address indexed incentive, uint256 amount);

    event ClaimedIncentive(address indexed ap, address incentive);

    /// @notice emitted when trying to create a market with address(0) as the input token
    error InvalidMarketInputToken();
    /// @notice emitted when trying to fill an offer that has expired
    error OfferExpired();
    /// @notice emitted when creating an offer with duplicate incentives
    error OfferCannotContainDuplicates();
    /// @notice emitted when trying to fill an offer with more input tokens than the remaining offer quantity
    error OfferAlreadyFilled();
    /// @notice emitted when the base asset of the target vault and the funding vault do not match
    error MismatchedBaseAsset();
    /// @notice emitted if a market with the given ID does not exist
    error MarketDoesNotExist();
    /// @notice emitted when trying to place an offer with an expiry in the past
    error CannotPlaceExpiredOffer();
    /// @notice emitted when trying to place an offer with a quantity of 0
    error CannotPlaceZeroQuantityOffer();
    /// @notice emitted when incentives and amounts offered/requested arrays are not the same length
    error ArrayLengthMismatch();
    /// @notice emitted when the frontend fee is below the minimum
    error FrontendFeeTooLow();
    /// @notice emitted when trying to forfeit a wallet that is not owned by the caller
    error NotOwner();
    /// @notice emitted when trying to claim rewards of a wallet that is locked
    error WalletLocked();
    /// @notice Emitted when trying to start a rewards campaign with a non-existent incentive
    error TokenDoesNotExist();
    /// @notice Emitted when sum of protocolFee and frontendFee is greater than 100% (1e18)
    error TotalFeeTooHigh();
    /// @notice emitted when trying to fill an offer that doesn't exist anymore/yet
    error CannotFillZeroQuantityOffer();
    /// @notice emitted when staking failed
    error StakingFailed();
    /// @notice emitted when creating an offer with an invalid points program
    error InvalidPointsProgram();
    /// @notice emitted when APOfferFill charges a trivial incentive amount
    error NoIncentivesPaidOnFill();
    /// @notice emitted when trying to fill offers while offers are paused
    error OffersPaused();
    /// @notice emitted when trying to fill an offer with a quantity below the minimum fill percent
    error InsufficientFillPercent();

    /// @notice Check if offer fills have been paused
    modifier offersNotPaused() {
        if (offersPaused) {
            revert OffersPaused();
        }
        _;
    }

    /// @notice Setter to pause and unpause fills
    function setOffersPaused(bool _offersPaused) external onlyOwner {
        offersPaused = _offersPaused;
    }

    /// @param _protocolFee The percent deducted from the IP's incentive amount and claimable by protocolFeeClaimant
    /// @param _minimumFrontendFee The minimum frontend fee that a market can set
    /// @param _owner The address that will be set as the owner of the contract
    /// @param _pointsFactory The address of a points factory contract for creating Point's campaign
    constructor(uint256 _protocolFee, uint256 _minimumFrontendFee, address _owner, address _pointsFactory) payable Owned(_owner) {
        POINTS_FACTORY = _pointsFactory;
        protocolFee = _protocolFee;
        protocolFeeClaimant = _owner;
        minimumFrontendFee = _minimumFrontendFee;
    }

    function createMarket(
        ERC20 stakingToken,
        uint256 frontendFee,
        bytes32 ipfsContentID,
        address oanSigningAddress
    )
        external
        payable
        returns (bytes32 marketHash)
    {
        // Check that the frontend fee is at least the global minimum
        if (frontendFee < minimumFrontendFee) {
            revert FrontendFeeTooLow();
        }
        // Check that the sum of fees isn't too high
        if ((frontendFee + protocolFee) > 1e18) {
            revert TotalFeeTooHigh();
        }

        OffchainActionMarket memory market = OffchainActionMarket(stakingToken, numMarkets, frontendFee, ipfsContentID, oanSigningAddress);
        marketHash = getMarketHash(market);
        marketHashToOffchainActionMarket[marketHash] = market;

        emit MarketCreated(numMarkets, marketHash, frontendFee, ipfsContentID, oanSigningAddress);

        numMarkets++;
    }

    function createAPOffer(
        bytes32 targetMarketHash,
        uint256 expiry,
        uint256 stakeAmount,
        address fundingVault,
        uint256 timeToAct,
        bytes calldata verificationScriptParams,
        address[] calldata incentivesRequested,
        uint256[] calldata incentiveAmountsRequested
    )
        external
        payable
        returns (bytes32 offerHash)
    {
        // Retrieve the target market
        OffchainActionMarket storage targetMarket = marketHashToOffchainActionMarket[targetMarketHash];

        // Check that the market exists
        if (address(targetMarket.stakingToken) == address(0)) {
            revert MarketDoesNotExist();
        }
        // Check offer isn't expired (expiries of 0 live forever)
        if (expiry != 0 && expiry < block.timestamp) {
            revert CannotPlaceExpiredOffer();
        }
        // Check incentive and amounts arrays are the same length
        if (incentivesRequested.length != incentiveAmountsRequested.length) {
            revert ArrayLengthMismatch();
        }
        address lastIncentive;
        for (uint256 i; i < incentivesRequested.length; i++) {
            address incentive = incentivesRequested[i];
            if (uint256(bytes32(bytes20(incentive))) <= uint256(bytes32(bytes20(lastIncentive)))) {
                revert OfferCannotContainDuplicates();
            }
            lastIncentive = incentive;
        }

        // NOTE: The cool use of short-circuit means this call can't revert if fundingVault doesn't support asset()
        if (fundingVault != address(0) && targetMarket.stakingToken != ERC4626(fundingVault).asset()) {
            revert MismatchedBaseAsset();
        }

        // Map the offer hash to the offer quantity
        APOffer memory offer = APOffer(
            numAPOffers,
            targetMarketHash,
            fundingVault,
            msg.sender,
            address(0),
            stakeAmount,
            verificationScriptParams,
            expiry,
            timeToAct,
            0,
            address(0),
            incentivesRequested,
            incentiveAmountsRequested
        );
        offerHash = getAPOfferHash(offer);
        offerHashToAPOffer[offerHash] = offer;

        /// @dev APOffer events are stored in events and do not exist onchain outside of the offerHashToRemainingQuantity mapping
        emit APOfferCreated(
            numAPOffers,
            offerHash,
            targetMarketHash,
            fundingVault,
            verificationScriptParams,
            stakeAmount,
            timeToAct,
            incentivesRequested,
            incentiveAmountsRequested,
            expiry
        );

        // Increment the number of AP offers created
        numAPOffers++;
    }

    function createIPOffer(
        bytes32 targetMarketHash,
        uint256 stakeAmount,
        bytes calldata verificationScriptParams,
        uint256 expiry,
        uint256 timeToAct,
        address[] calldata incentivesOffered,
        uint256[] calldata incentiveAmountsPaid
    )
        external
        payable
        nonReentrant
        returns (bytes32 offerHash)
    {
        // Retrieve the target market
        OffchainActionMarket storage targetMarket = marketHashToOffchainActionMarket[targetMarketHash];

        // Check that the market exists
        if (address(targetMarket.stakingToken) == address(0)) {
            revert MarketDoesNotExist();
        }
        // Check that the offer isn't expired
        if (expiry != 0 && expiry < block.timestamp) {
            revert CannotPlaceExpiredOffer();
        }

        // Check that the incentives and amounts arrays are the same length
        if (incentivesOffered.length != incentiveAmountsPaid.length) {
            revert ArrayLengthMismatch();
        }

        // To keep track of incentives allocated to the AP and fees (per incentive)
        uint256[] memory incentiveAmountsOffered = new uint256[](incentivesOffered.length);
        uint256[] memory protocolFeesToBePaid = new uint256[](incentivesOffered.length);
        uint256[] memory frontendFeesToBePaid = new uint256[](incentivesOffered.length);

        // Transfer the IP's incentives to the RecipeMarketHub and set aside fees
        address lastIncentive;
        for (uint256 i = 0; i < incentivesOffered.length; ++i) {
            // Get the incentive offered
            address incentive = incentivesOffered[i];

            // Check that the sorted incentive array has no duplicates
            if (uint256(bytes32(bytes20(incentive))) <= uint256(bytes32(bytes20(lastIncentive)))) {
                revert OfferCannotContainDuplicates();
            }
            lastIncentive = incentive;

            // Total amount IP is paying in this incentive including fees
            uint256 amount = incentiveAmountsPaid[i];

            // Get the frontend fee for the target offchain action market
            uint256 frontendFee = targetMarket.frontendFee;

            // Calculate incentive and fee breakdown
            uint256 incentiveAmount = amount.divWadDown(1e18 + protocolFee + frontendFee);
            uint256 protocolFeeAmount = incentiveAmount.mulWadDown(protocolFee);
            uint256 frontendFeeAmount = incentiveAmount.mulWadDown(frontendFee);

            // Use a scoping block to avoid stack to deep errors
            {
                // Track incentive amounts and fees (per incentive)
                incentiveAmountsOffered[i] = incentiveAmount;
                protocolFeesToBePaid[i] = protocolFeeAmount;
                frontendFeesToBePaid[i] = frontendFeeAmount;
            }

            // Check if incentive is a points program
            if (PointsFactory(POINTS_FACTORY).isPointsProgram(incentive)) {
                // If points incentive, make sure:
                // 1. The points factory used to create the program is the same as this RecipeMarketHubs PF
                // 2. IP placing the offer can award points
                // 3. Points factory has this RecipeMarketHub marked as a valid RO - can be assumed true
                if (POINTS_FACTORY != address(Points(incentive).pointsFactory()) || !Points(incentive).allowedIPs(msg.sender)) {
                    revert InvalidPointsProgram();
                }
            } else {
                // SafeTransferFrom does not check if a incentive address has any code, so we need to check it manually to prevent incentive deployment
                // frontrunning
                if (incentive.code.length == 0) revert TokenDoesNotExist();
                // Transfer frontend fee + protocol fee + incentiveAmount of the incentive to RecipeMarketHub
                ERC20(incentive).safeTransferFrom(msg.sender, address(this), incentiveAmount + protocolFeeAmount + frontendFeeAmount);
            }
        }

        // Create and store the offer
        offerHash =
            getIPOfferHash(numIPOffers, targetMarketHash, msg.sender, expiry, stakeAmount, verificationScriptParams, incentivesOffered, incentiveAmountsOffered);
        IPOffer storage offer = offerHashToIPOffer[offerHash];

        offer.offerID = numIPOffers;
        offer.targetMarketHash = targetMarketHash;
        offer.ip = msg.sender;
        delete offer.apFiller; // make sure its unfilled
        delete offer.dueDate; // make sure its unfilled
        offer.stakeAmount = stakeAmount;
        offer.timeToAct = timeToAct;
        offer.verificationScriptParams = verificationScriptParams;
        offer.expiry = expiry;
        offer.incentivesOffered = incentivesOffered;

        // Set incentives and fees in the offer mapping
        for (uint256 i = 0; i < incentivesOffered.length; ++i) {
            address incentive = incentivesOffered[i];

            offer.incentiveAmountsOffered[incentive] = incentiveAmountsOffered[i];
            offer.incentiveToProtocolFeeAmount[incentive] = protocolFeesToBePaid[i];
            offer.incentiveToFrontendFeeAmount[incentive] = frontendFeesToBePaid[i];
        }

        // Emit IP offer creation event
        emit IPOfferCreated(
            numIPOffers,
            offerHash,
            targetMarketHash,
            verificationScriptParams,
            stakeAmount,
            timeToAct,
            incentivesOffered,
            incentiveAmountsOffered,
            protocolFeesToBePaid,
            frontendFeesToBePaid,
            expiry
        );

        // Increment the number of IP offers created
        numIPOffers++;
    }

    /// @param incentiveToken The incentive token to claim fees for
    /// @param to The address to send fees claimed to
    function claimFees(address incentiveToken, address to) external payable {
        uint256 amount = feeClaimantToTokenToAmount[msg.sender][incentiveToken];
        delete feeClaimantToTokenToAmount[msg.sender][incentiveToken];
        ERC20(incentiveToken).safeTransfer(to, amount);
        emit FeesClaimed(msg.sender, incentiveToken, amount);
    }

    function fillIPOffer(bytes32 offerHash, address fundingVault, address frontendFeeRecipient) external {
        // Retreive the IPOffer and OffchainActionMarket structs
        IPOffer storage offer = offerHashToIPOffer[offerHash];
        OffchainActionMarket storage market = marketHashToOffchainActionMarket[offer.targetMarketHash];

        // Check that the offer isn't expired
        if (offer.expiry != 0 && block.timestamp > offer.expiry) {
            revert OfferExpired();
        }

        bool alreadyFilled = offer.apFiller != address(0);

        if (alreadyFilled) {
            revert OfferAlreadyFilled();
        }

        // Check that the offer's base asset matches the market's base asset
        if (fundingVault != address(0) && market.stakingToken != ERC4626(fundingVault).asset()) {
            revert MismatchedBaseAsset();
        }

        // Transfer stake to orderbook to hold the AP accountable
        _addStake(fundingVault, msg.sender, market.stakingToken, offer.stakeAmount);

        offer.apFiller = msg.sender;
        offer.frontendFeeRecipient = frontendFeeRecipient;
        offer.dueDate = block.timestamp + offer.timeToAct;

        emit IPOfferFilled(offerHash, msg.sender, offer.dueDate);
    }

    function fillAPOffer(bytes32 offerHash, address frontendFeeRecipient) external {
        APOffer storage offer = offerHashToAPOffer[offerHash];
        if (offer.expiry != 0 && block.timestamp > offer.expiry) {
            revert OfferExpired();
        }

        bool alreadyFilled = offer.ipFiller != address(0);

        if (alreadyFilled) {
            revert OfferAlreadyFilled();
        }

        // Get Weiroll market
        OffchainActionMarket storage market = marketHashToOffchainActionMarket[offer.targetMarketHash];

        uint256 numIncentives = offer.incentivesRequested.length;

        // Arrays to store incentives and fee amounts to be paid
        uint256[] memory incentiveAmountsPaid = new uint256[](numIncentives);
        uint256[] memory protocolFeesPaid = new uint256[](numIncentives);
        uint256[] memory frontendFeesPaid = new uint256[](numIncentives);

        // Fees at the time of fill
        uint256 protocolFeeAtFill = protocolFee;
        uint256 marketFrontendFee = market.frontendFee;

        for (uint256 i = 0; i < numIncentives; ++i) {
            // Incentive requested by AP
            address incentive = offer.incentivesRequested[i];

            // This is the incentive amount allocated to the AP
            uint256 incentiveAmount = offer.incentiveAmountsRequested[i];
            // Check that the incentives allocated to the AP are non-zero
            if (incentiveAmount == 0) {
                revert NoIncentivesPaidOnFill();
            }

            incentiveAmountsPaid[i] = incentiveAmount;

            // Calculate fees based on fill percentage. These fees will be taken on top of the AP's requested amount.
            protocolFeesPaid[i] = incentiveAmount.mulWadDown(protocolFeeAtFill);
            frontendFeesPaid[i] = incentiveAmount.mulWadDown(marketFrontendFee);

            // Pull incentives from IP and account fees
            _pullIncentivesOnAPFill(incentive, incentiveAmount, protocolFeesPaid[i], frontendFeesPaid[i]);
        }

        // Add stake from the AP in order to hold them accountable to complete the offchain action
        _addStake(offer.fundingVault, offer.ap, market.stakingToken, offer.stakeAmount);

        // Set the IP to the fulfiller
        offer.ipFiller = msg.sender;
        offer.frontendFeeRecipient = frontendFeeRecipient;
        offer.dueDate = block.timestamp + offer.timeToAct;

        emit APOfferFilled(offer.offerID, msg.sender, offer.dueDate, incentiveAmountsPaid, protocolFeesPaid, frontendFeesPaid);
    }

    /// @notice Cancel an AP offer, setting the remaining quantity available to fill to 0
    function cancelAPOffer(APOffer calldata offer) external payable {
        // Check that the cancelling party is the offer's owner
        if (offer.ap != msg.sender) revert NotOwner();

        // Check that the offer isn't already filled, hasn't been cancelled already, or never existed
        bytes32 offerHash = getAPOfferHash(offer);
        if (offerHashToAPOffer[offerHash].ipFiller != address(0)) {
            revert OfferAlreadyFilled();
        }

        // Transfer the remaining incentives back to the IP
        for (uint256 i = 0; i < offer.incentivesRequested.length; ++i) {
            delete offerHashToAPOffer[offerHash].incentivesRequested[i];
            delete offerHashToAPOffer[offerHash].incentiveAmountsRequested[i];
        }

        // Set remaining quantity to 0 - effectively cancelling the offer
        delete offerHashToAPOffer[offerHash];

        emit APOfferCancelled(offer.offerID);
    }

    /// @notice Cancel an IP offer, setting the remaining quantity available to fill to 0 and returning the IP's incentives
    function cancelIPOffer(bytes32 offerHash) external payable nonReentrant {
        IPOffer storage offer = offerHashToIPOffer[offerHash];

        // Check that the cancelling party is the offer's owner
        if (offer.ip != msg.sender) revert NotOwner();

        // Check that the offer isn't already filled
        if (offer.apFiller != address(0)) revert OfferAlreadyFilled();

        // Transfer the remaining incentives back to the IP
        for (uint256 i = 0; i < offer.incentivesOffered.length; ++i) {
            address incentive = offer.incentivesOffered[i];
            if (!PointsFactory(POINTS_FACTORY).isPointsProgram(incentive)) {
                uint256 incentiveAmount = offer.incentiveAmountsOffered[incentive];
                uint256 protocolFeeAmount = offer.incentiveToProtocolFeeAmount[incentive];
                uint256 frontendFeeAmount = offer.incentiveToFrontendFeeAmount[incentive];

                // Transfer reimbursements to the IP
                ERC20(incentive).safeTransfer(offer.ip, (incentiveAmount + protocolFeeAmount + frontendFeeAmount));
            }

            /// Delete cancelled fields of dynamic arrays and mappings
            delete offer.incentivesOffered[i];
            delete offer.incentiveAmountsOffered[incentive];
            delete offer.incentiveToProtocolFeeAmount[incentive];
            delete offer.incentiveToFrontendFeeAmount[incentive];
        }

        delete offerHashToIPOffer[offerHash];

        emit IPOfferCancelled(offerHash);
    }

    // /// @param weirollWallet The wallet to claim for
    // /// @param to The address to send the incentive to
    // function claim(address weirollWallet, address to) external payable nonReentrant {
    //     // Get the frontend fee recipient and ip from locked reward params
    //     address frontendFeeRecipient = params.frontendFeeRecipient;
    //     address ip = params.ip;

    //     if (params.wasIPOffer) {
    //         // If it was an ipoffer, get the offer so we can retrieve the fee amounts and fill quantity
    //         IPOffer storage offer = offerHashToIPOffer[params.offerHash];

    //         uint256 stakeAmount = wallet.amount();
    //         uint256 fillPercentage = stakeAmount.divWadDown(offer.quantity);

    //         for (uint256 i = 0; i < params.incentives.length; ++i) {
    //             address incentive = params.incentives[i];

    //             // Calculate fees to take based on percentage of fill
    //             uint256 protocolFeeAmount = offer.incentiveToProtocolFeeAmount[incentive].mulWadDown(fillPercentage);
    //             uint256 frontendFeeAmount = offer.incentiveToFrontendFeeAmount[incentive].mulWadDown(fillPercentage);

    //             // Reward incentives to AP upon claim and account fees
    //             _pushIncentivesAndAccountFees(incentive, to, params.amounts[i], protocolFeeAmount, frontendFeeAmount, ip, frontendFeeRecipient);

    //             emit WeirollWalletClaimedIncentive(weirollWallet, to, incentive);

    //             /// Delete fields of dynamic arrays and mappings
    //             delete params.incentives[i];
    //             delete params.amounts[i];
    //         }
    //     } else {
    //         // Get the protocol fee at fill and market frontend fee
    //         uint256 protocolFeeAtFill = params.protocolFeeAtFill;
    //         uint256 marketFrontendFee = marketHashToOffchainActionMarket[wallet.marketHash()].frontendFee;

    //         for (uint256 i = 0; i < params.incentives.length; ++i) {
    //             address incentive = params.incentives[i];
    //             uint256 amount = params.amounts[i];

    //             // Calculate fees to take based on percentage of fill
    //             uint256 protocolFeeAmount = amount.mulWadDown(protocolFeeAtFill);
    //             uint256 frontendFeeAmount = amount.mulWadDown(marketFrontendFee);

    //             // Reward incentives to AP upon claim and account fees
    //             _pushIncentivesAndAccountFees(incentive, to, amount, protocolFeeAmount, frontendFeeAmount, ip, frontendFeeRecipient);

    //             emit WeirollWalletClaimedIncentive(weirollWallet, to, incentive);

    //             /// Delete fields of dynamic arrays and mappings
    //             delete params.incentives[i];
    //             delete params.amounts[i];
    //         }
    //     }

    //     // Zero out the mapping
    //     delete weirollWalletToLockedIncentivesParams[weirollWallet];
    // }

    function _accountFee(address recipient, address incentive, uint256 amount, address ip) internal {
        //check to see the incentive is actually a points campaign
        if (PointsFactory(POINTS_FACTORY).isPointsProgram(incentive)) {
            // Points cannot be claimed and are rather directly awarded
            Points(incentive).award(recipient, amount, ip);
        } else {
            feeClaimantToTokenToAmount[recipient][incentive] += amount;
        }
    }

    function _addStake(address fundingVault, address ap, ERC20 token, uint256 amount) internal {
        if (fundingVault == address(0)) {
            // If no fundingVault specified, fund the wallet directly from AP
            token.safeTransferFrom(ap, address(this), amount);
        } else {
            uint256 preStakeBalance = token.balanceOf(address(this));
            // Withdraw the stake from the funding vault into the contract
            ERC4626(fundingVault).withdraw(amount, address(this), ap);
            uint256 postStakeBalance = token.balanceOf(address(this));
            if (postStakeBalance - preStakeBalance < amount) {
                revert StakingFailed();
            }
        }
    }

    function _pushIncentivesAndAccountFees(
        address incentive,
        address to,
        uint256 incentiveAmount,
        uint256 protocolFeeAmount,
        uint256 frontendFeeAmount,
        address ip,
        address frontendFeeRecipient
    )
        internal
    {
        // Take fees
        _accountFee(protocolFeeClaimant, incentive, protocolFeeAmount, ip);
        _accountFee(frontendFeeRecipient, incentive, frontendFeeAmount, ip);

        // Push incentives to AP
        if (PointsFactory(POINTS_FACTORY).isPointsProgram(incentive)) {
            Points(incentive).award(to, incentiveAmount, ip);
        } else {
            ERC20(incentive).safeTransfer(to, incentiveAmount);
        }
    }

    function _pullIncentivesOnAPFill(address incentive, uint256 incentiveAmount, uint256 protocolFeeAmount, uint256 frontendFeeAmount) internal {
        // RewardStyle is Forfeitable or Arrear
        // If incentives will be paid out later, only handle the incentive case. Points will be awarded on claim.
        if (PointsFactory(POINTS_FACTORY).isPointsProgram(incentive)) {
            // If points incentive, make sure:
            // 1. The points factory used to create the program is the same as this RecipeMarketHubs PF
            // 2. IP placing the offer can award points
            // 3. Points factory has this RecipeMarketHub marked as a valid RO - can be assumed true
            if (POINTS_FACTORY != address(Points(incentive).pointsFactory()) || !Points(incentive).allowedIPs(msg.sender)) {
                revert InvalidPointsProgram();
            }
        } else {
            // SafeTransferFrom does not check if a incentive address has any code, so we need to check it manually to prevent incentive deployment
            // frontrunning
            if (incentive.code.length == 0) {
                revert TokenDoesNotExist();
            }
            // If not a points program, transfer amount requested (based on fill percentage) to the RecipeMarketHub in addition to protocol and frontend
            // fees.
            ERC20(incentive).safeTransferFrom(msg.sender, address(this), incentiveAmount + protocolFeeAmount + frontendFeeAmount);
        }
    }

    /// @notice sets the protocol fee recipient, taken on all fills
    /// @param _protocolFeeClaimant The address allowed to claim protocol fees
    function setProtocolFeeClaimant(address _protocolFeeClaimant) external payable onlyOwner {
        protocolFeeClaimant = _protocolFeeClaimant;
    }

    /// @notice sets the protocol fee rate, taken on all fills
    /// @param _protocolFee The percent deducted from the IP's incentive amount and claimable by protocolFeeClaimant, 1e18 == 100% fee
    function setProtocolFee(uint256 _protocolFee) external payable onlyOwner {
        protocolFee = _protocolFee;
    }

    /// @notice sets the minimum frontend fee that a market can set and is paid to whoever fills the offer
    /// @param _minimumFrontendFee The minimum frontend fee for a market, 1e18 == 100% fee
    function setMinimumFrontendFee(uint256 _minimumFrontendFee) external payable onlyOwner {
        minimumFrontendFee = _minimumFrontendFee;
    }

    /// @notice Calculates the hash of a Weiroll Market
    function getMarketHash(OffchainActionMarket memory market) public pure returns (bytes32) {
        return keccak256(abi.encode(market));
    }

    /// @notice Calculates the hash of an AP offer
    function getAPOfferHash(APOffer memory offer) public pure returns (bytes32) {
        return keccak256(abi.encode(offer));
    }

    /// @notice Calculates the hash of an IP offer
    function getIPOfferHash(
        uint256 offerID,
        bytes32 targetMarketHash,
        address ip,
        uint256 expiry,
        uint256 stakeAmount,
        bytes calldata verificationScriptParams,
        address[] calldata incentivesOffered,
        uint256[] memory incentiveAmountsOffered
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(offerID, targetMarketHash, ip, expiry, stakeAmount, verificationScriptParams, incentivesOffered, incentiveAmountsOffered)
        );
    }
}
