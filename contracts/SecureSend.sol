
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./SafeMath.sol";
import "./IERC20.sol";
import "./IERC721.sol";

contract SecureSend {
    using SafeMath for uint256;

    struct publickeys {
        bytes32 x_cor;
        bytes32 y_cor;
        bytes2 sharedSecret;
    }

    uint256 internal totalFunds;
    uint256 internal totalStealthAdd;
    address private owner;
    publickeys[] public logs;
    string public contractName;
    event publicKeys(bytes32 x_cor, bytes32 y_cor, bytes2 sharedSecret);

    modifier onlyOwner() {
        assert(msg.sender == owner);
        _;
    }

    modifier validateTokenAddr(address token) {
        require(token != address(0x0), "Token address required");
        _;
    }

    constructor() {
        owner = msg.sender;
        contractName = "SecureSend No Fees";
    }

    function gettotalStealthAddresses() public view returns (uint256) {
        return totalStealthAdd;
    }

    function getTotalVolume() public view returns (uint256) {
        return totalFunds;
    }

    function updateTvl(uint256 _vol) internal {
        uint256 updatedTotalFunds;
        uint256 updatedtotalStealthAddresses;

        assembly {
            updatedTotalFunds := sload(totalFunds.slot)
            updatedtotalStealthAddresses := sload(totalStealthAdd.slot)

            updatedTotalFunds := add(updatedTotalFunds, _vol)
            updatedtotalStealthAddresses := add(updatedtotalStealthAddresses, 1)

            sstore(totalFunds.slot, updatedTotalFunds)
            sstore(totalStealthAdd.slot, updatedtotalStealthAddresses)
        }
    }

    function publishPubkeys(
        bytes32 x_cor,
        bytes32 y_cor,
        bytes2 sharedSecret
    ) private {
        logs.push(publickeys(x_cor, y_cor, sharedSecret));
    }

    function pubKeysLen() public view returns (uint256) {
        return logs.length;
    }

    function Transfer(
        bytes32 x_cor,
        bytes32 y_cor,
        bytes2 sharedSecret,
        address payable target
    ) public payable returns (uint256) {
        require(msg.value > 0, "Amount should be more than 0");

        uint256 amountToSend = msg.value;

        publishPubkeys(x_cor, y_cor, sharedSecret);

        (bool transferSuccess, ) = target.call{value: amountToSend}("");

        require(transferSuccess, "Transfer to recipient failed");

        updateTvl(msg.value);

        emit publicKeys(x_cor, y_cor, sharedSecret);

        return amountToSend;
    }

    function TransferERC20(
        bytes32 x_cor,
        bytes32 y_cor,
        bytes2 sharedSecret,
        address token,
        address target,
        uint256 amount
    ) external payable validateTokenAddr(token) {
        require(amount > 0, "Amount should be more than 0");

        require(
            IERC20(token).balanceOf(msg.sender) >= amount,
            "Not enough tokens"
        );

        if (IERC20(token).allowance(msg.sender, address(this)) < amount) {
            revert("Not enough allowance");
        }

        publishPubkeys(x_cor, y_cor, sharedSecret);

        IERC20(token).transferFrom(msg.sender, target, amount);

        updateTvl(amount);

        emit publicKeys(x_cor, y_cor, sharedSecret);
    }

    function TransferERC721(
        bytes32 x_cor,
        bytes32 y_cor,
        bytes2 sharedSecret,
        address ERC721Token,
        address target,
        uint256 tokenId
    ) external {
        require(ERC721Token != address(0x0), " Enter the token address");

        require(
            IERC721(ERC721Token).ownerOf(tokenId) == msg.sender,
            "You are not the owner of this tokenId"
        );

        if (IERC721(ERC721Token).getApproved(tokenId) != address(this)) {
            revert("Not approved");
        }

        publishPubkeys(x_cor, y_cor, sharedSecret);

        IERC721(ERC721Token).transferFrom(msg.sender, target, tokenId);

        updateTvl(1);

        emit publicKeys(x_cor, y_cor, sharedSecret);
    }

    function retrievePubKeys(
        uint256 initVal
    ) public view returns (publickeys[10] memory) {
        publickeys[10] memory Keys;

        uint256 j = initVal >= logs.length ? logs.length : initVal;

        uint256 end = j > 10 ? j - 10 : 0;

        for (uint256 i = j; i > end; --i) {
            Keys[j - i] = logs[i - 1];
        }
        return Keys;
    }
}