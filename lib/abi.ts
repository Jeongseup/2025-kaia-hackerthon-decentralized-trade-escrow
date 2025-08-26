import dteArtifact from "@/lib/contracts/DecentralizedTradeEscrow.json";
import erc20Artifact from "@/lib/contracts/StableKRW.json";

export const dteAbi = dteArtifact.abi as const;
export const erc20Abi = erc20Artifact.abi as const;
