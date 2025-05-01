package com.satyam.LearningSpringBoot.service;
import com.satyam.LearningSpringBoot.dto.ProductDto;
import com.satyam.LearningSpringBoot.entity.Category;
import com.satyam.LearningSpringBoot.entity.Product;
import com.satyam.LearningSpringBoot.entity.User;
import com.satyam.LearningSpringBoot.mapper.ProductMapper;
import com.satyam.LearningSpringBoot.repository.CategoryRepository;
import com.satyam.LearningSpringBoot.repository.ProductRepository;
import com.satyam.LearningSpringBoot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    public ProductDto createProduct(ProductDto productDto) {
        User user = userRepository.findById(productDto.getUser_id()).orElse(null);
        Category category = categoryRepository.findById(productDto.getCategory_id()).orElse(null);
        Product product = ProductMapper.toProduct(productDto, category, user);
        productRepository.save(product);
        return ProductMapper.productDto(product);
    }
    public List<ProductDto> getAll(){
        return productRepository.findAll().stream().map(ProductMapper::productDto).toList();
    }
    public ProductDto getById(Long id){
        Product product = productRepository.findById(id).orElse(null);
        return ProductMapper.productDto(product);
    }
    public void deleteById(Long id){
        productRepository.deleteById(id);
    }
    public ProductDto updateById(Long id,ProductDto productDto){
        Product product = productRepository.findById(id).orElse(null);
        if(product!=null){
             product.setProductName(productDto.getProductName().isEmpty() ? product.getProductName():productDto.getProductName());
             product.setDescription(productDto.getDescription().isEmpty() ? product.getDescription():productDto.getDescription());
             product.setPrice(productDto.getPrice()==null?product.getPrice():productDto.getPrice());
             product.setCategory(productDto.getCategory_id()==null? product.getCategory():categoryRepository.findById(productDto.getCategory_id()).orElse(null));
             productRepository.save(product);
        }
        return  ProductMapper.productDto(product);
    }
}
