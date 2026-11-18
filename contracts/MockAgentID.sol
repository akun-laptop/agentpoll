// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice TEST-ONLY mock of the Binance Agent ID ERC-721.
/// @dev The real Agent ID contract (0x60b9262456de011f7d15a54cdd8c48baaa8b022f
///      on BNB Chain) is non-transferable and one-per-user. This mock only
///      implements balanceOf + a test mint so the Agent ID gate can be
///      exercised locally. NOT part of the deliverable — never deploy it
///      to a live chain as if it were the real Agent ID.
contract MockAgentID {
    mapping(address => uint256) private _balances;
    mapping(address => bool) private _minted;
    uint256 private _nextId = 1;

    event Minted(address indexed to, uint256 indexed tokenId);

    /// @notice Mint one Agent ID to `to`. One per address, like the real one.
    function mint(address to) external returns (uint256 tokenId) {
        require(!_minted[to], "MockAgentID: already holds one");
        _minted[to] = true;
        _balances[to] = 1;
        tokenId = _nextId++;
        emit Minted(to, tokenId);
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }
}
