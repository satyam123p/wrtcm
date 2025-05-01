package com.satyam.LearningSpringBoot.mapper;

import com.satyam.LearningSpringBoot.dto.ProductDto;
import com.satyam.LearningSpringBoot.entity.Category;
import com.satyam.LearningSpringBoot.entity.Product;
import com.satyam.LearningSpringBoot.entity.User;

public class ProductMapper {
    public static ProductDto productDto(Product product){
            if(product==null)
                return null;
            return new ProductDto(
                    product.getId(),
                    product.getProductName(),
                    product.getDescription(),
                    product.getPrice(),
                    product.getCategory().getId(),
                    product.getUser().getId()
            );
    }
    public static Product toProduct(ProductDto productDto, Category category, User user){
            Product product = new Product();
            product.setProductName(productDto.getProductName());
            product.setPrice(productDto.getPrice());
            product.setDescription(productDto.getDescription());
            product.setCategory(category);
            product.setUser(user);
            return product;
    }
}
