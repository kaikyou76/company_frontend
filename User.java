package com.example.companybackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "position_id")
    private Long positionId;

    @Column(name = "manager_id")
    private Long managerId;

    @Column(name = "location_type")
    private String locationType;

    @Column(name = "client_latitude")
    private String clientLatitude;

    @Column(name = "client_longitude")
    private String clientLongitude;

    @Column(name = "role")
    private String role = "USER";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "skip_location_check")
    private Boolean skipLocationCheck = false;

    @Column(name = "hire_date")
    private LocalDateTime hireDate;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // コンストラクタ、ゲッター、セッターは@Dataアノテーションで自動生成
}