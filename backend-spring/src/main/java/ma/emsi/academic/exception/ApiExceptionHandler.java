package ma.emsi.academic.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({BadRequestException.class, BusinessRuleException.class}) @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badRequest(RuntimeException exception) { return Map.of("message", exception.getMessage()); }
    @ExceptionHandler(ResourceNotFoundException.class) @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> missing(ResourceNotFoundException exception) { return Map.of("message", exception.getMessage()); }
    @ExceptionHandler(MethodArgumentNotValidException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> validation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream().map(e -> e.getDefaultMessage()).findFirst().orElse("Vérifiez les champs du formulaire.");
        return Map.of("message", message);
    }
    @ExceptionHandler(HttpMessageNotReadableException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalidBody() { return Map.of("message", "Le format de la requête est invalide."); }
    @ExceptionHandler(DataIntegrityViolationException.class) @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> integrity() { return Map.of("message", "Cette opération entre en conflit avec une ressource existante ou liée."); }
}
