'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { Abi, AbiFunction } from "viem";
import requestResponseConsumerAbi from '@/lib/abis/RequestResponseConsumer.json';

// Shadcn UI 컴포넌트 임포트
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 메인 페이지 컴포넌트
export default function DevPage() {
  const { isConnected } = useAccount();
  const [abi, setAbi] = useState<Abi>([]);
  const [readFunctions, setReadFunctions] = useState<AbiFunction[]>([]);

  // 상태(state) 정의
  const [readContractAddress, setReadContractAddress] = useState(
    process.env.NEXT_PUBLIC_REQUEST_RESPONSE_CONSUMER_ADDRESS || ''
  );
  const [readFunctionName, setReadFunctionName] = useState('');
  const [readResult, setReadResult] = useState('');

  const [writeContractAddress, setWriteContractAddress] = useState(
    process.env.NEXT_PUBLIC_REQUEST_RESPONSE_CONSUMER_ADDRESS || ''
  );
  const [writeFunctionName, setWriteFunctionName] = useState('');
  const [writeArgs, setWriteArgs] = useState('');
  const [writeResult, setWriteResult] = useState('');

  useEffect(() => {
    const consumerAbi = requestResponseConsumerAbi.abi as Abi;
    setAbi(consumerAbi);
    const filteredFunctions = consumerAbi.filter(
      (item): item is AbiFunction =>
        item.type === 'function' &&
        (item.stateMutability === 'view' || item.stateMutability === 'pure'),
    );
    setReadFunctions(filteredFunctions);
    if (filteredFunctions.length > 0) {
      setReadFunctionName(filteredFunctions[0].name);
    }
  }, []);

  const { refetch } = useReadContract({
    address: readContractAddress as `0x${string}`,
    abi: abi,
    functionName: readFunctionName,
    query: {
      enabled: false,
    },
  });

  const handleReadContract = async () => {
    setReadResult('Reading...');
    try {
      const {
        data: refetchData,
        isError,
        error: refetchError,
      } = await refetch();
      if (isError) {
        console.error(refetchError);
        setReadResult(`Error: ${refetchError?.message}`);
        return;
      }
      if (refetchData) {
        const replacer = (_key: string, value: unknown) =>
          typeof value === 'bigint' ? value.toString() : value;
        setReadResult(JSON.stringify(refetchData, replacer));
      } else {
        setReadResult('No data returned.');
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setReadResult(`Error: ${e.message}`);
      } else {
        setReadResult('An unknown error occurred.');
      }
    }
  };

  const handleWriteContract = () => {
    // TODO: Implement write contract logic
    setWriteResult('Write function called');
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-primary-purple to-secondary-purple font-sans text-white">
      <div className="absolute top-8 right-8 z-10">
        <ConnectButton />
      </div>
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-center text-4xl font-bold text-white mb-12">
          Contract Dev Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Read Contract Section */}
          <Card className="bg-white/10 border-white/20 text-white shadow-lg">
            <CardHeader>
              <CardTitle>Read from Contract</CardTitle>
              <CardDescription className="text-gray-200">
                Call a read-only function from a smart contract.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="read-contract-address">Contract Address</Label>
                <Input
                  id="read-contract-address"
                  placeholder="0x..."
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  value={readContractAddress}
                  onChange={(e) => setReadContractAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="read-function-name">Function Name</Label>
                <select
                  id="read-function-name"
                  className="w-full p-2 bg-gray-800 border-gray-600 rounded-md text-white"
                  value={readFunctionName}
                  onChange={(e) => setReadFunctionName(e.target.value)}
                >
                  {readFunctions.map((func) => (
                    <option key={func.name} value={func.name}>
                      {func.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleReadContract}
                className="w-full bg-kaia-yellow hover:bg-yellow-400 text-black"
                disabled={
                  !isConnected || !readContractAddress || !readFunctionName
                }
              >
                Read Contract
              </Button>
              {!isConnected && (
                <p className="text-center text-sm text-red-400 mt-2">
                  Please connect your wallet to read from a contract.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h4 className="font-semibold">Result:</h4>
                <p className="text-sm text-gray-300 break-all">
                  {readResult || 'No result yet.'}
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Write Contract Section */}
          <Card className="bg-white/10 border-white/20 text-white shadow-lg">
            <CardHeader>
              <CardTitle>Write to Contract</CardTitle>
              <CardDescription className="text-gray-200">
                Execute a state-changing function on a smart contract.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="write-contract-address">
                  Contract Address
                </Label>
                <Input
                  id="write-contract-address"
                  placeholder="0x..."
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  value={writeContractAddress}
                  onChange={(e) => setWriteContractAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="write-function-name">Function Name</Label>
                <Input
                  id="write-function-name"
                  placeholder="e.g., setValue"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  value={writeFunctionName}
                  onChange={(e) => setWriteFunctionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="write-args">Arguments (comma-separated)</Label>
                <Input
                  id="write-args"
                  placeholder="e.g., 123, 'hello'"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  value={writeArgs}
                  onChange={(e) => setWriteArgs(e.target.value)}
                />
              </div>
              <Button
                onClick={handleWriteContract}
                className="w-full bg-kaia-yellow hover:bg-yellow-400 text-black"
                disabled={!isConnected}
              >
                Write Contract
              </Button>
              {!isConnected && (
                <p className="text-center text-sm text-red-400 mt-2">
                  Please connect your wallet to write to a contract.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h4 className="font-semibold">Result:</h4>
                <p className="text-sm text-gray-300 break-all">
                  {writeResult || 'No result yet.'}
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
