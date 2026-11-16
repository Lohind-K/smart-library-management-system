package com.smartlibrary.service;

import com.smartlibrary.dto.MemberDTO;
import com.smartlibrary.entity.Member;
import com.smartlibrary.enums.MemberStatus;

import java.util.List;

public interface MemberService {
    List<MemberDTO> getAllMembers();
    MemberDTO getMemberDtoById(Long id);
    Member getMemberById(Long id);
    Member getMemberByUsername(String username);
    List<MemberDTO> searchMembers(String query);
    MemberDTO updateMember(Long id, MemberDTO dto);
    MemberDTO updateMemberStatus(Long id, MemberStatus status);
    MemberDTO toggleMemberActive(Long id);
}
