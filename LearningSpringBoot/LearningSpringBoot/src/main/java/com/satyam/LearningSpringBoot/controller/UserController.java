package com.satyam.LearningSpringBoot.controller;
import com.satyam.LearningSpringBoot.dto.UserDto;
import com.satyam.LearningSpringBoot.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto){
        UserDto res = userService.createUser(userDto);
         return new ResponseEntity<>(res, HttpStatus.CREATED);
    }
    @PostMapping("/login")
    public String login(@RequestBody UserDto userDto){
         return userService.verify(userDto);
    }
    @GetMapping
    public ResponseEntity<?> getAllUser(){
        List<UserDto> entries = userService.getAll();
        return new ResponseEntity<>(entries,HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public  ResponseEntity<?>getById(@PathVariable Long id){
        UserDto userDto = userService.getById(id);
        return new ResponseEntity<>(userDto,HttpStatus.OK);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?>DeleteById(@PathVariable Long id){
        userService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?>UpdateById(@PathVariable Long id,@RequestBody UserDto userDto){
        UserDto res = userService.updateUserById(id,userDto);
        return new ResponseEntity<>(res,HttpStatus.OK);
    }
}
