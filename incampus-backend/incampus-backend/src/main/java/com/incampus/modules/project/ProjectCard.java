package com.incampus.modules.project;

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

import java.util.ArrayList;
import java.util.List;

/** e.g. "Need Frontend Developer", "Hackathon Team" */
@Entity
@Table(name = "project_cards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCard extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;

    // e.g. ["Frontend Developer", "ML Engineer"]
    @ElementCollection
    @CollectionTable(name = "project_roles_needed", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "role")
    @Builder.Default
    private List<String> rolesNeeded = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean open = true;
}
