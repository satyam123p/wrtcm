package com.satyam.JournalApp.controller;
import com.satyam.JournalApp.entity.JournalEntry;
import com.satyam.JournalApp.service.JournalEntryService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/journal")
public class JournalEntryController {
      @Autowired
      private JournalEntryService journalEntryService;
      @GetMapping("/getAll")
      public ResponseEntity<?> getAll(){
          List<JournalEntry> all = journalEntryService.getAll();
          if(!all.isEmpty()){
               return new ResponseEntity<>(all, HttpStatus.OK);
          }
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      @PostMapping
      public ResponseEntity<JournalEntry> createMapping(@RequestBody JournalEntry entry) {
          try{
              entry.setDate(LocalDateTime.now());
              journalEntryService.saveEntry(entry);
              return new ResponseEntity<>(entry,HttpStatus.CREATED);
          }catch(Exception e){
              return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
          }
      }
      @GetMapping("/id/{id}")
      public ResponseEntity<JournalEntry> getById(@PathVariable ObjectId id){
           Optional<JournalEntry> journalEntry = journalEntryService.getById(id);
           if(journalEntry.isPresent()){
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
           }
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      @DeleteMapping("/id/{id}")
      public ResponseEntity<?> DeleteById(@PathVariable ObjectId id){
          journalEntryService.DeleteById(id);
          return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      }
      @PutMapping("/id/{id}")
      public ResponseEntity<JournalEntry> UpdateById(@PathVariable ObjectId id,@RequestBody JournalEntry newEntry){
          JournalEntry oldEntry = journalEntryService.getById(id).orElse(null);
          if(oldEntry!=null) {
              oldEntry.setTitle(newEntry.getTitle() != null && !newEntry.getTitle().equals("") ? newEntry.getTitle() : oldEntry.getTitle());
              oldEntry.setContent(newEntry.getContent() != null && !newEntry.getContent().equals("") ? newEntry.getContent() : oldEntry.getContent());
              journalEntryService.saveEntry(oldEntry);
              return new ResponseEntity<>(oldEntry, HttpStatus.OK);
          }
          return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
}
