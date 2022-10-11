// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/* This contract is a factory for new ProjectContracts. */
contract ProjectFactory {

    /* 1) STORAGE VARIABLES */
    address payable[] private deployedProjects;
    address payable private greenHubAddress;

    /* 2) CONTRACT CONSTRUCTOR */
    constructor (address payable greenhubAddress) {
        greenHubAddress = greenhubAddress;
    }

    /* 3) FUNCTIONS: */
    function createProject(uint projectTargetValue) public payable {
        address newProject = new ProjectContract(payable(msg.sender), greenHubAddress, projectTargetValue).getAddress();
        deployedProjects.push(payable(newProject)); // <-- Cast from "address" to "address payable".
    }

    function getDeployedProjects() public view returns (address payable[] memory) {
        return deployedProjects;
    }
}

/* This is the contract for GreenHub Pattform Projects. */
contract ProjectContract {

    /* 1) STORAGE VARIABLES */
    address payable private owner; // The owner of this project.
    address payable private greenHubAccount; // GrenHub's account that allows some edpecific function calls on this contract.
    uint private targetValue; // The target value of this project (in wei)
    bool private active; // Project's status. 'True' value means that this project can receive new donations currently.
    bool private targetAchieved; // Flag that sinalizes if project's target value was achieved.

    /* 2) CONTRACT CONSTRUCTOR */
    constructor (address payable projectOwner, address payable greenHubAddress, uint projectTargetValue) {
        greenHubAccount = greenHubAddress;
        owner = projectOwner;
        targetValue = projectTargetValue;
        active = true;
        targetAchieved = false;
    }

    /* 3) MODIFIERS: */
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier isGreenHub() {
        require(msg.sender == greenHubAccount, "Caller is not an authorized GreenHubAccount");
        _;
    }

    modifier isActive() {
        require(active == true, "Project must be active to receive donations");
        _;
    }


    /* 4) FUNCTIONS: */
    function getAddress() external view returns (address) {
        return address(this);
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function setActive(bool status) public isGreenHub {
        active = status;
    }

    /*  Transfer funds from donors account to this contract account.
        Transfers only can be done if project status is active.
        Donors must specify a tax value to be transfered to greenhub's account.*/
    function donate(uint greenHubTax) public payable isActive {
        require((greenHubTax >= (msg.value / 200)) && (greenHubTax < msg.value));
        greenHubAccount.transfer(greenHubTax);
        if (address(this).balance >= targetValue) {
            active = false;
            targetAchieved = true;
        }
    }

    /*  Transfers the total amount of this contract to the owner's account.
        Only contract's owner can call this function. */
    function receiveDonatedAmount() public payable isOwner {
        require(targetAchieved);
        owner.transfer(address(this).balance);
    }

    function revertAmountToDonors() public payable isGreenHub {
        // TODO: 
        // If some criteria are met, GreenHub can revert donated amount to donors.
        // Eg:
        // 1) After a predefined time, if target value is not achieved, contracts ammount is reverted to donors.
        // 2) After a predefined time, if owner do not transfer the amount to his account, contracts ammount is reverted to donors.
        // 3) If owner do not follow all the predefined spending rules for this project, the remmaining amount is reverted to donors.
    }
}