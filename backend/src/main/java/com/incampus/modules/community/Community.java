package com.incampus.modules.community;

import com.incampus.common.BaseEntity;
import com.incampus.modules.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "communities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Community extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Coding", "AI", "Photography"

    @Column(length = 1000)
    private String description;

    private String bannerUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(nullable = false)
    @Builder.Default
    private long memberCount = 0;
}
