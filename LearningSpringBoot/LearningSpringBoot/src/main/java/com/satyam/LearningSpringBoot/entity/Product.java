package com.satyam.LearningSpringBoot.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName;
    private String description;
    private Double price;
    @ManyToOne
    @JoinColumn(name = "category_id",nullable = false)
    private Category category;
    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false)
    private User user;
}
// it  tells jpa to join  current entity with referenced entity.
// name="category_id" is used to specify the name of the foreign key column in the database.
// @JoinColumn annotation is used in jpa to specify the foreign key field in relation database.