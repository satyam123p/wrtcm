package com.satyam.LearningSpringBoot.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String categoryName;
    @OneToMany(mappedBy = "category",cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Product>products = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false)
    private User user;
}
// mappedBy->tells jpa that one to many relationship b/w category and product is mapped using category field.