import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { BookManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse, EventLog, Log, LogDescription } from "ethers";

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

    const addBooksAndGetLogs = async (count: number) => {
        const books = [];
        const iface = bookManager.interface;

        for (let i = 0; i < count; i ++) {
            const book = {
                name: `Book${i}`,
                publisher: `Publisher${i}`,
                publisherCity: `City${i}`,
                authors: [`Author${i}_0`, `Author${i}_1`],
                yearPublished: 2020 + i,
            };

            const tx = await bookManager.connect(operatorAccount).addBook(
                book.yearPublished,
                book.name,
                book.publisher,
                book.publisherCity,
                book.authors
            );

            const receipt = await tx.wait();
            const event = receipt?.logs
                .map(log => {
                    try {
                        return iface.parseLog(log);
                    }
                    catch {
                        return null;
                    }
                })
                .find(log => log?.name === "BookAdded");

            const block = await hre.ethers.provider.getBlock(receipt?.blockNumber!);

            books.push({ ...book, id: i, timestamp: block?.timestamp, event });
        }

        return books;
    };

    const getCorrectedBookId = async (bookManager: BookManager, tx: ContractTransactionResponse): Promise<{ newBookId: number, logs: LogDescription[] }> => {
        const receipt = await tx.wait();
        const iface = bookManager.interface;
        const logs: LogDescription[] = [];

        let newBookId: number | null = null;

        for (const log of receipt!.logs) {
            try {
                const parsed = iface.parseLog(log);
                logs.push(parsed!);

                if (parsed?.name === "BookTypoCorrected") {
                    newBookId = parsed.args.newBookId;
                }
            }
            catch {
                continue;
            }
        }

        if (newBookId === null) {
            throw new Error("BookTypoCorrected event not found");
        }

        return { newBookId, logs };
    }

    describe("Core functionality", () => {
        it("Should add a book into the contract and emit the event", async () => {
            const book = {
                name: "Book0",
                publisher: "Publisher0",
                publisherCity: "PublisherCity0",
                authors: ["Author0", "Author1", "Author2"],
                yearPublished: 2025,
            };

            const tx = await bookManager.connect(operatorAccount).addBook(
                book.yearPublished,
                book.name,
                book.publisher,
                book.publisherCity,
                book.authors
            );

            const block = await hre.ethers.provider.getBlock(tx.blockNumber!);


            /**
             * uint32 indexed bookId,
             * uint256 timestamp,
             * uint16 yearPublished,
             * string name,
             * string publisher,
             * string publisherCity,
             * string[] authors
             */
            await expect(tx).to.emit(bookManager, "BookAdded").withArgs(
                0,
                block?.timestamp,
                book.yearPublished,
                book.name,
                book.publisher,
                book.publisherCity,
                book.authors
            );
        });

        it("Should add multiple books and verify them", async () => {
            const books = await addBooksAndGetLogs(3);

            for (let i = 0; i < books.length; i ++) {
                const log = books[i].event;
                expect(log?.args.name).to.equal(books[i].name);
                expect(log?.args.publisher).to.equal(books[i].publisher);
                expect(log?.args.publisherCity).to.equal(books[i].publisherCity);
                expect(log?.args.yearPublished).to.equal(books[i].yearPublished);
                expect(log?.args.authors).to.deep.equal(books[i].authors);
            }
        });

        it("Should edit the 2nd book, check others are unchanged and 2nd is updated", async () => {
            const books = await addBooksAndGetLogs(3);

            const edited = {
                name: "Edited book",
                publisher: "Edited publisher",
                publisherCity: "Edited city",
                authors: ["new author"],
                yearPublished: 2033,
            };

            const tx = await bookManager.connect(operatorAccount).correctTypo(
                1,
                edited.yearPublished,
                edited.name,
                edited.publisher,
                edited.publisherCity,
                edited.authors
            );

            const { newBookId, logs } = await getCorrectedBookId(bookManager, tx);

            const addEvent = logs?.find(e => e?.name === "BookAdded" && e.args.bookId === newBookId);
            expect(addEvent).to.not.be.undefined;

            expect(addEvent!.args.name).to.equal(edited.name);
            expect(addEvent!.args.publisher).to.equal(edited.publisher);
            expect(addEvent!.args.publisherCity).to.equal(edited.publisherCity);
            expect(addEvent!.args.yearPublished).to.equal(edited.yearPublished);
            expect(addEvent!.args.authors).to.deep.equal(edited.authors);

            expect(books[0].event!.args.name).to.equal("Book0");
            expect(books[2].event!.args.name).to.equal("Book2");
        });

        it("Should adopt the 2nd book and confirm via event", async () => {
            await addBooksAndGetLogs(3);

            const tx = await bookManager.connect(userAccount).adoptBook(1);
            const receipt = await tx.wait();
            const iface = bookManager.interface;

            const event = receipt?.logs.map(log => {
                try {
                    return iface.parseLog(log);
                }
                catch {
                    return null;
                }
            }).find(e => e?.name === "BookAdopted");

            expect(event?.args.bookId).to.equal(1);
            expect(event?.args.adopter).to.equal(userAccount.address);
        });

        it("Should edit 3rd of 5 books and adopt the corrected (6th) version", async () => {
            await addBooksAndGetLogs(5);

            const edited = {
                name: "Corrected",
                publisher: "Fixed",
                publisherCity: "FixedCity",
                authors: ["Fixer"],
                yearPublisher: 2042,
            };

            const correctTx = await bookManager.connect(operatorAccount).correctTypo(
                2,
                edited.yearPublisher,
                edited.name,
                edited.publisher,
                edited.publisherCity,
                edited.authors
            );

            const { newBookId, logs } = await getCorrectedBookId(bookManager, correctTx);

            const adoptTx = await bookManager.connect(userAccount).adoptBook(newBookId);
            const adoptReceipt = await adoptTx.wait();

            const iface = bookManager.interface;

            const adoptLog = adoptReceipt?.logs.map(log => {
                try {
                    return iface.parseLog(log);
                }
                catch {
                    return null;
                }
            }).find(e => e?.name === "BookAdopted");

            expect(adoptLog).to.not.be.undefined;
            expect(adoptLog!.args.bookId).to.equal(newBookId);
            expect(adoptLog!.args.adopter).to.equal(userAccount.address);
        });

        it("Should correct the 2nd book twice and verify the latest version via chained BookTypoCorrected events", async () => {
            await addBooksAndGetLogs(3);

            const firstCorrection = {
                name: "Corrected once",
                publisher: "Corrected once publisher",
                publisherCity: "Corrected once publisher city",
                authors: ["Author A"],
                yearPublished: 2030,
            };

            const tx1 = await bookManager.connect(operatorAccount).correctTypo(
                1,
                firstCorrection.yearPublished,
                firstCorrection.name,
                firstCorrection.publisher,
                firstCorrection.publisherCity,
                firstCorrection.authors
            );

            const { newBookId: firstCorrectedId } = await getCorrectedBookId(bookManager, tx1);

            const secondCorrection = {
                name: "Corrected twice",
                publisher: "Corrected twice publisher",
                publisherCity: "Corrected twice publisher city",
                authors: ["Author B"],
                yearPublished: 2031,
            };

            const tx2 = await bookManager.connect(operatorAccount).correctTypo(
                firstCorrectedId,
                secondCorrection.yearPublished,
                secondCorrection.name,
                secondCorrection.publisher,
                secondCorrection.publisherCity,
                secondCorrection.authors
            );

            const { newBookId: secondCorrectedId, logs} = await getCorrectedBookId(bookManager, tx2);

            const finalAdd = logs.find(e => e.name === "BookAdded" && e.args.bookId === secondCorrectedId);
            expect(finalAdd).to.not.be.undefined;

            expect(finalAdd!.args.name).to.equal(secondCorrection.name);
            expect(finalAdd!.args.publisher).to.equal(secondCorrection.publisher);
            expect(finalAdd!.args.publisherCity).to.equal(secondCorrection.publisherCity);
            expect(finalAdd!.args.authors).to.deep.equal(secondCorrection.authors);
            expect(finalAdd!.args.yearPublished).to.equal(secondCorrection.yearPublished);
        });

        it("Should add 3 books and return correct number from getNumberOfBooks", async () => {
            await addBooksAndGetLogs(3);

            const count = await bookManager.getNumberOfBooks();
            
            expect(count).to.equal(3);
        });
    });

    describe.skip("[DEPRICATED] Core functionality", () => {
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

        it("Should return the correct range", async () => {
            const numberOfBooks = 6;

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

            const returnedBooksRaw = await bookManager.getBooksInRange(3, 6);

            const returnedBooks = returnedBooksRaw.map((b) => ({
                name: b[0],
                publisher: b[1],
                publisherCity: b[2],
                authors: b[3],
                yearPublished: Number(b[4]),
                isAdopted: b[5],
            }));

            for (let i = 3; i < 6; ++i) {
                expect(returnedBooks[i - 3]).to.deep.equal({
                    ...books[i],
                    isAdopted: false
                });
            }
        });

        it("Should eventually revert due to gas limit or return size when calling getBooks()", async () => {
            const maxBooks = 10000;
            const batchSize = 50;

            let i = 0;
            try {
                while (i < maxBooks) {
                    const txs = [];
                    for (let j = 0; j < batchSize; ++ j) {
                        const book = {
                            name: `Book${i}`,
                            publisher: `Publisher${i}`,
                            publisherCity: `PublisherCity${i}`,
                            authors: [`Author${i * 3}`, `Author${i * 3 + 1}`, `Author${i * 3 + 2}`],
                            yearPublished: 2025,
                        };

                        txs.push(bookManager.connect(operatorAccount).addBook(
                            book.yearPublished,
                            book.name,
                            book.publisher,
                            book.publisherCity,
                            book.authors
                        ));

                        ++ i;
                    }

                    await Promise.all(txs);
                    await bookManager.getBooks();
                }

                expect.fail("Expected getBooks to revert due to gas or return size limit, but it didn't");
            }
            catch (error: any) {
                expect(error.message).to.match(/ran out of gas/i);
            }
        });

        it("Should fail at the incorrect range", async () => {
            const numberOfBooks = 6;

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

            expect(bookManager.getBooksInRange(2, 2)).to.be.revertedWith("Invalid range: start must be less than end");
        });
        
        it("Should fail at the out of bounds range", async () => {
            const numberOfBooks = 6;

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

            expect(bookManager.getBooksInRange(3, 7)).to.be.revertedWith("Range exceeds total books");
        });
    });

    describe.skip("[DEPRICATED] Events", () => {
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
