package com.satyam.LearningSpringBoot.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String userName;
    private String password;
    private List<ProductDto>products=new ArrayList<>();
    private List<CategoryDto>categories=new ArrayList<>();
}
