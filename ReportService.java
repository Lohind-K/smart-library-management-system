package com.smartlibrary.service;

import com.smartlibrary.dto.ReportDTO;

import java.time.LocalDate;

public interface ReportService {
    ReportDTO getInventoryReport();
    ReportDTO getBorrowingHistoryReport(LocalDate startDate, LocalDate endDate);
    ReportDTO getOverdueBooksReport();
    ReportDTO getActiveMembersReport();
    ReportDTO getFineCollectionReport(LocalDate startDate, LocalDate endDate);
    ReportDTO getMostBorrowedBooksReport();
}
