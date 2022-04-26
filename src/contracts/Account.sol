pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

contract Account {

    address public admin; // Storing the address of the admin - SIA to ensure these functions can be invoked only by the admin 
    mapping (address => bool) public accountStatus; // Storing the admin of the contract

    event AccountStatusUpdate(address target, bool frozen);

    // Modifier to set Admin Activies
    modifier onlyAdmin() {
		require(msg.sender == admin);
		_;
	}
    
    constructor() {
        admin=msg.sender;
        accountStatus[admin] = true;
    }
    
    function activateAccount(address target) onlyAdmin public returns (bool status) {
        accountStatus[target] = true;
        emit AccountStatusUpdate(target, true);
        return true;
    }
    
    function deactivateAccount(address target) onlyAdmin public returns (bool status) {
        accountStatus[target] = false;
        emit AccountStatusUpdate(target, false);
        return true;
    }
    
    function isAccountPresent(address target) view public returns (bool status) {
        return (accountStatus[target]);
    }
}