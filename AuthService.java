package com.smartlibrary.service;

import com.smartlibrary.dto.AuthRequest;
import com.smartlibrary.dto.AuthResponse;
import com.smartlibrary.dto.RegisterRequest;
import com.smartlibrary.entity.User;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse registerMember(RegisterRequest request);
    AuthResponse registerLibrarian(RegisterRequest request);
    User getUserByUsername(String username);
}
