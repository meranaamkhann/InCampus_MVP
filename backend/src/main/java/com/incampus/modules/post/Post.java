package com.incampus.modules.post;

import com.incampus.common.BaseEntity;
import com.incampus.common.enums.PostType;
import com.incampus.modules.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
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

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_posts_author", columnList = "author_id"),
        @Index(name = "idx_posts_created_at", columnList = "createdAt"),
        @Index(name = "idx_posts_type", columnList = "type")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType type;

    @Column(length = 5000)
    private String content;

    // Image posts -> Cloudinary URLs
    @ElementCollection
    @CollectionTable(name = "post_images", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    // Poll posts -> options; votes tracked in PostPollVote
    @ElementCollection
    @CollectionTable(name = "post_poll_options", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "option_text")
    @Builder.Default
    private List<String> pollOptions = new ArrayList<>();

    // Optional link to a full Event, when type == EVENT
    private java.util.UUID linkedEventId;

    @Column(nullable = false)
    @Builder.Default
    private long likeCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private long commentCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean pinned = false;
}
