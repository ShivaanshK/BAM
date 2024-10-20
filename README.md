# Project Overview

Our project consists of two main components: the **BAM Protocol** and the **BAM Portal**.

## BAM Protocol

The BAM Protocol is a novel primitive that enables the verification of any off-chain action, allowing for proof that it has occurred.

- The current implementation of the BAM Protocol is designed to incentivize **any action**. 
- To utilize it, you simply need to connect a prover service, off-chain source of truth (SOT), or oracle. 
- If it can be proven, it can be incentivized through the BAM Protocol.

## BAM Portal

The BAM Portal is a **scam-resistant, competitive escrow market** tailored for Twitter key opinion leaders (KOLs). It harnesses the power of the BAM Protocol to create a secure and transparent marketplace.

- Incentive providers can create customized orders, filtered by follower count, sentiment, and other variables. These orders pair a desired action with an incentive, which is temporarily held in escrow.
- Action providers (KOLs) can negotiate on both the action and the incentives.
- Once the order is filled, the action provider (KOL) submits the tweet and provides the tweet ID to the BAM Portal frontend.
- This tweet ID is sent to a Trusted Execution Environment (TEE) running on LIT Protocol, which uses the Twitter API to validate the result of the action.
- Upon consensus, an attestation is posted to both the Flow Network and Fhenix using Sign
- Finally, the incentive is released from escrow and sent to the action provider.
