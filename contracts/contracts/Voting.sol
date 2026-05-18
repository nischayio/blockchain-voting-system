// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Contract
contract Voting {

    address public owner;

    struct Batch {
        string batchId;
        bytes32 merkleRoot;
        uint256 timestamp;
    }

    Batch[] public batches;

    mapping(string => bool) public batchExists;

    event BatchStored(string batchId, bytes32 merkleRoot, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function storeBatch(string memory _batchId, bytes32 _root) public onlyOwner {
        require(!batchExists[_batchId], "Batch already exists");

        batches.push(Batch({
            batchId: _batchId,
            merkleRoot: _root,
            timestamp: block.timestamp
        }));

        batchExists[_batchId] = true;

        emit BatchStored(_batchId, _root, block.timestamp);
    }

    function getBatch(uint index) public view returns (
        string memory batchId,
        bytes32 merkleRoot,
        uint256 timestamp
    ) {
        Batch memory b = batches[index];
        return (b.batchId, b.merkleRoot, b.timestamp);
    }

    function getBatchCount() public view returns (uint) {
        return batches.length;
    }
}