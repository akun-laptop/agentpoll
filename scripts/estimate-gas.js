// Local-only gas estimate: deploys MockAgentID + AgentPoll on the Hardhat
// network and prints the deployment gas + bytecode size. Never run against
// a live chain from here (no network config, no keys).
import { network } from "hardhat";

const { ethers } = await network.connect();
const [deployer] = await ethers.getSigners();

const Mock = await ethers.getContractFactory("MockAgentID");
const mock = await Mock.deploy();
const mockReceipt = await mock.deploymentTransaction().wait();
console.log("MockAgentID deployment gas:", mockReceipt.gasUsed.toString());

const Poll = await ethers.getContractFactory("AgentPoll");
const poll = await Poll.deploy(await mock.getAddress());
const receipt = await poll.deploymentTransaction().wait();
console.log("AgentPoll deployment gas:", receipt.gasUsed.toString());
console.log("AgentPoll address:", await poll.getAddress());
console.log("AgentPoll creation bytecode bytes:", (Poll.bytecode.length - 2) / 2);
console.log("AgentPoll deployed bytecode bytes:", (await ethers.provider.getCode(await poll.getAddress())).length / 2 - 1);
console.log("deployer:", deployer.address);
