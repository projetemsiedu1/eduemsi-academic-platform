package ma.emsi.academic.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import ma.emsi.academic.domain.entity.Utilisateur;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@AllArgsConstructor
@Builder
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final String email;
    private final String nom;
    private final String prenom;
    private final String role;
    private final Long campusId;
    private final String campusNom;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetails build(Utilisateur user) {
        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());
        return CustomUserDetails.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole().name())
                .campusId(user.getCampus() != null ? user.getCampus().getId() : null)
                .campusNom(user.getCampus() != null ? user.getCampus().getNom() : null)
                .enabled(Boolean.TRUE.equals(user.getActif()))
                .authorities(Collections.singletonList(authority))
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
