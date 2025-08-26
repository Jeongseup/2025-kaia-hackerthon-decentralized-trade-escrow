# Use .env file for environment variables
-include .env

# Default values, can be overridden in .env file or shell
RPC_URL ?= https://public-en-kairos.node.kaia.io
OWNER_PRIVATE_KEY ?= ""
STABLE_KRW_ADDRESS ?= ""
ORAKL_COORDINATOR_ADDRESS ?= ""
OWNER_ADDRESS ?= ""
BUYER_ADDRESS ?= ""
SELLER_ADDRESS ?= ""

help:
	@echo "Usage:"
	@echo "  make deploy 					Deploy all contracts"
	@echo "  make deploy-escrow 				Deploy the DecentralizedTradeEscrow contract"

.PHONY: deploy check-balance
deploy: deploy-escrow

.PHONY: deploy-escrow
deploy-escrow:
	@if [ -z "$(OWNER_PRIVATE_KEY)" ]; then \
		echo "Error: OWNER_PRIVATE_KEY is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(ORAKL_COORDINATOR_ADDRESS)" ]; then \
		echo "Error: ORAKL_COORDINATOR_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(OWNER_ADDRESS)" ]; then \
		echo "Error: OWNER_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(BUYER_ADDRESS)" ]; then \
		echo "Error: BUYER_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(SELLER_ADDRESS)" ]; then \
		echo "Error: SELLER_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@echo "Deploying StableKRW and DecentralizedTradeEscrow..."

	@forge script script/DeployDecentralizedTradeEscrow.s.sol:DeployAll \
		--rpc-url $(RPC_URL) \
		--private-key $(OWNER_PRIVATE_KEY) \
		--broadcast -v

check-balance:
	@echo "Checking balances..."
	@forge script script/CheckBalances.s.sol:CheckBalance \
		--rpc-url $(RPC_URL) \
		-v

check-trades:
	@echo "Checking trades..."
	@forge script script/CheckTrades.s.sol:CheckTrades \
		--rpc-url $(RPC_URL) \
		-v

submit-tracking-info:
	@echo "Submitting tracking info..."
	@forge script script/SubmitTrackingInfo.s.sol:SubmitTrackingInfoScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		-vvvv

create-trade-and-deposit-token:
	@echo "Creating and depositing trade..."
	@forge script script/CreateTradeAndDepositToken.s.sol:CreateTradeAndDepositTokenScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		-v

confirm-delivery:
	@forge script script/ConfirmDelivery.s.sol:ConfirmDeliveryScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		-v


withdraw:
	@forge script script/Withdraw.s.sol:WithdrawScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		-v