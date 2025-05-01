package com.satyam.LearningSpringBoot.mapper;

import com.satyam.LearningSpringBoot.dto.UserDto;
import com.satyam.LearningSpringBoot.entity.User;

public class UserMapper {
    public static UserDto toUserDto(User user){
        if(user==null) return null;
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUserName(user.getUserName());
        userDto.setPassword(user.getPassword());
        userDto.setCategories(user.getCategories().stream().map(CategoryMapper::toCategoryDto).toList());
        userDto.setProducts(user.getProducts().stream().map(ProductMapper::productDto).toList());
        return userDto;
    }
    public static User toUser(UserDto userDto){
        User user = new User();
        user.setUserName(userDto.getUserName());
        user.setPassword(userDto.getPassword());
        return user;
    }
}
