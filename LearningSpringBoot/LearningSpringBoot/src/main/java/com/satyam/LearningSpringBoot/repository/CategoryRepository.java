package com.satyam.LearningSpringBoot.repository;

import com.satyam.LearningSpringBoot.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category,Long>{
}
