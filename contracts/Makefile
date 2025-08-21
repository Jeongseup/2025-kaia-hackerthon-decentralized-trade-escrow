# Use .env file for environment variables
-include .env

# Default values, can be overridden in .env file or shell
RPC_URL ?= https://public-en-kairos.node.kaia.io
PRIVATE_KEY ?= ""
COORDINATOR_ADDRESS ?= ""

.PHONY: help deploy-vrf-consumer deploy-request-response interact-request-response read-rr-response

help:
	@echo "Usage:"
	@echo "  make deploy-vrf-consumer 			Deploy the VRFConsumer contract"
	@echo "  make interact						Interact with the VRFConsumer contract"
	@echo "  make deploy-request-response 		Deploy the RequestResponseConsumer contract"
	@echo "  make interact-request-response 	Interact with the RequestResponseConsumer contract"
	@echo "  make read-rr-response 				Read the response from the RequestResponseConsumer contract"

## Deploys the VRFConsumer contract
deploy-vrf-consumer:
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "Error: PRIVATE_KEY is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(COORDINATOR_ADDRESS)" ]; then \
		echo "Error: COORDINATOR_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@echo "Deploying VRFConsumer contract..."
	@forge script script/DeployVRFConsumer.s.sol:DeployVRFConsumer \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast -vvvv

## Interacts with the VRFConsumer contract
interact-vrf:
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "Error: PRIVATE_KEY is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(VRF_CONSUMER_ADDRESS)" ]; then \
		echo "Error: VRF_CONSUMER_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@echo "Interacting with VRFConsumer contract..."
	@forge script script/InteractVRFConsumer.s.sol:InteractVRFConsumer \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast -vvvv

## Checks the VRFConsumer contract for the random word
read-vrf:
	@if [ -z "$(VRF_CONSUMER_ADDRESS)" ]; then \
		echo "Error: VRF_CONSUMER_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@echo "Checking VRFConsumer contract for random word..."
	@cast call $(VRF_CONSUMER_ADDRESS) "sRandomWord()(uint256)" --rpc-url $(RPC_URL)

## Deploys the RequestResponseConsumer contract
deploy-request-response:
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "Error: PRIVATE_KEY is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@echo "Deploying RequestResponseConsumer contract..."
	@forge script script/DeployRequestResponse.s.sol:DeployRequestResponse \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast -vvvv

## Interacts with the RequestResponseConsumer contract
interact-request-response:
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "Error: PRIVATE_KEY is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(ACC_ID)" ]; then \
		echo "Error: ACC_ID is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@if [ -z "$(RR_CONSUMER_ADDRESS)" ]; then \
		echo "Error: RR_CONSUMER_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@echo "Interacting with RequestResponseConsumer contract..."
	@forge script script/InteractRequestResponse.s.sol:InteractRequestResponse \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast -vvvv

## Reads the response from the RequestResponseConsumer contract
read-rr-response:
	@if [ -z "$(RR_CONSUMER_ADDRESS)" ]; then \
		echo "Error: RR_CONSUMER_ADDRESS is not set. Please set it in your .env file or export it."; \
		exit 1; \
	fi
	@echo "Reading response from RequestResponseConsumer contract..."
	@cast call $(RR_CONSUMER_ADDRESS) "sResponse()(uint128)" --rpc-url $(RPC_URL)
