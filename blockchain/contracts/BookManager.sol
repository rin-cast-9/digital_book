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

    event BookAdded(uint256 indexed bookId, string name);

    function getBook(uint256 _bookId) public view returns (Book memory) {
        return books[_bookId];
    }

    function getBooks() public view returns (Book[] memory) {
        return books;
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

        emit BookAdded(books.length - 1, _name);
    }

    function addBooks(
        uint16[] memory _yearPublisheds,
        string[] memory _names,
        string[] memory _publishers,
        string[] memory _publisherCities,
        string[][] memory _authors
    ) public onlyRole(OPERATOR_ROLE) {
        require(
            _names.length == _yearPublisheds.length &&
            _names.length == _publishers.length &&
            _names.length == _publisherCities.length &&
            _names.length == _authors.length,
            "All arrays must have the same length"
        );

        for (uint256 i = 0; i < _names.length; i ++) {
            books.push(Book(_names[i], _publishers[i], _publisherCities[i], _authors[i], _yearPublisheds[i], false));
            emit BookAdded(books.length - 1, _names[i]);
        }
    }

    function adoptBook(uint256 _bookId) public onlyRole(USER_ROLE) {
        books[_bookId].isAdopted = true;
    }

}