// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract FoodToken is ERC20 {
    address public immutable supplyChainContract;
    
    constructor(address _supplyChain) ERC20("FoodToken", "FOOD") {
        supplyChainContract = _supplyChain;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == supplyChainContract, "Not authorized");
        _mint(to, amount);
    }
}

contract FoodSupplyChain is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant QUALITY_CHECKER_ROLE = keccak256("QUALITY_CHECKER_ROLE");

    FoodToken public foodToken;

    struct Product {
        string name;
        string origin;
        uint256 harvestDate;
        address currentOwner;
        string[] qualityChecks;
        address[] previousOwners;
        string[] locations;
        bool rewarded;
    }

    struct CarbonFootprint {
        uint256 transportEmissions;
        uint256 productionEmissions;
        uint256 packagingEmissions;
    }

    struct Certification {
        string standard;
        string issuer;
        uint256 issueDate;
        uint256 expiryDate;
    }

    struct Batch {
        uint256[] productIds;
        string batchId;
        uint256 creationTime;
        address currentOwner;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => CarbonFootprint) public productFootprints;
    mapping(uint256 => Certification[]) public productCertifications;
    mapping(string => Batch) public batches;
    uint256 public productCount;

    event ProductRegistered(uint256 productId, string name, string origin);
    event OwnershipTransferred(uint256 productId, address from, address to);
    event QualityCheckAdded(uint256 productId, string check);
    event LocationAdded(uint256 productId, string location);
    event ParticipantRewarded(address participant, uint256 amount);
    event CarbonFootprintSet(uint256 productId, uint256 transport, uint256 production, uint256 packaging);
    event CertificationAdded(uint256 productId, string standard, string issuer);
    event BatchCreated(string batchId, uint256[] productIds);
    event BatchOwnershipTransferred(string batchId, address from, address to);

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(FARMER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(DISTRIBUTOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(RETAILER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(QUALITY_CHECKER_ROLE, ADMIN_ROLE);

        foodToken = new FoodToken(address(this));
    }

    function registerProduct(string memory _name, string memory _origin, uint256 _harvestDate) public onlyRole(FARMER_ROLE) {
        productCount++;
        products[productCount] = Product({
            name: _name,
            origin: _origin,
            harvestDate: _harvestDate,
            currentOwner: msg.sender,
            qualityChecks: new string[](0),
previousOwners: new address[](0),
locations: new string[](0),
            rewarded: false
        });
        emit ProductRegistered(productCount, _name, _origin);
    }

    function transferOwnership(uint256 _productId, address _newOwner) public {
        require(products[_productId].harvestDate != 0, "Product does not exist");
        require(products[_productId].currentOwner == msg.sender, "Only current owner can transfer");

        if (hasRole(FARMER_ROLE, msg.sender)) {
            require(hasRole(DISTRIBUTOR_ROLE, _newOwner), "New owner must be a distributor");
        } else if (hasRole(DISTRIBUTOR_ROLE, msg.sender)) {
            require(hasRole(RETAILER_ROLE, _newOwner), "New owner must be a retailer");
        }

        products[_productId].previousOwners.push(msg.sender);
        products[_productId].currentOwner = _newOwner;

        if (!products[_productId].rewarded) {
            rewardParticipant(msg.sender, 100 * 10**18);
            rewardParticipant(_newOwner, 100 * 10**18);
            products[_productId].rewarded = true;
        }

        emit OwnershipTransferred(_productId, msg.sender, _newOwner);
    }

    function addQualityCheck(uint256 _productId, string memory _check) public onlyRole(QUALITY_CHECKER_ROLE) {
        require(products[_productId].harvestDate != 0, "Product does not exist");
        products[_productId].qualityChecks.push(_check);
        rewardParticipant(msg.sender, 50 * 10**18);
        emit QualityCheckAdded(_productId, _check);
    }

    function addLocation(uint256 _productId, string memory _location) public {
        require(products[_productId].harvestDate != 0, "Product does not exist");
        require(
            products[_productId].currentOwner == msg.sender || hasRole(DISTRIBUTOR_ROLE, msg.sender),
            "Not authorized to add location"
        );
        products[_productId].locations.push(_location);
        emit LocationAdded(_productId, _location);
    }

    function rewardParticipant(address _participant, uint256 _amount) internal {
        foodToken.mint(_participant, _amount);
        emit ParticipantRewarded(_participant, _amount);
    }

    function setCarbonFootprint(uint256 _productId, uint256 _transport, uint256 _production, uint256 _packaging)
        public onlyRole(FARMER_ROLE)
    {
        require(products[_productId].harvestDate != 0, "Product does not exist");
        productFootprints[_productId] = CarbonFootprint(_transport, _production, _packaging);
        emit CarbonFootprintSet(_productId, _transport, _production, _packaging);
    }

    function addCertification(uint256 _productId, string memory _standard, string memory _issuer, uint256 _expiryDate)
        public onlyRole(ADMIN_ROLE)
    {
        require(products[_productId].harvestDate != 0, "Product does not exist");
        productCertifications[_productId].push(Certification({
            standard: _standard,
            issuer: _issuer,
            issueDate: block.timestamp,
            expiryDate: _expiryDate
        }));
        emit CertificationAdded(_productId, _standard, _issuer);
    }

    function createBatch(uint256[] memory _productIds, string memory _batchId) public {
        require(_productIds.length > 0, "Batch must include products");
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(batches[_batchId].creationTime == 0, "Batch ID already exists");

        for (uint i = 0; i < _productIds.length; i++) {
            require(products[_productIds[i]].currentOwner == msg.sender, "Not owner of all products");
        }

        batches[_batchId] = Batch({
            productIds: _productIds,
            batchId: _batchId,
            creationTime: block.timestamp,
            currentOwner: msg.sender
        });

        emit BatchCreated(_batchId, _productIds);
    }

    function transferBatchOwnership(string memory _batchId, address _newOwner) public {
        Batch storage batch = batches[_batchId];
        require(batch.creationTime != 0, "Batch does not exist");
        require(batch.currentOwner == msg.sender, "Only current owner can transfer");

        if (hasRole(FARMER_ROLE, msg.sender)) {
            require(hasRole(DISTRIBUTOR_ROLE, _newOwner), "New owner must be a distributor");
        } else if (hasRole(DISTRIBUTOR_ROLE, msg.sender)) {
            require(hasRole(RETAILER_ROLE, _newOwner), "New owner must be a retailer");
        }

        for (uint i = 0; i < batch.productIds.length; i++) {
            uint256 productId = batch.productIds[i];
            products[productId].previousOwners.push(msg.sender);
            products[productId].currentOwner = _newOwner;

            if (!products[productId].rewarded) {
                rewardParticipant(msg.sender, 100 * 10**18);
                rewardParticipant(_newOwner, 100 * 10**18);
                products[productId].rewarded = true;
            }
        }

        batch.currentOwner = _newOwner;
        emit BatchOwnershipTransferred(_batchId, msg.sender, _newOwner);
    }
function getProductHistory(uint256 _productId) public view returns (
    string memory, 
    string memory, 
    uint256, 
    address, 
    string[] memory,
    address[] memory, 
    string[] memory
) {
    Product storage product = products[_productId];
    return (
        product.name,
        product.origin,
        product.harvestDate,
        product.currentOwner,
        product.qualityChecks,
        product.previousOwners,
        product.locations
    );
}

function getProductFootprint(uint256 _productId) public view returns (CarbonFootprint memory) {
    return productFootprints[_productId];
}

function getProductCertifications(uint256 _productId) public view returns (Certification[] memory) {
    return productCertifications[_productId];
}

    function getBatchDetails(string memory _batchId) public view returns (
        uint256[] memory, string memory, uint256, address
    ) {
        Batch storage batch = batches[_batchId];
        return (
            batch.productIds,
            batch.batchId,
            batch.creationTime,
            batch.currentOwner
        );
    }

    function grantFarmerRole(address _account) public onlyRole(ADMIN_ROLE) {
        grantRole(FARMER_ROLE, _account);
    }

    function grantDistributorRole(address _account) public onlyRole(ADMIN_ROLE) {
        grantRole(DISTRIBUTOR_ROLE, _account);
    }

    function grantRetailerRole(address _account) public onlyRole(ADMIN_ROLE) {
        grantRole(RETAILER_ROLE, _account);
    }

    function grantQualityCheckerRole(address _account) public onlyRole(ADMIN_ROLE) {
        grantRole(QUALITY_CHECKER_ROLE, _account);
    }

    function isAdmin(address _account) public view returns (bool) {
        return hasRole(ADMIN_ROLE, _account);
    }

    function isFarmer(address _account) public view returns (bool) {
        return hasRole(FARMER_ROLE, _account);
    }

    function isDistributor(address _account) public view returns (bool) {
        return hasRole(DISTRIBUTOR_ROLE, _account);
    }

    function isRetailer(address _account) public view returns (bool) {
        return hasRole(RETAILER_ROLE, _account);
    }

    function isQualityChecker(address _account) public view returns (bool) {
        return hasRole(QUALITY_CHECKER_ROLE, _account);
    }

    function revokeRole(bytes32 role, address _account) public override onlyRole(ADMIN_ROLE) {
        super.revokeRole(role, _account);
    }
}
