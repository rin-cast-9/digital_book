// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract RolesManager is AccessControl {

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(USER_ROLE, MANAGER_ROLE);
    }

    function addOperator(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!hasRole(OPERATOR_ROLE, account), "Operator already exists");
        grantRole(OPERATOR_ROLE, account);
    }

    function revokeOperator(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(OPERATOR_ROLE, account), "Operator not found");
        revokeRole(OPERATOR_ROLE, account);
    }

    function addManager(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!hasRole(MANAGER_ROLE, account), "Manager already exists");
        grantRole(MANAGER_ROLE, account);
    }

    function revokeManager(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(MANAGER_ROLE, account), "Manager not found");
        revokeRole(MANAGER_ROLE, account);
    }

    function addUser(address account) public onlyRole(MANAGER_ROLE) {
        require(!hasRole(USER_ROLE, account), "User already exists");
        grantRole(USER_ROLE, account);
    }

    function revokeUser(address account) public onlyRole(MANAGER_ROLE) {
        require(hasRole(USER_ROLE, account), "User not found");
        revokeRole(USER_ROLE, account);
    }

}