package com.satyam.LearningSpringBoot.service;
import com.satyam.LearningSpringBoot.dto.CategoryDto;
import com.satyam.LearningSpringBoot.entity.Category;
import com.satyam.LearningSpringBoot.entity.User;
import com.satyam.LearningSpringBoot.mapper.CategoryMapper;
import com.satyam.LearningSpringBoot.repository.CategoryRepository;
import com.satyam.LearningSpringBoot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class CategoryService {
     @Autowired
     private CategoryRepository categoryRepository;
     @Autowired
     private UserRepository userRepository;
     public CategoryDto createCategory(CategoryDto categoryDto){
          User user = userRepository.findById(categoryDto.getUserId()).orElse(null);
          Category category = CategoryMapper.toCategory(categoryDto,user);
          category = categoryRepository.save(category);
          return CategoryMapper.toCategoryDto(category);
     }
     public List<CategoryDto> getAll(){
          return categoryRepository.findAll().stream().map(CategoryMapper::toCategoryDto).toList();
     }
     public CategoryDto getById(Long id){
          Category category= categoryRepository.findById(id).orElse(null);
          return CategoryMapper.toCategoryDto(category);
     }
     public void deleteById(Long id){
          categoryRepository.deleteById(id);
     }
     public CategoryDto updateById(Long id,CategoryDto categoryDto){
          Category category = categoryRepository.findById(id).orElse(null);
          if(category!=null){
               category.setCategoryName(categoryDto.getCategoryName().isEmpty()?category.getCategoryName():categoryDto.getCategoryName());
          }
          return CategoryMapper.toCategoryDto(category);
     }
}
