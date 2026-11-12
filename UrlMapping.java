package com.shortener.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "url_mappings", indexes = @Index(name = "idx_short_code", columnList = "shortCode", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UrlMapping implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 12)
    private String shortCode;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String originalUrl;

    private String createdByEmail;

    @Builder.Default
    private Long clickCount = 0L;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
