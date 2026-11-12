package com.shortener.service;

import com.shortener.entity.UrlMapping;
import com.shortener.event.UrlClickEvent;
import com.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UrlShortenerService {

    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String KAFKA_TOPIC = "url-click-events";

    private final UrlMappingRepository repository;
    private final KafkaTemplate<String, UrlClickEvent> kafkaTemplate;

    public UrlMapping createShortUrl(String originalUrl, String userEmail) {
        String shortCode = generateBase62Code(7);

        UrlMapping mapping = UrlMapping.builder()
                .shortCode(shortCode)
                .originalUrl(originalUrl)
                .createdByEmail(userEmail)
                .build();

        return repository.save(mapping);
    }

    @Cacheable(value = "urls", key = "#shortCode")
    public String getOriginalUrlCached(String shortCode) {
        return repository.findByShortCode(shortCode)
                .map(UrlMapping::getOriginalUrl)
                .orElseThrow(() -> new RuntimeException("Short URL not found: " + shortCode));
    }

    public void publishClickEvent(String shortCode) {
        UrlClickEvent event = new UrlClickEvent(shortCode, LocalDateTime.now().toString());
        kafkaTemplate.send(KAFKA_TOPIC, shortCode, event);
    }

    private String generateBase62Code(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(BASE62.charAt(RANDOM.nextInt(BASE62.length())));
        }
        return sb.toString();
    }
}
