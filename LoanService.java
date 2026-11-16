package com.smartlibrary.service;

import com.smartlibrary.dto.LoanRequestDTO;
import com.smartlibrary.dto.ReturnRequestDTO;
import com.smartlibrary.entity.Loan;
import com.smartlibrary.enums.LoanStatus;

import java.time.LocalDate;
import java.util.List;

public interface LoanService {
    Loan issueBook(LoanRequestDTO request);
    Loan returnBook(ReturnRequestDTO request);
    List<Loan> getAllLoans();
    List<Loan> getActiveLoans();
    List<Loan> getOverdueLoans();
    List<Loan> getLoansByMember(Long memberId);
    Loan getLoanById(Long id);
    List<Loan> filterLoans(LoanStatus status, LocalDate startDate, LocalDate endDate);
}
