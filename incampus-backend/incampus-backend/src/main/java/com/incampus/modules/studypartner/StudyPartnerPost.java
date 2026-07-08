package com.incampus.modules.studypartner;

import com.incampus.common.BaseEntity;
import com.incampus.modules.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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

import java.util.HashSet;
import java.util.Set;

/** e.g. "Looking for Java study partner", "Need DSA partner", "Need GATE partner" */
@Entity
@Table(name = "study_partner_posts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyPartnerPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private String subject; // e.g. "DSA", "GATE", "Java", "ML"

    @Column(length = 2000)
    private String description;

    @ElementCollection
    @CollectionTable(name = "study_partner_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    @Builder.Default
    private Set<String> tags = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean open = true;
}
