package com.satyam.LearningSpringBoot.service;
import com.satyam.LearningSpringBoot.entity.User;
import com.satyam.LearningSpringBoot.entity.UserPrinciple;
import com.satyam.LearningSpringBoot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
@Service
public class MyUserDetailService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username);
        if(user==null){
            System.out.println("User Not Found");
            throw  new UsernameNotFoundException("User Not found.");
        }
        return new UserPrinciple(user);
    }
}
