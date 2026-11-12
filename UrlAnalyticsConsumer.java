package com.shortener.kafka;

import com.shortener.event.UrlClickEvent;
import com.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class UrlAnalyticsConsumer {

    private final UrlMappingRepository repository;

    @Transactional
    @KafkaListener(topics = "url-click-events", groupId = "url-analytics-group")
    public void consumeClickEvent(UrlClickEvent event) {
        log.info("Kafka received click event for shortCode: {}", event.shortCode());
        repository.incrementClickCount(event.shortCode());
    }
}
