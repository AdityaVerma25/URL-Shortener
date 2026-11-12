package com.shortener.controller;

import com.shortener.entity.UrlMapping;
import com.shortener.service.UrlShortenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UrlController {

    private final UrlShortenerService service;

    @PostMapping("/api/v1/url/shorten")
    public ResponseEntity<Map<String, String>> shortenUrl(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String originalUrl = request.get("originalUrl");
        String userEmail = authentication != null ? authentication.getName() : "anonymous";

        UrlMapping mapping = service.createShortUrl(originalUrl, userEmail);
        String shortUrl = "http://localhost:8080/r/" + mapping.getShortCode();

        return ResponseEntity.ok(Map.of(
                "shortCode", mapping.getShortCode(),
                "shortUrl", shortUrl,
                "originalUrl", mapping.getOriginalUrl()
        ));
    }

    @GetMapping("/r/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode) {
        String originalUrl = service.getOriginalUrlCached(shortCode);
        service.publishClickEvent(shortCode);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(originalUrl))
                .build();
    }
}
