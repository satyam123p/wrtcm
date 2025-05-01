package com.satyam.LearningSpringBoot.mapper;

import com.satyam.LearningSpringBoot.dto.CategoryDto;
import com.satyam.LearningSpringBoot.entity.Category;
import com.satyam.LearningSpringBoot.entity.User;

public class CategoryMapper {
    public static CategoryDto toCategoryDto(Category category){
        if(category==null) return null;
        CategoryDto categoryDto = new CategoryDto();
        categoryDto.setCategoryName(category.getCategoryName());
        categoryDto.setId(category.getId());
        categoryDto.setProducts(category.getProducts().stream().map(ProductMapper::productDto).toList());
        categoryDto.setUserId(category.getUser().getId());
        return categoryDto;
    }
    public static Category toCategory(CategoryDto categoryDto , User user){
        Category category=new Category();
        category.setCategoryName(categoryDto.getCategoryName());
        category.setUser(user);
        return category;
    }
}
