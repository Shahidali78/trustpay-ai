import { expect } from "chai";
import hre from "hardhat";

describe("TrustPayEscrow", function () {
  async function deployFixture() {
    const { ethers } = hre;
    const [resolver, client, freelancer, stranger] = await ethers.getSigners();
    const TrustPayEscrow = await ethers.getContractFactory("TrustPayEscrow");
    const escrow = await TrustPayEscrow.deploy();
    const amount = ethers.parseEther("1");

    return { escrow, resolver, client, freelancer, stranger, amount };
  }

  it("creates an unfunded project", async function () {
    const { escrow, client, freelancer } = await deployFixture();

    await expect(
      escrow.connect(client).createProject(freelancer.address, "local://project"),
    )
      .to.emit(escrow, "ProjectCreated")
      .withArgs(1, client.address, freelancer.address, 0, "local://project");

    const project = await escrow.getProject(1);
    expect(project.client).to.equal(client.address);
    expect(project.freelancer).to.equal(freelancer.address);
    expect(project.status).to.equal(0);
  });

  it("creates and funds a project", async function () {
    const { escrow, client, freelancer, amount } = await deployFixture();

    await expect(
      escrow
        .connect(client)
        .createProject(freelancer.address, "local://project", { value: amount }),
    )
      .to.emit(escrow, "ProjectFunded")
      .withArgs(1, amount);

    const project = await escrow.getProject(1);
    expect(project.amount).to.equal(amount);
    expect(project.status).to.equal(1);
  });

  it("funds an existing project", async function () {
    const { escrow, client, freelancer, amount } = await deployFixture();

    await escrow.connect(client).createProject(freelancer.address, "local://project");

    await expect(escrow.connect(client).fundProject(1, { value: amount }))
      .to.emit(escrow, "ProjectFunded")
      .withArgs(1, amount);

    const project = await escrow.getProject(1);
    expect(project.status).to.equal(1);
  });

  it("allows the freelancer to submit work", async function () {
    const { escrow, client, freelancer, amount } = await deployFixture();

    await escrow
      .connect(client)
      .createProject(freelancer.address, "local://project", { value: amount });

    await expect(escrow.connect(freelancer).submitWork(1))
      .to.emit(escrow, "WorkSubmitted")
      .withArgs(1);

    const project = await escrow.getProject(1);
    expect(project.status).to.equal(2);
  });

  it("releases payment to the freelancer", async function () {
    const { escrow, client, freelancer, amount } = await deployFixture();

    await escrow
      .connect(client)
      .createProject(freelancer.address, "local://project", { value: amount });
    await escrow.connect(freelancer).submitWork(1);

    await expect(() => escrow.connect(client).releasePayment(1)).to.changeEtherBalances(
      [escrow, freelancer],
      [-amount, amount],
    );

    const project = await escrow.getProject(1);
    expect(project.status).to.equal(3);
    expect(project.amount).to.equal(0);
  });

  it("refunds the client", async function () {
    const { escrow, client, freelancer, amount } = await deployFixture();

    await escrow
      .connect(client)
      .createProject(freelancer.address, "local://project", { value: amount });

    await expect(() => escrow.connect(client).refundClient(1)).to.changeEtherBalances(
      [escrow, client],
      [-amount, amount],
    );

    const project = await escrow.getProject(1);
    expect(project.status).to.equal(5);
  });

  it("opens and resolves a dispute with a split", async function () {
    const { escrow, resolver, client, freelancer, amount } = await deployFixture();

    await escrow
      .connect(client)
      .createProject(freelancer.address, "local://project", { value: amount });
    await escrow.connect(client).openDispute(1);

    const freelancerAmount = hre.ethers.parseEther("0.7");
    const clientAmount = hre.ethers.parseEther("0.3");

    await expect(() =>
      escrow
        .connect(resolver)
        .resolveDispute(1, freelancerAmount, clientAmount),
    ).to.changeEtherBalances(
      [escrow, freelancer, client],
      [-amount, freelancerAmount, clientAmount],
    );

    const project = await escrow.getProject(1);
    expect(project.status).to.equal(3);
  });

  it("rejects unauthorized actions", async function () {
    const { escrow, client, freelancer, stranger, amount } = await deployFixture();

    await escrow
      .connect(client)
      .createProject(freelancer.address, "local://project", { value: amount });

    await expect(escrow.connect(stranger).submitWork(1)).to.be.revertedWithCustomError(
      escrow,
      "NotFreelancer",
    );
    await expect(escrow.connect(stranger).releasePayment(1)).to.be.revertedWithCustomError(
      escrow,
      "NotClient",
    );
    await expect(escrow.connect(freelancer).openDispute(1)).to.be.revertedWithCustomError(
      escrow,
      "NotClient",
    );
  });

  it("prevents invalid status transitions and bad splits", async function () {
    const { escrow, client, freelancer, amount } = await deployFixture();

    await escrow.connect(client).createProject(freelancer.address, "local://project");

    await expect(escrow.connect(client).releasePayment(1)).to.be.revertedWithCustomError(
      escrow,
      "InvalidStatus",
    );
    await expect(escrow.connect(freelancer).submitWork(1)).to.be.revertedWithCustomError(
      escrow,
      "InvalidStatus",
    );

    await escrow.connect(client).fundProject(1, { value: amount });
    await escrow.connect(client).openDispute(1);

    await expect(
      escrow.connect(client).resolveDispute(1, amount, 0),
    ).to.be.revertedWithCustomError(escrow, "NotResolver");
  });
});
