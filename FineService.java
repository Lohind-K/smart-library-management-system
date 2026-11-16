package com.smartlibrary.service;

import com.smartlibrary.dto.FinePaymentDTO;
import com.smartlibrary.entity.Fine;
import com.smartlibrary.entity.Loan;
import com.smartlibrary.entity.Payment;
import com.smartlibrary.entity.User;

import java.util.List;

public interface FineService {
    Fine calculateAndRecordFine(Loan loan, long overdueDays);
    List<Fine> getAllFines();
    List<Fine> getFinesByMember(Long memberId);
    List<Fine> getUnpaidFinesByMember(Long memberId);
    Payment payFine(FinePaymentDTO dto, User collectedBy);
    Fine waiveFine(Long fineId, String reason, User librarian);
    List<Payment> getAllPayments();
    List<Payment> getPaymentsByMember(Long memberId);
}
