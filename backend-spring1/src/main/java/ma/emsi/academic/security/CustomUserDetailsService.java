package ma.emsi.academic.security;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Utilisateur;
import ma.emsi.academic.repository.UtilisateurRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur user = utilisateurRepository.findByUsername(username)
                .or(() -> utilisateurRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'identifiant : " + username));

        return CustomUserDetails.build(user);
    }
}
