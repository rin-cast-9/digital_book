// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./RolesManager.sol";

contract BookManager is RolesManager {

    struct Book {
        string name;
        string publisher;
        string publisherCity;
        string[] authors;
        uint16 yearPublished;
        bool isAdopted;
    }

    Book[] private books;

    event BookAdded(uint256 indexed bookId, address indexed addedBy, uint256 timestamp);
    event BookAdopted(uint256 indexed bookId, address indexed adopter, uint256 timestamp);

    function getLength() external view returns (uint256) {
        return books.length;
    }

    function getBook(uint256 _bookId) external view returns (Book memory) {
        return books[_bookId];
    }

    function getBooks() external view returns (Book[] memory) {
        return books;
    }

    function getBooksInRange(uint32 start, uint32 end) external view returns (Book[] memory) {
        require(start < end, "Invalid range: start must be less than end");
        require(end <= books.length, "Range exceeds total books");

        uint32 length = end - start;
        Book[] memory result = new Book[](length);

        for (uint32 i = 0; i < length; i ++) {
            result[i] = books[start + i];
        }

        return result;
    }

    function addBook(
        uint16 _yearPublished,
        string memory _name,
        string memory _publisher,
        string memory _publisherCity,
        string[] memory _authors
    ) public onlyRole(OPERATOR_ROLE) {
        Book memory newBook = Book({
            name: _name,
            publisher: _publisher,
            publisherCity: _publisherCity,
            authors: _authors,
            yearPublished: _yearPublished,
            isAdopted: false
        });

        books.push(newBook);

        emit BookAdded(books.length - 1, msg.sender, block.timestamp);
    }

    function adoptBook(uint256 _bookId) public onlyRole(USER_ROLE) {
        require(books[_bookId].isAdopted == false, "The book is already adopted");

        books[_bookId].isAdopted = true;

        emit BookAdopted(_bookId, msg.sender, block.timestamp);
    }

}
