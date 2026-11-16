package com.smartlibrary.service;

import com.smartlibrary.dto.BookDTO;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.enums.CopyStatus;

import java.util.List;

public interface BookService {
    List<Book> getAllBooks();
    Book getBookById(Long id);
    Book getBookByIsbn(String isbn);
    List<Book> searchBooks(String query, String category);
    List<String> getCategories();
    Book createBook(BookDTO bookDTO);
    Book updateBook(Long id, BookDTO bookDTO);
    void deleteBook(Long id);
    List<BookCopy> getBookCopies(Long bookId);
    BookCopy addBookCopy(Long bookId, String barcode, String conditionNotes);
    BookCopy updateCopyStatus(Long copyId, CopyStatus status);
}
