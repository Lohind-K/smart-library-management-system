package com.smartlibrary.service;

import com.smartlibrary.dto.ReservationDTO;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.Reservation;

import java.util.List;

public interface ReservationService {
    ReservationDTO reserveBook(Long memberId, Long bookId, String notes);
    ReservationDTO cancelReservation(Long reservationId, Long requestingUserId);
    ReservationDTO fulfillReservation(Long reservationId);
    List<ReservationDTO> getAllReservations();
    List<ReservationDTO> getReservationsByMember(Long memberId);
    void checkAndNotifyReservationsForBook(Book book);
}
