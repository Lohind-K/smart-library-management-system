package com.smartlibrary.config;

import com.smartlibrary.entity.*;
import com.smartlibrary.enums.*;
import com.smartlibrary.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LibrarianRepository librarianRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        System.out.println(">>> [Smart Library] Seeding initial database records...");

        // 1. Create Default Admin / Head Librarian
        Librarian admin = new Librarian();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEmail("admin@smartlibrary.com");
        admin.setFullName("Eleanor Vance");
        admin.setPhoneNumber("+1 555-0100");
        admin.setRole(Role.ROLE_LIBRARIAN);
        admin.setEmployeeId("LIB-ADM-001");
        admin.setDepartment("Head Administration");
        admin.setActive(true);
        librarianRepository.save(admin);

        // 2. Create Assistant Librarian
        Librarian librarian = new Librarian();
        librarian.setUsername("librarian");
        librarian.setPassword(passwordEncoder.encode("librarian123"));
        librarian.setEmail("librarian@smartlibrary.com");
        librarian.setFullName("Marcus Wright");
        librarian.setPhoneNumber("+1 555-0101");
        librarian.setRole(Role.ROLE_LIBRARIAN);
        librarian.setEmployeeId("LIB-AST-002");
        librarian.setDepartment("Circulation Desk");
        librarian.setActive(true);
        librarianRepository.save(librarian);

        // 3. Create Sample Members
        Member member1 = new Member("alice", passwordEncoder.encode("member123"), "alice.johnson@university.edu",
                "Alice Johnson", "+1 555-0201", "LIB-M-1001", MembershipType.STUDENT, 3, "Room 402, North Dormitory");
        member1 = memberRepository.save(member1);

        Member member2 = new Member("bob", passwordEncoder.encode("member123"), "prof.bob@university.edu",
                "Dr. Robert Smith", "+1 555-0202", "LIB-M-1002", MembershipType.FACULTY, 7, "Faculty Office 315, Science Hall");
        member2 = memberRepository.save(member2);

        Member member3 = new Member("clara", passwordEncoder.encode("member123"), "clara.davis@gmail.com",
                "Clara Davis", "+1 555-0203", "LIB-M-1003", MembershipType.GENERAL, 5, "742 Evergreen Terrace");
        member3 = memberRepository.save(member3);

        Member member4 = new Member("david", passwordEncoder.encode("member123"), "david.miller@university.edu",
                "David Miller", "+1 555-0204", "LIB-M-1004", MembershipType.STUDENT, 3, "Room 210, West Dormitory");
        member4 = memberRepository.save(member4);

        // 4. Create Books & Physical Copies
        Book book1 = new Book("978-0132350884", "Clean Code: A Handbook of Agile Software Craftsmanship",
                "Robert C. Martin", "Computer Science", "Prentice Hall", 2008,
                "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
                "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80",
                "CS-A1-04", 4, 3);
        book1 = bookRepository.save(book1);
        createCopies(book1, 4);

        Book book2 = new Book("978-0201633610", "Design Patterns: Elements of Reusable Object-Oriented Software",
                "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", "Computer Science", "Addison-Wesley", 1994,
                "Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions.",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
                "CS-A2-11", 3, 2);
        book2 = bookRepository.save(book2);
        createCopies(book2, 3);

        Book book3 = new Book("978-0262033848", "Introduction to Algorithms, 3rd Edition",
                "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein", "Computer Science", "MIT Press", 2009,
                "Some books on algorithms are rigorous but incomplete; others cover masses of material but lack rigor. Introduction to Algorithms uniquely combines rigor and comprehensiveness.",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
                "CS-B3-02", 2, 1);
        book3 = bookRepository.save(book3);
        createCopies(book3, 2);

        Book book4 = new Book("978-0061120084", "To Kill a Mockingbird",
                "Harper Lee", "Literature", "J. B. Lippincott & Co.", 1960,
                "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80",
                "LIT-C1-09", 5, 5);
        book4 = bookRepository.save(book4);
        createCopies(book4, 5);

        Book book5 = new Book("978-0553380163", "A Brief History of Time",
                "Stephen Hawking", "Science", "Bantam Books", 1988,
                "Was there a beginning of time? Could time run backwards? Is the universe infinite or does it have boundaries?",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
                "SCI-D2-07", 3, 3);
        book5 = bookRepository.save(book5);
        createCopies(book5, 3);

        Book book6 = new Book("978-0062316097", "Sapiens: A Brief History of Humankind",
                "Yuval Noah Harari", "History", "Harper", 2014,
                "One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one: Homo sapiens.",
                "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80",
                "HIST-E4-15", 3, 2);
        book6 = bookRepository.save(book6);
        createCopies(book6, 3);

        Book book7 = new Book("978-0374533557", "Thinking, Fast and Slow",
                "Daniel Kahneman", "Philosophy", "Farrar, Straus and Giroux", 2011,
                "The groundbreaking book on the two systems that drive the way we think—System 1, fast and intuitive; and System 2, slow and deliberate.",
                "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80",
                "PHIL-F1-03", 2, 0); // Out of copies for reservation testing!
        book7 = bookRepository.save(book7);
        createCopies(book7, 2);

        // 5. Create Loans
        // Loan 1: Alice has Clean Code (Active, Due in 7 days)
        BookCopy copy1 = bookCopyRepository.findByBookId(book1.getId()).get(0);
        copy1.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy1);
        Loan loan1 = new Loan("LN-20261020-0001", member1, book1, copy1, LocalDate.now().minusDays(7), LocalDate.now().plusDays(7));
        loanRepository.save(loan1);

        // Loan 2: Bob has Design Patterns (Active, Due in 10 days)
        BookCopy copy2 = bookCopyRepository.findByBookId(book2.getId()).get(0);
        copy2.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy2);
        Loan loan2 = new Loan("LN-20261022-0002", member2, book2, copy2, LocalDate.now().minusDays(4), LocalDate.now().plusDays(10));
        loanRepository.save(loan2);

        // Loan 3: Clara has Introduction to Algorithms (OVERDUE! Borrowed 22 days ago, due 8 days ago)
        BookCopy copy3 = bookCopyRepository.findByBookId(book3.getId()).get(0);
        copy3.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy3);
        Loan loan3 = new Loan("LN-20261005-0003", member3, book3, copy3, LocalDate.now().minusDays(22), LocalDate.now().minusDays(8));
        loan3.setStatus(LoanStatus.ISSUED);
        loanRepository.save(loan3);

        // Record Fine for Clara's overdue loan: 8 days * $1.00 = $8.00
        Fine fine1 = new Fine("FN-20261025-0001", loan3, member3, new BigDecimal("8.00"), "Overdue by 8 days for 'Introduction to Algorithms'");
        fineRepository.save(fine1);

        // Loan 4 & 5: Sapiens & Thinking Fast/Slow (Loaned to David and Clara)
        BookCopy copy6 = bookCopyRepository.findByBookId(book6.getId()).get(0);
        copy6.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy6);
        Loan loan4 = new Loan("LN-20261015-0004", member4, book6, copy6, LocalDate.now().minusDays(12), LocalDate.now().plusDays(2));
        loanRepository.save(loan4);

        BookCopy copy7A = bookCopyRepository.findByBookId(book7.getId()).get(0);
        copy7A.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy7A);
        Loan loan5A = new Loan("LN-20261018-0005", member1, book7, copy7A, LocalDate.now().minusDays(9), LocalDate.now().plusDays(5));
        loanRepository.save(loan5A);

        BookCopy copy7B = bookCopyRepository.findByBookId(book7.getId()).get(1);
        copy7B.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy7B);
        Loan loan5B = new Loan("LN-20261019-0006", member2, book7, copy7B, LocalDate.now().minusDays(8), LocalDate.now().plusDays(6));
        loanRepository.save(loan5B);

        // 6. Create Reservation: David reserved "Thinking, Fast and Slow" (which has 0 available copies)
        Reservation res1 = new Reservation("RES-20261025-0001", member4, book7);
        res1.setQueuePosition(1);
        res1.setNotes("Required for behavioral economics coursework");
        reservationRepository.save(res1);

        // 7. Initial In-App Notifications
        notificationRepository.save(new Notification(member1, "Welcome to Smart Library!",
                "Your student account has been created. Enjoy borrowing up to 3 books simultaneously.", NotificationType.GENERAL));
        notificationRepository.save(new Notification(member3, "Urgent: Book Overdue",
                "Your loan for 'Introduction to Algorithms' was due on " + loan3.getDueDate() + ". An overdue fine of $8.00 has accrued. Please return the book promptly.",
                NotificationType.OVERDUE_ALERT));
        notificationRepository.save(new Notification(member4, "Reservation Placed",
                "You are #1 in line for 'Thinking, Fast and Slow'. You will receive an instant notification when a copy is returned.",
                NotificationType.GENERAL));

        System.out.println(">>> [Smart Library] Initial seed data successfully populated!");
    }

    private void createCopies(Book book, int count) {
        for (int i = 1; i <= count; i++) {
            String barcode = book.getIsbn() + "-C" + String.format("%02d", i);
            BookCopy copy = new BookCopy(barcode, book, CopyStatus.AVAILABLE, "Good condition");
            bookCopyRepository.save(copy);
        }
    }
}
