import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { BookManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BookManager", function () {
    
    async function deployBookManagerContract() {
        const [owner, operatorAccount, managerAccount, userAccount] = await hre.ethers.getSigners();

        const BookManager = await hre.ethers.getContractFactory("BookManager");
        const bookManager = await BookManager.deploy();

        return { bookManager, owner, operatorAccount, managerAccount, userAccount };
    }

    let bookManager: BookManager;
    let owner: HardhatEthersSigner;
    let operatorAccount: HardhatEthersSigner;
    let managerAccount: HardhatEthersSigner;
    let userAccount: HardhatEthersSigner;

    beforeEach(async function() {
        ({ bookManager, owner, operatorAccount, managerAccount, userAccount } = await loadFixture(deployBookManagerContract));

        await bookManager.connect(owner).addOperator(operatorAccount.address);
        await bookManager.connect(owner).addManager(managerAccount.address);
        await bookManager.connect(managerAccount).addUser(userAccount.address);
    });

    describe("Core functionality", function() {

        it("Should add a book into the contract", async function() {            
            const book = {
                name: "Book0",
                publisher: "Publisher0",
                publisherCity: "PublisherCity0",
                authors: [
                    "Author0",
                    "Author1",
                    "Author2"
                ],
                yearPublished: 2025
            };

            await bookManager.connect(operatorAccount).addBook(book.yearPublished, book.name, book.publisher, book.publisherCity, book.authors);

            const returnedBook = await bookManager.getBook(0);
            
            expect(returnedBook.name).to.equal(book.name);
            expect(returnedBook.publisher).to.equal(book.publisher);
            expect(returnedBook.publisherCity).to.equal(book.publisherCity);
            expect(returnedBook.authors).to.deep.equal(book.authors);
            expect(returnedBook.yearPublished).to.equal(book.yearPublished);
            expect(returnedBook.isAdopted).to.equal(false);
        });
    });

});