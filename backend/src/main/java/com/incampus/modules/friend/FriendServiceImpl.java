package com.incampus.modules.friend;

import com.incampus.common.enums.FriendRequestStatus;
import com.incampus.common.enums.NotificationType;
import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.friend.dto.FriendRequestResponse;
import com.incampus.modules.notification.NotificationService;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void sendRequest(UUID senderId, UUID receiverId) {
        if (senderId.equals(receiverId)) {
            throw ApiException.badRequest("You can't send a friend request to yourself");
        }
        if (friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(senderId, receiverId, FriendRequestStatus.PENDING)
                || friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(receiverId, senderId, FriendRequestStatus.PENDING)) {
            throw ApiException.conflict("A friend request already exists between these users");
        }

        User sender = findUserOrThrow(senderId);
        User receiver = findUserOrThrow(receiverId);

        friendRequestRepository.save(FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build());
        notificationService.notify(receiverId, senderId, NotificationType.FRIEND_REQUEST, null,
                sender.getName() + " sent you a friend request");
    }

    @Override
    @Transactional
    public void acceptRequest(UUID requestId, UUID currentUserId) {
        FriendRequest request = findRequestOrThrow(requestId);
        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw ApiException.forbidden("You can only respond to requests sent to you");
        }
        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);
        notificationService.notify(
                request.getSender().getId(), currentUserId, NotificationType.FRIEND_REQUEST_ACCEPTED, null,
                request.getReceiver().getName() + " accepted your friend request");
    }

    @Override
    @Transactional
    public void rejectRequest(UUID requestId, UUID currentUserId) {
        FriendRequest request = findRequestOrThrow(requestId);
        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw ApiException.forbidden("You can only respond to requests sent to you");
        }
        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }

    @Override
    @Transactional
    public void removeFriend(UUID currentUserId, UUID friendUserId) {
        friendRequestRepository.findBySenderIdAndReceiverId(currentUserId, friendUserId)
                .or(() -> friendRequestRepository.findBySenderIdAndReceiverId(friendUserId, currentUserId))
                .filter(r -> r.getStatus() == FriendRequestStatus.ACCEPTED)
                .ifPresent(friendRequestRepository::delete);
    }

    @Override
    public PageResponse<FriendRequestResponse> getPendingRequests(UUID userId, int page, int size) {
        Page<FriendRequest> requests = friendRequestRepository.findByReceiverIdAndStatus(
                userId, FriendRequestStatus.PENDING, PageRequest.of(page, size));
        return PageResponse.from(requests.map(this::toResponse));
    }

    @Override
    public PageResponse<UserSummaryResponse> getSuggestedFriends(UUID userId, int page, int size) {
        // NOTE (skeleton): naive same-college suggestion. Phase 5 hardening should
        // exclude existing friends/pending requests at the query level (a dedicated
        // native query) rather than filtering in memory once colleges get large.
        User currentUser = findUserOrThrow(userId);
        List<User> candidates = userRepository.findByCollegeAndDeletedFalse(currentUser.getCollege(), PageRequest.of(page, size))
                .getContent().stream()
                .filter(u -> !u.getId().equals(userId))
                .collect(Collectors.toList());

        List<UserSummaryResponse> summaries = candidates.stream()
                .map(u -> UserSummaryResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .profilePictureUrl(u.getProfilePictureUrl())
                        .college(u.getCollege())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<UserSummaryResponse>builder()
                .content(summaries)
                .page(page)
                .size(size)
                .totalElements(summaries.size())
                .totalPages(1)
                .last(true)
                .build();
    }

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private FriendRequest findRequestOrThrow(UUID requestId) {
        return friendRequestRepository.findById(requestId).orElseThrow(() -> ApiException.notFound("Friend request not found"));
    }

    private FriendRequestResponse toResponse(FriendRequest request) {
        return FriendRequestResponse.builder()
                .id(request.getId())
                .sender(toSummary(request.getSender()))
                .receiver(toSummary(request.getReceiver()))
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }

    private UserSummaryResponse toSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .college(user.getCollege())
                .build();
    }
}
