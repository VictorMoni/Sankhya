package org.sankhya.exception;

import java.time.OffsetDateTime;

public record ApiError(int status, String error, String message, OffsetDateTime timestamp) {}
