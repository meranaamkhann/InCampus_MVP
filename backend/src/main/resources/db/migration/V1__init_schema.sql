-- V1__init_schema.sql
-- Baseline schema for InCampus MVP. Generated to match the JPA entities in
-- Phase "backend skeleton". IDs are UUIDs generated application-side
-- (Hibernate's @UuidGenerator), so no DB-side default is needed on id columns.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ USERS ============
CREATE TABLE users (
    id                          UUID PRIMARY KEY,
    created_at                  TIMESTAMP NOT NULL,
    updated_at                  TIMESTAMP,
    deleted                     BOOLEAN NOT NULL DEFAULT FALSE,
    name                        VARCHAR(60) NOT NULL,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    password_hash               VARCHAR(255) NOT NULL,
    college                     VARCHAR(255) NOT NULL,
    branch                      VARCHAR(255),
    year                        INTEGER,
    bio                         VARCHAR(300),
    profile_picture_url         VARCHAR(500),
    role                        VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    verification_status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    otp_code_hash               VARCHAR(255),
    otp_expires_at               TIMESTAMP,
    current_refresh_token_hash  VARCHAR(255),
    refresh_token_expires_at    TIMESTAMP,
    banned                      BOOLEAN NOT NULL DEFAULT FALSE,
    enabled                     BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_college ON users(college);

CREATE TABLE user_interests (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest VARCHAR(100)
);
CREATE TABLE user_skills (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(100)
);
CREATE TABLE user_badges (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge VARCHAR(100)
);

CREATE TABLE user_follows (
    id           UUID PRIMARY KEY,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP,
    deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_follower_following UNIQUE (follower_id, following_id)
);

-- ============ POSTS ============
CREATE TABLE posts (
    id              UUID PRIMARY KEY,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP,
    deleted         BOOLEAN NOT NULL DEFAULT FALSE,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL,
    content         VARCHAR(5000),
    linked_event_id UUID,
    like_count      BIGINT NOT NULL DEFAULT 0,
    comment_count   BIGINT NOT NULL DEFAULT 0,
    pinned          BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_type ON posts(type);

CREATE TABLE post_images (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url     VARCHAR(500)
);
CREATE TABLE post_poll_options (
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    option_text VARCHAR(255)
);

CREATE TABLE post_saves (
    id         UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_post_save_user UNIQUE (post_id, user_id)
);

CREATE TABLE comments (
    id                UUID PRIMARY KEY,
    created_at        TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP,
    deleted           BOOLEAN NOT NULL DEFAULT FALSE,
    post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content           VARCHAR(2000) NOT NULL,
    like_count        BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

CREATE TABLE likes (
    id          UUID PRIMARY KEY,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    deleted     BOOLEAN NOT NULL DEFAULT FALSE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    target_id   UUID NOT NULL,
    CONSTRAINT uq_like_user_target UNIQUE (user_id, target_type, target_id)
);

-- ============ COMMUNITIES ============
CREATE TABLE communities (
    id           UUID PRIMARY KEY,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP,
    deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    name         VARCHAR(255) NOT NULL UNIQUE,
    description  VARCHAR(1000),
    banner_url   VARCHAR(500),
    created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    member_count BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE community_members (
    id                 UUID PRIMARY KEY,
    created_at         TIMESTAMP NOT NULL,
    updated_at         TIMESTAMP,
    deleted            BOOLEAN NOT NULL DEFAULT FALSE,
    community_id       UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_community  VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    CONSTRAINT uq_community_user UNIQUE (community_id, user_id)
);

-- ============ EVENTS ============
CREATE TABLE events (
    id                UUID PRIMARY KEY,
    created_at        TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP,
    deleted           BOOLEAN NOT NULL DEFAULT FALSE,
    organizer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title             VARCHAR(255) NOT NULL,
    description       VARCHAR(3000),
    event_date        DATE NOT NULL,
    event_time        TIME,
    location          VARCHAR(500),
    latitude          DOUBLE PRECISION,
    longitude         DOUBLE PRECISION,
    max_participants  INTEGER,
    category          VARCHAR(30) NOT NULL,
    banner_url        VARCHAR(500),
    joined_count      BIGINT NOT NULL DEFAULT 0,
    interested_count  BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_organizer ON events(organizer_id);

CREATE TABLE event_participants (
    id         UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL,
    CONSTRAINT uq_event_user UNIQUE (event_id, user_id)
);

-- ============ STUDY PARTNER ============
CREATE TABLE study_partner_posts (
    id          UUID PRIMARY KEY,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    deleted     BOOLEAN NOT NULL DEFAULT FALSE,
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject     VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    open        BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE study_partner_tags (
    post_id UUID NOT NULL REFERENCES study_partner_posts(id) ON DELETE CASCADE,
    tag     VARCHAR(100)
);
CREATE TABLE study_partner_participants (
    id         UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    post_id    UUID NOT NULL REFERENCES study_partner_posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_study_post_user UNIQUE (post_id, user_id)
);

-- ============ PROJECT MATCHING ============
CREATE TABLE project_cards (
    id          UUID PRIMARY KEY,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    deleted     BOOLEAN NOT NULL DEFAULT FALSE,
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description VARCHAR(3000),
    open        BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE project_roles_needed (
    project_id UUID NOT NULL REFERENCES project_cards(id) ON DELETE CASCADE,
    role       VARCHAR(100)
);
CREATE TABLE project_join_requests (
    id           UUID PRIMARY KEY,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP,
    deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    project_id   UUID NOT NULL REFERENCES project_cards(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message      VARCHAR(1000),
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT uq_project_requester UNIQUE (project_id, requester_id)
);

-- ============ FRIENDS ============
CREATE TABLE friend_requests (
    id          UUID PRIMARY KEY,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    deleted     BOOLEAN NOT NULL DEFAULT FALSE,
    sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT uq_sender_receiver UNIQUE (sender_id, receiver_id)
);

-- ============ CHAT ============
CREATE TABLE chat_rooms (
    id                     UUID PRIMARY KEY,
    created_at             TIMESTAMP NOT NULL,
    updated_at             TIMESTAMP,
    deleted                BOOLEAN NOT NULL DEFAULT FALSE,
    user_a_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_preview   VARCHAR(255),
    last_message_at        TIMESTAMP,
    CONSTRAINT uq_chat_participants UNIQUE (user_a_id, user_b_id)
);

CREATE TABLE messages (
    id         UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    room_id    UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    VARCHAR(4000) NOT NULL,
    read_at    TIMESTAMP
);
CREATE INDEX idx_messages_room ON messages(room_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE notifications (
    id           UUID PRIMARY KEY,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP,
    deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    type         VARCHAR(30) NOT NULL,
    target_id    UUID,
    message      VARCHAR(500),
    read         BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);

-- ============ REPORTS ============
CREATE TABLE reports (
    id                UUID PRIMARY KEY,
    created_at        TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP,
    deleted           BOOLEAN NOT NULL DEFAULT FALSE,
    reporter_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type       VARCHAR(20) NOT NULL,
    target_id         UUID NOT NULL,
    reason            VARCHAR(1000),
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes  VARCHAR(1000)
);
