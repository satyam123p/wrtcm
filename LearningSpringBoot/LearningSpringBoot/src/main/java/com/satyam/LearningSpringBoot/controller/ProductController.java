package com.satyam.LearningSpringBoot.controller;
import com.satyam.LearningSpringBoot.dto.ProductDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private com.satyam.LearningSpringBoot.service.ProductService productService;
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductDto productDto){
        com.satyam.LearningSpringBoot.dto.ProductDto res = productService.createProduct(productDto);
        return new ResponseEntity<>(res,HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<?> getAll(){
        List<ProductDto> productDtos = productService.getAll();
        return new ResponseEntity<>(productDtos,HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public  ResponseEntity<?> getById(@PathVariable Long id){
        ProductDto productDto = productService.getById(id);
        return new ResponseEntity<>(productDto,HttpStatus.OK);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id){
        productService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> UpdateById(@PathVariable Long id,@RequestBody ProductDto productDto){
         ProductDto res = productService.updateById(id,productDto);
         return new ResponseEntity<>(res,HttpStatus.OK);
    }
}
