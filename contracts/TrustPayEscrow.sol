// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TrustPayEscrow {
    enum Status {
        Created,
        Funded,
        Submitted,
        Completed,
        Disputed,
        Refunded
    }

    struct Project {
        address payable client;
        address payable freelancer;
        uint256 amount;
        Status status;
        string metadataURI;
    }

    error InvalidFreelancer();
    error InvalidProject();
    error InvalidStatus(Status current);
    error InvalidFunding();
    error InvalidSplit();
    error NotClient();
    error NotFreelancer();
    error NotResolver();
    error TransferFailed();

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        string metadataURI
    );
    event ProjectFunded(uint256 indexed projectId, uint256 amount);
    event WorkSubmitted(uint256 indexed projectId);
    event PaymentReleased(uint256 indexed projectId, address indexed freelancer, uint256 amount);
    event ClientRefunded(uint256 indexed projectId, address indexed client, uint256 amount);
    event DisputeOpened(uint256 indexed projectId);
    event DisputeResolved(
        uint256 indexed projectId,
        uint256 freelancerAmount,
        uint256 clientAmount
    );

    address public immutable resolver;
    uint256 public nextProjectId = 1;

    mapping(uint256 => Project) private projects;

    modifier projectExists(uint256 projectId) {
        if (projects[projectId].client == address(0)) revert InvalidProject();
        _;
    }

    modifier onlyClient(uint256 projectId) {
        if (msg.sender != projects[projectId].client) revert NotClient();
        _;
    }

    modifier onlyFreelancer(uint256 projectId) {
        if (msg.sender != projects[projectId].freelancer) revert NotFreelancer();
        _;
    }

    constructor() {
        resolver = msg.sender;
    }

    function createProject(
        address freelancer,
        string memory metadataURI
    ) external payable returns (uint256 projectId) {
        if (freelancer == address(0) || freelancer == msg.sender) revert InvalidFreelancer();

        projectId = nextProjectId++;
        Status initialStatus = msg.value > 0 ? Status.Funded : Status.Created;

        projects[projectId] = Project({
            client: payable(msg.sender),
            freelancer: payable(freelancer),
            amount: msg.value,
            status: initialStatus,
            metadataURI: metadataURI
        });

        emit ProjectCreated(projectId, msg.sender, freelancer, msg.value, metadataURI);
        if (msg.value > 0) {
            emit ProjectFunded(projectId, msg.value);
        }
    }

    function fundProject(
        uint256 projectId
    ) external payable projectExists(projectId) onlyClient(projectId) {
        Project storage project = projects[projectId];
        if (project.status != Status.Created) revert InvalidStatus(project.status);
        if (msg.value == 0) revert InvalidFunding();

        project.amount = msg.value;
        project.status = Status.Funded;

        emit ProjectFunded(projectId, msg.value);
    }

    function submitWork(
        uint256 projectId
    ) external projectExists(projectId) onlyFreelancer(projectId) {
        Project storage project = projects[projectId];
        if (project.status != Status.Funded) revert InvalidStatus(project.status);

        project.status = Status.Submitted;
        emit WorkSubmitted(projectId);
    }

    function releasePayment(
        uint256 projectId
    ) external projectExists(projectId) onlyClient(projectId) {
        Project storage project = projects[projectId];
        if (project.status != Status.Submitted) revert InvalidStatus(project.status);

        uint256 amount = project.amount;
        project.amount = 0;
        project.status = Status.Completed;

        _send(project.freelancer, amount);
        emit PaymentReleased(projectId, project.freelancer, amount);
    }

    function refundClient(
        uint256 projectId
    ) external projectExists(projectId) onlyClient(projectId) {
        Project storage project = projects[projectId];
        if (project.status != Status.Funded && project.status != Status.Submitted) {
            revert InvalidStatus(project.status);
        }

        uint256 amount = project.amount;
        project.amount = 0;
        project.status = Status.Refunded;

        _send(project.client, amount);
        emit ClientRefunded(projectId, project.client, amount);
    }

    function openDispute(
        uint256 projectId
    ) external projectExists(projectId) onlyClient(projectId) {
        Project storage project = projects[projectId];
        if (project.status != Status.Funded && project.status != Status.Submitted) {
            revert InvalidStatus(project.status);
        }

        project.status = Status.Disputed;
        emit DisputeOpened(projectId);
    }

    function resolveDispute(
        uint256 projectId,
        uint256 freelancerAmount,
        uint256 clientAmount
    ) external projectExists(projectId) {
        if (msg.sender != resolver) revert NotResolver();

        Project storage project = projects[projectId];
        if (project.status != Status.Disputed) revert InvalidStatus(project.status);
        if (freelancerAmount + clientAmount != project.amount) revert InvalidSplit();

        project.amount = 0;
        project.status = freelancerAmount >= clientAmount ? Status.Completed : Status.Refunded;

        if (freelancerAmount > 0) {
            _send(project.freelancer, freelancerAmount);
        }
        if (clientAmount > 0) {
            _send(project.client, clientAmount);
        }

        emit DisputeResolved(projectId, freelancerAmount, clientAmount);
    }

    function getProject(uint256 projectId) external view projectExists(projectId) returns (Project memory) {
        return projects[projectId];
    }

    function _send(address payable recipient, uint256 amount) private {
        (bool ok, ) = recipient.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
