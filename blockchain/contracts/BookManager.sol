// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract BookManager {

    struct Book {
        string name;
        string publisher;
        string publisherCity;
        string[] authors;
        uint16 yearPublished;
        bool isAdopted;
    }

    Book[] private books;

    event BookAdded(uint256 indexed bookId, string name);

    function getBook(uint256 _bookId) public view returns (
        string memory name,
        string memory publisher,
        string memory publisherCity,
        string[] memory authors,
        uint16 yearPublished,
        bool isAdopted
    ) {
        Book memory book = books[_bookId];

        return (
            book.name,
            book.publisher,
            book.publisherCity,
            book.authors,
            book.yearPublished,
            book.isAdopted
        );
    }

    function addBook(
        uint16 _yearPublished,
        string memory _name,
        string memory _publisher,
        string memory _publisherCity,
        string[] memory _authors
    ) public {
        Book memory newBook = Book({
            name: _name,
            publisher: _publisher,
            publisherCity: _publisherCity,
            authors: _authors,
            yearPublished: _yearPublished,
            isAdopted: false
        });

        books.push(newBook);

        emit BookAdded(books.length - 1, _name);
    }

    function adoptBook(uint256 _bookId) public {
        books[_bookId].isAdopted = true;
    }

}