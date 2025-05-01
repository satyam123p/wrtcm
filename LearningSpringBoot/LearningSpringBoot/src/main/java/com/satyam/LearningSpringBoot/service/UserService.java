package com.satyam.LearningSpringBoot.service;
import com.satyam.LearningSpringBoot.dto.UserDto;
import com.satyam.LearningSpringBoot.entity.User;
import com.satyam.LearningSpringBoot.mapper.UserMapper;
import com.satyam.LearningSpringBoot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JWTService jwtService;
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    public UserDto createUser(UserDto userDto){
        User user = UserMapper.toUser(userDto);
        user.setPassword(encoder.encode(user.getPassword()));
        user=userRepository.save(user);
        return UserMapper.toUserDto(user);
    }
    public List<UserDto> getAll(){
        return userRepository.findAll().stream().map(UserMapper::toUserDto).toList();
    }
    public UserDto getById(Long id){
        User user = userRepository.findById(id).orElse(null);
        return UserMapper.toUserDto(user);
    }
    public void deleteById(Long id){
        userRepository.deleteById(id);
    }
    public UserDto updateUserById(Long id,UserDto userDto){
        User user = userRepository.findById(id).orElse(null);
        if(user!=null){
              user.setUserName(userDto.getUserName().isEmpty() ? user.getUserName():userDto.getUserName());
              user.setPassword(userDto.getPassword().isEmpty() ? user.getPassword():userDto.getPassword());
              userRepository.save(user);
        }
        return UserMapper.toUserDto(user);
    }
    public String verify(UserDto userDto){
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(userDto.getUserName(),userDto.getPassword()));
        if(authentication.isAuthenticated()){
            return jwtService.generateToken(userDto.getUserName());
        }
        return "fails";
    }
}
