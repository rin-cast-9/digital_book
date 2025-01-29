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

        return { bookManager, owner, operatorAccount, managerAccount, userAccount };
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
                authors: [
                    "Author0",
                    "Author1",
                    "Author2"
                ],
                yearPublished: 2025
            };

            await bookManager.connect(operatorAccount).addBook(book.yearPublished, book.name, book.publisher, book.publisherCity, book.authors);

            const returnedBookRaw = await bookManager.getBook(0);

            const returnedBook = {
                name: returnedBookRaw[0],
                publisher: returnedBookRaw[1],
                publisherCity: returnedBookRaw[2],
                authors: returnedBookRaw[3],
                yearPublished: Number(returnedBookRaw[4]),
                isAdopted: returnedBookRaw[5]
            };

            expect(returnedBook).to.deep.equal({ ...book, isAdopted: false });
        });

        it("Should add a bunch of books into the contract", async () => {
            const books = [
                {
                    name: "Book0",
                    publisher: "Publisher0",
                    publisherCity: "PublisherCity0",
                    authors: ["Author0", "Author1", "Author2"],
                    yearPublished: 2025
                },
                {
                    name: "Book1",
                    publisher: "Publisher1",
                    publisherCity: "PublisherCity1",
                    authors: ["Author3", "Author4", "Author5"],
                    yearPublished: 2023
                },
                {
                    name: "Book2",
                    publisher: "Publisher2",
                    publisherCity: "PublisherCity2",
                    authors: ["Author6", "Author7", "Author8"],
                    yearPublished: 2024
                }
            ];

            const years = books.map(b => b.yearPublished);
            const names = books.map(b => b.name);
            const publishers = books.map(b => b.publisher);
            const publisherCities = books.map(b => b.publisherCity);
            const authors = books.map(b => b.authors);

            await bookManager.connect(operatorAccount).addBooks(years, names, publishers, publisherCities, authors);

            const returnedBooksRaw = await bookManager.getBooks();

            const returnedBooks = returnedBooksRaw.map(b => ({
                name: b[0],
                publisher: b[1],
                publisherCity: b[2],
                authors: b[3],
                yearPublished: Number(b[4]),
                isAdopted: b[5]
            }));

            expect(returnedBooks).to.deep.equal(books.map(b => ({ ...b, isAdopted: false })));
        })

    });

});