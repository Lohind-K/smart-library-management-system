package com.smartlibrary.service;

import com.smartlibrary.dto.DashboardStatsDTO;

import java.util.Map;

public interface DashboardService {
    DashboardStatsDTO getLibrarianDashboardStats();
    Map<String, Object> getMemberDashboardStats(Long memberId);
}
