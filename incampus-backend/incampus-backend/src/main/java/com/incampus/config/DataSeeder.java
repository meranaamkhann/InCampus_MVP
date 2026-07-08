package com.incampus.config;

import com.incampus.common.enums.EventCategory;
import com.incampus.common.enums.VerificationStatus;
import com.incampus.modules.community.Community;
import com.incampus.modules.community.CommunityRepository;
import com.incampus.modules.event.Event;
import com.incampus.modules.event.EventRepository;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

/**
 * Runs only on the "dev" profile, and only if the users table is empty, so
 * it's safe to leave enabled without accidentally seeding a real environment.
 * Seeded users are pre-verified so you can log in immediately without
 * wiring up a real mail provider locally.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        User asad = userRepository.save(User.builder()
                .name("Asad Khan")
                .email("asad@galgotiacollege.edu")
                .passwordHash(passwordEncoder.encode("password123"))
                .college("Galgotias College of Engineering and Technology")
                .branch("Information Technology")
                .year(4)
                .bio("Java backend dev. Building InCampus.")
                .interests(Set.of("Coding", "Startups", "Gym"))
                .skills(Set.of("Java", "Spring Boot", "React"))
                .verificationStatus(VerificationStatus.VERIFIED)
                .build());

        User priya = userRepository.save(User.builder()
                .name("Priya Sharma")
                .email("priya@galgotiacollege.edu")
                .passwordHash(passwordEncoder.encode("password123"))
                .college("Galgotias College of Engineering and Technology")
                .branch("Computer Science")
                .year(3)
                .bio("ML enthusiast, photographer on weekends.")
                .interests(Set.of("AI", "Photography"))
                .skills(Set.of("Python", "TensorFlow"))
                .verificationStatus(VerificationStatus.VERIFIED)
                .build());

        userRepository.save(User.builder()
                .name("Rohan Verma")
                .email("rohan@galgotiacollege.edu")
                .passwordHash(passwordEncoder.encode("password123"))
                .college("Galgotias College of Engineering and Technology")
                .branch("Electronics")
                .year(2)
                .bio("Sports and gaming.")
                .interests(Set.of("Gaming", "Sports"))
                .verificationStatus(VerificationStatus.VERIFIED)
                .build());

        Community coding = communityRepository.save(Community.builder()
                .name("Coding")
                .description("For everyone who ships code.")
                .createdBy(asad)
                .memberCount(1)
                .build());

        communityRepository.save(Community.builder()
                .name("AI")
                .description("Machine learning and AI enthusiasts.")
                .createdBy(priya)
                .memberCount(1)
                .build());

        eventRepository.save(Event.builder()
                .organizer(asad)
                .title("Campus Hackathon Kickoff")
                .description("Kickoff meeting for the upcoming inter-college hackathon team.")
                .eventDate(LocalDate.now().plusDays(7))
                .eventTime(LocalTime.of(17, 0))
                .location("CS Block Auditorium")
                .category(EventCategory.HACKATHON)
                .maxParticipants(50)
                .build());
    }
}
