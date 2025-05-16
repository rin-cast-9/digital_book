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

    uint32 private booksSaved = 0;
    mapping(uint32 => bool) public isBookAdopted;

    event BookAdded(
        uint32 indexed bookId,
        uint256 timestamp,
        uint16 yearPublished,
        string name,
        string publisher,
        string publisherCity,
        string[] authors
    );

    event BookTypoCorrected(
        uint32 indexed oldBookId,
        uint32 newBookId,
        uint256 timestamp
    );

    event BookAdopted(
        uint256 indexed bookId,
        address indexed adopter,
        uint256 timestamp
    );

    function addBook(
        uint16 _yearPublished,
        string memory _name,
        string memory _publisher,
        string memory _publisherCity,
        string[] memory _authors
    ) public onlyRole(OPERATOR_ROLE) {
        emit BookAdded(booksSaved ++, block.timestamp, _yearPublished, _name, _publisher, _publisherCity, _authors);
    }

    function adoptBook(uint32 _bookId) public onlyRole(USER_ROLE) {
        require(!isBookAdopted[_bookId], "Book already adopted");
        isBookAdopted[_bookId] = true;

        emit BookAdopted(_bookId, msg.sender, block.timestamp);
    }

    function correctTypo(
        uint32 _bookId,
        uint16 _yearPublished,
        string memory _name,
        string memory _publisher,
        string memory _publisherCity,
        string[] memory _authors
    ) public onlyRole(OPERATOR_ROLE) {
        uint256 timestamp = block.timestamp;
        uint32 newBookId = booksSaved ++;

        if (isBookAdopted[_bookId]) {
            isBookAdopted[newBookId] = true;
        }

        emit BookAdded(newBookId, timestamp, _yearPublished, _name, _publisher, _publisherCity, _authors);
        emit BookTypoCorrected(_bookId, newBookId, timestamp);
    }

}
