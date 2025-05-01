package com.satyam.LearningSpringBoot.controller;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/greeting")
public class Greeting {
    @GetMapping
    public String greeting(HttpServletRequest httpServletRequest){
        return "Welcome -> "  + httpServletRequest.getSession().getId() ;
    }
    @GetMapping("/csrf")
    public CsrfToken csrfToken(HttpServletRequest httpServletRequest){
        return (CsrfToken) httpServletRequest.getAttribute("_csrf");
    }
}
