package com.satyam.LearningSpringBoot.repository;
import com.satyam.LearningSpringBoot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface UserRepository extends JpaRepository<User,Long>{
       User findByUserName(String userName);
}
