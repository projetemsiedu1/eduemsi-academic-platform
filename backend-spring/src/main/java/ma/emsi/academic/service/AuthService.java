package ma.emsi.academic.service;

import ma.emsi.academic.dto.auth.ChangePasswordRequest;
import ma.emsi.academic.dto.auth.LoginRequest;
import ma.emsi.academic.dto.auth.LoginResponse;
import ma.emsi.academic.dto.auth.UserSummaryDto;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    UserSummaryDto getCurrentUser(String username);
    void changePassword(String username, ChangePasswordRequest request);
    void seedDefaultUsersIfEmpty();
}
