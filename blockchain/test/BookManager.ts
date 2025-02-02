import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { BookManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BookManager", () => {
    async function deployBookManagerContract() {
        const [owner, operatorAccount, managerAccount, userAccount] = await hre.ethers.getSigners();

        const BookManager = await hre.ethers.getContractFactory("BookManager");
        const bookManager = await BookManager.deploy();

        return {
            bookManager,
            owner,
            operatorAccount,
            managerAccount,
            userAccount,
        };
    }

    let bookManager: BookManager;
    let owner: HardhatEthersSigner;
    let operatorAccount: HardhatEthersSigner;
    let managerAccount: HardhatEthersSigner;
    let userAccount: HardhatEthersSigner;

    beforeEach(async () => {
        ({ bookManager, owner, operatorAccount, managerAccount, userAccount } = await loadFixture(deployBookManagerContract));

        await bookManager.connect(owner).addOperator(operatorAccount.address);
        await bookManager.connect(owner).addManager(managerAccount.address);
        await bookManager.connect(managerAccount).addUser(userAccount.address);
    });

    describe("Core functionality", () => {
        it("Should add a book into the contract", async () => {
            const book = {
                name: "Book0",
                publisher: "Publisher0",
                publisherCity: "PublisherCity0",
                authors: ["Author0", "Author1", "Author2"],
                yearPublished: 2025,
            };

            await bookManager.connect(operatorAccount).addBook(book.yearPublished, book.name, book.publisher, book.publisherCity, book.authors);

            const returnedBookRaw = await bookManager.getBook(0);

            const returnedBook = {
                name: returnedBookRaw[0],
                publisher: returnedBookRaw[1],
                publisherCity: returnedBookRaw[2],
                authors: returnedBookRaw[3],
                yearPublished: Number(returnedBookRaw[4]),
                isAdopted: returnedBookRaw[5],
            };

            expect(returnedBook).to.deep.equal({ ...book, isAdopted: false });
        });

        it("Should adopt a book", async () => {
            const book = {
                name: "Book0",
                publisher: "Publisher0",
                publisherCity: "PublisherCity0",
                authors: ["Author0", "Author1", "Author2"],
                yearPublished: 2025,
            };

            await bookManager.connect(operatorAccount).addBook(book.yearPublished, book.name, book.publisher, book.publisherCity, book.authors);
            await bookManager.connect(userAccount).adoptBook(0);

            const returnedBookRaw = await bookManager.getBook(0);

            const returnedBook = {
                name: returnedBookRaw[0],
                publisher: returnedBookRaw[1],
                publisherCity: returnedBookRaw[2],
                authors: returnedBookRaw[3],
                yearPublished: Number(returnedBookRaw[4]),
                isAdopted: returnedBookRaw[5],
            };

            expect(returnedBook).to.deep.equal({ ...book, isAdopted: true });
        });

        it("Should adopt only one book among others", async () => {
            const numberOfBooks = 3;

            let books = [];

            for (let i = 0; i < numberOfBooks; ++i) {
                books.push({
                    name: `Book${i}`,
                    publisher: `Publisher${i}`,
                    publisherCity: `PublisherCity${i}`,
                    authors: [`Author${i * 3}`, `Author${i * 3 + 1}`, `Author${i * 3 + 2}`],
                    yearPublished: 2025,
                });
            }

            const years = books.map((b) => b.yearPublished);
            const names = books.map((b) => b.name);
            const publishers = books.map((b) => b.publisher);
            const publisherCities = books.map((b) => b.publisherCity);
            const authors = books.map((b) => b.authors);

            for (let i = 0; i < numberOfBooks; ++i) {
                await bookManager.connect(operatorAccount).addBook(years[i], names[i], publishers[i], publisherCities[i], authors[i]);
            }

            await bookManager.connect(userAccount).adoptBook(1);

            const returnedBooksRaw = await bookManager.getBooks();

            const returnedBooks = returnedBooksRaw.map((b) => ({
                name: b[0],
                publisher: b[1],
                publisherCity: b[2],
                authors: b[3],
                yearPublished: Number(b[4]),
                isAdopted: b[5],
            }));

            expect(returnedBooks[0]).to.deep.equal({
                ...books[0],
                isAdopted: false,
            });
            expect(returnedBooks[1]).to.deep.equal({
                ...books[1],
                isAdopted: true,
            });
            expect(returnedBooks[2]).to.deep.equal({
                ...books[2],
                isAdopted: false,
            });
        });

        it("Should fail at adopting an adopted book", async () => {
            const book = {
                name: "Book0",
                publisher: "Publisher0",
                publisherCity: "PublisherCity0",
                authors: ["Author0", "Author1", "Author2"],
                yearPublished: 2025,
            };

            await bookManager.connect(operatorAccount).addBook(book.yearPublished, book.name, book.publisher, book.publisherCity, book.authors);

            await bookManager.connect(userAccount).adoptBook(0);

            await expect(bookManager.connect(userAccount).adoptBook(0)).to.be.revertedWith("The book is already adopted");
        });
    });

    describe("Events", () => {
        it("Should emit an event on a book addition", async () => {
            const book = {
                name: "Book0",
                publisher: "Publisher0",
                publisherCity: "PublisherCity0",
                authors: ["Author0", "Author1", "Author2"],
                yearPublished: 2025,
            };

            const tx = await bookManager.connect(operatorAccount).addBook(book.yearPublished, book.name, book.publisher, book.publisherCity, book.authors);
            const block = await hre.ethers.provider.getBlock(tx.blockNumber!);

            await expect(tx).to.emit(bookManager, "BookAdded").withArgs(0, operatorAccount.address, block?.timestamp);
        });

        it("Should emit an event on a book adoption", async () => {
            const book = {
                name: "Book0",
                publisher: "Publisher0",
                publisherCity: "PublisherCity0",
                authors: ["Author0", "Author1", "Author2"],
                yearPublished: 2025,
            };

            await bookManager.connect(operatorAccount).addBook(book.yearPublished, book.name, book.publisher, book.publisherCity, book.authors);

            const tx = await bookManager.connect(userAccount).adoptBook(0);
            const block = await hre.ethers.provider.getBlock(tx.blockNumber!);

            await expect(tx).to.emit(bookManager, "BookAdopted").withArgs(0, userAccount, block?.timestamp);
        });
    });
});
