package ma.emsi.academic.controller;
import ma.emsi.academic.service.solver.global.TimetableConflictException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestControllerAdvice
public class TimetableSolverExceptionHandler {
    @ExceptionHandler(TimetableConflictException.class) @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String,String> conflict(TimetableConflictException e) { return Map.of("message", e.getMessage()); }
}
